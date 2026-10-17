# TalentPilot AI
> **One Hiring Workspace. Personalized Interviews. Evidence-Based Decisions.**

TalentPilot AI is a full-stack agentic recruitment and adaptive interview intelligence platform. It connects hiring campaigns, job description competency extraction, candidate-specific cryptographic invitation links, isolated candidate interview portals, adaptive depth-probing AI interviewing, verbatim evidence scorecards, and a master recruiter command center.

---

## 🚀 Key Implemented Capabilities

1. **Public Marketing Website**:
   - High-impact hero with interactive product composition.
   - Comprehensive feature breakdown, 6-step interactive workflow, and Security & Ethics architecture.
   - One-click recruiter entry with pre-configured judge credentials.

2. **Authenticated Recruiter/Admin Command Center**:
   - Executive telemetry: Active campaigns, candidate pipeline, interviews in progress, completed evaluations, and human reviews required.
   - Live synchronization heartbeat: Recruiter dashboard reflects candidate progress in real time without manual reloads.
   - Immutable security and compliance audit log.

3. **6-Step Hiring Campaign Wizard**:
   - Job description intake (PDF, DOCX, or text) with prompt-injection defense.
   - Planner Agent generates an editable 5-tier competency framework.
   - Candidate intake, interview settings, and evaluation rubric customization.

4. **Cryptographic Candidate Link Generation & Strict Isolation**:
   - 32-byte URL-safe cryptographic tokens hashed via SHA-256 for database storage.
   - **Candidate A and Candidate B can NEVER access each other's data, resume, answers, or scorecards.**
   - Full link lifecycle: Issuance, redemption, expiration countdown, revocation, and regeneration.

5. **Isolated Candidate Interview Portal (`/interview/:token`)**:
   - Completely separate, distraction-free, mobile-friendly experience without recruiter controls.
   - AI disclosure, required acknowledgment, and consent recording.
   - Real-time autosave: previously saved answers never disappear on refresh or network disruption.
   - Adaptive follow-up probing: if an answer is shallow, the agent dynamically asks a targeted follow-up question.
   - Pause / resume modal for candidate accommodation (WCAG 2.2 AA compliant).
   - Celebration confetti and constructive, respectful candidate feedback.

6. **6 Specialized AI Agents**:
   - **Agent 1 — Planner Agent**: Analyzes JD, extracts competencies, generates personalized question plans.
   - **Agent 2 — Adaptive Interviewer Agent**: Delivers questions and evaluates answer depth to ask sharp follow-up probes.
   - **Agent 3 — Resume Consistency Analyst**: Cross-references resume claims against actual interview answers.
   - **Agent 4 — Answer Evaluator Agent**: Scores answers strictly against the approved rubric with verbatim quote citations.
   - **Agent 5 — Critic & Evidence Validator**: Adversarially checks score-to-evidence alignment and flags human review.
   - **Agent 6 — Candidate Feedback Agent**: Crafts constructive, respectful candidate notes.

7. **Human-in-the-Loop Decision Authority**:
   - **The AI never automatically rejects or hires a candidate.**
   - Dedicated Human Review queue for borderline or flagged candidate assessments.
   - Authorized human recruiters record the final employment decision with mandatory rationale.

8. **Exports & Compliance Dossiers**:
   - Downloadable styled HTML/PDF candidate assessment dossiers with quote evidence.
   - Campaign-wide candidate summary CSV export.
   - Raw JSON evaluation export.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion, Recharts, Canvas Confetti |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, SQLite (local) / PostgreSQL (production) |
| **AI Integration** | Google GenAI SDK (Gemini 2.5 Flash) with structured schema outputs and deterministic failover |
| **Security** | Bcrypt password hashing, JWT access tokens, SHA-256 token hashing, Prompt-injection sanitization |
| **Deployment** | Multi-stage Dockerfile (Node 22 builder + Python 3.11 runner), docker-compose.yml, Cloud Run ready |

---

## 🏃 Quick Start (Local Run)

### Option 1: PowerShell One-Click Launcher (Windows)
```powershell
.\start.ps1
```
This automatically verifies the virtual environment, launches the backend on `http://127.0.0.1:8000`, and opens the frontend on `http://localhost:5173`.

