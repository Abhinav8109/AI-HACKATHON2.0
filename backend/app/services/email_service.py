import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from email.header import Header
from datetime import datetime
import re
from sqlalchemy.orm import Session
from app.config import settings
from app.models.email_log import SentEmail
from app.models.interview import InterviewInvitation, InterviewSession
from app.models.candidate import Candidate
from app.models.campaign import HiringCampaign
from app.models.assessment import FinalDecision, CandidateEvaluation

class EmailService:
    @staticmethod
    def _dispatch_smtp(
        recipient_email: str,
        subject: str,
        html_content: str,
        plain_text_content: str | None = None
    ) -> tuple[str, str | None]:
        """
        Attempts real SMTP delivery via Gmail or configured SMTP server.
        Generates fully compliant RFC 5322 MIME messages with both text/plain
        and text/html parts to maximize inbox deliverability and prevent spam classification.
        Falls back to SIMULATED status if network is unreachable or credentials fail.
        """
        if not (settings.SMTP_HOST and settings.SMTP_USER):
            return "SIMULATED", "SMTP not configured"

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = Header(subject, "utf-8").encode()
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = recipient_email
            msg["Date"] = formatdate(localtime=True)
            msg["Message-ID"] = make_msgid(domain="gmail.com")
            msg["Reply-To"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["X-Mailer"] = "TalentPilot-AI-Engine-1.0"
            msg["Auto-Submitted"] = "auto-generated"

            # Plain text part MUST be attached first for RFC 2046 alternative multipart
            if not plain_text_content:
                clean_text = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL)
                clean_text = re.sub(r'<script[^>]*>.*?</script>', '', clean_text, flags=re.DOTALL)
                clean_text = re.sub(r'<[^>]+>', ' ', clean_text)
                plain_text_content = re.sub(r'\s+', ' ', clean_text).strip()

            msg.attach(MIMEText(plain_text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            if settings.SMTP_PORT == 465:
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
                    if settings.SMTP_PASSWORD:
                        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    if settings.SMTP_PASSWORD:
                        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())
            return "SENT", None
        except Exception as e:
            return "SIMULATED", f"SMTP delivery fallback: {str(e)}"

    # ==========================================
    # 1. INVITATION & CREDENTIALS EMAIL
    # ==========================================
    @classmethod
    def generate_invitation_email_html(
        cls,
        candidate_name: str,
        job_title: str,
        campaign_title: str,
        portal_link: str,
        passcode: str,
        question_count: int = 6,
        duration_minutes: int = 30,
        deadline_str: str = "72 hours from issue",
        custom_note: str | None = None
    ) -> str:
        note_html = ""
        if custom_note:
            note_html = f"""
            <div style="margin: 22px 0; padding: 16px 20px; background-color: #f1f5f9; border-left: 4px solid #4f46e5; border-radius: 8px; font-size: 13px; color: #334155; line-height: 1.55;">
              <strong style="color: #0f172a; font-size: 13px;">Personalized Note from Recruiting Team:</strong><br/>
              <span style="font-style: italic; margin-top: 4px; display: inline-block;">"{custom_note}"</span>
            </div>
            """

        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TalentPilot AI Interview Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #0f172a;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
    <!-- Gradient Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%); padding: 36px 36px 32px 36px; text-align: left;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.2); border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: monospace;">Candidate Assessment Suite</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">
                TalentPilot <span style="font-size: 14px; background: #ffffff; color: #4338ca; padding: 2px 8px; border-radius: 6px; font-weight: 800; vertical-align: middle;">AI</span>
              </h1>
              <p style="color: #e0e7ff; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">One Hiring Workspace &bull; Personalized AI Interviews &bull; Evidence-Based Decisions</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 36px 36px 24px 36px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0;">Hello {candidate_name},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px 0;">
          Congratulations! You have been selected to participate in an adaptive technical interview for the position of <strong style="color: #0f172a;">{job_title}</strong> within our <strong style="color: #0f172a;">{campaign_title}</strong> pipeline.
        </p>

        {note_html}

        <!-- Credentials & Session Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 24px 0; overflow: hidden;">
          <tr>
            <td style="padding: 22px;">
              <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #4f46e5; margin: 0 0 14px 0; font-family: monospace;">Your Secure Interview Access Credentials</h3>
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                <tr>
                  <td style="padding: 7px 0; color: #64748b; width: 140px; font-weight: 500;">Target Role:</td>
                  <td style="padding: 7px 0; color: #0f172a; font-weight: 700;">{job_title}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Format:</td>
                  <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">Asynchronous Adaptive AI Interview</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Questions:</td>
                  <td style="padding: 7px 0; color: #0f172a; font-weight: 600;">{question_count} Progressive Scenarios (~{duration_minutes} minutes)</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Session Passcode:</td>
                  <td style="padding: 7px 0; color: #4f46e5; font-family: monospace; font-weight: 800; font-size: 14px;">{passcode}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Link Validity:</td>
                  <td style="padding: 7px 0; color: #b45309; font-weight: 700;">{deadline_str}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Call to Action Button -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0 20px 0;">
          <tr>
            <td align="center">
              <a href="{portal_link}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 15px 36px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); letter-spacing: 0.2px;">
                Enter Your Candidate Portal &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0 0 24px 0;">
          Direct link: <a href="{portal_link}" target="_blank" style="color: #4f46e5; word-break: break-all; text-decoration: underline;">{portal_link}</a>
        </p>

        <!-- Candidate Instructions -->
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.65;">
          <strong style="color: #0f172a; display: block; margin-bottom: 8px; font-size: 13px;">Important Guidelines for Candidates:</strong>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 6px;"><strong>Real-Time Autosave:</strong> Your draft answers are continuously saved in real time. If your connection drops or browser closes, simply re-open your link to resume.</li>
            <li style="margin-bottom: 6px;"><strong>Depth Probing:</strong> Questions adapt dynamically to your answers. Provide specific trade-offs and architectural rationale from your real projects.</li>
            <li style="margin-bottom: 6px;"><strong>Zero Automated Rejection Guarantee:</strong> The AI assists with evidence quote extraction, but final employment decisions are made strictly by human recruiters.</li>
          </ul>
        </div>

        <!-- Inbox Delivery Tip Banner -->
        <div style="margin-top: 18px; padding: 12px 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; font-size: 11px; color: #854d0e; line-height: 1.55;">
          <strong style="color: #713f12;">&#128236; Inbox Delivery Tip:</strong> If this email was delivered to your <em>Spam</em>, <em>Junk</em>, or <em>Promotions</em> folder, please click <strong>"Report Not Spam"</strong> or move it to your <strong>Primary Inbox</strong>. This ensures you receive subsequent interview round updates and feedback promptly.
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
        TalentPilot AI &bull; Autonomous Agentic Recruitment & Adaptive Intelligence<br/>
        This invitation was dispatched for your application for <strong>{job_title}</strong>.<br/>
        To ensure delivery, please add <em>{settings.SMTP_FROM_EMAIL}</em> to your address book.
      </td>
    </tr>
  </table>
