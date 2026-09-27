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

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        top_p: float = 0.9,
        repeat_penalty: float = 1.1,
        keep_alive: str = "30m",
        timeout: float = 60.0
    ) -> Optional[str]:
        """
        Sends structured message history to Ollama POST /api/chat.
        Returns message.content or None if Ollama is unreachable.
        """
        status = await self.get_status()
        if not status["available"]:
            logger.warning("Ollama server is unavailable")
            return None

        target_url = status["base_url"]
        target_model = model or status["active_model"]

        payload = {
            "model": target_model,
            "messages": messages,
            "stream": False,
            "keep_alive": keep_alive,
            "options": {
                "temperature": temperature,
                "top_p": top_p,
                "repeat_penalty": repeat_penalty
            }
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(f"{target_url}/api/chat", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data.get("message", {}).get("content", "").strip()
                    if content:
                        return content
                else:
                    logger.warning(f"Ollama returned HTTP {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Ollama chat_completion request failed: {e}")

        # Fallback to /api/generate if /api/chat was unavailable for older versions
        try:
            prompt_parts = []
            for msg in messages:
                role = msg.get("role", "user").capitalize()
                prompt_parts.append(f"{role}: {msg.get('content', '')}")
            full_prompt = "\n\n".join(prompt_parts) + "\n\nAssistant:"

            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(
                    f"{target_url}/api/generate",
                    json={
                        "model": target_model,
                        "prompt": full_prompt,
                        "stream": False
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

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        language: str = "en",
        model: Optional[str] = None
    ) -> Optional[str]:
        """Convenience method for single prompt query."""
        sys_msg = system_prompt or (
            "You are Migrant Saathi AI, an empathetic, highly knowledgeable AI assistant dedicated to helping "
            "migrant workers and government labor officials in India. You provide clear, accurate guidance on "
            "labor rights, minimum wages, safety regulations, e-Shram, BOCW schemes, and grievance reporting. "
            f"Always reply clearly and accurately in language '{language}'."
        )

        messages = [
            {"role": "system", "content": sys_msg},
            {"role": "user", "content": prompt}
        ]

        return await self.chat_completion(messages, model=model)


ollama_service = OllamaService()
