from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.config import settings
from app.models.interview import InterviewInvitation, InterviewSession, InvitationStatus, SessionStatus
from app.models.candidate import Candidate, CandidateStatus
from app.models.campaign import HiringCampaign
from app.auth.security import generate_invitation_token, hash_token

class InvitationService:
    @staticmethod
    def create_invitation_for_candidate(
        db: Session,
        candidate_id: str,
        campaign_id: str,
        expire_hours: int = 72
    ) -> tuple[InterviewInvitation, str]:
        """
        Creates a unique cryptographically secure invitation link for a candidate.
        Returns the persistent InterviewInvitation record and the plaintext token (only once).
        """
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        campaign = db.query(HiringCampaign).filter(HiringCampaign.id == campaign_id).first()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Invalidate any previous active invitations for this candidate in this campaign
        existing_active = db.query(InterviewInvitation).filter(
            InterviewInvitation.candidate_id == candidate_id,
            InterviewInvitation.campaign_id == campaign_id,
            InterviewInvitation.status.in_([InvitationStatus.ISSUED.value, InvitationStatus.READY.value, InvitationStatus.DRAFT.value])
        ).all()
        for inv in existing_active:
            inv.status = InvitationStatus.REVOKED.value
            inv.revoked_at = datetime.utcnow()

        token = generate_invitation_token()
        token_h = hash_token(token)
        token_prefix = token[:8]
        expires_at = datetime.utcnow() + timedelta(hours=expire_hours)

        invitation = InterviewInvitation(
            candidate_id=candidate_id,
            campaign_id=campaign_id,
            token_hash=token_h,
            token_prefix=token_prefix,
            raw_token=token,
            status=InvitationStatus.ISSUED.value,
            expires_at=expires_at
        )
        db.add(invitation)
        db.flush()

        # Create or update candidate interview session
        session = db.query(InterviewSession).filter(InterviewSession.candidate_id == candidate_id).first()
        if not session:
            session_token = generate_invitation_token()
            session = InterviewSession(
                candidate_id=candidate_id,
                invitation_id=invitation.id,
                session_token_hash=hash_token(session_token),
                status=SessionStatus.NOT_STARTED.value
            )
            db.add(session)
        else:
            session.invitation_id = invitation.id

        candidate.status = CandidateStatus.INVITED.value
        db.commit()
        db.refresh(invitation)

        return invitation, token

    @staticmethod
    def get_portal_url(token: str) -> str:
        return f"{settings.APP_ORIGIN}/interview/{token}"

    @staticmethod
    def revoke_invitation(db: Session, invitation_id: str) -> InterviewInvitation:
        invitation = db.query(InterviewInvitation).filter(InterviewInvitation.id == invitation_id).first()
        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")
        invitation.status = InvitationStatus.REVOKED.value
        invitation.revoked_at = datetime.utcnow()
        db.commit()
        db.refresh(invitation)
        return invitation

    @staticmethod
    def regenerate_invitation(db: Session, invitation_id: str) -> tuple[InterviewInvitation, str]:
        old_invitation = db.query(InterviewInvitation).filter(InterviewInvitation.id == invitation_id).first()
        if not old_invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")
        old_invitation.status = InvitationStatus.REVOKED.value
        old_invitation.revoked_at = datetime.utcnow()

        return InvitationService.create_invitation_for_candidate(
            db=db,
            candidate_id=old_invitation.candidate_id,
            campaign_id=old_invitation.campaign_id,
            expire_hours=settings.INVITATION_EXPIRE_HOURS
        )
