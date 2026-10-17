from pydantic import BaseModel
from datetime import datetime
from typing import Any

class JobDescriptionCreate(BaseModel):
    raw_text: str
    source_type: str = "PASTE"

class CompetencyItem(BaseModel):
    name: str
    category: str
    level: str = "REQUIRED"
    description: str

class CompetencyMatrixResponse(BaseModel):
    id: str
    campaign_id: str
    technical_skills: list[str] = []
    preferred_skills: list[str] = []
    job_competencies: list[dict[str, Any]] = []
    responsibilities: list[str] = []
    role_scenarios: list[str] = []
    behavioral_competencies: list[str] = []
    version: int

    class Config:
        from_attributes = True

class CampaignCreate(BaseModel):
    title: str
    job_title: str
    department: str | None = None
    job_level: str | None = "Mid-Senior"
    location: str | None = "Remote"
    hiring_manager: str | None = None
    description: str | None = None
    question_count: int = 8
    interview_duration_minutes: int = 30
    interview_language: str = "English"
    candidate_instructions: str | None = None
    accessibility_accommodations: str | None = None
    raw_jd_text: str | None = None

class CampaignUpdate(BaseModel):
    title: str | None = None
    job_title: str | None = None
    department: str | None = None
    job_level: str | None = None
    location: str | None = None
    hiring_manager: str | None = None
    description: str | None = None
    status: str | None = None
    question_count: int | None = None
    interview_duration_minutes: int | None = None
    interview_language: str | None = None
    candidate_instructions: str | None = None
    accessibility_accommodations: str | None = None

class CampaignResponse(BaseModel):
    id: str
    title: str
    job_title: str
    department: str | None
    job_level: str | None
    location: str | None
    hiring_manager: str | None
    description: str | None
    status: str
    question_count: int
    interview_duration_minutes: int
    interview_language: str
    candidate_instructions: str | None
    accessibility_accommodations: str | None
    created_at: datetime
    updated_at: datetime
    candidate_count: int = 0
    invitation_count: int = 0
    completed_interviews: int = 0

    class Config:
        from_attributes = True
