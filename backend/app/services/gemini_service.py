import json
import logging
import os
from typing import Any, Type
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Initialized Gemini client with API key.")
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI client: {e}")

    def is_available(self) -> bool:
        return self.client is not None

    async def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config={
                        "system_instruction": system_instruction,
                        "temperature": 0.2
                    }
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.error(f"Gemini generation error: {e}. Falling back to deterministic agent.")
        return ""

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[BaseModel],
        system_instruction: str = ""
    ) -> BaseModel | dict | None:
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config={
                        "system_instruction": system_instruction,
                        "response_mime_type": "application/json",
                        "response_schema": response_schema,
                        "temperature": 0.1
                    }
                )
                if response and response.text:
                    return response_schema.model_validate_json(response.text)
            except Exception as e:
                logger.warning(f"Structured Gemini call failed: {e}. Using deterministic agent fallback.")
        return None

gemini_service = GeminiService()
