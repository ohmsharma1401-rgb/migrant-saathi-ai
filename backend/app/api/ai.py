from fastapi import APIRouter, Depends

from pydantic import BaseModel
from typing import Optional

from app.core.dependencies import get_current_user
from app.schemas.worker import NLSkillExtractRequest, NLSkillExtractResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AIChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"


class AIChatResponse(BaseModel):
    reply: str
    language: str


@router.post("/extract-skills", response_model=NLSkillExtractResponse)
async def extract_skills(
    payload: NLSkillExtractRequest,
    current_user=Depends(get_current_user),
):
    from app.services.skill_agent import skill_agent

    return await skill_agent.extract_skills_from_text(payload.text)


@router.post("/ask", response_model=AIChatResponse)
async def ask_ai(
    payload: AIChatRequest,
    current_user=Depends(get_current_user),
):
    from app.services.watsonx_service import watsonx

    text = payload.message.strip()
    if watsonx.is_available():
        prompt = (
            "You are Migrant Saathi AI, an assistant helping migrant workers in India.\n"
            f"Answer the worker's query clearly and concisely in language code '{payload.language}'.\n"
            "Use cautious language ('potentially eligible', 'needs verification', 'reference rates').\n"
            "Do not make legal conclusions.\n\n"
            f"Worker Question: {text}\n\n"
            "Answer:"
        )
        try:
            reply = watsonx.generate(prompt)
            if reply:
                return AIChatResponse(reply=reply, language=payload.language or "en")
        except Exception:
            pass

    lower = text.lower()
    if any(k in lower for k in ["wage", "salary", "minimum"]):
        reply = (
            "The minimum daily wage for a Mason (Skilled) in Gujarat is approximately ₹500/day "
            "as per reference data. For Semi-skilled workers it is around ₹380/day and Unskilled workers ₹290/day.\n\n"
            "⚠ Reference figures only. Verify with the Gujarat Labour Department."
        )
    elif any(k in lower for k in ["report", "unsafe", "safety", "hazard"]):
        reply = (
            "To report an unsafe workplace:\n"
            "1. Go to the 'Report Safety Issue' section in this app\n"
            "2. Select the issue type (Safety, Wage, etc.)\n"
            "3. Describe the hazard and submit\n\n"
            "For immediate danger, call the Labour Helpline: 14434 or Police: 100."
        )
    elif any(k in lower for k in ["pm-sym", "pension", "document"]):
        reply = (
            "For PM-SYM Pension, you will need:\n"
            "• Aadhaar Card\n"
            "• Savings Bank Account passbook\n"
            "• Mobile number linked to Aadhaar\n"
            "• Monthly wage proof (below ₹15,000/month)"
        )
    elif any(k in lower for k in ["unpaid", "not paid", "delay"]):
        reply = (
            "If your employer has not paid your wages:\n"
            "1. Submit a complaint through this app ('Report Safety Issue' -> Wage Issue).\n"
            "2. Contact the local Labour Commissioner office.\n"
            "3. Call Labour Helpline: 14434."
        )
    else:
        reply = (
            "I am here to help you with information about welfare schemes, worker rights, "
            "wage reference rates, and filing grievances. Please ask any specific question."
        )

    return AIChatResponse(reply=reply, language=payload.language or "en")


@router.get("/status")
async def ai_status():
    from app.services.watsonx_service import watsonx

    return {
        "watsonx_available": watsonx.is_available(),
        "model_id": watsonx.model_id,
    }
