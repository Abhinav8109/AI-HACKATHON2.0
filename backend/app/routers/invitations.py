from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.interview import InterviewInvitation, InterviewSession, InvitationStatus
from app.models.candidate import Candidate
from app.models.campaign import HiringCampaign
from app.models.email_log import SentEmail
from app.schemas.interview import InvitationResponse
from app.auth.dependencies import get_current_user, require_role
from app.services.invitation_service import InvitationService
from app.services.email_service import EmailService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/invitations", tags=["Invitations"])

class SendEmailRequest(BaseModel):
    custom_note: str | None = None
    override_email: str | None = None

class TestEmailRequest(BaseModel):
    recipient_email: str = "abhinavclouds@gmail.com"
    candidate_name: str = "Abhinav Sharma"
    job_title: str = "Senior Distributed Systems Architect"
    campaign_title: str = "Core Engineering 2026"

@router.get("", response_model=list[InvitationResponse])
def list_invitations(
    campaign_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InterviewInvitation).join(Candidate).join(HiringCampaign)
    if campaign_id:
        query = query.filter(InterviewInvitation.campaign_id == campaign_id)

    invitations = query.order_by(InterviewInvitation.created_at.desc()).all()
    results = []
    for inv in invitations:
        token_to_use = inv.raw_token or inv.token_prefix
        results.append(InvitationResponse(
            id=inv.id,
            candidate_id=inv.candidate_id,
            candidate_name=inv.candidate.full_name,
            candidate_email=inv.candidate.email,
            campaign_id=inv.campaign_id,
            campaign_title=inv.campaign.title,
            token_prefix=inv.token_prefix,
            raw_token=inv.raw_token,
            token=inv.raw_token,
            portal_url=InvitationService.get_portal_url(token_to_use),
            status=inv.status,
            expires_at=inv.expires_at,
            opened_at=inv.opened_at,
            redeemed_at=inv.redeemed_at,
            created_at=inv.created_at
        ))
    return results

@router.post("/candidates/{candidate_id}", response_model=dict)
def generate_candidate_invitation(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    invitation, token = InvitationService.create_invitation_for_candidate(
        db=db,
        candidate_id=candidate.id,
        campaign_id=candidate.campaign_id
    )

    portal_url = InvitationService.get_portal_url(token)

    AuditService.log(
        db,
        action="GENERATE_INVITATION",
        resource_type="INVITATION",
        resource_id=invitation.id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"candidate_id": candidate.id, "candidate_email": candidate.email, "token_prefix": invitation.token_prefix}
    )

    return {
        "id": invitation.id,
        "invitation_id": invitation.id,
        "candidate_id": candidate.id,
        "candidate_name": candidate.full_name,
        "token": token,
        "raw_token": token,
        "portal_url": portal_url,
        "expires_at": invitation.expires_at.isoformat(),
        "status": invitation.status
    }

@router.post("/{invitation_id}/revoke")
def revoke_invitation(
    invitation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    invitation = InvitationService.revoke_invitation(db, invitation_id)
    AuditService.log(
        db,
        action="REVOKE_INVITATION",
        resource_type="INVITATION",
        resource_id=invitation.id,
        user_id=current_user.id,
        user_email=current_user.email
    )
    return {"message": "Invitation revoked successfully", "status": invitation.status}

@router.post("/{invitation_id}/regenerate")
def regenerate_invitation(
    invitation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    new_inv, token = InvitationService.regenerate_invitation(db, invitation_id)
    AuditService.log(
        db,
        action="REGENERATE_INVITATION",
        resource_type="INVITATION",
        resource_id=new_inv.id,
        user_id=current_user.id,
        user_email=current_user.email
    )
    return {
        "invitation_id": new_inv.id,
        "candidate_id": new_inv.candidate_id,
        "token": token,
        "raw_token": token,
        "portal_url": InvitationService.get_portal_url(token),
        "expires_at": new_inv.expires_at.isoformat(),
        "status": new_inv.status
    }

@router.post("/{invitation_id}/send-email")
def send_candidate_email(
    invitation_id: str,
    req: SendEmailRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    """
    Triggers personalized candidate portal credentials email to candidate's email address.
    """
    custom_note = req.custom_note if req else None
    try:
        invitation = db.query(InterviewInvitation).filter(InterviewInvitation.id == invitation_id).first()
        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")

        # Allow override email for testing if provided
        if req and req.override_email:
            invitation.candidate.email = req.override_email

        res = EmailService.send_invitation_email(db, invitation_id, custom_note=custom_note)

        res["recipient"] = res.get("recipient_email")
        res["candidate_email"] = res.get("recipient_email")

        AuditService.log(
            db,
            action="SEND_INVITATION_EMAIL",
            resource_type="EMAIL",
            resource_id=res["email_id"],
            user_id=current_user.id,
            user_email=current_user.email,
            details={"recipient": res["recipient_email"], "subject": res["subject"]}
        )

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.get("/emails/history")
def get_sent_emails_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns history of all dispatched emails and personalized credentials for outbox inspection.
    """
    emails = db.query(SentEmail).order_by(SentEmail.sent_at.desc()).limit(limit).all()
    results = [
        {
            "id": e.id,
            "candidate_id": e.candidate_id,
            "recipient_email": e.recipient_email,
            "recipient_name": e.recipient_name,
            "subject": e.subject,
            "portal_link": e.portal_link,
            "passcode": e.passcode,
            "status": e.status,
            "sent_at": e.sent_at.isoformat() if e.sent_at else None,
            "created_at": e.sent_at.isoformat() if e.sent_at else None,
            "body_html": e.body_html,
            "error_message": e.error_message
        }
        for e in emails
    ]
    return {"emails": results}

@router.post("/emails/test")
def send_test_email(
    req: TestEmailRequest = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    """
    Sends test email to abhinavclouds@gmail.com with live portal credentials.
    """
    recipient = req.recipient_email if req else "abhinavclouds@gmail.com"
    name = req.candidate_name if req else "Abhinav Sharma"
    job_title = req.job_title if req else "Senior Distributed Systems Architect"
    campaign = req.campaign_title if req else "Core Engineering 2026"
    
    portal_link = f"{InvitationService.get_portal_url('live_demo_priya_sharma_token')}"
    passcode = "TP-DEMO-99"

    res = EmailService.send_direct_email(
        db=db,
        recipient_email=recipient,
        recipient_name=name,
        job_title=job_title,
        campaign_title=campaign,
        portal_link=portal_link,
        passcode=passcode,
        custom_note="This is a test notification generated by TalentPilot AI Recruiter Command Center."
    )

    AuditService.log(
        db,
        action="SEND_TEST_EMAIL",
        resource_type="EMAIL",
        resource_id=res["email_id"],
        user_id=current_user.id,
        user_email=current_user.email,
        details={"recipient": recipient}
    )

    return res
