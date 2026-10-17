from typing import List, Optional
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service
from app.services.document_service import DocumentService

class CandidateRankItem(BaseModel):
    candidate_id: str
    candidate_name: str
    rank: int
    percentile_tier: str = Field(description="Top 5%, Top 15%, Strong Contender, or Reserve")
    key_differentiator: str = Field(description="What makes this candidate stand out over others")
    top_competency: str
    potential_risk: Optional[str] = Field(description="Remaining risk or area to probe in final round")

class CalibrationResult(BaseModel):
    campaign_title: str
    calibrated_at: str
    executive_summary: str = Field(description="2-3 sentence overview of the talent pool caliber")
    rankings: List[CandidateRankItem]
    head_to_head_takeaways: List[str] = Field(description="Actionable comparisons between top candidates")
    hiring_recommendation: str = Field(description="Strategic advice on which candidates to extend offers or fast-track")

class CalibrationAgent:
    @classmethod
    async def calibrate_campaign_candidates(
        cls,
        campaign_title: str,
        job_title: str,
        candidates_data: list[dict]
    ) -> dict:
        """
        Autonomous Talent Calibration Agent:
        Compares all candidates evaluated under a hiring campaign.
        Generates relative rankings, key differentiators, and executive hiring guidance.
        """
        if not candidates_data:
            return {
                "campaign_title": campaign_title,
                "calibrated_at": "N/A",
                "executive_summary": "No candidate dossiers available for calibration.",
                "rankings": [],
                "head_to_head_takeaways": [],
                "hiring_recommendation": "Conduct assessments to generate comparative calibration."
            }

        # Format candidate profiles for prompt
        profiles_text = ""
        for c in candidates_data[:10]:
            name = c.get("full_name", "Candidate")
            cid = c.get("id", "")
            score = c.get("overall_score")
            skills = ", ".join(c.get("skills", [])[:5])
            decision = c.get("decision", "PENDING")
            summary = c.get("summary", "")[:200]
            quotes = "; ".join(c.get("evidence_quotes", [])[:3])
            
            profiles_text += f"\n- Candidate ID: {cid}\n  Name: {name}\n  Current Title: {c.get('current_title')}\n  Overall Score: {score}\n  Skills: {skills}\n  Decision: {decision}\n  Evidence Quotes: {quotes}\n  Summary: {summary}\n"

        prompt = f"""
        You are the TalentPilot Principal Talent Calibration and Executive Benchmarking Agent.
        Target Role: {job_title}
        Hiring Campaign: {campaign_title}

        Candidate Dossiers under review:
        {profiles_text}

        TASK:
        Perform a rigorous comparative talent calibration across these candidates:
        1. Rank candidates in order of verified competency, technical depth, and role fit.
        2. Assign a percentile tier (Top 5%, Top 15%, Strong Contender, Reserve).
        3. Identify the primary competitive differentiator for each candidate.
        4. Provide head-to-head comparative takeaways for leadership.
        5. Formulate a clear, actionable hiring recommendation for the hiring manager.
        """
        system_instruction = "You are an executive talent calibration partner. Provide objective, evidence-based comparative candidate intelligence."

        result = await gemini_service.generate_structured(prompt, CalibrationResult, system_instruction)
        if result and isinstance(result, CalibrationResult):
            return result.model_dump()

        # Resilient fallback ranking by score
        sorted_cands = sorted(candidates_data, key=lambda x: x.get("overall_score") or 0, reverse=True)
        fallback_rankings = []
        for idx, sc in enumerate(sorted_cands):
            score = sc.get("overall_score") or 0
            tier = "Top 5%" if idx == 0 else "Top 15%" if idx == 1 else "Strong Contender" if score >= 3.8 else "Reserve"
            fallback_rankings.append({
                "candidate_id": sc.get("id", ""),
                "candidate_name": sc.get("full_name", "Candidate"),
                "rank": idx + 1,
                "percentile_tier": tier,
                "key_differentiator": f"Strong demonstration of {sc.get('skills', ['Core competencies'])[0] if sc.get('skills') else 'core engineering'}",
                "top_competency": "Technical Systems Architecture",
                "potential_risk": "Verify specific scaling edge cases in team round"
            })

        return {
            "campaign_title": campaign_title,
            "calibrated_at": "Deterministic Fallback Calibration",
            "executive_summary": f"Calibrated {len(candidates_data)} candidates for {job_title}. Top candidates demonstrate strong alignment with role prerequisites.",
            "rankings": fallback_rankings,
            "head_to_head_takeaways": [
                f"Top ranked candidate demonstrates highest verified evidence score ({sorted_cands[0].get('overall_score', 'N/A') if sorted_cands else 'N/A'}/5.0).",
                "Differentiating factor centers on hands-on production incident handling and concurrency design."
            ],
            "hiring_recommendation": f"Fast-track {sorted_cands[0].get('full_name') if sorted_cands else 'top candidate'} for immediate on-site executive rounds."
        }
