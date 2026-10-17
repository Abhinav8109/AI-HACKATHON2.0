from app.database import engine, Base, SessionLocal
import app.models
from app.models import InterviewInvitation, Candidate, HiringCampaign, CandidateResume, ResumeClaim, InterviewPlan, InterviewQuestion, InterviewSession, SentEmail, CandidateStatus, InvitationStatus, SessionStatus
from app.auth.security import hash_token
from app.services.email_service import EmailService
from app.config import settings
from datetime import datetime, timedelta

# Create any missing tables (like sent_emails)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Update existing invitations with raw_token
for inv in db.query(InterviewInvitation).all():
    name = inv.candidate.full_name.lower() if inv.candidate else ""
    if "priya" in name:
        inv.raw_token = "live_demo_priya_sharma_token"
    elif "alex" in name:
        inv.raw_token = "demo_alex_token_complete_12345"
    elif "marcus" in name:
        inv.raw_token = "marcus_demo_review_flagged_token"
    elif not inv.raw_token:
        inv.raw_token = f"token_{inv.token_prefix}_{inv.id[:8]}"

# Ensure Candidate 4 (Abhinav Sharma, abhinavclouds@gmail.com) exists
existing_abhinav = db.query(Candidate).filter(Candidate.email == "abhinavclouds@gmail.com").first()
if not existing_abhinav:
    campaign = db.query(HiringCampaign).first()
    if campaign:
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

        c4_resume = CandidateResume(
            candidate_id=c4.id,
            file_name="1_Distributed_Systems_Architect.pdf",
            file_type="application/pdf",
            raw_text="ABHINAV SHARMA - Senior Distributed Systems Architect. Email: abhinavclouds@gmail.com. Architected high-throughput financial event streaming ingestion engine processing 150k RPS using Go, Kafka, and Redis Streams with zero data loss.",
            parsed_skills=["Distributed Systems", "Go", "Python", "Kafka", "PostgreSQL", "Redis", "Raft"]
        )
        db.add(c4_resume)

        claim1 = ResumeClaim(
            candidate_id=c4.id,
            claim_text="Architected high-throughput financial event streaming ingestion engine processing 150k RPS using Go, Kafka, and Redis Streams.",
            category="TECHNICAL_SKILL",
            source_excerpt="Built financial event streaming ingestion engine processing 150k RPS with zero data loss"
        )
        claim2 = ResumeClaim(
            candidate_id=c4.id,
            claim_text="Designed zero-downtime database failover automation using Raft consensus and PostgreSQL logical replication.",
            category="TECHNICAL_SKILL",
            source_excerpt="Reduced failover RTO from 12 mins to under 1.5 seconds"
        )
        db.add(claim1)
        db.add(claim2)

        plan = InterviewPlan(candidate_id=c4.id, is_approved=True)
        db.add(plan)
        db.flush()

        q1 = InterviewQuestion(
            plan_id=plan.id,
            question_index=0,
            question_text="How do you handle partition reassignment and broker rebalancing in Apache Kafka under high write throughput without causing consumer group rebalance storms?",
            category="TECHNICAL",
            competency="Distributed Systems",
            difficulty="SENIOR",
            relevant_jd_requirement="High-throughput Kafka stream processing",
            relevant_resume_claim="Processed 150k RPS with Kafka and Redis Streams"
        )
        q2 = InterviewQuestion(
            plan_id=plan.id,
            question_index=1,
            question_text="Explain your approach to implementing Raft consensus for state-machine replication versus Paxos in mission-critical storage clusters.",
            category="SYSTEM_DESIGN",
            competency="Distributed Architecture",
            difficulty="SENIOR",
            relevant_jd_requirement="Distributed consensus mechanisms",
            relevant_resume_claim="Automated zero-downtime database failover with Raft"
        )
        db.add(q1)
        db.add(q2)
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

db.commit()
print("Database schema and Abhinav candidate updated successfully!")
for c in db.query(Candidate).all():
    inv = c.invitations[0] if c.invitations else None
    print(f"Candidate: {c.full_name} ({c.email}) -> raw_token: {inv.raw_token if inv else 'None'}")

db.close()
