from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.interview import (
    InterviewInvitation, InterviewSession, InterviewQuestion, InterviewAnswer,
    InterviewEvent, InvitationStatus, SessionStatus
)
from app.models.candidate import Candidate, CandidateStatus
from app.models.campaign import HiringCampaign, CompetencyMatrix
from app.models.assessment import (
    CandidateEvaluation, EvaluationEvidence, ConsistencyFinding, CriticReview
)
from app.schemas.interview import (
    CandidatePortalSessionResponse, AnswerSubmitRequest, QuestionResponse, EventLogRequest
)
from app.auth.dependencies import validate_candidate_invitation
from app.auth.security import hash_token
from app.services.agents.interviewer_agent import InterviewerAgent
from app.services.agents.evaluator_agent import EvaluatorAgent
from app.services.agents.consistency_agent import ConsistencyAgent
from app.services.agents.critic_agent import CriticAgent
from app.services.agents.feedback_agent import FeedbackAgent
from app.services.agents.coach_agent import CandidateCoachAgent
from app.services.audit_service import AuditService
from app.services.email_service import EmailService

class AnswerDepthAnalysisRequest(BaseModel):
    question_text: str
    draft_answer: str

router = APIRouter(prefix="/portal", tags=["Candidate Portal"])

def get_portal_session_context(token: str, db: Session):
    invitation = validate_candidate_invitation(token, db)
    
    # Mark opened if not yet
    if not invitation.opened_at:
        invitation.opened_at = datetime.utcnow()
        if invitation.status == InvitationStatus.ISSUED.value:
            invitation.status = InvitationStatus.OPENED.value
        db.commit()

    session = db.query(InterviewSession).filter(InterviewSession.invitation_id == invitation.id).first()
    if not session:
        session = InterviewSession(
            candidate_id=invitation.candidate_id,
            invitation_id=invitation.id,
            session_token_hash=hash_token(token),
            status=SessionStatus.NOT_STARTED.value
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    candidate = invitation.candidate
    campaign = invitation.campaign

    return invitation, session, candidate, campaign

@router.get("/session", response_model=CandidatePortalSessionResponse)
def get_candidate_session(
    token: str,
    db: Session = Depends(get_db)
):
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    questions_count = len(candidate.interview_plan.questions) if candidate.interview_plan else campaign.question_count

    return CandidatePortalSessionResponse(
        candidate_name=candidate.full_name,
        job_title=campaign.job_title,
        campaign_title=campaign.title,
        duration_minutes=campaign.interview_duration_minutes,
        question_count=questions_count,
        consent_given=session.consent_given,
        session_status=session.status,
        current_question_index=session.current_question_index,
        candidate_instructions=campaign.candidate_instructions,
        accessibility_accommodations=campaign.accessibility_accommodations
    )

@router.post("/consent")
def give_consent(
    token: str,
    db: Session = Depends(get_db)
):
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    session.consent_given = True
    session.consent_timestamp = datetime.utcnow()
    
    # Log event
    evt = InterviewEvent(
        session_id=session.id,
        event_type="CONSENT_GIVEN",
        event_data={"timestamp": session.consent_timestamp.isoformat()}
    )
    db.add(evt)
    db.commit()
    return {"message": "Consent recorded", "consent_given": True}

@router.post("/start")
def start_interview(
    token: str,
    db: Session = Depends(get_db)
):
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    if not session.consent_given:
        raise HTTPException(status_code=400, detail="Consent is required before starting the interview.")

    session.status = SessionStatus.IN_PROGRESS.value
    session.started_at = session.started_at or datetime.utcnow()
    candidate.status = CandidateStatus.IN_PROGRESS.value
    inv.status = InvitationStatus.REDEEMED.value
    inv.redeemed_at = inv.redeemed_at or datetime.utcnow()

    evt = InterviewEvent(
        session_id=session.id,
        event_type="INTERVIEW_STARTED",
        event_data={"started_at": session.started_at.isoformat()}
    )
    db.add(evt)
    db.commit()
    return {"message": "Interview started", "status": session.status, "current_question_index": session.current_question_index}

@router.get("/interview")
def get_current_question(
    token: str,
    db: Session = Depends(get_db)
):
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    if not candidate.interview_plan or not candidate.interview_plan.questions:
        raise HTTPException(status_code=404, detail="No interview questions prepared for this candidate.")

    questions = candidate.interview_plan.questions
    total_q = len(questions)

    # Check if all answered
    if session.current_question_index >= total_q:
        return {
            "is_completed": True,
            "total_questions": total_q,
            "current_index": session.current_question_index,
            "question": None,
            "saved_answer": None
        }

    current_q = questions[session.current_question_index]
    # Check if there is an existing saved answer for this question
    latest_answer = db.query(InterviewAnswer).filter(
        InterviewAnswer.session_id == session.id,
        InterviewAnswer.question_id == current_q.id
    ).order_by(InterviewAnswer.saved_at.desc()).first()

    return {
        "is_completed": False,
        "total_questions": total_q,
        "current_index": session.current_question_index,
        "question": {
            "id": current_q.id,
            "question_index": current_q.question_index,
            "question_text": current_q.question_text,
            "category": current_q.category,
            "competency": current_q.competency,
            "difficulty": current_q.difficulty
        },
        "saved_answer": latest_answer.answer_text if latest_answer else ""
    }

@router.post("/answers")
async def submit_answer(
    token: str,
    request: AnswerSubmitRequest,
    db: Session = Depends(get_db)
):
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == request.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    words = len(request.answer_text.split())
    # Save the answer
    answer = InterviewAnswer(
        session_id=session.id,
        question_id=question.id,
        candidate_id=candidate.id,
        answer_text=request.answer_text,
        is_follow_up=request.is_follow_up,
        parent_answer_id=request.parent_answer_id,
        follow_up_prompt=request.follow_up_prompt,
        word_count=words
    )
    db.add(answer)
    db.flush()

    # Log event
    evt = InterviewEvent(
        session_id=session.id,
        event_type="ANSWER_SUBMITTED",
        event_data={"question_id": question.id, "word_count": words, "is_follow_up": request.is_follow_up}
    )
    db.add(evt)

    # Count how many follow-ups already done for this question
    follow_up_count = db.query(InterviewAnswer).filter(
        InterviewAnswer.session_id == session.id,
        InterviewAnswer.question_id == question.id,
        InterviewAnswer.is_follow_up == True
    ).count()

    # Advance directly to the next planned question (strictly 8 questions total)
    session.current_question_index += 1
    db.commit()

    return {
        "message": "Answer saved successfully",
        "answer_id": answer.id,
        "needs_follow_up": False,
        "follow_up_prompt": None,
        "next_question_index": session.current_question_index
    }

@router.post("/reset-demo")
def reset_demo_session(
    token: str,
    db: Session = Depends(get_db)
):
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    if session.status == SessionStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail="This interview has reached terminal completed status. Submissions are permanently locked and cannot be retaken."
        )
    session.status = SessionStatus.NOT_STARTED.value
    session.current_question_index = 0
    session.started_at = None
    session.completed_at = None
    session.consent_given = False

    # Clear previous test answers
    db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session.id).delete()
    candidate.status = CandidateStatus.INVITED.value
    inv.status = InvitationStatus.OPENED.value

    db.commit()
    return {"message": "Demo interview session reset to step 1", "status": "RESET"}

