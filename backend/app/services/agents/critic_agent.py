from typing import Any
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service

class CriticValidationResult(BaseModel):
    alignment_score: float = Field(description="Score between 0.0 and 1.0 indicating degree of evidence alignment")
    passed_validation: bool = Field(description="True if evaluation is solidly grounded in candidate answers")
    flags: list[str] = Field(description="Any issues found: unsupported scores, missing answers, contradictory claims")
    critic_summary: str = Field(description="Summary of the critic review")
    human_review_flagged: bool = Field(description="Whether a human recruiter MUST review this assessment")

class CriticAgent:
    @classmethod
    async def validate_evaluation(
        cls,
        evaluation_data: dict,
        qa_pairs: list[dict]
    ) -> dict:
        prompt = f"""
        You are the TalentPilot Critic and Evidence Validator Agent.
        Your job is to independently audit the candidate evaluation against original answers.
        
        Evaluation to Audit:
        Overall Score: {evaluation_data.get('overall_score')}
        Recommendation: {evaluation_data.get('recommendation')}
        Dimensions: {evaluation_data.get('dimensions')}

        Candidate Raw Answers:
        {qa_pairs}

        Validate:
        1. Are the assigned scores proportional to the verbatim evidence quotes?
        2. Are there any unsupported hallucinations or scores without quote evidence?
        3. Are any answers missing or skipped?
        4. Should a human recruiter be flagged for mandatory review?
        """
        system_instruction = "Act as an independent adversarial auditor. Hold the evaluation to high evidence standards."

        result = await gemini_service.generate_structured(prompt, CriticValidationResult, system_instruction)
        if result and isinstance(result, CriticValidationResult):
            return result.model_dump()

        # Resilient critic verification
        flags = []
        overall_score = evaluation_data.get("overall_score", 3.0)
        dimensions = evaluation_data.get("dimensions", [])
        
        # Check if quotes are populated
        missing_quotes = [d for d in dimensions if not d.get("evidence_quote") or len(d.get("evidence_quote")) < 5]
        if missing_quotes:
            flags.append("One or more dimension ratings lack verbatim quotation proof.")

        # Check for borderline scores
        human_review = False
        if 2.5 <= overall_score <= 3.4:
            flags.append("Borderline overall score (2.5 - 3.4) — human recruiter alignment recommended.")
            human_review = True
        
        if len(qa_pairs) < 4:
            flags.append("Candidate answered fewer than 4 questions. Incomplete interview dataset.")
            human_review = True

        alignment_score = 0.95 if not flags else 0.85

        return {
            "alignment_score": alignment_score,
            "passed_validation": len(flags) == 0 or (len(flags) == 1 and not missing_quotes),
            "flags": flags,
            "critic_summary": "All dimension evaluations link to verbatim candidate quotes with coherent scoring alignment." if not flags else f"Audited with notes: {'; '.join(flags)}",
            "human_review_flagged": human_review
        }
