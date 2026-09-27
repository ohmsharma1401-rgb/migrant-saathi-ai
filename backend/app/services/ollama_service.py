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
                "message": f"Connected to local Ollama LLM server ({active})"
            }

        return {
            "available": False,
            "status": "offline",
            "base_url": self.base_urls[0],
            "active_model": self.default_model,
            "installed_models": [],
            "message": "Ollama server offline or not running at http://localhost:11434."
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
        Queries Ollama POST http://localhost:11434/api/chat.
        Correctly parses result["message"]["content"] and validates length.
        """
        status = await self.get_status()
        if not status["available"]:
            logger.warning("[AskSaathi/Ollama] Server is unavailable at http://localhost:11434")
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

        user_q = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "N/A")
        logger.info(f"[AskSaathi/Ollama] Sending request to {target_url}/api/chat for model '{target_model}'")
        logger.info(f"[AskSaathi/Ollama] User Question: {user_q}")

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(f"{target_url}/api/chat", json=payload)
                logger.info(f"[AskSaathi/Ollama] HTTP Status: {res.status_code}")

                if res.status_code == 200:
                    data = res.json()
                    has_message = "message" in data
                    msg_obj = data.get("message", {})
                    content = msg_obj.get("content", "").strip()

                    logger.info(f"[AskSaathi/Ollama] Response keys: {list(data.keys())}")
                    logger.info(f"[AskSaathi/Ollama] message exists: {has_message}, role: {msg_obj.get('role')}")
                    logger.info(f"[AskSaathi/Ollama] Answer content length: {len(content)}")

                    if content:
                        return content
                    else:
                        logger.warning("[AskSaathi/Ollama] Empty content returned in result['message']['content']")
                else:
                    logger.error(f"[AskSaathi/Ollama] Failed with HTTP {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"[AskSaathi/Ollama] Exception during chat_completion: {e}", exc_info=True)

        return None


ollama_service = OllamaService()