</body>
</html>"""

    @classmethod
    def generate_invitation_email_text(
        cls,
        candidate_name: str,
        job_title: str,
        campaign_title: str,
        portal_link: str,
        passcode: str,
        question_count: int = 6,
        duration_minutes: int = 30,
        deadline_str: str = "72 hours from issue",
        custom_note: str | None = None
    ) -> str:
        note_text = f"\nPersonal Note from Recruiting Team:\n\"{custom_note}\"\n" if custom_note else ""
        return f"""TALENTPILOT AI - INTERVIEW INVITATION
One Hiring Workspace. Personalized AI Interviews. Evidence-Based Decisions.

Hello {candidate_name},

Congratulations! You have been selected to participate in an adaptive technical interview for the position of {job_title} ({campaign_title}).
{note_text}
YOUR SECURE INTERVIEW ACCESS CREDENTIALS:
- Target Role: {job_title}
- Format: Asynchronous Adaptive AI Interview
- Structure: {question_count} Progressive Scenarios (~{duration_minutes} minutes)
- Session Passcode: {passcode}
- Link Validity: {deadline_str}

ENTER YOUR CANDIDATE PORTAL:
{portal_link}

IMPORTANT CANDIDATE GUIDELINES:
1. Real-Time Autosave: Your draft responses are saved continuously. You can safely refresh or return anytime.
2. Depth Probing: Scenarios adapt to your engineering depth. Detail architectural decisions and concrete trade-offs.
3. Human Review Guarantee: The AI collects verbatim evidence quotes, but final advancement decisions are made exclusively by human recruiters.

