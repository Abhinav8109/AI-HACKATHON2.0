import json
from typing import Any
from pydantic import BaseModel, Field
from app.services.gemini_service import gemini_service
from app.services.document_service import DocumentService

class CompetencyExtractionResult(BaseModel):
    technical_skills: list[str] = Field(description="Must-have technical proficiencies")
    preferred_skills: list[str] = Field(description="Nice-to-have or bonus proficiencies")
    job_competencies: list[dict[str, Any]] = Field(description="Key competencies with name and description")
    responsibilities: list[str] = Field(description="Key daily responsibilities")
    role_scenarios: list[str] = Field(description="Practical real-world challenges this role tackles")
    behavioral_competencies: list[str] = Field(description="Collaboration and working styles needed")

class PlannedQuestion(BaseModel):
    question_index: int
    question_text: str
    category: str
    competency: str
    difficulty: str
    purpose: str
    relevant_jd_requirement: str
    relevant_resume_claim: str
    scoring_criteria: str
    follow_up_guidance: str

class InterviewPlanResult(BaseModel):
    questions: list[PlannedQuestion]

class PlannerAgent:
    @classmethod
    async def extract_competencies(cls, job_title: str, jd_text: str) -> dict:
        sanitized_jd = DocumentService.sanitize_untrusted_text(jd_text)
        prompt = f"""
        You are an expert Talent Intelligence and Job Architecture AI Agent.
        Analyze the following Job Description for the role of '{job_title}'.
        Extract a structured competency matrix.

        Job Description:
        \"\"\"{sanitized_jd}\"\"\"
        """
        system_instruction = "Extract job-related technical, behavioral, and practical competencies strictly based on the provided JD. Do not invent requirements not mentioned."
        
        result = await gemini_service.generate_structured(prompt, CompetencyExtractionResult, system_instruction)
        if result and isinstance(result, CompetencyExtractionResult):
            return result.model_dump()

        # Deterministic high-quality fallback
        words = sanitized_jd.split()
        skills = []
        common_tech = ["Python", "React", "TypeScript", "FastAPI", "SQL", "Docker", "AWS", "System Design", "CI/CD", "PostgreSQL", "Kubernetes", "Git"]
        for tech in common_tech:
            if tech.lower() in sanitized_jd.lower():
                skills.append(tech)
        if not skills:
            skills = ["Software Architecture", "Problem Solving", "Modern Web Frameworks", "API Design", "Distributed Systems"]

        return {
            "technical_skills": skills[:8],
            "preferred_skills": ["Performance Optimization", "Cloud Infrastructure", "Mentorship"],
            "job_competencies": [
                {"name": "Core Technical Depth", "category": "Technical", "level": "REQUIRED", "description": f"Mastery in {', '.join(skills[:3])}"},
                {"name": "System Architecture & Scalability", "category": "Architecture", "level": "REQUIRED", "description": "Designing resilient, scalable backend and frontend services"},
                {"name": "Practical Execution & Troubleshooting", "category": "Engineering", "level": "REQUIRED", "description": "Debugging production issues and delivering maintainable code"},
                {"name": "Collaborative Communication", "category": "Behavioral", "level": "REQUIRED", "description": "Cross-functional clarity and constructive feedback"}
            ],
            "responsibilities": [
                f"Design, develop, and maintain high-impact systems for {job_title}",
                "Collaborate with product and design to deliver end-to-end features",
                "Uphold high standards of code quality, testing, and system reliability"
            ],
            "role_scenarios": [
                "Handling an unexpected latency spike in high-traffic APIs",
                "Refactoring legacy monolith components into modular microservices",
                "Navigating divergent technical opinions across team members"
            ],
            "behavioral_competencies": [
                "Constructive technical debate",
                "Ownership under ambiguity",
                "Continuous learning and mentoring"
            ]
        }

    @classmethod
    async def generate_candidate_interview_plan(
        cls,
        job_title: str,
        competencies: dict,
        candidate_name: str,
        resume_text: str,
        question_count: int = 8
    ) -> list[dict]:
        sanitized_resume = DocumentService.sanitize_untrusted_text(resume_text)
        prompt = f"""
        You are the TalentPilot Senior Technical Interview Planner AI Agent.
        Candidate Name: {candidate_name}
        Target Role: {job_title}
        Competencies Required: {json.dumps(competencies.get('job_competencies', []))}
        
        Candidate Full Resume:
        \"\"\"{sanitized_resume[:4000]}\"\"\"

        TASK:
        Generate EXACTLY 8 rigorous, highly customized interview questions for {candidate_name}.
        MANDATORY RULES:
        1. EVERY SINGLE QUESTION MUST BE GROUNDED IN THE CANDIDATE'S ACTUAL RESUME.
           Reference their specific past projects, companies, architectural designs, tools (e.g., Kafka, Docker, Kubernetes, AWS, Go, Python, React), and claimed metrics.
        2. NO GENERIC OR RANDOM QUESTIONS. For example, begin questions like:
           - "On your resume, you noted implementing [specific project/tool] at [Company/Context]. How did you..."
           - "You highlight experience with [Technology]. In your architecture for [Project], how did you handle..."
        3. Distribute across 8 questions:
           - Q0-Q1: Technical Architecture & Core Stack (MID)
           - Q2-Q3: Deep System Design & Concurrency/Storage (SENIOR)
           - Q4-Q5: Production Incident Debugging & Real-world Problem Solving (SENIOR)
           - Q6: CI/CD, Testing & Operational Resilience (MID)
           - Q7: Technical Leadership, Trade-offs & Behavioral Alignment (MID)
        4. Populate relevant_resume_claim with the exact excerpt or claim from their resume.
        """
        system_instruction = "You are a principal talent architect. You generate questions strictly tailored to the candidate's actual resume. Never produce generic interview templates."

        result = await gemini_service.generate_structured(prompt, InterviewPlanResult, system_instruction)
        if result and isinstance(result, InterviewPlanResult) and len(result.questions) >= 5:
            questions = [q.model_dump() for q in result.questions[:8]]
            for idx, q in enumerate(questions):
                q["question_index"] = idx
            return questions

        # Resilient contextual fallback dynamically tailored to resume
        meta = DocumentService.extract_resume_metadata(sanitized_resume)
        skills = meta.get("skills", []) or competencies.get("technical_skills", ["Distributed Systems", "Cloud Architecture"])
        primary_skill = skills[0] if len(skills) > 0 else "Cloud Architecture"
        secondary_skill = skills[1] if len(skills) > 1 else "Database Systems"
        tertiary_skill = skills[2] if len(skills) > 2 else "CI/CD & DevOps"

        return [
            {
                "question_index": 0,
                "question_text": f"Looking at your experience, can you walk us through a complex system or project where you utilized {primary_skill}? What architectural trade-offs did you make?",
                "category": "TECHNICAL",
                "competency": "Technical Architecture",
                "difficulty": "MID",
                "purpose": f"Evaluate hands-on depth with {primary_skill} and awareness of design decisions.",
                "relevant_jd_requirement": f"Proficiency in {primary_skill}",
                "relevant_resume_claim": f"Hands-on experience with {primary_skill} on recent engineering projects.",
                "scoring_criteria": "Demonstrates clear rationale for architectural choices and understands memory/concurrency trade-offs.",
                "follow_up_guidance": "Ask how they benchmarked performance or handled unexpected edge cases."
            },
            {
                "question_index": 1,
                "question_text": f"How do you approach database schema design and indexing in {secondary_skill} to maintain sub-100ms query latency under heavy write traffic?",
                "category": "TECHNICAL",
                "competency": "Data Engineering & Storage",
                "difficulty": "MID",
                "purpose": "Test database indexing, query optimization, and write contention handling.",
                "relevant_jd_requirement": "Relational/NoSQL database performance tuning",
                "relevant_resume_claim": "Database optimization and persistence modeling",
                "scoring_criteria": "Articulates compound index strategy, query execution plans, and write isolation levels.",
                "follow_up_guidance": "Inquire about connection pooling or partitioning strategies."
            },
            {
                "question_index": 2,
                "question_text": "Describe a real-world production incident you diagnosed. What debugging tools and telemetry metrics did you rely on to isolate the root cause?",
                "category": "PROBLEM_SOLVING",
                "competency": "Production Debugging & Observability",
                "difficulty": "SENIOR",
                "purpose": "Assess incident response, root-cause analysis, and systemic prevention.",
                "relevant_jd_requirement": "Troubleshooting distributed production systems",
                "relevant_resume_claim": "Ownership of production services and uptime",
                "scoring_criteria": "Structures troubleshooting methodically (logs -> metrics -> distributed traces) without guessing.",
                "follow_up_guidance": "Ask what automated safeguards or regression tests were introduced afterward."
            },
            {
                "question_index": 3,
                "question_text": "When designing an API contract consumed by multiple frontend and mobile clients, how do you handle versioning, breaking schema changes, and backwards compatibility?",
                "category": "SYSTEM_DESIGN",
                "competency": "API Architecture",
                "difficulty": "MID",
                "purpose": "Verify API design maturity and developer ergonomics.",
                "relevant_jd_requirement": "RESTful / GraphQL API design standards",
                "relevant_resume_claim": "REST API development",
                "scoring_criteria": "Mentions semantic versioning, additive changes, deprecation windows, and contract testing.",
                "follow_up_guidance": "Ask about idempotency keys for mutative endpoints."
            },
            {
                "question_index": 4,
                "question_text": "Tell us about a time you strongly disagreed with a peer or tech lead on a critical design direction. How did you present your case and navigate to a resolution?",
                "category": "BEHAVIORAL",
                "competency": "Constructive Collaboration",
                "difficulty": "JUNIOR",
                "purpose": "Examine interpersonal skills, evidence-based persuasion, and team alignment.",
                "relevant_jd_requirement": "Cross-functional team collaboration",
                "relevant_resume_claim": "Collaborative agile team experience",
                "scoring_criteria": "Focuses on objective data/benchmarks rather than ego, and commits fully once a decision is agreed upon.",
                "follow_up_guidance": "Check how they supported the final outcome if their proposal wasn't chosen."
            },
            {
                "question_index": 5,
                "question_text": "How do you ensure test coverage in your CI/CD pipeline balance between unit tests, integration tests, and end-to-end checks without slowing developer velocity?",
                "category": "TECHNICAL",
                "competency": "Quality Assurance & DevOps",
                "difficulty": "MID",
                "purpose": "Assess testing pyramid understanding and deployment confidence.",
                "relevant_jd_requirement": "CI/CD automated testing",
                "relevant_resume_claim": "Automated testing and CI/CD pipelines",
                "scoring_criteria": "Articulates the testing pyramid, mocking external dependencies, and ephemeral test environments.",
                "follow_up_guidance": "Ask how they handle flaky integration tests."
            },
            {
                "question_index": 6,
                "question_text": "If our application traffic spiked 10x overnight due to a sudden product launch, where do you predict our system would bottleneck first, and how would you mitigate it?",
                "category": "SYSTEM_DESIGN",
                "competency": "Scalability & Resilience",
                "difficulty": "SENIOR",
                "purpose": "Evaluate holistic architectural thinking under stress.",
                "relevant_jd_requirement": "High-concurrency distributed systems",
                "relevant_resume_claim": "Scalable cloud architecture",
                "scoring_criteria": "Identifies database connection limits, queue backpressure, cache invalidation, and rate limiting.",
                "follow_up_guidance": "Probe into graceful degradation and circuit breaker mechanisms."
            },
            {
                "question_index": 7,
                "question_text": "What is an emerging technology, framework, or architectural pattern you evaluated in the past 6-12 months? What was your conclusion on its production readiness?",
                "category": "BEHAVIORAL",
                "competency": "Continuous Learning",
                "difficulty": "JUNIOR",
                "purpose": "Evaluate curiosity, critical evaluation of hype, and practical adoption prudence.",
                "relevant_jd_requirement": "Adaptability and continuous learning",
                "relevant_resume_claim": "Self-driven technical growth",
                "scoring_criteria": "Demonstrates genuine curiosity balanced with pragmatism for production maintenance.",
                "follow_up_guidance": "Ask what trade-offs prevented immediate adoption if any."
            }
        ]
