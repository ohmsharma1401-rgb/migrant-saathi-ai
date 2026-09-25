import os
import logging
import httpx
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.default_model = os.getenv("OLLAMA_MODEL", "llama3")

    async def get_status(self) -> Dict[str, Any]:
        """Checks if local Ollama server is running and returns installed models."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models_data = res.json().get("models", [])
                    installed_models = [m.get("name") for m in models_data]
                    
                    active = self.default_model
                    if installed_models and active not in installed_models:
                        active = installed_models[0]
                        
                    return {
                        "available": True,
                        "status": "online",
                        "base_url": self.base_url,
                        "active_model": active,
                        "installed_models": installed_models,
                        "message": f"Connected to local Ollama NLP LLM ({active})"
                    }
        except Exception as e:
            logger.debug(f"Ollama connection check: {e}")

        return {
            "available": False,
            "status": "offline",
            "base_url": self.base_url,
            "active_model": self.default_model,
            "installed_models": [],
            "message": "Ollama server offline or not running at http://localhost:11434. Falling back to high-precision rule NLP."
        }

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        language: str = "en",
        model: Optional[str] = None
    ) -> Optional[str]:
        """Queries local Ollama chat API for AI assistant response."""
        status = await self.get_status()
        if not status["available"]:
            return None

        target_model = model or status["active_model"]
        
        sys_msg = system_prompt or (
            "You are Migrant Saathi AI, an empathetic, highly knowledgeable AI assistant dedicated to helping "
            "migrant workers and government labor officials in India. You provide clear, accurate guidance on "
            "labor rights, minimum wages, safety regulations, e-Shram, BOCW schemes, and grievance reporting. "
            f"Always reply clearly and accurately in language '{language}'."
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": target_model,
                        "messages": [
                            {"role": "system", "content": sys_msg},
                            {"role": "user", "content": prompt}
                        ],
                        "stream": False,
                        "options": {
                            "temperature": 0.3,
                            "top_p": 0.9
                        }
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("message", {}).get("content", "").strip()
                    if content:
                        return content
        except Exception as e:
            logger.warning(f"Ollama generate request failed: {e}")
        
        return None


ollama_service = OllamaService()
