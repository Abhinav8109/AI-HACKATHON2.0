import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class CandidateStatus(str, Enum):
    NEW = "NEW"
    INVITED = "INVITED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    UNDER_REVIEW = "UNDER_REVIEW"
    REVIEWED = "REVIEWED"

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("hiring_campaigns.id"), nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(100), nullable=True)
    current_title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    status = Column(String(50), default=CandidateStatus.NEW.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campaign = relationship("HiringCampaign", back_populates="candidates")
    resume = relationship("CandidateResume", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    claims = relationship("ResumeClaim", back_populates="candidate", cascade="all, delete-orphan")
    interview_plan = relationship("InterviewPlan", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    invitations = relationship("InterviewInvitation", back_populates="candidate", cascade="all, delete-orphan")
    interview_session = relationship("InterviewSession", back_populates="candidate", uselist=False, cascade="all, delete-orphan")
    evaluation = relationship("CandidateEvaluation", back_populates="candidate", uselist=False, cascade="all, delete-orphan")

class CandidateResume(Base):
    __tablename__ = "candidate_resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    raw_text = Column(Text, nullable=False)
    parsed_skills = Column(JSON, default=list)
    parsed_experience = Column(JSON, default=list)
    parsed_projects = Column(JSON, default=list)
    parsed_education = Column(JSON, default=list)
    parsed_certifications = Column(JSON, default=list)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resume")

class ResumeClaim(Base):
    __tablename__ = "resume_claims"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    category = Column(String(50), default="TECHNICAL_SKILL")  # TECHNICAL_SKILL, PROJECT, EXPERIENCE, CERTIFICATION
    source_excerpt = Column(Text, nullable=True)
    verification_status = Column(String(50), default="UNVERIFIED")  # UNVERIFIED, SUPPORTED, INCONSISTENT, AMBIGUOUS
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="claims")
