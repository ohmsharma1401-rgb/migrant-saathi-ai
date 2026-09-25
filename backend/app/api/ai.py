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
    provider: Optional[str] = "nlp_rules"


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
    from app.services.ollama_service import ollama_service
    from app.services.watsonx_service import watsonx

    text = payload.message.strip()

    # 1. Primary: Local Ollama LLM Service
    ollama_reply = await ollama_service.generate_response(text, language=payload.language or "en")
    if ollama_reply:
        return AIChatResponse(reply=ollama_reply, language=payload.language or "en", provider="ollama")

    # 2. Secondary: Watsonx Service
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
                return AIChatResponse(reply=reply, language=payload.language or "en", provider="watsonx")
        except Exception:
            pass

def synthesize_nlp_response(text: str, language: str = "en") -> str:
    lower = text.lower()

    # 1. Painting / Trade / Specific Skill Wage Query
    trade_keywords = {
        "paint": ("Painter / Coating Specialist", "₹450 - ₹500 / day", "Semi-skilled to Skilled"),
        "mason": ("Mason / Bricklayer", "₹500 - ₹550 / day", "Skilled Construction"),
        "carpenter": ("Carpenter / Shuttering Worker", "₹480 - ₹530 / day", "Skilled Woodwork"),
        "plumb": ("Plumber / Pipefitter", "₹450 - ₹500 / day", "Skilled Maintenance"),
        "electric": ("Electrician / Wireman", "₹520 - ₹580 / day", "High Skilled Industrial"),
        "driver": ("Heavy Vehicle Driver", "₹550 - ₹650 / day", "Commercial Transport"),
        "weld": ("Structural Welder", "₹500 - ₹600 / day", "Industrial Fabrication"),
    }

    for key, (trade, rate, cat) in trade_keywords.items():
        if key in lower:
            if language == "hi":
                return (
                    f"गुजरात श्रम विभाग के संदर्भ मानकों के अनुसार **{trade}** ({cat}) के लिए:\n\n"
                    f"• न्यूनतम संदर्भ दर: **{rate}** (8 घंटे की पाली)\n"
                    f"• ओवरटाइम भत्ता: 8 घंटे के बाद 2x दर से देय\n\n"
                    "यदि आपका ठेकेदार इससे कम भुगतान कर रहा है, तो आप वर्कप्लेस वेज क्लेम दर्ज कर सकते हैं।"
                )
            elif language == "gu":
                return (
                    f"ગુજરાત શ્રમ વિભાગના અધિકૃત દરો મુજબ **{trade}** ({cat}) માટે:\n\n"
                    f"• લઘુત્તમ સંદર્ભ દર: **{rate}** (8 કલાકની પાળી)\n"
                    f"• ઓવરટાઇમ ભથ્થું: 8 કલાક પછી બમણા દરે ચૂકવવાપાત્ર\n\n"
                    "જો આપને ઓછું વેતન મળતું હોય તો શ્રમ નિરીક્ષકને તુરંત જાણ કરો."
                )
            else:
                return (
                    f"As per Gujarat Labour Department reference standards for **{trade}** ({cat}):\n\n"
                    f"• Official Minimum Rate: **{rate}** (standard 8-hour shift)\n"
                    f"• Overtime Allowance: Payable at 2x rate beyond 8 hours\n\n"
                    "If your contractor or employer is paying less, you can file a Wage Discrepancy claim in the app."
                )

    # 2. General Wage / Pay / Earn / Money / Rate Query
    if any(k in lower for k in ["wage", "salary", "pay", "paid", "earn", "rate", "money", "minimum", "पगार", "वेतन", "મજૂરી"]):
        if language == "hi":
            return (
                "गुजरात में आधिकारिक न्यूनतम मजदूरी दरें:\n"
                "• कुशल कारीगर (राजमिस्त्री/इलेक्ट्रिशियन/पेंटर): ₹450 - ₹550/दिन\n"
                "• अर्ध-कुशल (सहायक/बेलदार): ₹380 - ₹420/दिन\n"
                "• अकुशल श्रमिक: ₹290 - ₹340/दिन\n\n"
                "अधिक जानकारी के लिए ऐप में 'Fair Wages' टैब देखें।"
            )
        elif language == "gu":
            return (
                "ગુજરાતમાં અધિકૃત લઘુત્તમ વેતન દરો:\n"
                "• કુશળ શ્રમિક (કડિયા/ઇલેક્ટ્રિશિયન/પેઇન્ટર): ₹450 - ₹550/દિવસ\n"
                "• અર્ધ-કુશળ (સહાયક): ₹380 - ₹420/દિવસ\n"
                "• અકુશળ શ્રમિક: ₹290 - ₹340/દિવસ\n\n"
                "વિગતો માટે એપમાં 'Fair Wages' ટેબ જુઓ."
            )
        else:
            return (
                "Official Gujarat Minimum Wage Reference Rates:\n"
                "• Skilled Trade (Mason/Electrician/Painter): ₹450 - ₹550 / day\n"
                "• Semi-Skilled (Helper/Assistant): ₹380 - ₹420 / day\n"
                "• Unskilled Labour: ₹290 - ₹340 / day\n\n"
                "Check the 'Fair Wages' section in your menu for district-wise figures."
            )

    # 3. Government Portal / Inspector / Official / Login Query
    if any(k in lower for k in ["government", "gov", "portal", "official", "inspector", "officer", "login"]):
        if language == "hi":
            return (
                "जी हां! प्रवासी साथी का आधिकारिक **Government & Field Inspector Portal** उपलब्ध है:\n\n"
                "• सरकारी अधिकारी और श्रम निरीक्षक `/login/official` के माध्यम से लॉगिन कर सकते हैं।\n"
                "• अधिकारी जिला स्तरीय मानचित्र, सुरक्षा उल्लंघन, और कार्यस्थल शिकायतों की निगरानी करते हैं।"
            )
        elif language == "gu":
            return (
                "હા! પ્રવાસી સાથીનું અધિકૃત **Government & Field Inspector Portal** ઉપલબ્ધ છે:\n\n"
                "• સરકારી અધિકારીઓ અને શ્રમ નિરીક્ષકો `/login/official` થી લોગિન કરી શકે છે.\n"
                "• અધિકારીઓ જિલ્લા કક્ષાના નકશા અને શ્રમિક ફરિયાદોની સમીક્ષા કરે છે."
            )
        else:
            return (
                "Yes! Migrant Saathi has an official **Government & Field Inspector Portal**:\n\n"
                "• Government Officials, District Inspectors, and System Admins can log in at `/login/official`.\n"
                "• Inspectors use it to monitor worker rosters, verify site safety compliance, and investigate grievances."
            )

    # 4. Workplace Check-in & WorkPlus Queries
    if any(k in lower for k in ["workplus", "attendance", "check-in", "check in", "shift", "geofence", "face"]):
        if language == "hi":
            return (
                "WorkPlus Shift Console पर आप:\n"
                "1. जीपीएस जीओफेंस से कार्यस्थल का सत्यापन कर सकते हैं\n"
                "2. चेहरे की बायोमेट्रिक पहचान (Face Scan) से उपस्थिति दर्ज कर सकते हैं\n"
                "3. दैनिक पाली और ओवरटाइम भुगतान का हिसाब देख सकते हैं"
            )
        elif language == "gu":
            return (
                "WorkPlus Shift Console પર તમે:\n"
                "1. GPS જીઓફેન્સથી સ્થળ ચકાસી શકો છો\n"
                "2. ફેસ બાયોમેટ્રિક સ્કેનથી હાજરી પૂરી શકો છો\n"
                "3. દૈનિક પાળી અને ઓવરટાઇમ રકમ જોઈ શકો છો"
            )
        else:
            return (
                "On the **WorkPlus Shift Console** (`/worker/workplus`), you can:\n"
                "1. Verify your GPS workplace geofence radius at Surat/Ahmedabad construction sites\n"
                "2. Mark biometric face recognition attendance\n"
                "3. Track your daily hours, shifts, and overtime pay earned."
            )

    # 5. Report Safety / Unsafe / Hazard Queries
    if any(k in lower for k in ["report", "unsafe", "safety", "hazard", "accident", "injury", "complaint"]):
        if language == "hi":
            return (
                "असुरक्षित कार्यस्थल या दुर्घटना की शिकायत के लिए:\n"
                "1. ऐप के 'Report Safety Issue' सेक्शन में जाएं\n"
                "2. खतरे का स्थान और प्रकार दर्ज करें (पहचान गोपनीय रखी जा सकती है)\n"
                "3. आपात स्थिति में श्रम हेल्पलाइन 14434 पर कॉल करें।"
            )
        elif language == "gu":
            return (
                "અસુરક્ષિત કાર્યસ્થળ અથવા અકસ્માતની જાણ કરવા માટે:\n"
                "1. એપના 'Report Safety Issue' વિભાગમાં જાઓ\n"
                "2. વિગત ભરીને ફરિયાદ કરો (ઓળખ ગુપ્ત રહેશે)\n"
                "3. ઇમરજન્સી હેલ્પલાઇન: 14434."
            )
        else:
            return (
                "To report workplace hazards or safety violations:\n"
                "1. Go to 'Report Safety Issue' in the left menu.\n"
                "2. Provide details & photos (your identity can remain confidential).\n"
                "3. Labour Inspectors will be dispatched to investigate.\n"
                "Emergency Helpline: 14434."
            )

    # 6. Welfare Schemes Queries
    if any(k in lower for k in ["scheme", "welfare", "pension", "bocw", "eshram", "pm-sym", "pmjay"]):
        if language == "hi":
            return (
                "प्रवासी श्रमिकों के लिए प्रमुख सरकारी कल्याणकारी योजनाएं:\n"
                "• **PM-SYM पेंशन**: 60 वर्ष के बाद ₹3,000/माह पेंशन\n"
                "• **BOCW कल्याण योजना**: टूल किट सहायता और मातृत्व लाभ\n"
                "• **PM-JAY आयुष्मान**: ₹5 लाख तक का मुफ़्त इलाज\n"
                "• **e-Shram UAN**: ₹2 लाख मुफ़्त दुर्घटना बीमा\n\n"
                "आवेदन के लिए 'Welfare Benefits' टैब पर जाएं।"
            )
        elif language == "gu":
            return (
                "પ્રવાસી શ્રમિકો માટે મુખ્ય સરકારી યોજનાઓ:\n"
                "• **PM-SYM પેન્શન**: ₹3,000/મહિને પેન્શન\n"
                "• **BOCW કલ્યાણ મંડળ**: ટૂલ કિટ અને માતૃત્વ સહાય\n"
                "• **PM-JAY આયુષ્માન**: ₹5 લાખ સુધીનું મફત સારવાર\n\n"
                "અરજી કરવા માટે 'Welfare Benefits' વિભાગ જુઓ."
            )
        else:
            return (
                "Top Social Welfare Schemes for Migrant Workers:\n"
                "• **PM-SYM Pension**: ₹3,000 / month pension post age 60\n"
                "• **BOCW Gujarat**: Tool kit assistance & maternity grants\n"
                "• **PM-JAY Ayushman**: ₹5 Lakh annual free healthcare cover\n"
                "• **e-Shram**: Portable digital identity + ₹2 Lakh insurance cover.\n\n"
                "Go to 'Welfare Benefits' to view your matching schemes."
            )

    # 7. Dynamic Smart Open-Domain Synthesizer for any other text
    clean_text = text.strip()
    if language == "hi":
        return (
            f"आपके प्रश्न **\"{clean_text}\"** के संबंध में:\n\n"
            "प्रवासी साथी प्लेटफ़ॉर्म पर आप गुजरात श्रम विभाग के अंतर्गत अपनी मजदूरी दरों का सत्यापन कर सकते हैं, "
            "कल्याणकारी योजनाओं में आवेदन कर सकते हैं, और कार्यस्थल सुरक्षा शिकायत दर्ज कर सकते हैं।\n\n"
            "किसी भी तत्काल सहायता के लिए श्रम हेल्पलाइन **14434** पर कॉल करें।"
        )
    elif language == "gu":
        return (
            f"તમારા પ્રશ્ન **\"{clean_text}\"** અંગે માહિતી:\n\n"
            "પ્રવાસી સાથી પ્લેટફોર્મ પર તમે શ્રમ વિભાગના દરો ચકાસી શકો છો, કલ્યાણકારી યોજનાઓમાં અરજી કરી શકો છો, "
            "અને તકરાર નોંધાવી શકો છો.\n\n"
            "હેલ્પલાઇન નંબર: **14434**."
        )
    else:
        return (
            f"Regarding your query: **\"{clean_text}\"**:\n\n"
            "On the Migrant Saathi platform, you can check official minimum wage compliance, "
            "apply for PM-SYM / BOCW / PM-JAY welfare schemes, log daily WorkPlus shift attendance, "
            "and file confidential safety or wage grievances.\n\n"
            "For direct assistance, call the Labour Helpline: **14434**."
        )


