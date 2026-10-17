from pydantic import BaseModel
from datetime import datetime
from typing import Any

class InvitationResponse(BaseModel):
    id: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    campaign_id: str
    campaign_title: str
    token_prefix: str
    portal_url: str
    raw_token: str | None = None
    token: str | None = None
    status: str
    expires_at: datetime
    opened_at: datetime | None = None
    redeemed_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: str
    question_index: int
    question_text: str
    category: str
    competency: str
    difficulty: str
    purpose: str | None = None

    class Config:
        from_attributes = True

class AnswerSubmitRequest(BaseModel):
    question_id: str
    answer_text: str
    is_follow_up: bool = False
    parent_answer_id: str | None = None
    follow_up_prompt: str | None = None
    duration_seconds: int = 0

class AnswerResponse(BaseModel):
    id: str
    question_id: str
    candidate_id: str
    answer_text: str
    is_follow_up: bool
    follow_up_prompt: str | None
    word_count: int
    saved_at: datetime

    class Config:
        from_attributes = True

class CandidatePortalSessionResponse(BaseModel):
    candidate_name: str
    job_title: str
    campaign_title: str
    duration_minutes: int
    question_count: int
    consent_given: bool
    session_status: str
    current_question_index: int
    candidate_instructions: str | None
    accessibility_accommodations: str | None

class EventLogRequest(BaseModel):
    event_type: str
    event_data: dict[str, Any] = {}
