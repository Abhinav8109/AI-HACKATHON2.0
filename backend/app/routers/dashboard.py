from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.campaign import HiringCampaign, CampaignStatus
from app.models.candidate import Candidate
from app.models.interview import InterviewInvitation, InterviewSession, SessionStatus, InvitationStatus
from app.models.assessment import CandidateEvaluation, FinalDecision
from app.models.audit import AuditEvent
from app.schemas.dashboard import DashboardSummaryResponse, ActivityFeedItem
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    active_campaigns = db.query(HiringCampaign).filter(HiringCampaign.status == CampaignStatus.ACTIVE.value).count()
    total_candidates = db.query(Candidate).count()
    invitations_gen = db.query(InterviewInvitation).count()
    in_progress = db.query(InterviewSession).filter(InterviewSession.status == SessionStatus.IN_PROGRESS.value).count()
    completed = db.query(InterviewSession).filter(InterviewSession.status == SessionStatus.COMPLETED.value).count()
    
    # Pending evaluations
    pending_evals = db.query(InterviewSession).filter(
        InterviewSession.status == SessionStatus.COMPLETED.value,
        ~InterviewSession.candidate_id.in_(db.query(CandidateEvaluation.candidate_id))
    ).count()

    human_reviews = db.query(CandidateEvaluation).filter(CandidateEvaluation.human_review_required == True).count()
    
    # Expiring invitations within 24 hours
    expiring = db.query(InterviewInvitation).filter(
        InterviewInvitation.status.in_([InvitationStatus.ISSUED.value, InvitationStatus.OPENED.value]),
        InterviewInvitation.expires_at > datetime.utcnow(),
        InterviewInvitation.expires_at < datetime.utcnow().replace(day=datetime.utcnow().day + 1)
    ).count()

    avg_score = db.query(func.avg(CandidateEvaluation.overall_score)).scalar()
    avg_score_val = round(float(avg_score), 2) if avg_score else None

    recent_evals = db.query(CandidateEvaluation).count()

    # Recruiter human decision metrics
    all_decisions = db.query(FinalDecision).order_by(FinalDecision.recorded_at.desc()).all()
    latest_decision_by_cand = {}
    for d in all_decisions:
        if d.candidate_id not in latest_decision_by_cand:
            latest_decision_by_cand[d.candidate_id] = d.decision

    approved_count = sum(1 for dec in latest_decision_by_cand.values() if dec in ["ADVANCE", "NEXT_ROUND", "APPROVED", "HIRED"])
    rejected_count = sum(1 for dec in latest_decision_by_cand.values() if dec in ["REJECT", "REJECTED"])

    return DashboardSummaryResponse(
        active_campaigns=active_campaigns,
        total_candidates=total_candidates,
        invitations_generated=invitations_gen,
        interviews_in_progress=in_progress,
        completed_interviews=completed,
        pending_evaluations=pending_evals,
        human_reviews_required=human_reviews,
        expiring_invitations=expiring,
        recent_assessments_count=recent_evals,
        average_score=avg_score_val,
        approved_candidates=approved_count,
        rejected_candidates=rejected_count,
        is_demo_data=False
    )

@router.get("/activity", response_model=list[ActivityFeedItem])
def get_activity_feed(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit).all()
    results = []
    for e in events:
        action_title = e.action.replace("_", " ").title()
        desc = ""
        if e.details:
            if "title" in e.details:
                desc = f"Campaign '{e.details['title']}'"
            elif "candidate_email" in e.details:
                desc = f"Candidate: {e.details.get('candidate_email')}"
            elif "overall_score" in e.details:
                desc = f"Score: {e.details.get('overall_score')}/5.0"
            else:
                desc = str(e.details)
        else:
            desc = f"Resource {e.resource_type} ({e.resource_id or ''})"

        results.append(ActivityFeedItem(
            id=e.id,
            action=e.action,
            resource_type=e.resource_type,
            resource_id=e.resource_id,
            title=action_title,
            description=desc,
            timestamp=e.created_at,
            user_email=e.user_email
        ))
    return results
