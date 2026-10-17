import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.config import settings
from app.services.email_service import EmailService
from app.models.candidate import Candidate
from app.models.interview import InterviewInvitation, InterviewSession
from app.models.assessment import FinalDecision, CandidateEvaluation

def test_full_email_suite():
    print("=" * 70)
    print("TALENTPILOT AI — LIVE GMAIL SMTP LIFECYCLE DISPATCH TEST")
    print("=" * 70)
    print(f"SMTP Host: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"SMTP User: {settings.SMTP_USER}")
    print(f"From: {settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>")
    print(f"Target Inbox: abhinavclouds@gmail.com")
    print("-" * 70)

    db = SessionLocal()
    try:
        # Find a candidate with invitation and session (e.g. Priya Sharma or first candidate)
        candidate = db.query(Candidate).filter(Candidate.email == "abhinavclouds@gmail.com").first()
        if not candidate:
            candidate = db.query(Candidate).first()

        print(f"Testing with Candidate: {candidate.full_name} ({candidate.email})")

        # ---------------------------------------------------------
        # TEST 1: INVITATION & CREDENTIALS EMAIL
        # ---------------------------------------------------------
        print("\n[TEST 1] Dispatching Personalized Invitation & Credentials Email...")
        invitation = db.query(InterviewInvitation).filter(InterviewInvitation.candidate_id == candidate.id).first()
        if not invitation:
            from app.services.invitation_service import InvitationService
            invitation, _ = InvitationService.create_invitation_for_candidate(db, candidate.id, candidate.campaign_id)

        # Force recipient to abhinavclouds@gmail.com for live verification
        candidate.email = "abhinavclouds@gmail.com"
        db.commit()

        res1 = EmailService.send_invitation_email(
            db=db,
            invitation_id=invitation.id,
            custom_note="Welcome Abhinav! We were impressed by your distributed systems architecture and Kafka background."
        )
        print(f"-> Status: {res1['status']}")
        print(f"-> Subject: {res1['subject']}")
        print(f"-> Portal Link: {res1['portal_link']}")
        print(f"-> Error: {res1.get('error_message')}")
        assert res1["status"] == "SENT", f"Invitation email failed: {res1.get('error_message')}"

        # ---------------------------------------------------------
        # TEST 2: INTERVIEW COMPLETION & THANK-YOU EMAIL
        # ---------------------------------------------------------
        print("\n[TEST 2] Dispatching Interview Completion Thank-You Email...")
        session = candidate.interview_session
        if not session:
            session = db.query(InterviewSession).first()

        res2 = EmailService.send_completion_email(
            db=db,
            session_id=session.id
        )
        print(f"-> Status: {res2['status']}")
        print(f"-> Subject: {res2['subject']}")
        assert res2["status"] == "SENT", f"Completion email failed"

        # ---------------------------------------------------------
        # TEST 3: HUMAN RECRUITER DECISION / NEXT ROUND EMAIL
        # ---------------------------------------------------------
        print("\n[TEST 3] Dispatching Human Recruiter Decision & Next Round Email...")
        decision = db.query(FinalDecision).filter(FinalDecision.candidate_id == candidate.id).first()
        if not decision:
            # Create a decision
            evaluation = candidate.evaluation
            if not evaluation:
                evaluation = CandidateEvaluation(
                    candidate_id=candidate.id,
                    interview_session_id=session.id,
                    overall_score=4.7,
                    recommendation="ADVANCE",
                    summary="Exemplary technical depth and strong consistency."
                )
                db.add(evaluation)
                db.flush()

            decision = FinalDecision(
                evaluation_id=evaluation.id,
                candidate_id=candidate.id,
                decision="ADVANCE",
                rationale="Candidate demonstrated exemplary distributed consensus design with sub-15ms p99 architecture. Strongly approved for final panel.",
                recorded_by_id="admin_user_id"
            )
            db.add(decision)
            db.commit()

        res3 = EmailService.send_decision_email(
            db=db,
            decision_id=decision.id,
            recruiter_name="Marcus Vance (Principal Hiring Architect)"
        )
        print(f"-> Status: {res3['status']}")
        print(f"-> Subject: {res3['subject']}")
        assert res3["status"] == "SENT", f"Decision email failed"

        print("\n" + "=" * 70)
        print("ALL 3 REAL GMAIL EMAILS DISPATCHED SUCCESSFULLY TO abhinavclouds@gmail.com!")
        print("1. Personalized Invitation with Portal Credentials: SENT")
        print("2. Interview Completion Confirmation & Thank-You: SENT")
        print("3. Human-in-the-Loop Next Round Advancement Decision: SENT")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    test_full_email_suite()
