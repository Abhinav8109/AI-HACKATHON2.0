from typing import Any
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service
from app.services.document_service import DocumentService

class FollowUpDecision(BaseModel):
    needs_follow_up: bool = Field(description="Whether a follow-up probe is needed")
    reason: str = Field(description="Why follow-up is needed (e.g., shallow, missing trade-offs, vague metrics)")
    follow_up_prompt: str = Field(description="The adaptive follow-up question to ask the candidate")

class InterviewerAgent:
    @classmethod
    async def evaluate_answer_and_adapt(
        cls,
        question_text: str,
        competency: str,
        candidate_answer: str,
        current_follow_up_count: int,
        max_follow_up_limit: int = 2
    ) -> dict:
        """
        Adaptive Interviewing Engine:
        Analyzes the depth of the candidate's answer.
        If shallow or missing concrete examples, asks a contextual clarifying follow-up.
        If strong or max limit reached, advances to the next question.
        """
        if current_follow_up_count >= max_follow_up_limit:
            return {
                "needs_follow_up": False,
                "reason": "Max follow-up limit reached for this question.",
                "follow_up_prompt": None
            }

        sanitized_ans = DocumentService.sanitize_untrusted_text(candidate_answer)
        words = sanitized_ans.split()
        
        # If extremely brief (< 25 words), always probe for depth
        if len(words) < 25:
            return {
                "needs_follow_up": True,
                "reason": "Answer is brief. Probing for specific architectural details and trade-offs.",
                "follow_up_prompt": f"Could you elaborate on specific technical decisions, challenges you encountered, or measurable outcomes from that approach?"
            }

        prompt = f"""
        You are the TalentPilot Adaptive AI Interviewer.
        Original Question: "{question_text}"
        Target Competency: "{competency}"
        Candidate's Answer:
        \"\"\"{sanitized_ans}\"\"\"

        Determine if the candidate's answer is complete and supported with specific engineering examples.
        If it lacks detail on trade-offs, architecture, or metrics, formulate ONE sharp, respectful follow-up question.
        If the answer is comprehensive, set needs_follow_up to false.
        """
        system_instruction = "Be concise, encouraging, and focused on job-related technical depth. Do not ask trick questions."

        result = await gemini_service.generate_structured(prompt, FollowUpDecision, system_instruction)
        if result and isinstance(result, FollowUpDecision):
            return result.model_dump()

        # Resilient heuristic: if candidate mentions concepts without trade-offs or metrics, probe gently once
        lower_ans = sanitized_ans.lower()
        if "trade-off" not in lower_ans and "challenge" not in lower_ans and len(words) < 80:
            return {
                "needs_follow_up": True,
                "reason": "Answer outlines the solution well but doesn't mention trade-offs or alternatives considered.",
                "follow_up_prompt": "What trade-offs or alternative options did you weigh when choosing that particular implementation?"
            }

        return {
            "needs_follow_up": False,
            "reason": "Answer provides sufficient depth for evaluation.",
            "follow_up_prompt": None
        }
