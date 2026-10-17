def test_admin_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@talentpilot.ai",
        "password": "talentpilot123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@talentpilot.ai"
    assert data["user"]["role"] == "SUPER_ADMIN"

def test_admin_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@talentpilot.ai",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_authorized(client):
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "admin@talentpilot.ai",
        "password": "talentpilot123"
    })
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "admin@talentpilot.ai"
