import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from app.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)  # Null if system event or anonymous candidate
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)  # CAMPAIGN, CANDIDATE, INVITATION, INTERVIEW, EVALUATION
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), nullable=True)
    campaign_id = Column(String(36), nullable=True)
    report_type = Column(String(50), nullable=False)  # PDF, JSON, CSV, TRANSCRIPT
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    generated_by_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
