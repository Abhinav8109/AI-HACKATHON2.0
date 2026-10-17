import re
import os
from pathlib import Path
from pypdf import PdfReader
from docx import Document

class DocumentService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extracts text safely from PDF files."""
        try:
            reader = PdfReader(file_path)
            extracted_text = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text.append(text)
            return "\n\n".join(extracted_text)
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extracts text safely from DOCX files."""
        try:
            doc = Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())
            return "\n".join(full_text)
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")

    @classmethod
    def extract_text_from_file(cls, file_path: str) -> str:
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            return cls.extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return cls.extract_text_from_docx(file_path)
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

    @staticmethod
    def sanitize_untrusted_text(text: str) -> str:
        """
        Guards against prompt injection in untrusted candidate resumes and JDs.
        Removes system prompt overrides like 'Ignore previous instructions'.
        """
        if not text:
            return ""
        # Remove null bytes
        clean = text.replace("\x00", "")
        # Neutralize common prompt injection patterns
        patterns = [
            r"(?i)ignore\s+(all\s+)?previous\s+instructions",
            r"(?i)system\s*prompt\s*override",
            r"(?i)you\s+are\s+now\s+a\s+different\s+agent",
            r"(?i)disregard\s+prior\s+guidelines"
        ]
        for pattern in patterns:
            clean = re.sub(pattern, "[FILTERED_INSTRUCTION_OVERRIDE]", clean)
        return clean.strip()

    @staticmethod
    def extract_resume_metadata(raw_text: str) -> dict:
        """Heuristic extractor for resume sections, skills, and claims."""
        text = raw_text.strip()
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        full_name = lines[0] if lines else "Candidate"
        # Search for email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else "candidate@example.com"

        # Search for phone
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        phone = phone_match.group(0) if phone_match else None

        # Common tech skills matching
        tech_keywords = [
            "Python", "TypeScript", "JavaScript", "React", "Node.js", "FastAPI", "Django",
            "Go", "Rust", "Java", "C++", "Docker", "Kubernetes", "AWS", "GCP", "PostgreSQL",
            "Redis", "Kafka", "GraphQL", "REST", "CI/CD", "Machine Learning", "PyTorch", "TensorFlow"
        ]
        found_skills = [kw for kw in tech_keywords if re.search(r'\b' + re.escape(kw) + r'\b', text, re.IGNORECASE)]

        return {
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "skills": found_skills
        }
