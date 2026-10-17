from pydantic import BaseModel
from datetime import datetime
from typing import Any

class DashboardSummaryResponse(BaseModel):
    active_campaigns: int
    total_candidates: int
    invitations_generated: int
    interviews_in_progress: int
    completed_interviews: int
    pending_evaluations: int
    human_reviews_required: int
    expiring_invitations: int
    recent_assessments_count: int
    average_score: float | None = None
    approved_candidates: int = 0
    rejected_candidates: int = 0
    is_demo_data: bool = False

class ActivityFeedItem(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: str | None
    title: str
    description: str
    timestamp: datetime
    user_email: str | None
