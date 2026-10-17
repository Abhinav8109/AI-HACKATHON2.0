def test_full_candidate_interview_lifecycle(client):
    # Use pre-seeded candidate Priya Sharma
    token = "live_demo_priya_sharma_token"

    # 1. Get Session
    sess_resp = client.get(f"/api/v1/portal/session?token={token}")
    assert sess_resp.status_code == 200
    assert sess_resp.json()["candidate_name"] == "Priya Sharma"

    # 2. Give Consent
    consent_resp = client.post(f"/api/v1/portal/consent?token={token}")
    assert consent_resp.status_code == 200

    # 3. Start Interview
    start_resp = client.post(f"/api/v1/portal/start?token={token}")
    assert start_resp.status_code == 200
    assert start_resp.json()["status"] == "IN_PROGRESS"

    # 4. Fetch Question
    q_resp = client.get(f"/api/v1/portal/interview?token={token}")
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    assert not q_data["is_completed"]
    question_id = q_data["question"]["id"]

    # 5. Submit brief answer (triggers adaptive follow-up from Interviewer Agent)
    ans1_resp = client.post(f"/api/v1/portal/answers?token={token}", json={
        "question_id": question_id,
        "answer_text": "We use Pydantic models with FastAPI to parse structured JSON."
    })
    assert ans1_resp.status_code == 200
    res1 = ans1_resp.json()
    assert "answer_id" in res1

    # 6. Submit detailed answer (completes question depth)
    ans2_resp = client.post(f"/api/v1/portal/answers?token={token}", json={
        "question_id": question_id,
        "answer_text": "In addition to Pydantic schemas, we enforce strict tool schemas in Gemini with response_schema and system prompts. We also implemented automated validation with bounded retries if the LLM output violates schema constraints, ensuring our production API never returns unformatted text to downstream clients.",
        "is_follow_up": True
    })
    assert ans2_resp.status_code == 200

    # 7. Finalize Interview
    final_resp = client.post(f"/api/v1/portal/submit?token={token}")
    assert final_resp.status_code == 200
    assert final_resp.json()["session_status"] == "COMPLETED"

    # 8. Verify Recruiter can inspect completed scorecard
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@talentpilot.ai",
        "password": "talentpilot123"
    })
    admin_token = admin_login.json()["access_token"]

    interviews_resp = client.get("/api/v1/interviews", headers={"Authorization": f"Bearer {admin_token}"})
    assert interviews_resp.status_code == 200
    priya_interview = next(i for i in interviews_resp.json() if i["candidate_name"] == "Priya Sharma")
    assert priya_interview["status"] == "COMPLETED"
    assert priya_interview["overall_score"] is not None

    # 9. Verify Recruiter records human decision
    int_id = priya_interview["id"]
    decision_resp = client.post(f"/api/v1/interviews/{int_id}/decision", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "decision": "ADVANCE",
        "rationale": "Strong demonstration of structured schema validation and error-recovery techniques."
    })
    assert decision_resp.status_code == 200
    assert decision_resp.json()["decision"] == "ADVANCE"
