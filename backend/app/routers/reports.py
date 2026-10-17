from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.campaign import HiringCampaign
from app.models.interview import InterviewAnswer, InterviewQuestion
from app.models.assessment import FinalDecision
from app.auth.dependencies import get_current_user
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/candidates/{candidate_id}/export")
def export_candidate_report(
    candidate_id: str,
    format: str = "html",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    evaluation = candidate.evaluation
    if not evaluation:
        raise HTTPException(status_code=400, detail="Cannot export report: candidate has not completed evaluation.")

    campaign = candidate.campaign
    session = candidate.interview_session
    answers = session.answers if session else []

    qa_pairs = []
    for a in answers:
        q = a.question
        qa_pairs.append({
            "question": a.follow_up_prompt if a.is_follow_up else (q.question_text if q else "General Question"),
            "answer": a.answer_text
        })

    decision = db.query(FinalDecision).filter(FinalDecision.candidate_id == candidate.id).first()
    decision_dict = None
    if decision:
        decision_dict = {
            "decision": decision.decision,
            "rationale": decision.rationale,
            "recorded_at": decision.recorded_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    eval_dict = {
        "overall_score": evaluation.overall_score,
        "recommendation": evaluation.recommendation,
        "summary": evaluation.summary,
        "strengths": evaluation.strengths,
        "development_areas": evaluation.development_areas,
        "dimensions": [
            {
                "dimension_name": d.dimension_name,
                "score": d.score,
                "rubric_anchor": d.rubric_anchor,
                "evidence_quote": d.evidence_quote,
                "explanation": d.explanation
            }
            for d in evaluation.evidence_items
        ]
    }

    consistency_list = [
        {
            "claim_text": c.claim_text,
            "finding_type": c.finding_type,
            "explanation": c.explanation
        }
        for c in evaluation.consistency_findings
    ]

    critic_dict = {
        "alignment_score": evaluation.critic_reviews[0].alignment_score if evaluation.critic_reviews else 1.0,
        "critic_summary": evaluation.critic_reviews[0].critic_summary if evaluation.critic_reviews else "Validated"
    }

    if format == "json":
        return {
            "candidate": {"id": candidate.id, "name": candidate.full_name, "email": candidate.email},
            "job_title": campaign.job_title,
            "campaign": campaign.title,
            "evaluation": eval_dict,
            "decision": decision_dict,
            "transcript": qa_pairs
        }

    html_content = ReportService.generate_candidate_report_html(
        candidate_name=candidate.full_name,
        job_title=campaign.job_title,
        campaign_title=campaign.title,
        evaluation=eval_dict,
        qa_pairs=qa_pairs,
        consistency_findings=consistency_list,
        critic_review=critic_dict,
        human_decision=decision_dict
    )

    return Response(content=html_content, media_type="text/html")

@router.get("/campaigns/{campaign_id}/export")
def export_campaign_csv(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaign = db.query(HiringCampaign).filter(HiringCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    candidates_data = []
    for c in campaign.candidates:
        eval_score = c.evaluation.overall_score if c.evaluation else None
        rec = c.evaluation.recommendation if c.evaluation else None
        decision = db.query(FinalDecision).filter(FinalDecision.candidate_id == c.id).first()
        
        candidates_data.append({
            "full_name": c.full_name,
            "email": c.email,
            "status": c.status,
            "overall_score": eval_score,
            "recommendation": rec,
            "created_at": c.created_at.strftime("%Y-%m-%d"),
            "decision": decision.decision if decision else "PENDING_REVIEW"
        })

    csv_text = ReportService.generate_campaign_csv(candidates_data)
    filename = f"campaign_{campaign.id[:8]}_export.csv"

    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
