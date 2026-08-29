"""
Skill extraction agent — uses IBM Granite to parse natural language into structured skill data.
"""
import json
import structlog

from app.schemas.worker import NLSkillExtractResponse

logger = structlog.get_logger()


class SkillAgent:
    async def extract_skills_from_text(self, text: str) -> NLSkillExtractResponse:
        from app.services.watsonx_service import watsonx

        if not watsonx.is_available():
            logger.warning("skill_agent_unavailable", reason="watsonx not configured")
            return NLSkillExtractResponse(
                note="AI extraction unavailable. Please enter skills manually."
            )

        prompt = (
            "Extract the following from the text below and return ONLY valid JSON.\n"
            "JSON keys: primary_occupation (string or null), skills (list of strings), "
            "origin_state (string or null), current_location (string or null), "
            "experience_years (integer or null).\n"
            "Do not add explanation outside the JSON.\n\n"
            f"Text: {text}\n\n"
            "JSON:"
        )

        try:
            raw = watsonx.generate(prompt)
            if not raw:
                return NLSkillExtractResponse(note="Empty response from AI model.")

            # Attempt to isolate JSON in the response
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON object found in response")

            data = json.loads(raw[start:end])
            return NLSkillExtractResponse(
                extracted_occupation=data.get("primary_occupation"),
                extracted_skills=data.get("skills") or [],
                origin_state=data.get("origin_state"),
                current_location=data.get("current_location"),
                experience_years=data.get("experience_years"),
            )
        except Exception as e:
            logger.warning("skill_agent_parse_failed", error=str(e))
            return NLSkillExtractResponse(
                note="Could not parse AI response. Please enter skills manually."
            )


skill_agent = SkillAgent()