### Option 2: Docker Compose (Unified Container)
```bash
docker-compose up --build
```
Open `http://localhost:8000` to access the full platform.

### Option 3: Manual Startup

**Backend:**
```bash
python -m venv .venv
.\.venv\Scripts\pip install -r backend\requirements.txt
$env:PYTHONPATH="backend"
.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Automated Test Suite Verification

Run the full backend test suite:
```bash
$env:PYTHONPATH="backend"
.\.venv\Scripts\pytest backend\tests -v
```

**Results:**
- `test_admin_login_success`: PASSED
- `test_admin_login_invalid_password`: PASSED
- `test_get_me_unauthorized`: PASSED
- `test_get_me_authorized`: PASSED
- `test_invitation_generation_and_portal_access`: PASSED (Strict candidate isolation verified!)
- `test_invalid_token_returns_404`: PASSED
- `test_full_candidate_interview_lifecycle`: PASSED (Consent &rarr; Adaptive Q&A &rarr; Evaluation &rarr; Human Decision)

---

## ⏱️ 5-Minute Judge Demonstration Script

### Minute 1 — Public Portal & Recruiter Login
1. Navigate to `http://localhost:5173/` (or `http://127.0.0.1:8000/`).
2. Point out the design tokens, product headline, interactive preview composition, and the 3 architectural pillars.
3. Click **"Sign In"** or **"Launch Workspace"** to navigate to `/login`.
4. Click **"Fill Admin Demo Credentials (admin@talentpilot.ai)"** and click **"Sign In to Command Center"**.

### Minute 2 — Master Command Center & Live Telemetry
1. Land on `/admin`. Observe the real KPI counters (Active Campaigns, Candidates, Completed Interviews, Human Reviews).
2. Point out the **Live Sync** indicator in the header and the **Global Activity Feed** showing real audit events.
3. Notice pre-seeded completed candidate **Alex Morgan** (Score: 4.4 / 5.0).
4. Click **"Inspect"** to view Alex's 8-tab dossier:
   - View **Interview Plan** (personalized questions).
   - View **Transcript** (full responses).
   - View **Evidence Quotes** (verbatim quotes directly supporting each score).
   - View **Resume Consistency** (fact-checking stated claims).

### Minute 3 — Test Live Candidate Portal Experience
1. In the sidebar, click **"Unique Portal Links"** (`/admin/invitations`).
2. Highlight the cryptographic token prefix and candidate isolation notice.
3. For candidate **Priya Sharma**, click the **Open Portal** icon (or open `http://localhost:5173/interview/live_demo_priya_sharma_token`).
4. Notice the clean, distraction-free candidate screen. Check the consent box and click **"Begin Adaptive Interview"**.
5. Enter a brief answer: *"We use Pydantic models with FastAPI."* Click **"Submit & Next Question"**.
6. Observe the **Interviewer Agent trigger an adaptive follow-up** asking for deeper architectural trade-offs!
7. Provide an expanded answer and click **"Submit Final Interview"**.
8. Enjoy the celebration confetti and read the constructive candidate note.

### Minute 4 — Live Sync in Admin & Human-in-the-Loop Review
1. Return to the recruiter window (`/admin`).
2. Notice the live dashboard has updated immediately reflecting Priya's completed interview!
3. Go to **"Human Review Queue"** (`/admin/reviews`).
4. Select flagged candidate **Marcus Vance**. Explain why the Critic Agent flagged this candidate (borderline score / brief response).
5. Switch to the **"Human Decision"** tab. Select **"Advance"**, enter rationale: *"Demonstrated solid fundamentals upon secondary review"*, and click **"Record Official Human Decision"**.
6. Explain: **AI assists, but human recruiters always make the final employment decision.**

### Minute 5 — Exports & Compliance Audit
1. Navigate to **"Reports & Exports"** (`/admin/reports`).
2. Click **"Download CSV"** to export the campaign candidate summary.
3. Click **"View Dossier (HTML/PDF)"** for Alex Morgan to inspect the formal, audit-ready assessment report.
4. Navigate to **"Compliance Audit"** (`/admin/audit`) to show the immutable security ledger of all actions taken during the demo.
5. Conclude the presentation!
