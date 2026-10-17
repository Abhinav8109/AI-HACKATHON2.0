import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Float, Boolean, Integer
from sqlalchemy.orm import relationship
from app.database import Base

class RecommendationType(str, Enum):
    ADVANCE = "ADVANCE"
    HOLD_FOR_REVIEW = "HOLD_FOR_REVIEW"
    FURTHER_ASSESSMENT = "FURTHER_ASSESSMENT"

class ConsistencyType(str, Enum):
    CONSISTENT = "CONSISTENT"
    SUPPORTED = "SUPPORTED"
    INCOMPLETE = "INCOMPLETE"
    AMBIGUOUS = "AMBIGUOUS"
    POTENTIAL_INCONSISTENCY = "POTENTIAL_INCONSISTENCY"

class FinalDecisionType(str, Enum):
    ADVANCE = "ADVANCE"
    HOLD = "HOLD"
    NEXT_ROUND = "NEXT_ROUND"
    REJECT = "REJECT"

class EvaluationRubric(Base):
    __tablename__ = "evaluation_rubrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("hiring_campaigns.id"), nullable=False)
    name = Column(String(255), default="Standard Engineering Rubric")
    version = Column(Integer, default=1)
    dimensions = Column(JSON, default=list)  # list of dimension configs with weights and anchors
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("HiringCampaign", back_populates="evaluation_rubric")

class CandidateEvaluation(Base):
    __tablename__ = "candidate_evaluations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    interview_session_id = Column(String(36), ForeignKey("interview_sessions.id"), nullable=True)
    overall_score = Column(Float, nullable=False)  # 1.0 - 5.0
    recommendation = Column(String(50), default=RecommendationType.HOLD_FOR_REVIEW.value, nullable=False)
    summary = Column(Text, nullable=False)
    strengths = Column(JSON, default=list)
    development_areas = Column(JSON, default=list)
    
    # Dimension Scores
    technical_score = Column(Float, default=0.0)
    problem_solving_score = Column(Float, default=0.0)
    practical_application_score = Column(Float, default=0.0)
    role_knowledge_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    behavioral_score = Column(Float, default=0.0)

    human_review_required = Column(Boolean, default=False)
    candidate_feedback_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="evaluation")
    evidence_items = relationship("EvaluationEvidence", back_populates="evaluation", cascade="all, delete-orphan")
    consistency_findings = relationship("ConsistencyFinding", back_populates="evaluation", cascade="all, delete-orphan")
    critic_reviews = relationship("CriticReview", back_populates="evaluation", cascade="all, delete-orphan")
    human_reviews = relationship("HumanReview", back_populates="evaluation", cascade="all, delete-orphan")
    final_decisions = relationship("FinalDecision", back_populates="evaluation", cascade="all, delete-orphan")

class EvaluationEvidence(Base):
    __tablename__ = "evaluation_evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String(36), ForeignKey("candidate_evaluations.id"), nullable=False)
    dimension_name = Column(String(100), nullable=False)
    score = Column(Float, nullable=False)
    rubric_anchor = Column(String(255), nullable=True)
    evidence_quote = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    missing_evidence = Column(Text, nullable=True)
    confidence_limitations = Column(Text, nullable=True)

    evaluation = relationship("CandidateEvaluation", back_populates="evidence_items")

class ConsistencyFinding(Base):
    __tablename__ = "consistency_findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String(36), ForeignKey("candidate_evaluations.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    answer_excerpt = Column(Text, nullable=False)
    finding_type = Column(String(50), default=ConsistencyType.CONSISTENT.value, nullable=False)
    explanation = Column(Text, nullable=False)
    suggested_follow_up = Column(Text, nullable=True)

    evaluation = relationship("CandidateEvaluation", back_populates="consistency_findings")

class CriticReview(Base):
    __tablename__ = "critic_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String(36), ForeignKey("candidate_evaluations.id"), nullable=False)
    alignment_score = Column(Float, default=1.0)  # 0.0 - 1.0 confidence in score-evidence alignment
    passed_validation = Column(Boolean, default=True)
    flags = Column(JSON, default=list)
    critic_summary = Column(Text, nullable=False)
    human_review_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    evaluation = relationship("CandidateEvaluation", back_populates="critic_reviews")

class HumanReview(Base):
    __tablename__ = "human_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String(36), ForeignKey("candidate_evaluations.id"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="APPROVED")  # APPROVED, OVERRIDDEN, FLAG_NEEDS_INFO
    review_notes = Column(Text, nullable=False)
    score_overrides = Column(JSON, default=dict)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    evaluation = relationship("CandidateEvaluation", back_populates="human_reviews")
    reviewer = relationship("User")

class FinalDecision(Base):
    __tablename__ = "final_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evaluation_id = Column(String(36), ForeignKey("candidate_evaluations.id"), nullable=False)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    decision = Column(String(50), nullable=False)  # ADVANCE, HOLD, NEXT_ROUND, REJECT
    rationale = Column(Text, nullable=False)
    recorded_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    evaluation = relationship("CandidateEvaluation", back_populates="final_decisions")
    recorded_by = relationship("User")