DELIVERY NOTICE:
If this email appeared in your Spam or Promotions folder, please mark it as "Not Spam" or drag it to your Primary Inbox to ensure you receive future stage updates.

Talent Acquisition Team
TalentPilot AI
{settings.SMTP_FROM_EMAIL}
"""

    # ==========================================
    # 2. INTERVIEW COMPLETED / THANK YOU EMAIL
    # ==========================================
    @classmethod
    def generate_completion_email_html(
        cls,
        candidate_name: str,
        job_title: str,
        campaign_title: str,
        portal_link: str,
        completed_at_str: str,
        feedback_summary: str | None = None
    ) -> str:
        feedback_html = ""
        if feedback_summary:
            feedback_html = f"""
            <div style="margin: 22px 0; padding: 18px 20px; background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; font-size: 13px; color: #1e1b4b; line-height: 1.6;">
              <strong style="color: #4338ca; font-size: 13px; display: block; margin-bottom: 6px;">Candidate Growth Note:</strong>
              {feedback_summary}
            </div>
            """

        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Interview Submitted — TalentPilot AI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #0f172a;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
    <!-- Gradient Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%); padding: 36px 36px 32px 36px; text-align: left;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.2); border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: monospace;">Interview Completed</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                Submission Received! &#10004;
              </h1>
              <p style="color: #d1fae5; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">Your interview responses have been securely recorded and compiled.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 36px 36px 24px 36px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0;">Thank You, {candidate_name}!</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px 0;">
          We have successfully received your completed responses for the <strong style="color: #0f172a;">{job_title}</strong> role ({campaign_title}).
        </p>

        <!-- Summary Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 20px 0; overflow: hidden;">
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 500;">Submission Time:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{completed_at_str}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Role:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{job_title}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Status:</td>
                  <td style="padding: 6px 0; color: #059669; font-weight: 700;">Completed &bull; Evidence Grounding in Progress</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        {feedback_html}

        <!-- Next Steps Timeline -->
        <div style="margin: 24px 0; padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0;">What Happens Next?</h3>
          <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.7;">
            <li style="margin-bottom: 8px;"><strong>Evidence Scorecard Synthesis:</strong> Our Evaluator and Consistency agents analyze your transcript answers against the role rubric with verbatim quote citations.</li>
            <li style="margin-bottom: 8px;"><strong>Human Recruiter Review:</strong> An authorized human recruiter inspects your scorecard, transcript, and resume background to make the advancement decision.</li>
            <li><strong>Next Round Decision Notification:</strong> You will receive an email update with next round scheduling details as soon as the hiring team reviews your dossier.</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="{portal_link}" target="_blank" style="background-color: #f1f5f9; color: #475569; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 10px; display: inline-block; border: 1px solid #cbd5e1;">
            View Candidate Portal Confirmation &rarr;
          </a>
        </div>

        <!-- Inbox Delivery Tip Banner -->
        <div style="margin-top: 18px; padding: 12px 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; font-size: 11px; color: #854d0e; line-height: 1.55;">
          <strong style="color: #713f12;">&#128236; Delivery Tip:</strong> Please ensure you keep this confirmation email. If our messages land in your Spam or Promotions folder, mark as "Not Spam" so subsequent recruiter panel invitations reach your inbox.
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
        TalentPilot AI &bull; One Hiring Workspace. Personalized Interviews. Evidence-Based Decisions.<br/>
        Confirmation generated automatically for candidate reference.
      </td>
    </tr>
  </table>
</body>
</html>"""

    @classmethod
    def generate_completion_email_text(
        cls,
        candidate_name: str,
        job_title: str,
        campaign_title: str,
        portal_link: str,
        completed_at_str: str,
        feedback_summary: str | None = None
    ) -> str:
        feedback_text = f"\nCandidate Growth Note:\n{feedback_summary}\n" if feedback_summary else ""
        return f"""TALENTPILOT AI - INTERVIEW SUBMISSION CONFIRMED
One Hiring Workspace. Personalized AI Interviews. Evidence-Based Decisions.

Thank You, {candidate_name}!

We have successfully received and safely recorded your completed responses for the {job_title} role ({campaign_title}).

SUBMISSION DETAILS:
- Submission Time: {completed_at_str}
- Role Applied: {job_title}
- Status: Completed (Evidence Grounding & Rubric Scoring in Progress)
{feedback_text}
WHAT HAPPENS NEXT:
1. Evidence Scorecard Synthesis: Our Evaluator agents analyze your transcript answers with verbatim citations against the competency rubric.
2. Human Recruiter Review: An authorized hiring committee recruiter inspects your scorecard, claims, and resume.
3. Decision & Next Round Notification: You will receive an email update with next steps as soon as the recruiter finalizes the review.

Candidate Portal Confirmation:
{portal_link}

Talent Acquisition Team
TalentPilot AI
{settings.SMTP_FROM_EMAIL}
"""

    # ==========================================
    # 3. HUMAN RECRUITER DECISION / NEXT ROUND EMAIL
    # ==========================================
    @classmethod
    def generate_decision_email_html(
        cls,
        candidate_name: str,
        job_title: str,
        campaign_title: str,
        decision: str,
        rationale: str,
        recruiter_name: str = "Hiring Committee"
    ) -> str:
        is_advance = decision.upper() in ["ADVANCE", "NEXT_ROUND", "APPROVED", "OFFER", "HIRE"]
        is_hold = decision.upper() in ["HOLD", "HOLD_FOR_REVIEW", "WAITLIST"]

        if is_advance:
            banner_bg = "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%)"
            badge_text = "NEXT ROUND ADVANCEMENT"
            title_text = "Great News: You Are Advancing to the Next Round! &#127881;"
            decision_label = "ADVANCED TO NEXT ROUND"
            decision_color = "#4f46e5"
            next_steps_text = "Our recruiting coordinator will be in touch shortly to schedule the next phase of the process (technical architectural discussion / team panel)."
        elif is_hold:
            banner_bg = "linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)"
            badge_text = "APPLICATION UPDATE"
            title_text = "Application Status: Active Consideration"
            decision_label = "UNDER ACTIVE CONSIDERATION"
            decision_color = "#b45309"
            next_steps_text = "Your evaluation has been thoroughly reviewed. Our team is finalizing candidate comparisons across this cohort and will follow up with our next steps within 3-5 business days."
        else:
            banner_bg = "linear-gradient(135deg, #0f172a 0%, #334155 100%)"
            badge_text = "APPLICATION UPDATE"
            title_text = f"Update on Your {job_title} Application"
            decision_label = decision.replace('_', ' ')
            decision_color = "#64748b"
            next_steps_text = "Thank you for the time and engineering depth you shared with our team throughout this assessment."

        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TalentPilot AI Application Decision</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #0f172a;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
    <!-- Header Banner -->
    <tr>
      <td style="background: {banner_bg}; padding: 36px 36px 32px 36px; text-align: left;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.2); border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: monospace;">{badge_text}</span>
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; line-height: 1.25;">
                {title_text}
              </h1>
              <p style="color: #e0e7ff; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">Official Human Recruiter Decision &bull; {campaign_title}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 36px 36px 24px 36px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0;">Dear {candidate_name},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px 0;">
          Our recruiting committee has completed reviewing your adaptive AI interview scorecard and resume evidence for the <strong style="color: #0f172a;">{job_title}</strong> role.
        </p>

        <!-- Decision Box -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 22px 0; overflow: hidden;">
          <tr>
            <td style="padding: 22px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 500;">Role Applied:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{job_title}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Decision:</td>
                  <td style="padding: 6px 0; color: {decision_color}; font-weight: 800; font-size: 14px;">{decision_label}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Reviewed By:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{recruiter_name}</td>
                </tr>
              </table>

              <!-- Recruiter Rationale -->
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <strong style="color: #0f172a; font-size: 12px; display: block; margin-bottom: 6px; font-family: monospace; text-transform: uppercase;">Recruiter Feedback & Notes:</strong>
                <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; font-style: italic;">
                  "{rationale}"
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Next Steps -->
        <div style="margin: 22px 0; padding: 18px 20px; background-color: #f1f5f9; border-radius: 12px; font-size: 13px; color: #334155; line-height: 1.6;">
          <strong style="color: #0f172a; display: block; margin-bottom: 4px;">What's Next:</strong>
          {next_steps_text}
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-top: 24px;">
          If you have any questions or scheduling requirements, simply reply directly to this email and our talent acquisition team will assist you.
        </p>

        <!-- Inbox Delivery Tip Banner -->
        <div style="margin-top: 18px; padding: 12px 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; font-size: 11px; color: #854d0e; line-height: 1.55;">
          <strong style="color: #713f12;">&#128236; Note:</strong> Replies to this email go directly to our talent acquisition desk ({settings.SMTP_FROM_EMAIL}). If this update was delivered to Spam, mark as "Not Spam" to ensure subsequent interview coordination reaches you.
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
        TalentPilot AI &bull; One Hiring Workspace. Personalized Interviews. Evidence-Based Decisions.<br/>
        Dispatched on behalf of {recruiter_name} &bull; Talent Acquisition Department.
      </td>
    </tr>
  </table>
