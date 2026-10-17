from typing import Any
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service

class CandidateFeedback(BaseModel):
    feedback_text: str = Field(description="Constructive, encouraging, professional feedback for the candidate")

class FeedbackAgent:
    @classmethod
    async def generate_feedback(
        cls,
        candidate_name: str,
        job_title: str,
        strengths: list[str],
        development_areas: list[str]
    ) -> str:
        prompt = f"""
        You are the TalentPilot Candidate Feedback AI Agent.
        Candidate Name: {candidate_name}
        Role Applied: {job_title}
        Demonstrated Strengths: {strengths}
        Growth / Development Areas: {development_areas}

        Write a warm, professional, and constructive feedback note for the candidate.
        Praise their concrete contributions and give actionable tips for growth.
        Do NOT disclose numerical scores, confidential recruiter weights, or internal hiring status.
        """
        system_instruction = "Be respectful, constructive, and empowering. Maintain high professional standards."

        result = await gemini_service.generate_structured(prompt, CandidateFeedback, system_instruction)
        if result and isinstance(result, CandidateFeedback):
            return result.feedback_text

        # Resilient template fallback
        return f"""Dear {candidate_name},

Thank you for participating in our technical interview for the {job_title} role.

Key Strengths Observed:
{chr(10).join(['• ' + s for s in strengths])}

Recommended Areas for Continued Growth:
{chr(10).join(['• ' + d for d in development_areas])}

We appreciate the time, preparation, and thought you invested in answering our interview scenarios. We wish you continued success in your engineering journey!

Warm regards,
Talent Intelligence Team"""
