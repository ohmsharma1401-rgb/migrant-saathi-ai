"""
Dashboard insight service — generates AI-assisted insights from aggregated statistics.
"""
import json
import structlog
from typing import List

from app.schemas.dashboard import AIInsight

logger = structlog.get_logger()


class DashboardInsightService:
    def generate_insights(self, stats: dict) -> List[AIInsight]:
        from app.services.watsonx_service import watsonx

        if not watsonx.is_available():
            return self._fallback_insights(stats)

        prompt = (
            "You are an assistant helping a government labour officer understand migrant worker data.\n"
            "Based on the following aggregated statistics, generate 4-5 plain-English insights.\n"
            "Clearly distinguish between observed data and potential trends.\n"
            "Do not make unsupported predictions. Do not include any PII.\n"
            "Return a JSON array. Each element: {\"text\": \"...\", \"insight_type\": \"observed|trend|recommendation\", \"confidence\": \"high|medium|low\"}\n\n"
            f"Stats: {json.dumps(stats)}\n\n"
            "JSON:"
        )

        try:
            raw = watsonx.generate(prompt)
            if not raw:
                return self._fallback_insights(stats)

            start = raw.find("[")
            end = raw.rfind("]") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON array found")

            data = json.loads(raw[start:end])
            return [
                AIInsight(
                    text=item.get("text", ""),
                    insight_type=item.get("insight_type", "observed"),
                    confidence=item.get("confidence", "medium"),
                )
                for item in data
                if item.get("text")
            ]
        except Exception as e:
            logger.warning("dashboard_insight_parse_failed", error=str(e))
            return self._fallback_insights(stats)

    def _fallback_insights(self, stats: dict) -> List[AIInsight]:
        insights = []
        total_workers = stats.get("total_workers", 0)
        total_grievances = stats.get("total_grievances", 0)
        open_grievances = stats.get("open_grievances", 0)

        insights.append(
            AIInsight(
                text=f"There are currently {total_workers} registered migrant workers in the system.",
                insight_type="observed",
                confidence="high",
            )
        )
        if total_grievances > 0:
            insights.append(
                AIInsight(
                    text=(
                        f"{open_grievances} of {total_grievances} grievances are currently open "
                        f"and awaiting action."
                    ),
                    insight_type="observed",
                    confidence="high",
                )
            )
        return insights


dashboard_insight_service = DashboardInsightService()