@router.post("/submit")
async def finalize_interview(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Submits the final interview.
    Triggers the autonomous Agentic Evaluation Pipeline:
    1. Evaluator Agent (Scores rubric with verbatim quotes)
    2. Consistency Agent (Cross-references claims)
    3. Critic Agent (Adversarial auditor checking alignment)
    4. Feedback Agent (Generates candidate constructive note)
    """
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    
    session.status = SessionStatus.COMPLETED.value
    session.completed_at = datetime.utcnow()
    inv.status = InvitationStatus.COMPLETED.value
    candidate.status = CandidateStatus.COMPLETED.value

    # Gather all Q&A pairs
    qa_pairs = []
    answers = db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session.id).order_by(InterviewAnswer.saved_at.asc()).all()
    for a in answers:
        q = a.question
        prompt_used = a.follow_up_prompt if a.is_follow_up else (q.question_text if q else "General Question")
        qa_pairs.append({
            "question": prompt_used,
            "answer": a.answer_text
        })

    # Run Evaluator Agent
    rubric_dims = campaign.evaluation_rubric.dimensions if campaign.evaluation_rubric else []
    eval_result = await EvaluatorAgent.evaluate_interview(
        job_title=campaign.job_title,
        qa_pairs=qa_pairs,
        rubric_dimensions=rubric_dims
    )

    # Run Consistency Agent
    claims = [
        {"claim_text": c.claim_text, "category": c.category, "source_excerpt": c.source_excerpt}
        for c in candidate.claims
    ]
    transcript_text = "\n\n".join([f"Q: {qa['question']}\nA: {qa['answer']}" for qa in qa_pairs])
    consistency_results = await ConsistencyAgent.analyze_claims(claims, transcript_text)

    # Run Critic Agent
    critic_result = await CriticAgent.validate_evaluation(eval_result, qa_pairs)

    # Run Feedback Agent
    feedback_text = await FeedbackAgent.generate_feedback(
        candidate_name=candidate.full_name,
        job_title=campaign.job_title,
        strengths=eval_result.get("strengths", []),
        development_areas=eval_result.get("development_areas", [])
    )

    per_q = eval_result.get("per_question_reviews", [])

    # Update individual answers with AI score and critique
    for idx, a in enumerate(answers):
        if idx < len(per_q):
            a.ai_score = per_q[idx].get("score")
            a.ai_review = per_q[idx].get("ai_critique")

    # Persist CandidateEvaluation
    existing_eval = db.query(CandidateEvaluation).filter(CandidateEvaluation.candidate_id == candidate.id).first()
    if not existing_eval:
        evaluation = CandidateEvaluation(
            candidate_id=candidate.id,
            interview_session_id=session.id,
            overall_score=eval_result.get("overall_score", 3.0),
            recommendation=eval_result.get("recommendation", "HOLD_FOR_REVIEW"),
            summary=eval_result.get("summary", ""),
            strengths=eval_result.get("strengths", []),
            development_areas=eval_result.get("development_areas", []),
            human_review_required=critic_result.get("human_review_flagged", False),
            candidate_feedback_text=feedback_text,
            per_question_reviews=per_q
        )
        db.add(evaluation)
        db.flush()
    else:
        evaluation = existing_eval
        evaluation.overall_score = eval_result.get("overall_score", 3.0)
        evaluation.recommendation = eval_result.get("recommendation", "HOLD_FOR_REVIEW")
        evaluation.summary = eval_result.get("summary", "")
        evaluation.strengths = eval_result.get("strengths", [])
        evaluation.development_areas = eval_result.get("development_areas", [])
        evaluation.human_review_required = critic_result.get("human_review_flagged", False)
        evaluation.candidate_feedback_text = feedback_text
        evaluation.per_question_reviews = per_q

    # Clean old evaluation items
    db.query(EvaluationEvidence).filter(EvaluationEvidence.evaluation_id == evaluation.id).delete()
    db.query(ConsistencyFinding).filter(ConsistencyFinding.evaluation_id == evaluation.id).delete()
    db.query(CriticReview).filter(CriticReview.evaluation_id == evaluation.id).delete()

    # Save per-question evidence items FIRST so recruiters see Q1, Q2, Q3...
    for pq in per_q:
        q_label = f"Question {pq['question_number']}: {pq.get('question_text', '')[:65]}..."
        ev_item = EvaluationEvidence(
            evaluation_id=evaluation.id,
            dimension_name=q_label,
            score=pq.get("score", 0.0),
            rubric_anchor=pq.get("rubric_anchor", "Developing"),
            evidence_quote=pq.get("evidence_quote", "No evidence quote"),
            explanation=pq.get("ai_critique", ""),
            missing_evidence="; ".join(pq.get("missing_elements", [])) or "None identified",
            confidence_limitations=f"Relevance: {pq.get('relevance_to_question', 'HIGH')} • Signal: {pq.get('authenticity_rating', 'AUTHENTIC')}"
        )
        db.add(ev_item)

    # Consistency findings
    for cf in consistency_results:
        c_item = ConsistencyFinding(
            evaluation_id=evaluation.id,
            claim_text=cf.get("claim_text"),
            answer_excerpt=cf.get("answer_excerpt"),
            finding_type=cf.get("finding_type"),
            explanation=cf.get("explanation"),
            suggested_follow_up=cf.get("suggested_follow_up")
        )
        db.add(c_item)

    # Critic Review
    cr_item = CriticReview(
        evaluation_id=evaluation.id,
        alignment_score=critic_result.get("alignment_score", 1.0),
        passed_validation=critic_result.get("passed_validation", True),
        flags=critic_result.get("flags", []),
        critic_summary=critic_result.get("critic_summary", ""),
        human_review_flagged=critic_result.get("human_review_flagged", False)
    )
    db.add(cr_item)

    # If critic flagged human review, mark candidate
    if critic_result.get("human_review_flagged"):
        candidate.status = CandidateStatus.UNDER_REVIEW.value

    db.commit()

    # Automated Trigger 2: Send Interview Completion & Thank-You Email
    try:
        EmailService.send_completion_email(db, session_id=session.id)
    except Exception as e:
        print(f"[EmailService] Notice on completion email dispatch: {e}")

    AuditService.log(
        db,
        action="INTERVIEW_SUBMITTED",
        resource_type="INTERVIEW",
        resource_id=session.id,
        details={
            "candidate_id": candidate.id,
            "overall_score": evaluation.overall_score,
            "human_review_flagged": critic_result.get("human_review_flagged")
        }
    )

    return {
        "message": "Interview submitted and evaluated successfully",
        "session_status": session.status,
        "candidate_feedback": feedback_text
    }

@router.post("/event")
def log_portal_event(
    token: str,
    request: EventLogRequest,
    db: Session = Depends(get_db)
):
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    evt = InterviewEvent(
        session_id=session.id,
        event_type=request.event_type,
        event_data=request.event_data
    )
    session.last_heartbeat = datetime.utcnow()
    db.add(evt)
    db.commit()
    return {"status": "ok"}


@router.post("/analyze-depth")
async def analyze_answer_depth(
    request: AnswerDepthAnalysisRequest,
    token: str,
    db: Session = Depends(get_db)
):
    """
    Agent 10: Candidate Depth Coach Agent.
    Evaluates real-time candidate answers for architectural depth, failure modes, trade-offs, and metrics.
    """
    inv, session, candidate, campaign = get_portal_session_context(token, db)
    role = campaign.job_title if campaign else (candidate.current_title or "Software Engineer")
    analysis = await CandidateCoachAgent.analyze_draft_depth(
        question_text=request.question_text,
        competency=role,
        draft_answer=request.draft_answer
    )
    return analysis

