import os
import logging
import httpx
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self):
        self.base_urls = [
            os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
            "http://localhost:11434",
        ]
        self.default_model = os.getenv("OLLAMA_MODEL", "llama3")

    async def _get_working_base_url_and_models(self) -> Tuple[Optional[str], List[str]]:
        """Finds active Ollama server URL and installed model list."""
        for url in self.base_urls:
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    res = await client.get(f"{url}/api/tags")
                    if res.status_code == 200:
                        models_data = res.json().get("models", [])
                        installed = [m.get("name") for m in models_data if m.get("name")]
                        return url, installed
            except Exception:
                continue
        return None, []

    async def get_status(self) -> Dict[str, Any]:
        """Checks if local Ollama server is running and returns installed models."""
        base_url, installed_models = await self._get_working_base_url_and_models()
        if base_url:
            active = self.default_model
            matched = [m for m in installed_models if active in m or m.startswith(active)]
            if matched:
                active = matched[0]
            elif installed_models:
                active = installed_models[0]

            return {
                "available": True,
                "status": "online",
                "base_url": base_url,
                "active_model": active,
                "installed_models": installed_models,
                "message": f"Connected to local Ollama NLP LLM ({active})"
            }

        return {
            "available": False,
            "status": "offline",
            "base_url": self.base_urls[0],
            "active_model": self.default_model,
            "installed_models": [],
            "message": "Ollama server offline or not running at http://127.0.0.1:11434."
        }

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        language: str = "en",
        model: Optional[str] = None
    ) -> Optional[str]:
        """Queries local Ollama chat/generate API for AI response with 60s timeout for cold start."""
        status = await self.get_status()
        if not status["available"]:
            return None

        target_url = status["base_url"]
        target_model = model or status["active_model"]

        sys_msg = system_prompt or (
            "You are Migrant Saathi AI, an empathetic, highly knowledgeable AI assistant dedicated to helping "
            "migrant workers and government labor officials in India. You provide clear, accurate guidance on "
            "labor rights, minimum wages, safety regulations, e-Shram, BOCW schemes, and grievance reporting. "
            f"Always reply clearly and accurately in language '{language}'."
        )

        # 1. Try /api/chat with 60s timeout
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"{target_url}/api/chat",
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
            logger.warning(f"Ollama chat request failed: {e}")

        # 2. Fallback: /api/generate
        try:
            full_prompt = f"{sys_msg}\n\nUser Question: {prompt}\nAnswer:"
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"{target_url}/api/generate",
                    json={
                        "model": target_model,
                        "prompt": full_prompt,
                        "stream": False,
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("response", "").strip()
                    if content:
                        return content
        except Exception as e:
            logger.warning(f"Ollama generate fallback failed: {e}")

        return None


ollama_service = OllamaService()
