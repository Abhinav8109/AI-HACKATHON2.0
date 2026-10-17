import os
import json
import csv
from io import StringIO
from datetime import datetime
from app.config import settings

class ReportService:
    @staticmethod
    def generate_candidate_report_html(
        candidate_name: str,
        job_title: str,
        campaign_title: str,
        evaluation: dict,
        qa_pairs: list[dict],
        consistency_findings: list[dict],
        critic_review: dict,
        human_decision: dict | None = None
    ) -> str:
        overall_score = evaluation.get("overall_score", 0.0)
        recommendation = evaluation.get("recommendation", "HOLD_FOR_REVIEW")
        summary = evaluation.get("summary", "")
        strengths = evaluation.get("strengths", [])
        dev_areas = evaluation.get("development_areas", [])
        dimensions = evaluation.get("dimensions", [])

        dim_html = ""
        for dim in dimensions:
            dim_html += f"""
            <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; color: #1e293b;">
                    <span>{dim.get('dimension_name')}</span>
                    <span style="color: #6366f1;">{dim.get('score')} / 5.0 — {dim.get('rubric_anchor')}</span>
                </div>
                <p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Evidence Quote:</strong> <em>{dim.get('evidence_quote')}</em></p>
                <p style="margin: 4px 0; color: #64748b; font-size: 13px;">{dim.get('explanation')}</p>
            </div>
            """

        qa_html = ""
        for i, qa in enumerate(qa_pairs):
            qa_html += f"""
            <div style="margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                <p style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Q{i+1}: {qa.get('question')}</p>
                <p style="color: #334155; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">{qa.get('answer')}</p>
            </div>
            """

        consistency_html = ""
        for f in consistency_findings:
            consistency_html += f"""
            <div style="margin-bottom: 10px; font-size: 13px;">
                <strong>Claim:</strong> {f.get('claim_text')} &bull; <span style="color: #6366f1;">[{f.get('finding_type')}]</span><br/>
                <span style="color: #475569;">{f.get('explanation')}</span>
            </div>
            """

        decision_html = ""
        if human_decision:
            decision_html = f"""
            <div style="margin-top: 20px; padding: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
                <h3 style="color: #065f46; margin: 0 0 8px 0;">Official Human Recruiter Decision: {human_decision.get('decision')}</h3>
                <p style="margin: 0; color: #047857; font-size: 14px;"><strong>Rationale:</strong> {human_decision.get('rationale')}</p>
                <p style="margin: 4px 0 0 0; color: #059669; font-size: 12px;">Recorded on {human_decision.get('recorded_at')}</p>
            </div>
            """

        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>TalentPilot AI Assessment Report - {candidate_name}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 40px; line-height: 1.6; }}
        .header {{ border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }}
        .badge {{ display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 13px; background: #ede9fe; color: #6366f1; }}
        h1, h2, h3 {{ color: #0f172a; }}
        .summary-box {{ background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>TalentPilot AI &bull; Candidate Assessment Dossier</h1>
        <p style="color: #64748b; margin: 0;">AI-Assisted Evaluation Dossier &bull; Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
        <div>
            <h2>{candidate_name}</h2>
            <p style="margin: 0; color: #475569;">Target Role: <strong>{job_title}</strong></p>
            <p style="margin: 0; color: #64748b;">Campaign: {campaign_title}</p>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 32px; font-weight: 700; color: #6366f1;">{overall_score} / 5.0</div>
            <div class="badge">Recommendation: {recommendation}</div>
        </div>
    </div>

    <div class="summary-box">
        <h3 style="margin-top: 0;">Executive Summary</h3>
        <p style="margin-bottom: 0;">{summary}</p>
    </div>

    {decision_html}

    <h3>Dimension Competency Scorecard</h3>
    {dim_html}

    <h3>Demonstrated Strengths</h3>
    <ul>
        {''.join([f'<li>{s}</li>' for s in strengths])}
    </ul>

    <h3>Areas for Development</h3>
    <ul>
        {''.join([f'<li>{d}</li>' for d in dev_areas])}
    </ul>

    <h3>Resume Consistency & Fact Verification</h3>
    <div style="background: #fafafa; padding: 14px; border-radius: 6px; border: 1px solid #e5e5e5; margin-bottom: 24px;">
        {consistency_html}
    </div>

    <h3>Critic & Evidence Validation</h3>
    <div style="background: #fafafa; padding: 14px; border-radius: 6px; border: 1px solid #e5e5e5; margin-bottom: 24px;">
        <p style="margin: 0;"><strong>Evidence Alignment Score:</strong> {int(critic_review.get('alignment_score', 1.0) * 100)}%</p>
        <p style="margin: 4px 0 0 0; color: #475569;">{critic_review.get('critic_summary')}</p>
    </div>

    <h3>Verified Interview Transcript</h3>
    {qa_html}

    <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
        TalentPilot AI &bull; Human-in-the-Loop AI Recruitment Intelligence &bull; Strictly Confidential
    </div>
</body>
</html>"""
        return html

    @staticmethod
    def generate_campaign_csv(candidates_data: list[dict]) -> str:
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["Candidate Name", "Email", "Status", "Overall Score", "Recommendation", "Created At", "Decision"])
        for c in candidates_data:
            writer.writerow([
                c.get("full_name"),
                c.get("email"),
                c.get("status"),
                c.get("overall_score", "N/A"),
                c.get("recommendation", "N/A"),
                c.get("created_at"),
                c.get("decision", "PENDING_REVIEW")
            ])
        return output.getvalue()
