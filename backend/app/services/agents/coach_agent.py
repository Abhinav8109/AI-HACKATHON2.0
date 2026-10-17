from typing import List, Optional
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service
from app.services.document_service import DocumentService

class DepthCoachingResult(BaseModel):
    depth_rating: str = Field(description="BRIEF, MODERATE, or COMPREHENSIVE")
    covers_trade_offs: bool
    covers_failure_modes: bool
    cites_measurable_impact: bool
    coaching_tip: str = Field(description="Constructive advice on how to improve depth without giving away answers")
    word_count: int

class CandidateCoachAgent:
    @classmethod
    async def analyze_draft_depth(
        cls,
        question_text: str,
        competency: str,
        draft_answer: str
    ) -> dict:
        """
        Autonomous Candidate Coach Agent:
        Analyzes a candidate's drafted answer to provide constructive guidance on technical depth.
        """
        sanitized = DocumentService.sanitize_untrusted_text(draft_answer)
        words = len(sanitized.split())

        if words < 15:
            return {
                "depth_rating": "BRIEF",
                "covers_trade_offs": False,
                "covers_failure_modes": False,
                "cites_measurable_impact": False,
                "coaching_tip": "Your response is currently very brief. Try outlining specific architectural choices, trade-offs, and technologies you utilized.",
                "word_count": words
            }

        prompt = f"""
        You are the TalentPilot Technical Interview Coach AI.
        Question: "{question_text}"
        Target Competency: "{competency}"
        Candidate's Draft Answer:
        \"\"\"{sanitized}\"\"\"

        TASK:
        Evaluate the technical depth of the candidate's draft without providing solutions:
        1. Rate depth: BRIEF, MODERATE, or COMPREHENSIVE.
        2. Check whether they covered trade-offs (true/false).
        3. Check whether they addressed failure modes or resilience (true/false).
        4. Check whether they cited measurable impact or metrics (true/false).
        5. Formulate 1 concise, encouraging coaching tip on what areas they could elaborate on (e.g., mention concurrency, metrics, or failure edge cases).
        """
        system_instruction = "You are a supportive, fair technical mentor. Encourage rigor and clarity without leaking test criteria."

        result = await gemini_service.generate_structured(prompt, DepthCoachingResult, system_instruction)
        if result and isinstance(result, DepthCoachingResult):
            res_dict = result.model_dump()
            res_dict["word_count"] = words
            return res_dict

        # Deterministic fallback
        has_metrics = any(char.isdigit() for char in sanitized)
        has_tradeoffs = any(term in sanitized.lower() for term in ["trade-off", "tradeoff", "however", "instead of", "versus", "vs", "drawback"])
        has_failure = any(term in sanitized.lower() for term in ["failover", "retry", "incident", "latency", "bottleneck", "recovery", "timeout"])

        rating = "COMPREHENSIVE" if (words > 120 and has_tradeoffs and has_failure) else "MODERATE" if words > 50 else "BRIEF"
        tip = "Consider describing specific trade-offs you evaluated and how your architecture handled edge cases or failures." if not has_tradeoffs else "Great detail on trade-offs. You might also mention how you measured performance outcomes."

        return {
            "depth_rating": rating,
            "covers_trade_offs": has_tradeoffs,
            "covers_failure_modes": has_failure,
            "cites_measurable_impact": has_metrics,
            "coaching_tip": tip,
            "word_count": words
        }
