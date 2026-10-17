import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class SentEmail(Base):
    __tablename__ = "sent_emails"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=True)
    campaign_id = Column(String(36), ForeignKey("hiring_campaigns.id"), nullable=True)
    invitation_id = Column(String(36), ForeignKey("interview_invitations.id"), nullable=True)
    recipient_email = Column(String(255), nullable=False)
    recipient_name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    body_html = Column(Text, nullable=False)
    portal_link = Column(String(500), nullable=False)
    passcode = Column(String(50), nullable=True)
    status = Column(String(50), default="SENT")  # SENT, FAILED, SIMULATED
    sent_at = Column(DateTime, default=datetime.utcnow)
    error_message = Column(Text, nullable=True)

    candidate = relationship("Candidate")
    campaign = relationship("HiringCampaign")
    invitation = relationship("InterviewInvitation")
