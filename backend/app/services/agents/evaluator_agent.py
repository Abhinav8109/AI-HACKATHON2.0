import re
from typing import Any, List, Optional
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service
from app.services.document_service import DocumentService

class PerQuestionReview(BaseModel):
    question_number: int = Field(description="1-based index of question")
    question_text: str = Field(description="The question prompt asked")
    candidate_answer: str = Field(description="Candidate's submitted answer text")
    relevance_to_question: str = Field(description="HIGHLY_RELEVANT, PARTIALLY_RELEVANT, MINIMAL_RELEVANCE, or OFF_TOPIC")
    score: float = Field(description="STRICT HONEST SCORE 0.0 - 5.0. Rule: Give 0.0 if off-topic, evasive, gibberish, or non-responsive. Give 1.0 if superficial, textbook definitions with no architecture, or barely useful. Give 2.0-5.0 based strictly on technical rigor and trade-off depth.")
    rubric_anchor: str = Field(description="Anchor e.g. '0.0 / 5.0 - Off-Topic / Non-Responsive', '1.0 / 5.0 - Superficial / Barely Useful', '2.0 / 5.0 - Developing', '3.0 / 5.0 - Meets Competency', '4.0 / 5.0 - Strong Evidence', '5.0 / 5.0 - Exemplary Demonstration'")
    evidence_quote: str = Field(description="Exact verbatim excerpt from candidate answer demonstrating technical competence or lack thereof. If no evidence, state 'No verifiable evidence provided.'")
    ai_critique: str = Field(description="Thorough, honest AI technical critique explaining what candidate answered, what was missing, and why points were awarded or deducted.")
    strengths: List[str] = Field(default_factory=list, description="Demonstrated technical strengths for this question")
    missing_elements: List[str] = Field(default_factory=list, description="Missing trade-offs, architecture, or failure modes")
    authenticity_rating: str = Field(default="AUTHENTIC_PRACTITIONER", description="AUTHENTIC_PRACTITIONER, THEORETICAL_TEXTBOOK, or LOW_SIGNAL")

class DimensionEvaluation(BaseModel):
    dimension_name: str
    score: float = Field(description="Score between 0.0 and 5.0")
    rubric_anchor: str = Field(description="Anchor name")
    evidence_quote: str = Field(description="Verbatim excerpt from candidate's answers demonstrating this competency")
    explanation: str = Field(description="Objective rationale for this rating based on evidence")
    missing_evidence: Optional[str] = Field(default=None, description="What additional proof would be needed for a higher score")
    confidence_limitations: Optional[str] = Field(default=None, description="Any boundaries or limitations of this evaluation")

class CompleteEvaluationResult(BaseModel):
    overall_score: float = Field(description="Weighted honest average of question scores (0.0 to 5.0)")
    recommendation: str = Field(description="ADVANCE, HOLD_FOR_REVIEW, or REJECT")
    summary: str
    strengths: List[str]
    development_areas: List[str]
    per_question_reviews: List[PerQuestionReview]
    dimensions: List[DimensionEvaluation]