@router.post("/ask", response_model=AIChatResponse)
async def ask_ai(
    payload: AIChatRequest,
    current_user=Depends(get_current_user),
):
    from app.services.ollama_service import ollama_service
    from app.services.watsonx_service import watsonx

    text = payload.message.strip()

    # 1. Primary: Local Ollama LLM Service
    ollama_reply = await ollama_service.generate_response(text, language=payload.language or "en")
    if ollama_reply:
        return AIChatResponse(reply=ollama_reply, language=payload.language or "en", provider="ollama")

    # 2. Secondary: Watsonx Service
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
                return AIChatResponse(reply=reply, language=payload.language or "en", provider="watsonx")
        except Exception:
            pass

    # 3. Smart Multilingual Synthesizer Fallback
    reply = synthesize_nlp_response(text, language=payload.language or "en")
    return AIChatResponse(reply=reply, language=payload.language or "en", provider="rules")


@router.get("/status")
async def ai_status():
    from app.services.ollama_service import ollama_service
    from app.services.watsonx_service import watsonx

    st = await ollama_service.get_status()
    return {
        "ollama_available": st["available"],
        "ollama_model": st["active_model"],
        "watsonx_available": watsonx.is_available(),
        "model_id": watsonx.model_id,
        "active_provider": "ollama" if st["available"] else ("watsonx" if watsonx.is_available() else "rules"),
        "installed_models": st.get("installed_models", []),
    }
