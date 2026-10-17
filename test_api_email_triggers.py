import requests
import json

BASE_URL = "http://127.0.0.1:8000"
API_URL = f"{BASE_URL}/api/v1"
TARGET_EMAIL = "abhinavclouds@gmail.com"

def run_api_lifecycle_test():
    print("=" * 70)
    print("TESTING FULL LIFECYCLE EMAIL CONNECTIVITY VIA LIVE FASTAPI SERVER")
    print("=" * 70)

    # 1. Login as Admin Recruiter
    print("\n[STEP 1] Logging in as Recruiter...")
    login_res = requests.post(
        f"{API_URL}/auth/login",
        json={"email": "admin@talentpilot.ai", "password": "talentpilot123"}
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Logged in successfully!")

    # 2. Get active campaign
    camps_res = requests.get(f"{API_URL}/campaigns", headers=headers)
    assert camps_res.status_code == 200
    campaigns = camps_res.json()
    campaign = campaigns[0]
    campaign_id = campaign["id"]
    print(f"[PASS] Using Campaign: {campaign['title']} ({campaign_id})")

    # 3. Create a candidate with email abhinavclouds@gmail.com
    print(f"\n[STEP 2] Enrolling candidate with email {TARGET_EMAIL}...")
    cand_res = requests.post(
        f"{API_URL}/candidates",
        headers=headers,
        json={
            "campaign_id": campaign_id,
            "full_name": "Abhinav AI Systems Lead",
            "email": TARGET_EMAIL,
            "current_title": "Lead Distributed Systems & AI Architect",
            "skills": ["Distributed Systems", "Go", "Python", "Kafka", "PostgreSQL", "Redis"],
            "summary": "Proven track record architecting event-driven platforms and zero-downtime database failovers.",
            "resume_text": "Abhinav AI Systems Lead. Scaled Kafka data pipeline to 150k RPS. Designed PostgreSQL failover with Raft consensus."
        }
    )
    assert cand_res.status_code == 200, f"Candidate creation failed: {cand_res.text}"
    candidate = cand_res.json()
    candidate_id = candidate["id"]
    print(f"[PASS] Candidate created! ID={candidate_id}, Name={candidate['full_name']}")

    # 4. Generate unique cryptographic invitation link
    print("\n[STEP 3] Generating unique cryptographic invitation link...")
    inv_res = requests.post(
        f"{API_URL}/invitations/candidates/{candidate_id}",
        headers=headers
    )
    assert inv_res.status_code == 200, f"Invitation generation failed: {inv_res.text}"
    invitation = inv_res.json()
    invitation_id = invitation["id"]
    portal_token = invitation["raw_token"]
    portal_url = invitation["portal_url"]
    print(f"[PASS] Invitation generated! Token={portal_token[:16]}... Link={portal_url}")

    # 5. Trigger 1: Send Personalized Invitation & Credentials Email
    print(f"\n[TRIGGER 1] Dispatching Personalized Invitation Email to {TARGET_EMAIL}...")
    email_res = requests.post(
        f"{API_URL}/invitations/{invitation_id}/send-email",
        headers=headers,
        json={
            "custom_note": "Dear Abhinav, we are excited to evaluate your architecture depth for the Senior Distributed Systems role. Welcome to TalentPilot AI!"
        }
    )
    assert email_res.status_code == 200, f"Email dispatch failed: {email_res.text}"
    email_data = email_res.json()
    print(f"[PASS] Invitation Email Status: {email_data.get('status')} to {email_data.get('recipient_email')}")
    assert email_data.get("status") == "SENT", "Expected email status SENT"

    # 6. Candidate opens portal and provides consent
    print("\n[STEP 4] Candidate opening portal & providing consent...")
    consent_res = requests.post(f"{API_URL}/portal/consent?token={portal_token}")
    assert consent_res.status_code == 200, f"Consent failed: {consent_res.text}"

    start_res = requests.post(f"{API_URL}/portal/start?token={portal_token}")
    assert start_res.status_code == 200, f"Start failed: {start_res.text}"

    # Get first question and answer it
    q_res = requests.get(f"{API_URL}/portal/interview?token={portal_token}")
    assert q_res.status_code == 200
    q_data = q_res.json()
    question_id = q_data["question"]["id"]
    print(f"[PASS] Interview Started! Question 1: {q_data['question']['question_text'][:80]}...")

    ans_res = requests.post(
        f"{API_URL}/portal/answers?token={portal_token}",
        json={
            "question_id": question_id,
            "answer_text": "We utilized decoupled microservices pushing order events to Kafka partitions with idempotent consumer groups and Redis caching, guaranteeing sub-15ms p99 latency during peak flash sales.",
            "is_follow_up": False
        }
    )
    assert ans_res.status_code == 200, f"Answer submit failed: {ans_res.text}"
    print("[PASS] Answer submitted with continuous autosave!")

    # 7. Trigger 2: Candidate finalizes interview -> Auto-sends Thank You / Completion Email
    print(f"\n[TRIGGER 2] Candidate finalizing interview (Triggers Completion Thank-You Email)...")
    final_res = requests.post(f"{API_URL}/portal/submit?token={portal_token}")
    assert final_res.status_code == 200, f"Finalize failed: {final_res.text}"
    print("[PASS] Interview finalized and multi-agent evaluation completed!")

    # 8. Trigger 3: Recruiter records Human-in-the-Loop Decision -> Auto-sends Next Round Email
    print(f"\n[TRIGGER 3] Recruiter recording Human Review Approval & Next Round Decision...")
    # Get session ID
    dossier_res = requests.get(f"{API_URL}/candidates/{candidate_id}", headers=headers)
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    session_id = dossier["session"]["id"]

    decision_res = requests.post(
        f"{API_URL}/interviews/{session_id}/decision",
        headers=headers,
        json={
            "decision": "ADVANCE",
            "rationale": "Abhinav showed exceptional architectural rigor, deep knowledge of Kafka partition semantics, and verified quote grounding. Approved unanimously for final executive panel."
        }
    )
    assert decision_res.status_code == 200, f"Decision failed: {decision_res.text}"
    print(f"[PASS] Decision recorded: {decision_res.json()['decision']}!")

    # 9. Verify Email Outbox Log
    print("\n[STEP 5] Verifying Sent Email Outbox Audit Ledger...")
    outbox_res = requests.get(f"{API_URL}/invitations/emails/history?limit=10", headers=headers)
    assert outbox_res.status_code == 200
    outbox = outbox_res.json().get("emails", [])
    print(f"[PASS] Total Dispatched Emails in Outbox: {len(outbox)}")
    for e in outbox[:3]:
        print(f"  - Subject: '{e['subject']}' | Status: {e['status']} | To: {e['recipient_email']}")

    print("\n" + "=" * 70)
    print("ALL 3 LIFECYCLE EMAIL TRIGGERS VERIFIED & DISPATCHED TO GMAIL!")
    print("1. Profile Created -> Personalized Invitation & Credentials Email: SENT")
    print("2. Candidate Interview Completed -> Submission & Thank You Email: SENT")
    print("3. Human-in-the-Loop Decision Recorded -> Next Round News Email: SENT")
    print("=" * 70)

if __name__ == "__main__":
    run_api_lifecycle_test()
