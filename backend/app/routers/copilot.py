from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.models.interview import InterviewAnswer
from app.models.assessment import FinalDecision
from app.auth.dependencies import get_current_user
from app.services.agents.copilot_agent import RecruiterCopilotAgent

router = APIRouter(prefix="/copilot", tags=["Recruiter Copilot"])

class CopilotQueryRequest(BaseModel):
    query: str
    campaign_id: str | None = None

@router.post("/query")
async def query_talent_copilot(
    request: CopilotQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autonomous Recruiter Copilot:
    Answers complex natural language inquiries regarding candidates, competencies, scores, and evidence.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    query = db.query(Candidate)
    if request.campaign_id:
        query = query.filter(Candidate.campaign_id == request.campaign_id)
    candidates = query.order_by(Candidate.created_at.desc()).limit(20).all()

    candidates_context = []
    for c in candidates:
        answers = db.query(InterviewAnswer).filter(InterviewAnswer.candidate_id == c.id).limit(4).all()
        final_dec = db.query(FinalDecision).filter(FinalDecision.candidate_id == c.id).first()
        candidates_context.append({
            "id": c.id,
            "full_name": c.full_name,
            "current_title": c.current_title,
            "skills": c.skills or [],
            "overall_score": c.evaluation.overall_score if c.evaluation else None,
            "decision": final_dec.decision if final_dec else None,
            "summary": c.summary or "",
            "key_answers": [a.answer_text[:140] for a in answers]
        })

    response = await RecruiterCopilotAgent.query_candidate_intelligence(
        recruiter_query=request.query,
        candidates_context=candidates_context
    )

    return response
