"""
Grievance classification agent — uses IBM Granite to classify worker complaints.
"""
import json
import structlog

logger = structlog.get_logger()


class GrievanceAgent:
    def classify_grievance(self, description: str) -> dict:
        from app.services.watsonx_service import watsonx

        if not watsonx.is_available():
            logger.warning("grievance_agent_unavailable", reason="watsonx not configured")
            return self._fallback()

        prompt = (
            "Classify this worker complaint and return ONLY valid JSON.\n"
            "JSON keys:\n"
            "  category: one of wage, safety, harassment, conditions, other\n"
            "  severity: one of low, medium, high, critical\n"
            "  extracted_issues: list of short strings describing each issue\n"
            "  location_mentioned: string or null\n\n"
            "Use ONLY the information provided. Do not make legal conclusions.\n\n"
            f"Text: {description}\n\n"
            "JSON:"
        )

        try:
            raw = watsonx.generate(prompt)
            if not raw:
                return self._fallback()

            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON found")

            data = json.loads(raw[start:end])
            # Normalise to expected values
            valid_categories = {"wage", "safety", "harassment", "conditions", "other"}
            valid_severities = {"low", "medium", "high", "critical"}

            return {
                "category": data.get("category", "other") if data.get("category") in valid_categories else "other",
                "severity": data.get("severity", "medium") if data.get("severity") in valid_severities else "medium",
                "extracted_issues": data.get("extracted_issues") or [],
                "location_mentioned": data.get("location_mentioned"),
            }
        except Exception as e:
            logger.warning("grievance_agent_parse_failed", error=str(e))
            return self._fallback()

    def _fallback(self) -> dict:
        return {
            "category": "other",
            "severity": "medium",
            "extracted_issues": [],
            "location_mentioned": None,
        }


grievance_agent = GrievanceAgent()