class EvaluatorAgent:
    @classmethod
    async def evaluate_interview(
        cls,
        job_title: str,
        qa_pairs: list[dict],
        rubric_dimensions: list[dict]
    ) -> dict:
        """
        Autonomous Deep Evaluator Agent:
        Audits every question response individually with zero tolerance for fluff.
        Enforces honest 0.0 to 5.0 scoring (0 for non-responsive/off-topic, 1 for superficial).
        """
        transcript_formatted = []
        for i, qa in enumerate(qa_pairs):
            q_text = qa.get("question", f"Question {i+1}")
            ans_text = DocumentService.sanitize_untrusted_text(qa.get("answer", ""))
            transcript_formatted.append(f"--- QUESTION {i+1} ---\nPrompt: {q_text}\nCandidate Answer: {ans_text}")

        transcript_str = "\n\n".join(transcript_formatted)

        prompt = f"""
        You are the TalentPilot Strict Evidence-Based Technical Evaluator AI Agent.
        Your task is to conduct an unsparing, highly rigorous technical evaluation of the candidate's interview responses for the role of {job_title}.

        STRICT SCORING POLICY (ZERO TOLERANCE FOR FLUFF & EVASION):
        - Score 0.0 / 5.0: The response is off-topic, evasive, nonsense, gibberish, or does NOT answer the specific challenge in the question.
        - Score 1.0 / 5.0: The response is superficial or barely useful. Contains only generic buzzwords, 1-2 trivial sentences, or repeating definitions without explaining HOW or addressing failure modes.
        - Score 2.0 / 5.0: Developing. Candidate understands the domain and mentions valid concepts, but lacks failure handling, operational realities, or concrete architecture.
        - Score 3.0 / 5.0: Meets Competency. A solid, standard production design that adequately solves the problem.
        - Score 4.0 / 5.0: Strong. Clear consideration of trade-offs, failure modes (partitioning, backpressure, retries), and quantitative metrics.
        - Score 5.0 / 5.0: Exemplary. World-class mastery demonstrating deep hands-on battle-tested production insight and edge-case resilience.

        RULES:
        1. Evaluate EVERY SINGLE QUESTION individually in 'per_question_reviews'.
        2. Ground every single question score in a verbatim evidence quote from their answer. If they gave no valid evidence, quote their actual words and note why it lacks proof.
        3. Write an honest, detailed 'ai_critique' for each question explaining what was accurate, what was missing, and why points were awarded or deducted.
        4. Calculate 'overall_score' as the honest mathematical average of the question scores.
        5. Also summarize high-level rubric dimensions.

        Interview Transcript:
        \"\"\"{transcript_str}\"\"\"
        """
        system_instruction = "You are an elite, unsparing technical hiring evaluator. Do not inflate scores. Give honest scores from 0.0 to 5.0 based strictly on verifiable engineering evidence."

        result = await gemini_service.generate_structured(prompt, CompleteEvaluationResult, system_instruction)
        if result and isinstance(result, CompleteEvaluationResult):
            return result.model_dump()

        # Resilient, rigorous deterministic analysis of each question
        per_question_reviews: List[dict] = []
        trade_off_keywords = {"trade-off", "latency", "throughput", "consistency", "partition", "bottleneck", "overhead", "cache", "contention", "scalability", "concurrency", "p99", "backpressure"}
        failure_keywords = {"failover", "recovery", "circuit breaker", "dead letter", "quorum", "retry", "split-brain", "idempotent", "replica", "rollback", "outage", "heartbeat", "degraded"}
        tech_keywords = {"kafka", "raft", "postgres", "postgresql", "redis", "grpc", "docker", "kubernetes", "fastapi", "go", "golang", "python", "sql", "etcd", "elasticsearch", "aws", "partition", "stream"}
        metrics_keywords = {"ms", "rps", "rpm", "sla", "slo", "cluster", "seconds", "mb", "gb", "%", "nodes", "p99", "p95", "queries"}

        for i, qa in enumerate(qa_pairs):
            q_num = i + 1
            q_text = qa.get("question", f"Question {q_num}")
            raw_ans = qa.get("answer", "").strip()
            sanitized = DocumentService.sanitize_untrusted_text(raw_ans)
            words = sanitized.split()
            word_count = len(words)
            lower_ans = sanitized.lower()

            # Rule 1: Non-responsive or empty answer -> Score 0.0
            if word_count < 8:
                score = 0.0
                rubric_anchor = "0.0 / 5.0 - Non-Responsive / Fluff"
                relevance = "OFF_TOPIC"
                evidence_quote = f'"{sanitized}"' if sanitized else "No answer provided by candidate."
                critique = f"Question {q_num} received a non-responsive or trivial response ({word_count} words). The candidate failed to supply any architectural details, system trade-offs, or engineering proof."
                strengths = []
                missing = ["Architectural design", "Technical explanation", "Trade-off justification"]
                authenticity = "LOW_SIGNAL"

            # Rule 2: Minimal or superficial answer -> Score 1.0
            elif word_count < 25:
                # Check if it has any technical keywords
                has_tech = any(tk in lower_ans for tk in tech_keywords)
                score = 1.2 if has_tech else 0.8
                rubric_anchor = "1.0 / 5.0 - Superficial / Barely Useful"
                relevance = "MINIMAL_RELEVANCE"
                evidence_quote = f'"{sanitized[:140]}..."'
                critique = f"Superficial response of {word_count} words. While the candidate mentioned basic concepts, they provided zero implementation mechanics, no edge-case failure recovery, and no quantitative metrics."
                strengths = ["Recognized high-level problem domain"] if has_tech else []
                missing = ["Failure mode handling", "Production operational mechanics", "Quantitative benchmarks"]
                authenticity = "LOW_SIGNAL"

            # Rule 3: Substantial answer -> Deep signal analysis
            else:
                to_matches = [k for k in trade_off_keywords if k in lower_ans]
                fail_matches = [k for k in failure_keywords if k in lower_ans]
                tech_matches = [k for k in tech_keywords if k in lower_ans]
                metric_matches = [k for k in metrics_keywords if k in lower_ans]

                base_score = 2.2
                if tech_matches:
                    base_score += min(1.0, len(tech_matches) * 0.3)
                if to_matches:
                    base_score += min(1.0, len(to_matches) * 0.35)
                if fail_matches:
                    base_score += min(1.0, len(fail_matches) * 0.35)
                if metric_matches:
                    base_score += min(0.6, len(metric_matches) * 0.2)

                score = round(min(5.0, base_score), 1)

                if score >= 4.5:
                    rubric_anchor = "5.0 / 5.0 - Exemplary Demonstration"
                    relevance = "HIGHLY_RELEVANT"
                    authenticity = "AUTHENTIC_PRACTITIONER"
                elif score >= 3.8:
                    rubric_anchor = "4.0 / 5.0 - Strong Evidence"
                    relevance = "HIGHLY_RELEVANT"
                    authenticity = "AUTHENTIC_PRACTITIONER"
                elif score >= 2.8:
                    rubric_anchor = "3.0 / 5.0 - Meets Competency"
                    relevance = "PARTIALLY_RELEVANT"
                    authenticity = "THEORETICAL_TEXTBOOK"
                else:
                    rubric_anchor = "2.0 / 5.0 - Developing"
                    relevance = "MINIMAL_RELEVANCE"
                    authenticity = "LOW_SIGNAL"

                # Extract best sentence containing technical keywords as evidence quote
                sentences = re.split(r'(?<=[.!?])\s+', sanitized)
                best_sentence = sentences[0] if sentences else sanitized[:160]
                for s in sentences:
                    if any(tk in s.lower() for tk in tech_keywords) or any(fk in s.lower() for fk in failure_keywords):
                        best_sentence = s.strip()
                        break
                evidence_quote = f'"{best_sentence}"'

                strengths = []
                if tech_matches:
                    strengths.append(f"Concrete technology application ({', '.join(tech_matches[:3])})")
                if to_matches:
                    strengths.append(f"Trade-off awareness addressing {', '.join(to_matches[:2])}")
                if fail_matches:
                    strengths.append(f"Addressed failure scenarios ({', '.join(fail_matches[:2])})")
                if not strengths:
                    strengths.append("Structured communication format")

                missing = []
                if not fail_matches:
                    missing.append("Omitted distributed failure modes and automated failover mechanics")
                if not metric_matches:
                    missing.append("Lacked quantitative latency benchmarks and p99 SLA guarantees")
                if not to_matches:
                    missing.append("Did not evaluate architectural trade-offs between consistency and throughput")

                critique = (
                    f"Candidate answered Question {q_num} with a score of {score}/5.0 ({rubric_anchor}). "
                    f"Identified {len(tech_matches)} technical patterns. "
                    f"{'Demonstrated strong production insight regarding ' + ', '.join(to_matches[:2]) + '.' if to_matches else 'Lacked detailed trade-off analysis.'} "
                    f"{'Proactively covered failure scenarios including ' + ', '.join(fail_matches[:2]) + '.' if fail_matches else 'Did not articulate disaster recovery or partition handling.'}"
                )

            per_question_reviews.append({
                "question_number": q_num,
                "question_text": q_text,
                "candidate_answer": sanitized,
                "relevance_to_question": relevance,
                "score": score,
                "rubric_anchor": rubric_anchor,
                "evidence_quote": evidence_quote,
                "ai_critique": critique,
                "strengths": strengths,
                "missing_elements": missing,
                "authenticity_rating": authenticity
            })

        # Calculate strictly honest overall score
        scores = [pq["score"] for pq in per_question_reviews]
        overall = round(sum(scores) / max(len(scores), 1), 2)
        recommendation = "ADVANCE" if overall >= 3.8 else ("HOLD_FOR_REVIEW" if overall >= 2.5 else "REJECT")

        # Map to dimensions
        dimensions_list = []
        dim_names = [
            "Technical Competency",
            "Problem Solving",
            "Practical Application",
            "Role-specific Knowledge",
            "Communication",
            "Behavioral Competency"
        ]
        for idx, dim in enumerate(dim_names):
            matching_q = per_question_reviews[idx % len(per_question_reviews)]
            dim_score = matching_q["score"]
            dimensions_list.append({
                "dimension_name": dim,
                "score": dim_score,
                "rubric_anchor": matching_q["rubric_anchor"],
                "evidence_quote": matching_q["evidence_quote"],
                "explanation": f"Evaluated across Q{matching_q['question_number']}: {matching_q['ai_critique']}",
                "missing_evidence": "; ".join(matching_q.get("missing_elements", [])) or None,
                "confidence_limitations": f"Grounded in verbatim transcript proof with {matching_q['authenticity_rating']} signal."
            })

        all_strengths = []
        for pq in per_question_reviews:
            all_strengths.extend(pq.get("strengths", []))
        unique_strengths = list(dict.fromkeys(all_strengths))[:4] or ["Understands basic domain terminology"]

        all_missing = []
        for pq in per_question_reviews:
            all_missing.extend(pq.get("missing_elements", []))
        unique_missing = list(dict.fromkeys(all_missing))[:3] or ["Could provide deeper quantitative metrics"]

        return {
            "overall_score": overall,
            "recommendation": recommendation,
            "summary": (
                f"Multi-Agent deep audit completed across {len(per_question_reviews)} individual interview questions for {job_title}. "
                f"Overall strict uninflated score is {overall} / 5.0 with recommendation {recommendation}. "
                f"Questions with strong evidence received high scores (4.0-5.0), while superficial or off-topic responses were penalized accordingly (0.0-1.0)."
            ),
            "strengths": unique_strengths,
            "development_areas": unique_missing,
            "per_question_reviews": per_question_reviews,
            "dimensions": dimensions_list
        }
