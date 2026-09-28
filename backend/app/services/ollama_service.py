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
        self.default_model = os.getenv("OLLAMA_MODEL", "")

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
        """Checks if local Ollama server is running and returns installed models, preferring fast optimal models."""
        base_url, installed_models = await self._get_working_base_url_and_models()
        if base_url:
            # Model preference order for fast, high-quality CPU inference
            preferred_order = ["llama3.2:latest", "llama3.2", "qwen2.5:7b", "llama3:latest", "llama3"]
            active = None

            # 1. Respect explicit env var override if set
            env_model = os.getenv("OLLAMA_MODEL", self.default_model).strip()
            if env_model:
                matched_env = [m for m in installed_models if env_model == m or env_model in m or m.startswith(env_model)]
                if matched_env:
                    active = matched_env[0]
                else:
                    active = env_model

            # 2. Pick best available model from installed models
            if not active:
                for pref in preferred_order:
                    for m in installed_models:
                        if m == pref or m.startswith(pref) or pref in m:
                            active = m
                            break
                    if active:
                        break

            # 3. Fallback to first installed or default
            if not active:
                active = installed_models[0] if installed_models else "llama3.2:latest"

            return {
                "available": True,
                "status": "online",
                "base_url": base_url,
                "active_model": active,
                "installed_models": installed_models,
                "message": f"Connected to local Ollama LLM server ({active})"
            }

        fallback_model = self.default_model or "llama3.2:latest"
        return {
            "available": False,
            "status": "offline",
            "base_url": self.base_urls[0],
            "active_model": fallback_model,
            "installed_models": [],
            "message": "Ollama server offline or not running at http://localhost:11434."
        }

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.35,
        top_p: float = 0.9,
        repeat_penalty: float = 1.15,
        num_predict: int = 450,
        keep_alive: str = "60m",
        timeout: float = 90.0
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
                "repeat_penalty": repeat_penalty,
                "num_predict": num_predict
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
                    has_message = isinstance(data, dict) and "message" in data
                    msg_obj = data.get("message", {}) if isinstance(data, dict) else {}
                    content = msg_obj.get("content", "").strip() if isinstance(msg_obj, dict) else ""

                    logger.info(f"[AskSaathi/Ollama] Response keys: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                    logger.info(f"[AskSaathi/Ollama] message exists: {has_message}, role: {msg_obj.get('role') if isinstance(msg_obj, dict) else None}")
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

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        language: str = "en",
        model: Optional[str] = None
    ) -> Optional[str]:
        """Convenience method for single prompt query."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return await self.chat_completion(messages, model=model)


ollama_service = OllamaService()
