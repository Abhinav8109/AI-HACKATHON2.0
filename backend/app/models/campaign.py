import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.database import Base

class CampaignStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class HiringCampaign(Base):
    __tablename__ = "hiring_campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    job_level = Column(String(50), nullable=True)  # Junior, Mid, Senior, Lead, Executive
    location = Column(String(100), nullable=True)  # Remote, Hybrid, Onsite
    hiring_manager = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default=CampaignStatus.ACTIVE.value, nullable=False)
    
    # Interview Configuration
    question_count = Column(Integer, default=8)
    interview_duration_minutes = Column(Integer, default=30)
    difficulty_distribution = Column(JSON, default=lambda: {"junior": 2, "mid": 4, "senior": 2})
    follow_up_limits = Column(Integer, default=2)
    interview_language = Column(String(50), default="English")
    candidate_instructions = Column(Text, nullable=True)
    accessibility_accommodations = Column(Text, nullable=True)

    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="campaigns")
    job_descriptions = relationship("JobDescription", back_populates="campaign", cascade="all, delete-orphan")
    competency_matrix = relationship("CompetencyMatrix", back_populates="campaign", uselist=False, cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="campaign", cascade="all, delete-orphan")
    invitations = relationship("InterviewInvitation", back_populates="campaign", cascade="all, delete-orphan")
    evaluation_rubric = relationship("EvaluationRubric", back_populates="campaign", uselist=False, cascade="all, delete-orphan")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("hiring_campaigns.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    source_type = Column(String(50), default="PASTE")  # PASTE, PDF, DOCX
    file_path = Column(String(500), nullable=True)
    version = Column(Integer, default=1)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("HiringCampaign", back_populates="job_descriptions")

class CompetencyMatrix(Base):
    __tablename__ = "competency_matrices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("hiring_campaigns.id"), nullable=False)
    technical_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    job_competencies = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    role_scenarios = Column(JSON, default=list)
    behavioral_competencies = Column(JSON, default=list)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campaign = relationship("HiringCampaign", back_populates="competency_matrix")
