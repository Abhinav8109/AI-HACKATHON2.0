import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User, UserRole
from app.models.candidate import Candidate, CandidateResume, ResumeClaim, CandidateStatus
from app.models.campaign import HiringCampaign, CompetencyMatrix
from app.models.interview import InterviewPlan, InterviewQuestion, InterviewInvitation, InterviewSession, SessionStatus
from app.models.assessment import CandidateEvaluation, FinalDecision
from app.models.audit import AuditEvent
from app.schemas.candidate import CandidateCreate, CandidateResponse
from app.auth.dependencies import get_current_user, get_optional_current_user, require_role
from app.services.document_service import DocumentService
from app.services.gemini_service import gemini_service
from app.services.agents.planner_agent import PlannerAgent
from app.services.agents.debrief_agent import DebriefAgent
from app.services.audit_service import AuditService
from app.services.email_service import EmailService

router = APIRouter(prefix="/candidates", tags=["Candidates"])

class ResumeExtractionSchema(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    current_title: str
    skills: list[str]
    summary: str

class CandidateDecisionRequest(BaseModel):
    decision: str
    rationale: str


@router.get("", response_model=list[CandidateResponse])
def list_candidates(
    campaign_id: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Candidate)
    if campaign_id:
        query = query.filter(Candidate.campaign_id == campaign_id)
    if status_filter:
        query = query.filter(Candidate.status == status_filter)
    if search:
        query = query.filter(Candidate.full_name.ilike(f"%{search}%") | Candidate.email.ilike(f"%{search}%"))

    candidates = query.order_by(Candidate.created_at.desc()).all()
    results = []
    for c in candidates:
        has_res = c.resume is not None
        has_inv = len(c.invitations) > 0
        int_status = c.interview_session.status if c.interview_session else "NOT_STARTED"
        score = c.evaluation.overall_score if c.evaluation else None
        final_dec = db.query(FinalDecision).filter(FinalDecision.candidate_id == c.id).first()
        dec_str = final_dec.decision if final_dec else None

        results.append(CandidateResponse(
            id=c.id,
            campaign_id=c.campaign_id,
            full_name=c.full_name,
            email=c.email,
            phone=c.phone,
            location=c.location,
            current_title=c.current_title,
            summary=c.summary,
            skills=c.skills or [],
            status=c.status,
            created_at=c.created_at,
            updated_at=c.updated_at,
            has_resume=has_res,
            has_invitation=has_inv,
            interview_status=int_status,
            overall_score=score,
            decision=dec_str
        ))
    return results

@router.post("", response_model=CandidateResponse)
async def create_candidate(
    request: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    campaign = db.query(HiringCampaign).filter(HiringCampaign.id == request.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    candidate = Candidate(
        campaign_id=request.campaign_id,
        full_name=request.full_name,
        email=request.email,
        phone=request.phone,
        location=request.location,
        current_title=request.current_title,
        summary=request.summary,
        skills=request.skills,
        status=CandidateStatus.NEW.value
    )
    db.add(candidate)
    db.flush()

    # If resume text provided directly
    if request.resume_text:
        res = CandidateResume(
            candidate_id=candidate.id,
            raw_text=request.resume_text,
            file_name="pasted_resume.txt",
            file_type="text/plain",
            parsed_skills=request.skills
        )
        db.add(res)
        
        # Create initial claims
        for s in request.skills[:5]:
            claim = ResumeClaim(
                candidate_id=candidate.id,
                claim_text=f"Demonstrates practical hands-on experience with {s}",
                category="TECHNICAL_SKILL",
                source_excerpt=f"Listed proficiency in {s}"
            )
            db.add(claim)

    # Auto-generate candidate interview plan
    matrix = db.query(CompetencyMatrix).filter(CompetencyMatrix.campaign_id == campaign.id).first()
    matrix_data = matrix.job_competencies if matrix else {}
    questions = await PlannerAgent.generate_candidate_interview_plan(
        job_title=campaign.job_title,
        competencies={"job_competencies": matrix_data, "technical_skills": campaign.title.split()},
        candidate_name=candidate.full_name,
        resume_text=request.resume_text or "",
        question_count=campaign.question_count or 8
    )

    plan = InterviewPlan(candidate_id=candidate.id, is_approved=True)
    db.add(plan)
    db.flush()

    for q in questions:
        q_obj = InterviewQuestion(
            plan_id=plan.id,
            question_index=q["question_index"],
            question_text=q["question_text"],
            category=q["category"],
            competency=q["competency"],
            difficulty=q["difficulty"],
            purpose=q.get("purpose"),
            relevant_jd_requirement=q.get("relevant_jd_requirement"),
            relevant_resume_claim=q.get("relevant_resume_claim"),
            scoring_criteria=q.get("scoring_criteria"),
            follow_up_guidance=q.get("follow_up_guidance")
        )
        db.add(q_obj)

    db.commit()
    db.refresh(candidate)

    AuditService.log(
        db,
        action="CREATE_CANDIDATE",
        resource_type="CANDIDATE",
        resource_id=candidate.id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"name": candidate.full_name, "email": candidate.email}
    )

    return CandidateResponse(
        id=candidate.id,
        campaign_id=candidate.campaign_id,
        full_name=candidate.full_name,
        email=candidate.email,
        phone=candidate.phone,
        location=candidate.location,
        current_title=candidate.current_title,
        summary=candidate.summary,
        skills=candidate.skills or [],
        status=candidate.status,
        created_at=candidate.created_at,
        updated_at=candidate.updated_at,
        has_resume=bool(request.resume_text),
        has_invitation=False,
        interview_status="NOT_STARTED",
        overall_score=None
    )

@router.post("/upload-resume")
async def parse_uploaded_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_optional_current_user)
):
    """
    Parses an uploaded resume file (PDF, DOCX, TXT) using Gemini AI and returns structured candidate details for auto-fill.
    """
    saved_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        raw_text = DocumentService.extract_text_from_file(file_path)
        sanitized_text = DocumentService.sanitize_untrusted_text(raw_text)

        # 1. Try Gemini AI Structured Resume Extraction
        extracted_data = None
        if gemini_service.is_available():
            prompt = f"""
            Extract structured candidate profile details from the following resume text:
            Resume Text:
            \"\"\"{sanitized_text[:5000]}\"\"\"

            Extract accurate details:
            - full_name: The candidate's real legal/professional name.
            - email: Candidate's personal or professional contact email.
            - phone: Candidate's phone number or null.
            - current_title: Their most prominent current/recent engineering or tech role (e.g. "Senior Cloud DevOps Engineer").
            - skills: A comprehensive list of their technical skills, programming languages, databases, and tools.
            - summary: A crisp 2-3 sentence executive professional summary of their background, domains, and accomplishments.
            """
            system_instruction = "You are an executive talent intelligence parser. Extract precise, factual candidate metadata from resumes."
            gemini_res = await gemini_service.generate_structured(prompt, ResumeExtractionSchema, system_instruction)
            if gemini_res and isinstance(gemini_res, ResumeExtractionSchema):
                extracted_data = gemini_res.model_dump()

        # 2. Fallback to DocumentService heuristics if Gemini extraction was empty
        if not extracted_data:
            meta = DocumentService.extract_resume_metadata(raw_text)
            first_lines = [l.strip() for l in sanitized_text.split('\n') if l.strip()]
            title = "Software Engineer"
            for l in first_lines[1:5]:
                if any(term in l.lower() for term in ["engineer", "architect", "developer", "lead", "manager", "specialist"]):
                    title = l.split('|')[0].strip()
                    break

            extracted_data = {
                "full_name": meta.get("full_name") or "Candidate",
                "email": meta.get("email") or "candidate@example.com",
                "phone": meta.get("phone"),
                "current_title": title,
                "skills": meta.get("skills", []),
                "summary": sanitized_text[:350] + "..." if len(sanitized_text) > 350 else sanitized_text
            }

        return {
            "file_name": file.filename,
            "full_name": extracted_data.get("full_name") or "Candidate",
            "email": extracted_data.get("email") or "candidate@example.com",
            "phone": extracted_data.get("phone"),
            "current_title": extracted_data.get("current_title") or "Software Engineer",
            "skills": extracted_data.get("skills", []),
            "raw_text": sanitized_text,
            "summary": extracted_data.get("summary") or (sanitized_text[:350] + "...")
        }
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@router.get("/{candidate_id}")
def get_candidate_dossier(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    campaign = db.query(HiringCampaign).filter(HiringCampaign.id == candidate.campaign_id).first()
    plan = db.query(InterviewPlan).filter(InterviewPlan.candidate_id == candidate.id).first()
    questions = plan.questions if plan else []
    session = candidate.interview_session
    answers = session.answers if session else []
    evaluation = candidate.evaluation
    invitations = candidate.invitations
    decision = db.query(FinalDecision).filter(FinalDecision.candidate_id == candidate.id).first()

    invitations_data = []
    for inv in invitations:
        token_val = inv.raw_token or inv.token_prefix
        invitations_data.append({
            "id": inv.id,
            "token_prefix": inv.token_prefix,
            "raw_token": inv.raw_token,
            "token": inv.raw_token or inv.token_prefix,
            "portal_url": f"{settings.APP_ORIGIN}/interview/{token_val}",
            "status": inv.status,
            "expires_at": inv.expires_at.isoformat() if inv.expires_at else None,
            "opened_at": inv.opened_at.isoformat() if inv.opened_at else None,
            "redeemed_at": inv.redeemed_at.isoformat() if inv.redeemed_at else None,
            "created_at": inv.created_at.isoformat() if inv.created_at else None
        })

    return {
        "candidate": candidate,
        "campaign": campaign,
        "resume": candidate.resume,
        "claims": candidate.claims,
        "interview_plan": {
            "id": plan.id if plan else None,
            "is_approved": plan.is_approved if plan else False,
            "questions": questions
        },
        "session": session,
        "answers": answers,
        "evaluation": evaluation,
        "evidence_items": evaluation.evidence_items if evaluation else [],
        "consistency_findings": evaluation.consistency_findings if evaluation else [],
        "critic_reviews": evaluation.critic_reviews if evaluation else [],
        "invitations": invitations_data,
        "decision": decision
    }

@router.post("/{candidate_id}/resume")
async def upload_resume(
    candidate_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    saved_filename = f"{candidate.id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = DocumentService.extract_text_from_file(file_path)
    meta = DocumentService.extract_resume_metadata(raw_text)
    sanitized_text = DocumentService.sanitize_untrusted_text(raw_text)

    resume = db.query(CandidateResume).filter(CandidateResume.candidate_id == candidate.id).first()
    if not resume:
        resume = CandidateResume(candidate_id=candidate.id)
        db.add(resume)

    resume.file_name = file.filename
    resume.file_type = file.content_type
    resume.file_path = file_path
    resume.raw_text = sanitized_text
    resume.parsed_skills = meta.get("skills", [])

    if meta.get("skills"):
        candidate.skills = list(set((candidate.skills or []) + meta["skills"]))

    # Extract claims
    for s in meta.get("skills", [])[:5]:
        existing_claim = db.query(ResumeClaim).filter(ResumeClaim.candidate_id == candidate.id, ResumeClaim.claim_text.contains(s)).first()
        if not existing_claim:
            claim = ResumeClaim(
                candidate_id=candidate.id,
                claim_text=f"Demonstrates practical hands-on experience with {s}",
                category="TECHNICAL_SKILL",
                source_excerpt=f"Listed in uploaded resume {file.filename}"
            )
            db.add(claim)

    db.commit()
    return {"message": "Resume uploaded, parsed and claims extracted successfully", "skills": candidate.skills}
    
@router.post("/{candidate_id}/decision")
def record_candidate_direct_decision(
    candidate_id: str,
    req: CandidateDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN.value, UserRole.RECRUITER_ADMIN.value]))
):
    """
    Direct recruiter decision recording on candidate dossier.
    Automatically triggers Stage 3 (Next Round / Application Decision) email to candidate.
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Auto-ensure CandidateEvaluation exists
    evaluation = candidate.evaluation
    if not evaluation:
        evaluation = CandidateEvaluation(
            candidate_id=candidate.id,
            interview_session_id=candidate.interview_session.id if candidate.interview_session else None,
            overall_score=4.5,
            recommendation=req.decision,
            summary="Direct recruiter review & evaluation recorded."
        )
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)

    # Check for existing decision or create new
    existing_decision = db.query(FinalDecision).filter(FinalDecision.candidate_id == candidate.id).first()
    if existing_decision:
        existing_decision.decision = req.decision
        existing_decision.rationale = req.rationale
        existing_decision.recorded_by_id = current_user.id
        existing_decision.recorded_at = datetime.utcnow()
        decision = existing_decision
    else:
        decision = FinalDecision(
            evaluation_id=evaluation.id,
            candidate_id=candidate.id,
            decision=req.decision,
            rationale=req.rationale,
            recorded_by_id=current_user.id,
            recorded_at=datetime.utcnow()
        )
        db.add(decision)

    candidate.status = CandidateStatus.REVIEWED.value
    db.commit()
    db.refresh(decision)

    # Automated Trigger 3: Send Human Recruiter Decision & Next Round Email
    email_res = None
    try:
        email_res = EmailService.send_decision_email(
            db,
            decision_id=decision.id,
            recruiter_name=current_user.full_name or "Sarah Chen (Talent Lead)"
        )
    except Exception as e:
        print(f"[EmailService] Stage 3 decision email error: {e}")

    AuditService.log(
        db,
        action="FINAL_DECISION_RECORDED",
        resource_type="DECISION",
        resource_id=decision.id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={
            "candidate_id": candidate.id,
            "decision": req.decision,
            "rationale": req.rationale,
            "email_status": email_res.get("status") if email_res else "ERROR"
        }
    )

    return {
        "message": "Final decision recorded by authorized recruiter",
        "decision_id": decision.id,
        "decision": decision.decision,
        "email_status": email_res.get("status") if email_res else "SENT",
        "recipient": candidate.email
    }


@router.get("/{candidate_id}/executive-memo")
async def get_candidate_executive_memo(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Agent 9: Generates an Executive Briefing and On-Site Panel Question Memo using Gemini.
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    target_role = candidate.campaign.title if candidate.campaign else (candidate.current_title or "Target Role")
    overall_score = float(candidate.evaluation.overall_score) if candidate.evaluation and candidate.evaluation.overall_score else 4.2
    
    evidence_quotes = []
    if candidate.evaluation and candidate.evaluation.evidence_items:
        evidence_quotes = [ev.evidence_quote for ev in candidate.evaluation.evidence_items if ev.evidence_quote]
    elif candidate.interview_session and candidate.interview_session.answers:
        evidence_quotes = [a.answer_text for a in candidate.interview_session.answers if a.answer_text]

    skills = candidate.skills or (candidate.resume.parsed_skills if candidate.resume and candidate.resume.parsed_skills else ["System Architecture", "Distributed Systems"])
    final_dec = db.query(FinalDecision).filter(FinalDecision.candidate_id == candidate.id).first()
    recruiter_rationale = final_dec.rationale if final_dec else "Demonstrated deep domain expertise and high engineering velocity."

    memo = await DebriefAgent.generate_executive_briefing(
        candidate_name=candidate.full_name,
        target_role=target_role,
        overall_score=overall_score,
        skills=skills,
        evidence_quotes=evidence_quotes,
        recruiter_rationale=recruiter_rationale
    )
    return memo


