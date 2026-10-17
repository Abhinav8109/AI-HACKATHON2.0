from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Any

class CandidateCreate(BaseModel):
    campaign_id: str
    full_name: str
    email: EmailStr
    phone: str | None = None
    location: str | None = None
    current_title: str | None = None
    summary: str | None = None
    skills: list[str] = []
    resume_text: str | None = None

class CandidateUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    current_title: str | None = None
    summary: str | None = None
    skills: list[str] | None = None
    status: str | None = None

class ResumeClaimResponse(BaseModel):
    id: str
    claim_text: str
    category: str
    source_excerpt: str | None = None
    verification_status: str

    class Config:
        from_attributes = True

class CandidateResumeResponse(BaseModel):
    id: str
    file_name: str | None
    file_type: str | None
    raw_text: str
    parsed_skills: list[str] = []
    parsed_experience: list[dict[str, Any]] = []
    parsed_projects: list[dict[str, Any]] = []
    parsed_education: list[dict[str, Any]] = []
    parsed_certifications: list[str] = []
    uploaded_at: datetime

    class Config:
        from_attributes = True

class CandidateResponse(BaseModel):
    id: str
    campaign_id: str
    full_name: str
    email: str
    phone: str | None
    location: str | None
    current_title: str | None
    summary: str | None
    skills: list[str] = []
    status: str
    created_at: datetime
    updated_at: datetime
    has_resume: bool = False
    has_invitation: bool = False
    interview_status: str = "NOT_STARTED"
    overall_score: float | None = None
    decision: str | None = None

    class Config:
        from_attributes = True
