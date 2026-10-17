from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.campaign import HiringCampaign, JobDescription, CompetencyMatrix, CampaignStatus
from app.models.candidate import Candidate
from app.models.interview import InterviewInvitation, InterviewSession, SessionStatus
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse, CompetencyMatrixResponse
from app.auth.dependencies import get_current_user, require_role
from app.services.agents.planner_agent import PlannerAgent
from app.services.audit_service import AuditService

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("", response_model=list[CampaignResponse])
def list_campaigns(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(HiringCampaign)
    if status_filter:
        query = query.filter(HiringCampaign.status == status_filter)
    campaigns = query.order_by(HiringCampaign.created_at.desc()).all()

    result = []
    for c in campaigns:
        cand_count = db.query(Candidate).filter(Candidate.campaign_id == c.id).count()
        inv_count = db.query(InterviewInvitation).filter(InterviewInvitation.campaign_id == c.id).count()
        completed = db.query(InterviewSession).join(Candidate).filter(
            Candidate.campaign_id == c.id,
            InterviewSession.status == SessionStatus.COMPLETED.value
        ).count()

        resp = CampaignResponse(
            id=c.id,
            title=c.title,
            job_title=c.job_title,
            department=c.department,
            job_level=c.job_level,
            location=c.location,
            hiring_manager=c.hiring_manager,
            description=c.description,
            status=c.status,
            question_count=c.question_count,
            interview_duration_minutes=c.interview_duration_minutes,
            interview_language=c.interview_language,
            candidate_instructions=c.candidate_instructions,
            accessibility_accommodations=c.accessibility_accommodations,
            created_at=c.created_at,
            updated_at=c.updated_at,
            candidate_count=cand_count,
            invitation_count=inv_count,
            completed_interviews=completed
        )
        result.append(resp)
    return result

@router.post("", response_model=CampaignResponse)
async def create_campaign(
    request: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    campaign = HiringCampaign(
        title=request.title,
        job_title=request.job_title,
        department=request.department,
        job_level=request.job_level,
        location=request.location,
        hiring_manager=request.hiring_manager,
        description=request.description,
        question_count=request.question_count,
        interview_duration_minutes=request.interview_duration_minutes,
        interview_language=request.interview_language,
        candidate_instructions=request.candidate_instructions,
        accessibility_accommodations=request.accessibility_accommodations,
        organization_id=current_user.organization_id
    )
    db.add(campaign)
    db.flush()

    # Save Job Description if provided
    if request.raw_jd_text:
        jd = JobDescription(
            campaign_id=campaign.id,
            raw_text=request.raw_jd_text,
            source_type="PASTE",
            version=1
        )
        db.add(jd)
        db.flush()

        # Run AI competency extraction
        extracted = await PlannerAgent.extract_competencies(request.job_title, request.raw_jd_text)
        comp_matrix = CompetencyMatrix(
            campaign_id=campaign.id,
            technical_skills=extracted.get("technical_skills", []),
            preferred_skills=extracted.get("preferred_skills", []),
            job_competencies=extracted.get("job_competencies", []),
            responsibilities=extracted.get("responsibilities", []),
            role_scenarios=extracted.get("role_scenarios", []),
            behavioral_competencies=extracted.get("behavioral_competencies", []),
            version=1
        )
        db.add(comp_matrix)

    db.commit()
    db.refresh(campaign)

    AuditService.log(
        db,
        action="CREATE_CAMPAIGN",
        resource_type="CAMPAIGN",
        resource_id=campaign.id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"title": campaign.title, "job_title": campaign.job_title}
    )

    return CampaignResponse(
        id=campaign.id,
        title=campaign.title,
        job_title=campaign.job_title,
        department=campaign.department,
        job_level=campaign.job_level,
        location=campaign.location,
        hiring_manager=campaign.hiring_manager,
        description=campaign.description,
        status=campaign.status,
        question_count=campaign.question_count,
        interview_duration_minutes=campaign.interview_duration_minutes,
        interview_language=campaign.interview_language,
        candidate_instructions=campaign.candidate_instructions,
        accessibility_accommodations=campaign.accessibility_accommodations,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
        candidate_count=0,
        invitation_count=0,
        completed_interviews=0
    )

@router.get("/{campaign_id}")
def get_campaign_detail(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaign = db.query(HiringCampaign).filter(HiringCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    jd = db.query(JobDescription).filter(JobDescription.campaign_id == campaign.id).order_by(JobDescription.version.desc()).first()
    matrix = db.query(CompetencyMatrix).filter(CompetencyMatrix.campaign_id == campaign.id).first()
    candidates = db.query(Candidate).filter(Candidate.campaign_id == campaign.id).all()

    return {
        "campaign": campaign,
        "job_description": jd,
        "competency_matrix": matrix,
        "candidate_count": len(candidates)
    }

@router.post("/{campaign_id}/analyze-jd")
async def analyze_campaign_jd(
    campaign_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    campaign = db.query(HiringCampaign).filter(HiringCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    jd_text = payload.get("raw_jd_text") or (campaign.job_descriptions[0].raw_text if campaign.job_descriptions else "")
    if not jd_text:
        raise HTTPException(status_code=400, detail="Job description text is required")

    extracted = await PlannerAgent.extract_competencies(campaign.job_title, jd_text)
    
    matrix = db.query(CompetencyMatrix).filter(CompetencyMatrix.campaign_id == campaign_id).first()
    if not matrix:
        matrix = CompetencyMatrix(campaign_id=campaign_id)
        db.add(matrix)
    
    matrix.technical_skills = extracted.get("technical_skills", [])
    matrix.preferred_skills = extracted.get("preferred_skills", [])
    matrix.job_competencies = extracted.get("job_competencies", [])
    matrix.responsibilities = extracted.get("responsibilities", [])
    matrix.role_scenarios = extracted.get("role_scenarios", [])
    matrix.behavioral_competencies = extracted.get("behavioral_competencies", [])
    matrix.version = (matrix.version or 1) + 1

    db.commit()
    db.refresh(matrix)
    return matrix

@router.get("/{campaign_id}/calibration")
async def get_campaign_calibration(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autonomous Talent Calibration Agent:
    Ranks and comparatively calibrates all evaluated candidates under this campaign.
    """
    from app.services.agents.calibration_agent import CalibrationAgent
    from app.models.assessment import FinalDecision

    campaign = db.query(HiringCampaign).filter(HiringCampaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    candidates = db.query(Candidate).filter(Candidate.campaign_id == campaign_id).all()
    cands_data = []
    for c in candidates:
        score = c.evaluation.overall_score if c.evaluation else None
        quotes = [ev.evidence_quote for ev in c.evaluation.evidence_items if ev.evidence_quote] if c.evaluation and c.evaluation.evidence_items else []
        final_dec = db.query(FinalDecision).filter(FinalDecision.candidate_id == c.id).first()
        cands_data.append({
            "id": c.id,
            "full_name": c.full_name,
            "current_title": c.current_title,
            "skills": c.skills or [],
            "overall_score": score,
            "decision": final_dec.decision if final_dec else None,
            "summary": c.summary or "",
            "evidence_quotes": quotes
        })

    calibration = await CalibrationAgent.calibrate_campaign_candidates(
        campaign_title=campaign.title,
        job_title=campaign.job_title,
        candidates_data=cands_data
    )
    return calibration