</body>
</html>"""

    @classmethod
    def generate_decision_email_text(
        cls,
        candidate_name: str,
        job_title: str,
        campaign_title: str,
        decision: str,
        rationale: str,
        recruiter_name: str = "Hiring Committee"
    ) -> str:
        is_advance = decision.upper() in ["ADVANCE", "NEXT_ROUND", "APPROVED", "OFFER", "HIRE"]
        is_hold = decision.upper() in ["HOLD", "HOLD_FOR_REVIEW", "WAITLIST"]

        if is_advance:
            decision_label = "ADVANCED TO NEXT ROUND"
            next_steps_text = "Our recruiting coordinator will be in touch shortly to schedule the next phase of the process (technical architectural discussion / team panel)."
        elif is_hold:
            decision_label = "UNDER ACTIVE CONSIDERATION"
            next_steps_text = "Your evaluation has been thoroughly reviewed. Our team is finalizing candidate comparisons across this cohort and will follow up with our next steps within 3-5 business days."
        else:
            decision_label = decision.replace('_', ' ')
            next_steps_text = "Thank you for the time and engineering depth you shared with our team throughout this assessment."

        return f"""TALENTPILOT AI - APPLICATION STATUS UPDATE
One Hiring Workspace. Personalized AI Interviews. Evidence-Based Decisions.

