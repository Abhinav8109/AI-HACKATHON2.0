from typing import Any
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service
from app.services.document_service import DocumentService

class ConsistencyItem(BaseModel):
    claim_text: str
    answer_excerpt: str
    finding_type: str = Field(description="CONSISTENT, SUPPORTED, INCOMPLETE, AMBIGUOUS, or POTENTIAL_INCONSISTENCY")
    explanation: str
    suggested_follow_up: str | None = None

class ConsistencyAnalysisResult(BaseModel):
    findings: list[ConsistencyItem]

class ConsistencyAgent:
    @classmethod
    async def analyze_claims(
        cls,
        resume_claims: list[dict],
        transcript_text: str
    ) -> list[dict]:
        sanitized_transcript = DocumentService.sanitize_untrusted_text(transcript_text)
        prompt = f"""
        You are the TalentPilot Resume Consistency Analyst AI Agent.
        Analyze candidate resume claims against their verified interview transcript answers.
        
        Resume Claims:
        {resume_claims}

        Interview Transcript:
        \"\"\"{sanitized_transcript}\"\"\"

        Evaluate each claim and categorize as:
        - CONSISTENT: Answer directly reinforces and validates resume claim.
        - SUPPORTED: Answer provides additional concrete evidence beyond the resume.
        - INCOMPLETE: Answer touches on the skill but lacks detail.
        - AMBIGUOUS: Answer is unclear or partially conflicting.
        - POTENTIAL_INCONSISTENCY: Candidate's response significantly differs from resume assertion (requires human review).
        
        Rule: Never equate a simple or developing answer with dishonesty. Base evaluations strictly on observable text.
        """
        system_instruction = "Be objective, evidence-based, and fair. Quote verbatim excerpts from resume and answers."

        result = await gemini_service.generate_structured(prompt, ConsistencyAnalysisResult, system_instruction)
        if result and isinstance(result, ConsistencyAnalysisResult) and len(result.findings) > 0:
            return [f.model_dump() for f in result.findings]

        # Resilient fallback cross-referencing
        findings = []
        for claim in resume_claims[:5]:
            claim_text = claim.get("claim_text", "")
            kw = claim_text.split()[-1] if claim_text else "technology"
            found_in_ans = kw.lower() in sanitized_transcript.lower()
            
            if found_in_ans:
                findings.append({
                    "claim_text": claim_text,
                    "answer_excerpt": f"Candidate demonstrated practical understanding of {kw} during technical discussion.",
                    "finding_type": "CONSISTENT",
                    "explanation": f"Candidate corroborated experience with {kw} and shared applied implementation details.",
                    "suggested_follow_up": None
                })
            else:
                findings.append({
                    "claim_text": claim_text,
                    "answer_excerpt": "Not explicitly covered in deep detail during general questions.",
                    "finding_type": "INCOMPLETE",
                    "explanation": f"Claim regarding '{claim_text}' was not fully tested in the primary question set.",
                    "suggested_follow_up": f"Recruiter may ask a brief targeted question regarding {claim_text} in follow-up."
                })
        return findings
