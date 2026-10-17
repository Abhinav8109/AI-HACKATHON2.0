import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Integer, Boolean, Float
from sqlalchemy.orm import relationship
from app.database import Base

class InvitationStatus(str, Enum):
    DRAFT = "DRAFT"
    READY = "READY"
    ISSUED = "ISSUED"
    OPENED = "OPENED"
    REDEEMED = "REDEEMED"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class SessionStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"

class InterviewPlan(Base):
    __tablename__ = "interview_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    version = Column(Integer, default=1)
    is_approved = Column(Boolean, default=True)
    approved_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interview_plan")
    questions = relationship("InterviewQuestion", back_populates="plan", cascade="all, delete-orphan", order_by="InterviewQuestion.question_index")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String(36), ForeignKey("interview_plans.id"), nullable=False)
    question_index = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), default="TECHNICAL")  # TECHNICAL, SYSTEM_DESIGN, PROBLEM_SOLVING, BEHAVIORAL
    competency = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="MID")  # JUNIOR, MID, SENIOR
    purpose = Column(Text, nullable=True)
    relevant_jd_requirement = Column(Text, nullable=True)
    relevant_resume_claim = Column(Text, nullable=True)
    scoring_criteria = Column(Text, nullable=True)
    follow_up_guidance = Column(Text, nullable=True)

    plan = relationship("InterviewPlan", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question")

class InterviewInvitation(Base):
    __tablename__ = "interview_invitations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    campaign_id = Column(String(36), ForeignKey("hiring_campaigns.id"), nullable=False)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    token_prefix = Column(String(8), nullable=False)
    raw_token = Column(String(128), nullable=True)  # Plaintext token for copying & email delivery
    status = Column(String(50), default=InvitationStatus.ISSUED.value, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    opened_at = Column(DateTime, nullable=True)
    redeemed_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="invitations")
    campaign = relationship("HiringCampaign", back_populates="invitations")
    session = relationship("InterviewSession", back_populates="invitation", uselist=False)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    invitation_id = Column(String(36), ForeignKey("interview_invitations.id"), nullable=False)
    session_token_hash = Column(String(64), unique=True, index=True, nullable=False)
    status = Column(String(50), default=SessionStatus.NOT_STARTED.value, nullable=False)
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime, nullable=True)
    current_question_index = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interview_session")
    invitation = relationship("InterviewInvitation", back_populates="session")
    answers = relationship("InterviewAnswer", back_populates="session", cascade="all, delete-orphan", order_by="InterviewAnswer.saved_at")
    events = relationship("InterviewEvent", back_populates="session", cascade="all, delete-orphan", order_by="InterviewEvent.created_at")

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("interview_questions.id"), nullable=False)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    is_follow_up = Column(Boolean, default=False)
    parent_answer_id = Column(String(36), nullable=True)
    follow_up_prompt = Column(Text, nullable=True)
    word_count = Column(Integer, default=0)
    ai_score = Column(Float, nullable=True)
    ai_review = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="answers")
    question = relationship("InterviewQuestion", back_populates="answers")

class InterviewEvent(Base):
    __tablename__ = "interview_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="events")
