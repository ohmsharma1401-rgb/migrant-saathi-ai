"""
IBM watsonx.ai / Granite integration service.
All LLM calls go through this module. Never call watsonx directly from routers.
"""
import time
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = structlog.get_logger()


class WatsonxService:
    def __init__(self):
        self._client = None
        self.model_id = settings.WATSONX_MODEL_ID
        self.project_id = settings.WATSONX_PROJECT_ID

    def _get_client(self):
        if not settings.WATSONX_API_KEY or not settings.WATSONX_PROJECT_ID:
            return None
        if self._client is None:
            try:
                from ibm_watsonx_ai.foundation_models import ModelInference
                from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
                from ibm_watsonx_ai import Credentials

                credentials = Credentials(
                    url=settings.WATSONX_URL,
                    api_key=settings.WATSONX_API_KEY,
                )
                self._client = ModelInference(
                    model_id=self.model_id,
                    credentials=credentials,
                    project_id=self.project_id,
                    params={
                        GenParams.MAX_NEW_TOKENS: 512,
                        GenParams.TEMPERATURE: 0.1,
                        GenParams.REPETITION_PENALTY: 1.1,
                    },
                )
            except Exception as e:
                logger.error("watsonx_init_failed", error=str(e))
                return None
        return self._client

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def generate(self, prompt: str, max_tokens: int = 512) -> str:
        """Generate text from IBM Granite. Returns empty string if unavailable."""
        client = self._get_client()
        if client is None:
            logger.warning("watsonx_unavailable", reason="No credentials or client init failed")
            return ""
        start = time.time()
        try:
            response = client.generate_text(prompt=prompt)
            duration_ms = int((time.time() - start) * 1000)
            logger.info("watsonx_call", duration_ms=duration_ms, model=self.model_id)
            return response.strip()
        except Exception as e:
            logger.error("watsonx_generate_failed", error=str(e))
            raise

    def is_available(self) -> bool:
        return bool(settings.WATSONX_API_KEY and settings.WATSONX_PROJECT_ID)


watsonx = WatsonxService()
