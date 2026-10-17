from typing import List, Optional
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service

class CandidateMatchCitation(BaseModel):
    candidate_id: str
    candidate_name: str
    match_score: float = Field(description="Relevance to query on a 0.0 - 1.0 scale")
    relevant_evidence: str = Field(description="Specific quote or claim that satisfies the query")

class CopilotQueryResponse(BaseModel):
    query: str
    direct_answer: str = Field(description="Clear, executive-ready response directly answering the recruiter's inquiry")
    matched_candidates: List[CandidateMatchCitation]
    recommended_recruiter_action: str = Field(description="Actionable next step for the recruiter")

class RecruiterCopilotAgent:
    @classmethod
    async def query_candidate_intelligence(
        cls,
        recruiter_query: str,
        candidates_context: list[dict]
    ) -> dict:
        """
        Autonomous Recruiter Copilot Agent:
        Enables natural language semantic queries across candidate profiles, answers, and scores.
        """
        # Compress context for efficient token use
        context_str = ""
        for c in candidates_context[:12]:
            cid = c.get("id")
            name = c.get("full_name")
            title = c.get("current_title")
            skills = ", ".join(c.get("skills", [])[:6])
            score = c.get("overall_score")
            decision = c.get("decision", "PENDING")
            summary = c.get("summary", "")[:180]
            answers_summary = "; ".join(c.get("key_answers", [])[:3])
            
            context_str += f"\n- Candidate: {name} (ID: {cid})\n  Title: {title}\n  Skills: {skills}\n  Score: {score} | Decision: {decision}\n  Summary: {summary}\n  Sample Answers: {answers_summary}\n"

        prompt = f"""
        You are the TalentPilot Autonomous Recruiter Copilot AI.
        A corporate recruiter is asking the following query about their active candidate pool:

        Recruiter Query: "{recruiter_query}"

        Candidate Database Context:
        {context_str}

        TASK:
        1. Formulate a direct, insightful executive response addressing the recruiter's specific question.
        2. Identify the most relevant candidate(s) that match the query with a match score (0.0 to 1.0).
        3. Cite specific verifiable evidence (skills, answers, or background claims).
        4. Propose a clear, high-leverage next step for the recruiter.
        """
        system_instruction = "You are a senior technical recruiting advisor. Be precise, factual, and cite candidate evidence directly."

        result = await gemini_service.generate_structured(prompt, CopilotQueryResponse, system_instruction)
        if result and isinstance(result, CopilotQueryResponse):
            return result.model_dump()

        # Fallback keyword-based response
        matches = []
        q_lower = recruiter_query.lower()
        for c in candidates_context:
            name = c.get("full_name", "")
            skills = [s.lower() for s in c.get("skills", [])]
            if any(word in q_lower for word in name.lower().split()) or any(s in q_lower for s in skills):
                matches.append({
                    "candidate_id": c.get("id", ""),
                    "candidate_name": name,
                    "match_score": 0.85,
                    "relevant_evidence": f"Demonstrated background in {', '.join(c.get('skills', [])[:3])}."
                })

        return {
            "query": recruiter_query,
            "direct_answer": f"Analyzed candidate pool for '{recruiter_query}'. {len(matches)} candidate(s) demonstrate direct alignment with these technical parameters.",
            "matched_candidates": matches[:3],
            "recommended_recruiter_action": "Inspect the candidate intelligence dossier for full evidence quotes and interview recordings."
        }
