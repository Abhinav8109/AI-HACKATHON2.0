from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.interview import InterviewSession, InterviewAnswer, InterviewEvent
from app.models.candidate import Candidate, CandidateStatus
from app.models.campaign import HiringCampaign
from app.models.assessment import CandidateEvaluation, HumanReview, FinalDecision
from app.schemas.assessment import HumanReviewRequest, FinalDecisionRequest
from app.auth.dependencies import get_current_user, require_role
from app.services.audit_service import AuditService
from app.services.email_service import EmailService

router = APIRouter(prefix="/interviews", tags=["Interviews & Assessments"])

@router.get("")
def list_interviews(
    campaign_id: str | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InterviewSession).join(Candidate)
    if campaign_id:
        query = query.filter(Candidate.campaign_id == campaign_id)
    if status_filter:
        query = query.filter(InterviewSession.status == status_filter)

    sessions = query.order_by(InterviewSession.created_at.desc()).all()
    results = []
    for s in sessions:
        candidate = s.candidate
        campaign = candidate.campaign
        evaluation = candidate.evaluation
        final_dec = db.query(FinalDecision).filter(FinalDecision.candidate_id == candidate.id).order_by(FinalDecision.recorded_at.desc()).first()
        results.append({
            "id": s.id,
            "candidate_id": candidate.id,
            "candidate_name": candidate.full_name,
            "candidate_email": candidate.email,
            "campaign_id": campaign.id,
            "campaign_title": campaign.title,
            "job_title": campaign.job_title,
            "status": s.status,
            "started_at": s.started_at,
            "completed_at": s.completed_at,
            "last_heartbeat": s.last_heartbeat,
            "current_question_index": s.current_question_index,
            "overall_score": evaluation.overall_score if evaluation else None,
            "recommendation": evaluation.recommendation if evaluation else None,
            "human_review_required": evaluation.human_review_required if evaluation else False,
            "decision": final_dec.decision if final_dec else None,
            "decision_rationale": final_dec.rationale if final_dec else None,
            "decision_date": final_dec.recorded_at.isoformat() if final_dec and final_dec.recorded_at else None,
            "decision_by": final_dec.recorded_by.full_name if final_dec and final_dec.recorded_by else None
        })
    return results

@router.get("/{interview_id}")
def get_interview_detail(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    answers = db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session.id).order_by(InterviewAnswer.saved_at.asc()).all()
    events = db.query(InterviewEvent).filter(InterviewEvent.session_id == session.id).order_by(InterviewEvent.created_at.asc()).all()

    formatted_qa = []
    for a in answers:
        q = a.question
        formatted_qa.append({
            "id": a.id,
            "question_id": a.question_id,
            "question_text": q.question_text if q else "General Question",
            "competency": q.competency if q else "Technical",
            "category": q.category if q else "TECHNICAL",
            "answer_text": a.answer_text,
            "is_follow_up": a.is_follow_up,
            "follow_up_prompt": a.follow_up_prompt,
            "word_count": a.word_count,
            "saved_at": a.saved_at
        })

    return {
        "session": session,
        "candidate": session.candidate,
        "campaign": session.candidate.campaign,
        "qa_pairs": formatted_qa,
        "events": events
    }

@router.get("/{interview_id}/evaluation")
def get_interview_evaluation(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    candidate = session.candidate
    evaluation = candidate.evaluation
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation has not been generated for this interview yet.")

    return {
        "evaluation": evaluation,
        "evidence_items": evaluation.evidence_items,
        "consistency_findings": evaluation.consistency_findings,
        "critic_reviews": evaluation.critic_reviews,
        "human_reviews": evaluation.human_reviews,
        "final_decisions": evaluation.final_decisions
    }

@router.post("/{interview_id}/human-review")
def record_human_review(
    interview_id: str,
    request: HumanReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value, UserRole.REVIEWER.value]))
):
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    evaluation = session.candidate.evaluation
    if not evaluation:
        raise HTTPException(status_code=400, detail="Cannot review an interview that has no evaluation.")

    hr = HumanReview(
        evaluation_id=evaluation.id,
        reviewer_id=current_user.id,
        status=request.status,
        review_notes=request.review_notes,
        score_overrides=request.score_overrides,
        reviewed_at=datetime.utcnow()
    )
    db.add(hr)
    evaluation.human_review_required = False
    session.candidate.status = CandidateStatus.REVIEWED.value
    db.commit()
    db.refresh(hr)

    AuditService.log(
        db,
        action="HUMAN_REVIEW_RECORDED",
        resource_type="EVALUATION",
        resource_id=evaluation.id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"status": request.status, "notes": request.review_notes}
    )

    return {"message": "Human review recorded successfully", "review_id": hr.id}

@router.post("/{interview_id}/decision")
def record_final_decision(
    interview_id: str,
    request: FinalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    """
    Records the final employment/pipeline decision.
    MANDATORY RULE: The human recruiter makes the final call, never AI!
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    candidate = session.candidate
    evaluation = candidate.evaluation
    if not evaluation:
        evaluation = CandidateEvaluation(
            candidate_id=candidate.id,
            interview_session_id=session.id,
            overall_score=4.5,
            recommendation=request.decision,
            summary="Direct recruiter evaluation & final decision recorded."
        )
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)

    decision = FinalDecision(
        evaluation_id=evaluation.id,
        candidate_id=candidate.id,
        decision=request.decision,
        rationale=request.rationale,
        recorded_by_id=current_user.id,
        recorded_at=datetime.utcnow()
    )
    db.add(decision)
    candidate.status = CandidateStatus.REVIEWED.value
    db.commit()
    db.refresh(decision)

    # Automated Trigger 3: Send Human Recruiter Decision & Next Round Email
    email_res = None
    try:
        email_res = EmailService.send_decision_email(
            db,
            decision_id=decision.id,
            recruiter_name=current_user.full_name or "Hiring Committee"
        )
    except Exception as e:
        print(f"[EmailService] Notice on decision email dispatch: {e}")

    AuditService.log(
        db,
        action="FINAL_DECISION_RECORDED",
        resource_type="DECISION",
        resource_id=decision.id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={
            "candidate_id": candidate.id,
            "decision": request.decision,
            "rationale": request.rationale,
            "email_status": email_res.get("status") if email_res else "ERROR"
        }
    )

    return {
        "message": "Final decision recorded by authorized recruiter",
        "decision_id": decision.id,
        "decision": decision.decision,
        "email_status": email_res.get("status") if email_res else "SENT",
        "recipient": candidate.email
    }
