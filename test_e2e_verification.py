import requests

BASE = 'http://127.0.0.1:8000'

# 1. Login
r_login = requests.post(f'{BASE}/api/v1/auth/login', json={'email': 'admin@talentpilot.ai', 'password': 'talentpilot123'})
assert r_login.status_code == 200, f'Login failed: {r_login.text}'
token = r_login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('[PASS] 1. Recruiter logged in successfully.')

# 2. Upload and parse resume
with open('resumes/4_Cloud_Security_DevOps_Platform_Lead.pdf', 'rb') as f:
    r_parse = requests.post(
        f'{BASE}/api/v1/candidates/upload-resume',
        headers=headers,
        files={'file': ('4_Cloud_Security_DevOps_Platform_Lead.pdf', f, 'application/pdf')}
    )
assert r_parse.status_code == 200, f'Resume parse failed: {r_parse.text}'
parsed = r_parse.json()
print(f'[PASS] 2. Resume parsed: Name={parsed["full_name"]}, Email={parsed["email"]}, Title={parsed["current_title"]}, Skills={len(parsed["skills"])} skills')

# 3. Fetch campaigns to pick one
r_camps = requests.get(f'{BASE}/api/v1/campaigns', headers=headers)
assert r_camps.status_code == 200
campaigns = r_camps.json()
assert len(campaigns) > 0
camp_id = campaigns[0]['id']

# 4. Create candidate
r_cand = requests.post(
    f'{BASE}/api/v1/candidates',
    headers=headers,
    json={
        'campaign_id': camp_id,
        'full_name': parsed['full_name'],
        'email': parsed['email'],
        'current_title': parsed['current_title'],
        'skills': parsed['skills'],
        'summary': parsed['summary'],
        'resume_text': parsed['raw_text']
    }
)
assert r_cand.status_code == 200, f'Candidate creation failed: {r_cand.text}'
cand = r_cand.json()
cand_id = cand['id']
print(f'[PASS] 4. Candidate created: ID={cand_id}, Name={cand["full_name"]}')

# 5. Generate invitation link
r_inv = requests.post(f'{BASE}/api/v1/invitations/candidates/{cand_id}', headers=headers)
assert r_inv.status_code == 200, f'Invitation link creation failed: {r_inv.text}'
inv = r_inv.json()
raw_token = inv['raw_token']
portal_url = inv['portal_url']
print(f'[PASS] 5. Invitation link generated: Token={raw_token}, Portal URL={portal_url}')
assert '...' not in portal_url, 'Error: portal URL still has truncation ...!'
assert raw_token in portal_url, 'Error: portal URL does not contain raw token!'

# 6. Candidate opens portal URL
r_portal = requests.get(f'{BASE}/api/v1/portal/session?token={raw_token}')
assert r_portal.status_code == 200, f'Candidate portal session failed: {r_portal.text}'
portal_sess = r_portal.json()
print(f'[PASS] 6. Candidate portal loaded session: Candidate={portal_sess["candidate_name"]}, Status={portal_sess["session_status"]}')

# 7. Recruiter dispatches credentials email
r_email = requests.post(
    f'{BASE}/api/v1/invitations/{inv["id"]}/send-email',
    headers=headers,
    json={'custom_note': 'Welcome to your personalized technical assessment.'}
)
assert r_email.status_code == 200, f'Email dispatch failed: {r_email.text}'
email_res = r_email.json()
print(f'[PASS] 7. Credentials email dispatched: Status={email_res["status"]}, Recipient={email_res["recipient"]}')

# 8. Check email outbox log
r_outbox = requests.get(f'{BASE}/api/v1/invitations/emails/history', headers=headers)
assert r_outbox.status_code == 200
emails = r_outbox.json().get('emails', [])
assert len(emails) > 0
latest_email = emails[0]
print(f'[PASS] 8. Outbox verified: Latest email to {latest_email["recipient_email"]}, Subject="{latest_email["subject"]}"')
assert portal_url in latest_email['body_html'] or raw_token in latest_email['body_html'], 'Error: email body did not contain portal link!'
print('=== ALL 8 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY! ===')
