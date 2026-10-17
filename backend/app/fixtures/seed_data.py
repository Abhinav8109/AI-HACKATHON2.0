from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User, Organization, UserRole
from app.models.campaign import HiringCampaign, JobDescription, CompetencyMatrix, CampaignStatus
from app.models.candidate import Candidate, CandidateResume, ResumeClaim, CandidateStatus
from app.models.interview import (
    InterviewPlan, InterviewQuestion, InterviewInvitation, InterviewSession,
    InterviewAnswer, InterviewEvent, InvitationStatus, SessionStatus
)
from app.models.assessment import (
    CandidateEvaluation, EvaluationEvidence, ConsistencyFinding, CriticReview,
    FinalDecision, RecommendationType
)
from app.models.audit import AuditEvent
from app.models.email_log import SentEmail
from app.config import settings
from app.auth.security import hash_password, generate_invitation_token, hash_token
from app.services.audit_service import AuditService

def seed_database(db: Session):
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == "admin@talentpilot.ai").first()
    if existing_admin:
        return

    print("Seeding initial TalentPilot AI demo fixtures...")

    # 1. Organization
    org = Organization(
        name="TalentPilot Global Enterprise",
        slug="talentpilot-global"
    )
    db.add(org)
    db.flush()

    # 2. Super Admin & Recruiter
    admin = User(
        email="admin@talentpilot.ai",
        hashed_password=hash_password("talentpilot123"),
        full_name="Sarah Chen (Talent Lead)",
        role=UserRole.SUPER_ADMIN.value,
        organization_id=org.id,
        is_active=True
    )
    db.add(admin)
    db.flush()

    # 3. Hiring Campaign: Senior Full-Stack AI Engineer
    campaign = HiringCampaign(
        title="Senior Full-Stack AI Engineer",
        job_title="Senior Full-Stack AI Engineer",
        department="Engineering Intelligence",
        job_level="Senior",
        location="Remote (Global)",
        hiring_manager="Dr. Alan Turing",
        description="Lead the design and implementation of production agentic recruitment workflows and real-time candidate portals.",
        status=CampaignStatus.ACTIVE.value,
        question_count=6,
        interview_duration_minutes=30,
        interview_language="English",
        candidate_instructions="Welcome to your TalentPilot AI interview. Answer each scenario thoroughly with real technical examples from your recent systems experience.",
        organization_id=org.id
    )
    db.add(campaign)
    db.flush()

    # JD
    jd_text = """
    We are seeking a Senior Full-Stack AI Engineer to build next-generation adaptive hiring intelligence platforms.
    Responsibilities:
    - Architect robust FastAPI and React/TypeScript web applications with high concurrency and strict data isolation.
    - Integrate Gemini and LLM agents into production decision support pipelines.
    - Design scalable relational schemas and optimize database performance under heavy traffic.
    - Build observable, resilient microservices with structured audit trails.
    
    Requirements:
    - 5+ years building full-stack applications with Python, FastAPI, React, and TypeScript.
    - Strong grounding in system design, database indexing, and async event queues.
    - Practical experience integrating LLM tool-calling and structured schemas.
    - Collaborative mindset and empathy for candidate experience.
    """
    jd = JobDescription(
        campaign_id=campaign.id,
        raw_text=jd_text.strip(),
        source_type="PASTE",
        version=1
    )
    db.add(jd)

    # Competency Matrix
    comp_matrix = CompetencyMatrix(
        campaign_id=campaign.id,
        technical_skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Gemini AI", "Docker"],
        preferred_skills=["Distributed Systems", "Kubernetes", "Redis", "Vector Databases"],
        job_competencies=[
            {"name": "Full-Stack Architecture", "category": "Technical", "level": "REQUIRED", "description": "End-to-end design across React UI, FastAPI APIs, and relational models"},
            {"name": "AI Agent Integration", "category": "Technical", "level": "REQUIRED", "description": "Structured tool calling and reliable fallback architectures"},
            {"name": "System Reliability & Debugging", "category": "Engineering", "level": "REQUIRED", "description": "Methodical root cause analysis and telemetry metrics"},
            {"name": "Cross-Functional Collaboration", "category": "Behavioral", "level": "REQUIRED", "description": "Clear technical debate and alignment"}
        ],
        responsibilities=[
            "Architect resilient web applications with candidate data isolation",
            "Implement multi-agent workflows with evidence-based scoring",
            "Maintain high test coverage and production deployment pipelines"
        ],
        role_scenarios=[
            "Handling latency bottlenecks during high-volume interview submissions",
            "Preventing prompt injection attacks in candidate uploaded documents"
        ],
        behavioral_competencies=["Constructive technical debate", "Empathetic communication", "Continuous learning"]
    )
    db.add(comp_matrix)
    db.flush()

    # 4. Candidate 1: Alex Morgan (COMPLETED & EVALUATED)
    c1 = Candidate(
        campaign_id=campaign.id,
        full_name="Alex Morgan",
        email="alex.morgan@example.com",
        phone="+1 555-019-2834",
        location="San Francisco, CA",
        current_title="Senior Software Engineer",
        summary="Full-stack engineer with 6 years experience specializing in high-throughput Python backends and modern React interfaces.",
        skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "Redis"],
        status=CandidateStatus.COMPLETED.value
    )
    db.add(c1)
    db.flush()

    # C1 Resume
    c1_resume = CandidateResume(
        candidate_id=c1.id,
        file_name="Alex_Morgan_Resume.pdf",
        file_type="application/pdf",
        raw_text="Alex Morgan - Senior Software Engineer. Built microservices handling 50k RPM with FastAPI and Redis. Designed responsive dashboards in React and TypeScript.",
        parsed_skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Redis"]
    )
    db.add(c1_resume)

    # C1 Claims
    claim1 = ResumeClaim(
        candidate_id=c1.id,
        claim_text="Scaled FastAPI microservices handling 50,000 RPM with Redis caching.",
        category="WORK_EXPERIENCE",
        source_excerpt="Previous Senior Engineer at FinTech Corp",
        verification_status="SUPPORTED"
    )
    claim2 = ResumeClaim(
        candidate_id=c1.id,
        claim_text="Designed enterprise React design system with WCAG 2.2 accessibility compliance.",
        category="TECHNICAL_SKILL",
        source_excerpt="Led frontend component modernization",
        verification_status="SUPPORTED"
    )
    db.add(claim1)
    db.add(claim2)

    # C1 Interview Plan
    plan1 = InterviewPlan(candidate_id=c1.id, is_approved=True)
    db.add(plan1)
    db.flush()

    q1_1 = InterviewQuestion(
        plan_id=plan1.id,
        question_index=0,
        question_text="Looking at your experience, can you walk us through a complex system or project where you utilized FastAPI and Redis? What architectural trade-offs did you make?",
        category="TECHNICAL",
        competency="Full-Stack Architecture",
        difficulty="MID",
        relevant_jd_requirement="FastAPI and asynchronous Python backend architecture",
        relevant_resume_claim="Scaled FastAPI microservices handling 50,000 RPM with Redis caching."
    )
    q1_2 = InterviewQuestion(
        plan_id=plan1.id,
        question_index=1,
        question_text="How do you approach database schema design and indexing in PostgreSQL to maintain sub-50ms query latency under heavy write traffic?",
        category="TECHNICAL",
        competency="Data Engineering & Storage",
        difficulty="SENIOR",
        relevant_jd_requirement="Relational database optimization",
        relevant_resume_claim="PostgreSQL indexing and query optimization"
    )
    q1_3 = InterviewQuestion(
        plan_id=plan1.id,
        question_index=2,
        question_text="Describe a real-world production incident you diagnosed. What debugging tools and telemetry metrics did you rely on to isolate the root cause?",
        category="PROBLEM_SOLVING",
        competency="System Reliability & Debugging",
        difficulty="SENIOR",
        relevant_jd_requirement="Production incident troubleshooting and distributed tracing",
        relevant_resume_claim="Maintained 99.99% uptime on payment infrastructure"
    )
    db.add(q1_1)
    db.add(q1_2)
    db.add(q1_3)
    db.flush()

    # C1 Invitation (Completed)
    c1_token = "demo_alex_token_complete_12345"
    inv1 = InterviewInvitation(
        candidate_id=c1.id,
        campaign_id=campaign.id,
        token_hash=hash_token(c1_token),
        token_prefix="demo_ale",
        raw_token=c1_token,
        status=InvitationStatus.COMPLETED.value,
        expires_at=datetime.utcnow() + timedelta(days=5),
        opened_at=datetime.utcnow() - timedelta(hours=2),
        redeemed_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(inv1)
    db.flush()

    # C1 Session
    s1 = InterviewSession(
        candidate_id=c1.id,
        invitation_id=inv1.id,
        session_token_hash=hash_token("c1_session_completed"),
        status=SessionStatus.COMPLETED.value,
        consent_given=True,
        consent_timestamp=datetime.utcnow() - timedelta(hours=2),
        current_question_index=3,
        started_at=datetime.utcnow() - timedelta(hours=2),
        completed_at=datetime.utcnow() - timedelta(hours=1, minutes=30)
    )
    db.add(s1)
    db.flush()

    # C1 Answers
    ans1_1 = InterviewAnswer(
        session_id=s1.id,
        question_id=q1_1.id,
        candidate_id=c1.id,
        answer_text="At my previous role, we decoupled order ingestion from order settlement using FastAPI endpoints that pushed write events to Redis Streams. This protected our primary PostgreSQL database from sudden traffic surges during flash sales. The primary trade-off was accepting eventual consistency for downstream analytics in exchange for guaranteed sub-15ms client response times.",
        is_follow_up=False,
        word_count=58,
        saved_at=datetime.utcnow() - timedelta(hours=1, minutes=55)
    )
    ans1_2 = InterviewAnswer(
        session_id=s1.id,
        question_id=q1_2.id,
        candidate_id=c1.id,
        answer_text="For heavy write workloads, we partitioned the ledger table by month using PostgreSQL declarative partitioning. We also eliminated unnecessary secondary indexes on write-heavy tables, relying instead on composite BRIN indexes for timestamped records and standard B-trees only for unique lookup keys. This reduced write amplification significantly.",
        is_follow_up=False,
        word_count=51,
        saved_at=datetime.utcnow() - timedelta(hours=1, minutes=45)
    )
    ans1_3 = InterviewAnswer(
        session_id=s1.id,
        question_id=q1_3.id,
        candidate_id=c1.id,
        answer_text="During an unexpected p99 latency spike, I used distributed tracing in Datadog and isolated connection pool starvation in SQLAlchemy. We had a missing timeout on an external webhook call holding connection slots open. I introduced an explicit 2-second timeout and circuit breaker, immediately restoring pool capacity and lowering latency.",
        is_follow_up=False,
        word_count=53,
        saved_at=datetime.utcnow() - timedelta(hours=1, minutes=35)
    )
    db.add(ans1_1)
    db.add(ans1_2)
    db.add(ans1_3)

    # C1 Evaluation
    eval1 = CandidateEvaluation(
        candidate_id=c1.id,
        interview_session_id=s1.id,
        overall_score=4.4,
        recommendation=RecommendationType.ADVANCE.value,
        summary="Alex demonstrated exceptional depth in asynchronous system architecture, PostgreSQL performance tuning, and incident resolution. Responses were supported by concrete metrics, trade-off awareness, and clear technical communication.",
        strengths=[
            "Superb understanding of eventual consistency trade-offs using Redis Streams",
            "Pragmatic PostgreSQL write optimization via declarative partitioning and BRIN indexes",
            "Rapid, structured root-cause analysis for connection pool starvation"
        ],
        development_areas=[
            "Could expand on automated canary deployment validation"
        ],
        technical_score=4.6,
        problem_solving_score=4.5,
        practical_application_score=4.4,
        role_knowledge_score=4.3,
        communication_score=4.5,
        behavioral_score=4.2,
        human_review_required=False,
        candidate_feedback_text="Alex provided exemplary technical answers demonstrating mature architectural judgment. We recommend advancing to the executive team interview."
    )
    db.add(eval1)
    db.flush()

    # C1 Evidence items
    ev1 = EvaluationEvidence(
        evaluation_id=eval1.id,
        dimension_name="Technical Competency",
        score=4.6,
        rubric_anchor="Advanced demonstration",
        evidence_quote="At my previous role, we decoupled order ingestion from order settlement using FastAPI endpoints that pushed write events to Redis Streams.",
        explanation="Demonstrates mastery of asynchronous messaging and decoupled microservice patterns."
    )
    ev2 = EvaluationEvidence(
        evaluation_id=eval1.id,
        dimension_name="Problem Solving",
        score=4.5,
        rubric_anchor="Strong demonstration",
        evidence_quote="I used distributed tracing in Datadog and isolated connection pool starvation in SQLAlchemy. We had a missing timeout on an external webhook call holding connection slots open.",
        explanation="Systematic observability and immediate remediation of production bottleneck."
    )
    db.add(ev1)
    db.add(ev2)

    # C1 Consistency findings
    cf1 = ConsistencyFinding(
        evaluation_id=eval1.id,
        claim_text="Scaled FastAPI microservices handling 50,000 RPM with Redis caching.",
        answer_excerpt="decoupled order ingestion from order settlement using FastAPI endpoints that pushed write events to Redis Streams",
        finding_type="CONSISTENT",
        explanation="Candidate's technical explanations directly substantiate high-throughput distributed caching experience."
    )
    db.add(cf1)

    # C1 Critic Review
    crit1 = CriticReview(
        evaluation_id=eval1.id,
        alignment_score=0.98,
        passed_validation=True,
        flags=[],
        critic_summary="Audit confirmed: all scores match verbatim answer evidence with no unsupported claims.",
        human_review_flagged=False
    )
    db.add(crit1)

    # 5. Candidate 2: Priya Sharma (ACTIVE INVITATION LINK READY FOR JUDGES TO TRY LIVE!)
    c2 = Candidate(
        campaign_id=campaign.id,
        full_name="Priya Sharma",
        email="priya.sharma@example.com",
        phone="+1 555-082-7711",
        location="Austin, TX",
        current_title="AI Application Engineer",
        summary="Specialized in conversational AI agents, FastAPI microservices, and React frontends.",
        skills=["Python", "FastAPI", "React", "TypeScript", "LangChain", "Gemini", "PostgreSQL"],
        status=CandidateStatus.INVITED.value
    )
    db.add(c2)
    db.flush()

    c2_resume = CandidateResume(
        candidate_id=c2.id,
        file_name="Priya_Sharma_Resume.pdf",
        file_type="application/pdf",
        raw_text="Priya Sharma - AI Engineer. Developed agentic workflows with LLM tool calling. Built responsive React dashboards.",
        parsed_skills=["Python", "FastAPI", "React", "Gemini", "LangChain"]
    )
    db.add(c2_resume)

    # C2 Plan
    plan2 = InterviewPlan(candidate_id=c2.id, is_approved=True)
    db.add(plan2)
    db.flush()

    q2_1 = InterviewQuestion(
        plan_id=plan2.id,
        question_index=0,
        question_text="Could you describe how you architect agentic workflows with LLMs to guarantee reliable JSON structured outputs and prevent hallucinations in production?",
        category="TECHNICAL",
        competency="AI Agent Integration",
        difficulty="MID",
        relevant_jd_requirement="Structured LLM outputs and agent tooling",
        relevant_resume_claim="Developed agentic workflows with LLM tool calling"
    )
    q2_2 = InterviewQuestion(
        plan_id=plan2.id,
        question_index=1,
        question_text="How do you handle API security and prevent prompt injection when ingesting untrusted candidate resumes or external documents?",
        category="TECHNICAL",
        competency="System Security & Hardening",
        difficulty="SENIOR",
        relevant_jd_requirement="API security and untrusted data sanitization",
        relevant_resume_claim="Hardened FastAPI microservice authentication"
    )
    q2_3 = InterviewQuestion(
        plan_id=plan2.id,
        question_index=2,
        question_text="When building accessible frontend interfaces in React and Tailwind, what techniques do you use to ensure compliance with WCAG 2.2 AA standards?",
        category="TECHNICAL",
        competency="Full-Stack Architecture",
        difficulty="MID",
        relevant_jd_requirement="Accessible UI component development",
        relevant_resume_claim="Built responsive React dashboards"
    )
    db.add(q2_1)
    db.add(q2_2)
    db.add(q2_3)
    db.flush()

    # C2 Invitation (Token: live_demo_priya_sharma_token)
    c2_token = "live_demo_priya_sharma_token"
    inv2 = InterviewInvitation(
        candidate_id=c2.id,
        campaign_id=campaign.id,
        token_hash=hash_token(c2_token),
        token_prefix="live_dem",
        raw_token=c2_token,
        status=InvitationStatus.ISSUED.value,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(inv2)
    db.flush()

    s2 = InterviewSession(
        candidate_id=c2.id,
        invitation_id=inv2.id,
        session_token_hash=hash_token("c2_session_active"),
        status=SessionStatus.NOT_STARTED.value,
        current_question_index=0
    )
    db.add(s2)

    # 6. Candidate 3: Marcus Vance (UNDER HUMAN REVIEW FLAG)
    c3 = Candidate(
        campaign_id=campaign.id,
        full_name="Marcus Vance",
        email="marcus.vance@example.com",
        location="Seattle, WA",
        current_title="Software Developer",
        summary="Backend developer with Python and cloud infrastructure experience.",
        skills=["Python", "Django", "AWS", "Docker"],
        status=CandidateStatus.UNDER_REVIEW.value
    )
    db.add(c3)
    db.flush()

    plan3 = InterviewPlan(candidate_id=c3.id, is_approved=True)
    db.add(plan3)
    db.flush()

    q3_1 = InterviewQuestion(
        plan_id=plan3.id,
        question_index=0,
        question_text="Walk us through your approach to containerizing Python applications with Docker and optimizing image size.",
        category="TECHNICAL",
        competency="Cloud & DevOps",
        difficulty="MID"
    )
    db.add(q3_1)

    c3_token = "marcus_demo_review_flagged_token"
    inv3 = InterviewInvitation(
        candidate_id=c3.id,
        campaign_id=campaign.id,
        token_hash=hash_token(c3_token),
        token_prefix="marcus_d",
        raw_token=c3_token,
        status=InvitationStatus.COMPLETED.value,
        expires_at=datetime.utcnow() + timedelta(days=2)
    )
    db.add(inv3)
    db.flush()

    s3 = InterviewSession(
        candidate_id=c3.id,
        invitation_id=inv3.id,
        session_token_hash=hash_token("c3_session"),
        status=SessionStatus.COMPLETED.value,
        consent_given=True,
        current_question_index=1
    )
    db.add(s3)
    db.flush()

    ans3_1 = InterviewAnswer(
        session_id=s3.id,
        question_id=q3_1.id,
        candidate_id=c3.id,
        answer_text="I use multi-stage builds and alpine bases to keep container layers light.",
        is_follow_up=False,
        word_count=12
    )
    db.add(ans3_1)

    eval3 = CandidateEvaluation(
        candidate_id=c3.id,
        interview_session_id=s3.id,
        overall_score=3.1,
        recommendation=RecommendationType.HOLD_FOR_REVIEW.value,
        summary="Marcus provided concise answers. While fundamental principles were correct, deeper elaboration on production edge cases is needed.",
        strengths=["Familiarity with multi-stage Docker builds"],
        development_areas=["Needs to articulate caching strategies and security scanning in CI"],
        human_review_required=True
    )
    db.add(eval3)
    db.flush()

    crit3 = CriticReview(
        evaluation_id=eval3.id,
        alignment_score=0.82,
        passed_validation=True,
        flags=["Candidate answer is brief (< 25 words). Human recruiter review required before proceeding."],
        critic_summary="Human review requested due to borderline depth on container security.",
        human_review_flagged=True
    )
    db.add(crit3)

    # 7. Candidate 4: Abhinav Sharma (abhinavclouds@gmail.com) — Senior Distributed Systems Architect
    c4 = Candidate(
        campaign_id=campaign.id,
        full_name="Abhinav Sharma",
        email="abhinavclouds@gmail.com",
        phone="+1 555-392-8819",
        location="San Francisco, CA (Remote)",
        current_title="Senior Distributed Systems Architect",
        summary="Senior Distributed Systems Architect with 8+ years designing fault-tolerant event-driven platforms, high-concurrency microservices, and distributed storage engines. Proven track record scaling backends handling 150k+ RPS.",
        skills=["Distributed Systems", "Go", "Python", "Apache Kafka", "PostgreSQL", "Redis Cluster", "Raft Consensus", "Kubernetes"],
        status=CandidateStatus.INVITED.value
    )
    db.add(c4)
    db.flush()

    c4_resume_text = """ABHINAV SHARMA - Senior Distributed Systems Architect
Email: abhinavclouds@gmail.com | Phone: +1 555-392-8819 | Location: San Francisco, CA
Architected high-throughput financial event streaming ingestion engine processing 150k RPS using Go, Kafka, and Redis Streams with zero data loss.
Designed zero-downtime database failover automation using Raft consensus and PostgreSQL logical replication.
Eliminated write amplification contention on distributed ledger tables by implementing declarative range partitioning and custom composite BRIN indexing."""

    c4_resume = CandidateResume(
        candidate_id=c4.id,
        file_name="1_Distributed_Systems_Architect.pdf",
        file_type="application/pdf",
        raw_text=c4_resume_text,
        parsed_skills=["Distributed Systems", "Go", "Python", "Kafka", "PostgreSQL", "Redis", "Raft"]
    )
    db.add(c4_resume)

    claim4_1 = ResumeClaim(
        candidate_id=c4.id,
        claim_text="Architected high-throughput financial event streaming ingestion engine processing 150k RPS using Go, Kafka, and Redis Streams.",
        category="TECHNICAL_SKILL",
        source_excerpt="Built financial event streaming ingestion engine processing 150k RPS with zero data loss"
    )
    claim4_2 = ResumeClaim(
        candidate_id=c4.id,
        claim_text="Designed zero-downtime database failover automation using Raft consensus and PostgreSQL logical replication.",
        category="TECHNICAL_SKILL",
        source_excerpt="Reduced failover RTO from 12 mins to under 1.5 seconds"
    )
    db.add(claim4_1)
    db.add(claim4_2)

    plan4 = InterviewPlan(candidate_id=c4.id, is_approved=True)
    db.add(plan4)
    db.flush()

    q4_1 = InterviewQuestion(
        plan_id=plan4.id,
        question_index=0,
        question_text="How do you handle partition reassignment and broker rebalancing in Apache Kafka under high write throughput without causing consumer group rebalance storms?",
        category="TECHNICAL",
        competency="Distributed Systems",
        difficulty="SENIOR",
        relevant_jd_requirement="High-throughput Kafka stream processing",
        relevant_resume_claim="Processed 150k RPS with Kafka and Redis Streams"
    )
    q4_2 = InterviewQuestion(
        plan_id=plan4.id,
        question_index=1,
        question_text="Explain your approach to implementing Raft consensus for state-machine replication versus Paxos in mission-critical storage clusters.",
        category="SYSTEM_DESIGN",
        competency="Distributed Architecture",
        difficulty="SENIOR",
        relevant_jd_requirement="Distributed consensus mechanisms",
        relevant_resume_claim="Automated zero-downtime database failover with Raft"
    )
    db.add(q4_1)
    db.add(q4_2)
    db.flush()

    c4_token = "abhinav_live_demo_architect_token"
    inv4 = InterviewInvitation(
        candidate_id=c4.id,
        campaign_id=campaign.id,
        token_hash=hash_token(c4_token),
        token_prefix="abhinav_",
        raw_token=c4_token,
        status=InvitationStatus.ISSUED.value,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(inv4)
    db.flush()

    s4 = InterviewSession(
        candidate_id=c4.id,
        invitation_id=inv4.id,
        session_token_hash=hash_token("c4_session_active"),
        status=SessionStatus.NOT_STARTED.value,
        current_question_index=0
    )
    db.add(s4)

    # Initial Email record for abhinavclouds@gmail.com
    from app.services.email_service import EmailService
    portal_link4 = f"{settings.APP_ORIGIN}/interview/{c4_token}"
    passcode4 = "TP-ABHINAV-99"
    email_html4 = EmailService.generate_invitation_email_html(
        candidate_name="Abhinav Sharma",
        job_title=campaign.job_title,
        campaign_title=campaign.title,
        portal_link=portal_link4,
        passcode=passcode4,
        question_count=campaign.question_count or 6,
        duration_minutes=campaign.interview_duration_minutes or 30
    )
    email_rec4 = SentEmail(
        candidate_id=c4.id,
        campaign_id=campaign.id,
        invitation_id=inv4.id,
        recipient_email="abhinavclouds@gmail.com",
        recipient_name="Abhinav Sharma",
        subject=f"Interview Invitation: {campaign.job_title} at {campaign.title} — TalentPilot AI",
        body_html=email_html4,
        portal_link=portal_link4,
        passcode=passcode4,
        status="SENT"
    )
    db.add(email_rec4)

    # Initial Audit log
    AuditService.log(db, action="CAMPAIGN_CREATED", resource_type="CAMPAIGN", resource_id=campaign.id, details={"title": campaign.title})
    AuditService.log(db, action="INVITATIONS_GENERATED", resource_type="INVITATION", resource_id=inv4.id, details={"candidate": "Abhinav Sharma", "email": "abhinavclouds@gmail.com"})
    AuditService.log(db, action="SEND_INVITATION_EMAIL", resource_type="EMAIL", resource_id=email_rec4.id, details={"recipient": "abhinavclouds@gmail.com"})

    db.commit()
    print("Database successfully seeded with realistic enterprise data!")