Dear {candidate_name},

Our recruiting committee has completed reviewing your adaptive AI interview scorecard and resume evidence for the {job_title} role ({campaign_title}).

APPLICATION DECISION:
- Role Applied: {job_title}
- Official Decision: {decision_label}
- Reviewed By: {recruiter_name}

RECRUITER FEEDBACK & NOTES:
"{rationale}"

WHAT'S NEXT:
{next_steps_text}

If you have questions or scheduling requirements, reply directly to this email and our talent acquisition team will assist you.

Talent Acquisition Department
TalentPilot AI
{settings.SMTP_FROM_EMAIL}
"""

    # ==========================================
    # SERVICE METHODS (DB + SMTP DISPATCH)
    # ==========================================
    @classmethod
    def send_invitation_email(
        cls,
        db: Session,
        invitation_id: str,
        custom_note: str | None = None
    ) -> dict:
        invitation = db.query(InterviewInvitation).filter(InterviewInvitation.id == invitation_id).first()
        if not invitation:
            raise ValueError("Invitation not found")

        candidate = invitation.candidate
        campaign = invitation.campaign
        token = invitation.raw_token or invitation.token_prefix
        portal_link = f"{settings.APP_ORIGIN}/interview/{token}"
        passcode = f"{invitation.token_prefix}-PASS"
        expires_str = invitation.expires_at.strftime("%B %d, %Y at %H:%M UTC")

        company = "TalentPilot AI"
        if campaign.organization and campaign.organization.name:
            company = campaign.organization.name
        
        job_role = campaign.job_title or campaign.title or "Software Engineer"
        subject = f"Interview Invitation: {job_role} - {company}"

        html_content = cls.generate_invitation_email_html(
            candidate_name=candidate.full_name,
            job_title=job_role,
            campaign_title=campaign.title,
            portal_link=portal_link,
            passcode=passcode,
            question_count=campaign.question_count or 6,
            duration_minutes=campaign.interview_duration_minutes or 30,
            deadline_str=expires_str,
            custom_note=custom_note
        )

        text_content = cls.generate_invitation_email_text(
            candidate_name=candidate.full_name,
            job_title=job_role,
            campaign_title=campaign.title,
            portal_link=portal_link,
            passcode=passcode,
            question_count=campaign.question_count or 6,
            duration_minutes=campaign.interview_duration_minutes or 30,
            deadline_str=expires_str,
            custom_note=custom_note
        )

        email_status, error_msg = cls._dispatch_smtp(
            recipient_email=candidate.email,
            subject=subject,
            html_content=html_content,
            plain_text_content=text_content
        )

        email_record = SentEmail(
            candidate_id=candidate.id,
            campaign_id=campaign.id,
            invitation_id=invitation.id,
            recipient_email=candidate.email,
            recipient_name=candidate.full_name,
            subject=subject,
            body_html=html_content,
            portal_link=portal_link,
            passcode=passcode,
            status=email_status,
            error_message=error_msg
        )
        db.add(email_record)
        db.commit()
        db.refresh(email_record)

        return {
            "email_id": email_record.id,
            "recipient_email": candidate.email,
            "recipient": candidate.email,
            "recipient_name": candidate.full_name,
            "subject": subject,
            "portal_link": portal_link,
            "passcode": passcode,
            "status": email_status,
            "error_message": error_msg,
            "sent_at": email_record.sent_at.isoformat()
        }

    @classmethod
    def send_completion_email(
        cls,
        db: Session,
        session_id: str
    ) -> dict | None:
        """
        Sends the interview completion thank-you email once candidate submits answers.
        """
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            return None

        candidate = session.candidate
        invitation = session.invitation
        token = (invitation.raw_token or invitation.token_prefix) if invitation else "demo_token"
        portal_link = f"{settings.APP_ORIGIN}/interview/{token}"
        campaign = candidate.campaign
        job_title = campaign.job_title if campaign else (candidate.current_title or "Software Engineer")
        campaign_title = campaign.title if campaign else "Engineering Campaign"
        completed_at_str = (session.completed_at or datetime.utcnow()).strftime("%B %d, %Y at %H:%M UTC")

        company = "TalentPilot AI"
        if campaign and campaign.organization and campaign.organization.name:
            company = campaign.organization.name

        eval_obj = candidate.evaluation
        feedback_summary = eval_obj.candidate_feedback_text if eval_obj else None

        subject = f"Interview Completed: {job_title} Submission Confirmed - {company}"
        html_content = cls.generate_completion_email_html(
            candidate_name=candidate.full_name,
            job_title=job_title,
            campaign_title=campaign_title,
            portal_link=portal_link,
            completed_at_str=completed_at_str,
            feedback_summary=feedback_summary
        )

        text_content = cls.generate_completion_email_text(
            candidate_name=candidate.full_name,
            job_title=job_title,
            campaign_title=campaign_title,
            portal_link=portal_link,
            completed_at_str=completed_at_str,
            feedback_summary=feedback_summary
        )

        email_status, error_msg = cls._dispatch_smtp(
            recipient_email=candidate.email,
            subject=subject,
            html_content=html_content,
            plain_text_content=text_content
        )

        email_record = SentEmail(
            candidate_id=candidate.id,
            campaign_id=campaign.id if campaign else None,
            invitation_id=invitation.id if invitation else None,
            recipient_email=candidate.email,
            recipient_name=candidate.full_name,
            subject=subject,
            body_html=html_content,
            portal_link=portal_link,
            passcode="COMPLETED",
            status=email_status,
            error_message=error_msg
        )
        db.add(email_record)
        db.commit()
        db.refresh(email_record)

        return {
            "email_id": email_record.id,
            "recipient_email": candidate.email,
            "subject": subject,
            "status": email_status
        }

    @classmethod
    def send_decision_email(
        cls,
        db: Session,
        decision_id: str,
        recruiter_name: str | None = None
    ) -> dict | None:
        """
        Sends the decision / next round news email once human recruiter records a decision.
        """
        decision_obj = db.query(FinalDecision).filter(FinalDecision.id == decision_id).first()
        if not decision_obj:
            return None

        candidate = db.query(Candidate).filter(Candidate.id == decision_obj.candidate_id).first()
        if not candidate:
            return None

        campaign = candidate.campaign
        job_title = campaign.job_title if campaign else (candidate.current_title or "Software Engineer")
        campaign_title = campaign.title if campaign else "Engineering Campaign"
        reviewer = recruiter_name or "Talent Acquisition Team"

        company = "TalentPilot AI"
        if campaign and campaign.organization and campaign.organization.name:
            company = campaign.organization.name

        is_advance = decision_obj.decision.upper() in ["ADVANCE", "NEXT_ROUND", "APPROVED", "OFFER", "HIRE"]
        if is_advance:
            subject = f"Next Round Advancement: {job_title} - {company}"
        else:
            subject = f"Application Status Update: {job_title} - {company}"

        html_content = cls.generate_decision_email_html(
            candidate_name=candidate.full_name,
            job_title=job_title,
            campaign_title=campaign_title,
            decision=decision_obj.decision,
            rationale=decision_obj.rationale or "Reviewed against role competencies.",
            recruiter_name=reviewer
        )

        text_content = cls.generate_decision_email_text(
            candidate_name=candidate.full_name,
            job_title=job_title,
            campaign_title=campaign_title,
            decision=decision_obj.decision,
            rationale=decision_obj.rationale or "Reviewed against role competencies.",
            recruiter_name=reviewer
        )

        email_status, error_msg = cls._dispatch_smtp(
            recipient_email=candidate.email,
            subject=subject,
            html_content=html_content,
            plain_text_content=text_content
        )

        email_record = SentEmail(
            candidate_id=candidate.id,
            campaign_id=campaign.id if campaign else None,
            recipient_email=candidate.email,
            recipient_name=candidate.full_name,
            subject=subject,
            body_html=html_content,
            portal_link=f"{settings.APP_ORIGIN}/admin/candidates/{candidate.id}",
            passcode="DECISION",
            status=email_status,
            error_message=error_msg
        )
        db.add(email_record)
        db.commit()
        db.refresh(email_record)

        return {
            "email_id": email_record.id,
            "recipient_email": candidate.email,
            "subject": subject,
            "status": email_status
        }

    @classmethod
    def send_direct_email(
        cls,
        db: Session,
        recipient_email: str,
        recipient_name: str,
        job_title: str,
        campaign_title: str,
        portal_link: str,
        passcode: str,
        custom_note: str | None = None
    ) -> dict:
        subject = f"Interview Credentials: {job_title} - TalentPilot AI"
        html_content = cls.generate_invitation_email_html(
            candidate_name=recipient_name,
            job_title=job_title,
            campaign_title=campaign_title,
            portal_link=portal_link,
            passcode=passcode,
            custom_note=custom_note
        )
        text_content = cls.generate_invitation_email_text(
            candidate_name=recipient_name,
            job_title=job_title,
            campaign_title=campaign_title,
            portal_link=portal_link,
            passcode=passcode,
            custom_note=custom_note
        )

        email_status, error_msg = cls._dispatch_smtp(
            recipient_email=recipient_email,
            subject=subject,
            html_content=html_content,
            plain_text_content=text_content
        )

        email_record = SentEmail(
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            subject=subject,
            body_html=html_content,
            portal_link=portal_link,
            passcode=passcode,
            status=email_status,
            error_message=error_msg
        )
        db.add(email_record)
        db.commit()
        db.refresh(email_record)

        return {
            "email_id": email_record.id,
            "recipient_email": recipient_email,
            "recipient": recipient_email,
            "subject": subject,
            "portal_link": portal_link,
            "status": email_status
        }
