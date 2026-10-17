from app.models.candidate import Candidate
from app.models.campaign import HiringCampaign
from app.services.invitation_service import InvitationService

def get_admin_token(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@talentpilot.ai",
        "password": "talentpilot123"
    })
    return resp.json()["access_token"]

def test_invitation_generation_and_portal_access(client, db):
    admin_token = get_admin_token(client)
    
    # 1. Fetch campaigns
    camp_resp = client.get("/api/v1/campaigns", headers={"Authorization": f"Bearer {admin_token}"})
    assert camp_resp.status_code == 200
    campaign_id = camp_resp.json()[0]["id"]

    # 2. Add two distinct candidates
    cand_a_resp = client.post("/api/v1/candidates", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "campaign_id": campaign_id,
        "full_name": "Candidate Alpha",
        "email": "alpha@example.com",
        "skills": ["Python", "FastAPI"],
        "resume_text": "Experienced Python backend engineer."
    })
    assert cand_a_resp.status_code == 200
    cand_a_id = cand_a_resp.json()["id"]

    cand_b_resp = client.post("/api/v1/candidates", headers={"Authorization": f"Bearer {admin_token}"}, json={
        "campaign_id": campaign_id,
        "full_name": "Candidate Beta",
        "email": "beta@example.com",
        "skills": ["React", "CSS"],
        "resume_text": "Experienced React frontend engineer."
    })
    assert cand_b_resp.status_code == 200
    cand_b_id = cand_b_resp.json()["id"]

    # 3. Generate unique invitations for both
    inv_a_resp = client.post(f"/api/v1/invitations/candidates/{cand_a_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert inv_a_resp.status_code == 200
    token_a = inv_a_resp.json()["token"]

    inv_b_resp = client.post(f"/api/v1/invitations/candidates/{cand_b_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert inv_b_resp.status_code == 200
    token_b = inv_b_resp.json()["token"]

    # Tokens must be completely distinct
    assert token_a != token_b

    # 4. Strict Candidate Isolation: Candidate A token resolves to Candidate Alpha's details
    sess_a = client.get(f"/api/v1/portal/session?token={token_a}")
    assert sess_a.status_code == 200
    assert sess_a.json()["candidate_name"] == "Candidate Alpha"

    # Candidate B token resolves to Candidate Beta's details
    sess_b = client.get(f"/api/v1/portal/session?token={token_b}")
    assert sess_b.status_code == 200
    assert sess_b.json()["candidate_name"] == "Candidate Beta"

    # 5. Revoked invitation check
    inv_a_id = inv_a_resp.json()["invitation_id"]
    revoke_resp = client.post(f"/api/v1/invitations/{inv_a_id}/revoke", headers={"Authorization": f"Bearer {admin_token}"})
    assert revoke_resp.status_code == 200

    # Candidate A's token must now be rejected with 403 Forbidden
    sess_a_revoked = client.get(f"/api/v1/portal/session?token={token_a}")
    assert sess_a_revoked.status_code == 403
    assert "revoked" in sess_a_revoked.json()["detail"].lower()

    # Candidate B's token remains completely unaffected and active!
    sess_b_active = client.get(f"/api/v1/portal/session?token={token_b}")
    assert sess_b_active.status_code == 200

def test_invalid_token_returns_404(client):
    resp = client.get("/api/v1/portal/session?token=completely_fake_invalid_token")
    assert resp.status_code == 404
