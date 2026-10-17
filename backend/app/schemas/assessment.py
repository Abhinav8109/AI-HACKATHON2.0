from pydantic import BaseModel
from datetime import datetime
from typing import Any

class EvidenceItemResponse(BaseModel):
    id: str
    dimension_name: str
    score: float
    rubric_anchor: str | None
    evidence_quote: str
    explanation: str
    missing_evidence: str | None
    confidence_limitations: str | None

    class Config:
        from_attributes = True

class ConsistencyFindingResponse(BaseModel):
    id: str
    claim_text: str
    answer_excerpt: str
    finding_type: str
    explanation: str
    suggested_follow_up: str | None

    class Config:
        from_attributes = True

class CriticReviewResponse(BaseModel):
    id: str
    alignment_score: float
    passed_validation: bool
    flags: list[str] = []
    critic_summary: str
    human_review_flagged: bool

    class Config:
        from_attributes = True

class HumanReviewRequest(BaseModel):
    review_notes: str
    status: str = "APPROVED"  # APPROVED, OVERRIDDEN, FLAG_NEEDS_INFO
    score_overrides: dict[str, float] = {}

class FinalDecisionRequest(BaseModel):
    decision: str  # ADVANCE, HOLD, NEXT_ROUND, REJECT
    rationale: str

class EvaluationResponse(BaseModel):
    id: str
    candidate_id: str
    overall_score: float
    recommendation: str
    summary: str
    strengths: list[str] = []
    development_areas: list[str] = []
    technical_score: float
    problem_solving_score: float
    practical_application_score: float
    role_knowledge_score: float
    communication_score: float
    behavioral_score: float
    human_review_required: bool
    candidate_feedback_text: str | None
    created_at: datetime
    evidence_items: list[EvidenceItemResponse] = []
    consistency_findings: list[ConsistencyFindingResponse] = []
    critic_reviews: list[CriticReviewResponse] = []

    class Config:
        from_attributes = True
