import logging
from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = logging.getLogger(__name__)

# Verified Reference Knowledge Dictionary for Migrant Saathi Domain
VERIFIED_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "bocw": {
        "title": "BOCW (Building and Other Construction Workers) Welfare Board",
        "description": "Government welfare scheme for registered construction workers in Gujarat and India.",
        "eligibility": "Construction workers aged 18-60 who have worked for at least 90 days in the preceding 12 months.",
        "benefits": "Financial aid for tool kits (₹5,000-₹10,000), maternity grants (₹15,000-₹25,000), children's education scholarship, accidental disability support.",
        "documents": "Aadhaar Card, Bank Passbook, Worker Identity Card / 90-day Construction Worker Certificate, Passport photo.",
        "process": "Apply through Migrant Saathi Welfare Benefits tab or nearest BOCW Labour Welfare Office."
    },
    "pmsym": {
        "title": "PM-SYM (Pradhan Mantri Shram Yogi Maandhan) Pension Scheme",
        "description": "Voluntary and contributory pension scheme for unorganised migrant and daily-wage workers.",
        "eligibility": "Unorganised workers aged 18 to 40 years with monthly income of ₹15,000 or less. Must not be covered under EPFO/ESIC/NPS.",
        "benefits": "Guaranteed minimum monthly pension of ₹3,000 after attaining 60 years of age.",
        "documents": "Aadhaar Card, Savings Bank Account / Jan Dhan Account details with IFSC, valid mobile number.",
        "process": "Enrol at Common Services Centre (CSC) or through Migrant Saathi Welfare Portal."
    },
    "eshram": {
        "title": "e-Shram National Worker Database & UAN Card",
        "description": "National database for unorganised and migrant workers created by Ministry of Labour and Employment.",
        "eligibility": "Unorganised workers aged 16-59 years who are not tax payers or EPFO/ESIC members.",
        "benefits": "12-digit Universal Account Number (UAN) card, portable welfare benefit tracking across India, ₹2 Lakh free accidental death cover under PMSBY.",
        "documents": "Aadhaar Card, Aadhaar-linked active mobile number, Bank Account details.",
        "process": "Register online at eshram.gov.in or through Migrant Saathi portal."
    },
    "pmjay": {
        "title": "PM-JAY (Ayushman Bharat) Healthcare Scheme",
        "description": "National health protection scheme providing free secondary and tertiary healthcare hospitalization.",
        "eligibility": "Low-income daily wage and migrant worker families listed under SECC database or holding ration card.",
        "benefits": "Cashless & paperless health insurance cover up to ₹5,000,000 per family per year at empanelled public and private hospitals.",
        "documents": "Ayushman Golden Card / Ration Card, Aadhaar Card, photo ID.",
        "process": "Verify eligibility at empanelled hospital PM-JAY desk or through Migrant Saathi Welfare section."
    },
    "aaby": {
        "title": "Aam Aadmi Bima Yojana (AABY)",
        "description": "Social security life & disability insurance scheme for daily-wage landless and migrant labourers.",
        "eligibility": "Head of family or one earning member aged 18 to 59 years in unorganised worker category.",
        "benefits": "₹30,000 natural death cover, ₹75,000 accidental death/total permanent disability cover, ₹37,500 partial disability cover.",
        "documents": "Aadhaar Card, Ration Card, Nominee details, Bank account number.",
        "process": "Submit claim request via Migrant Saathi or local Nodal Agency."
    },
    "wages": {
        "title": "Gujarat Official Reference Minimum Wage Rates",
        "description": "Official reference minimum wage standards set by Gujarat Labour Department for 8-hour shift.",
        "rates": (
            "• Skilled Trade (Mason, Electrician, Painter, Carpenter, Plumber, Welder, Heavy Vehicle Driver): ₹450 - ₹580 per day.\n"
            "• Semi-Skilled Trade (Helper, Assistant, Shuttering Helper): ₹380 - ₹430 per day.\n"
            "• Unskilled Labour: ₹290 - ₹340 per day.\n"
            "• Overtime Allowance: Payable at 2x normal hourly rate beyond 8 hours of daily work."
        ),
        "remedy": "If your employer or contractor pays below these reference rates or withholds wages, file a Wage Claim in the app."
    },
    "grievances": {
        "title": "Labour Grievance & Workplace Safety Reporting Procedure",
        "description": "Official confidential dispute and hazard reporting mechanism for migrant workers.",
        "process": (
            "1. Navigate to 'Report Safety / Wage Issue' on Migrant Saathi.\n"
            "2. Fill in site location, contractor name, and hazard / wage withholding details (identity can remain confidential).\n"
            "3. Case is logged and assigned to Gujarat Labour Inspector for site dispatch.\n"
            "4. Emergency Helpline: 14434."
        )
    },
    "workplus": {
        "title": "WorkPlus Shift Console & Face Attendance",
        "description": "Automated workplace attendance logging system.",
        "details": "Allows workers to check in using GPS site geofencing and facial biometric scan to log daily shifts and calculate overtime pay earned accurately."
    },
    "skills": {
        "title": "Worker Skill Mapping & Certification",
        "description": "Skill assessment and trade certification for migrant workers.",
        "details": "Allows workers to add trades (Masonry, Painting, Carpentry, Plumbing, Electrical, Welding) to their profile to receive matching high-wage job opportunities."
    }
}


class KnowledgeService:
    """Retrieves verified database and curated knowledge relevant to user query."""

    async def retrieve_relevant_knowledge(
        self,
        db: AsyncSession,
        query: str,
        language: str = "en"
    ) -> Tuple[str, List[str], bool]:
        """
        Returns (formatted_knowledge_context, list_of_sources, knowledge_found_boolean).
        """
        q = query.lower().strip()
        matched_blocks = []
        sources = []

        # 1. Scheme Knowledge Lookup
        if any(k in q for k in ["bocw", "construction worker", "building worker", "tool kit", "maternity"]):
            info = VERIFIED_KNOWLEDGE_BASE["bocw"]
            matched_blocks.append(
                f"SCHEME: {info['title']}\n"
                f"Description: {info['description']}\n"
                f"Eligibility: {info['eligibility']}\n"
                f"Benefits: {info['benefits']}\n"
                f"Required Documents: {info['documents']}\n"
                f"Application Process: {info['process']}"
            )
            sources.append("BOCW Gujarat Welfare Board")

        if any(k in q for k in ["pm-sym", "pmsym", "pension", "60 year", "3000"]):
            info = VERIFIED_KNOWLEDGE_BASE["pmsym"]
            matched_blocks.append(
                f"SCHEME: {info['title']}\n"
                f"Description: {info['description']}\n"
                f"Eligibility: {info['eligibility']}\n"
                f"Benefits: {info['benefits']}\n"
                f"Required Documents: {info['documents']}\n"
                f"Application Process: {info['process']}"
            )
            sources.append("PM-SYM Portal")

        if any(k in q for k in ["eshram", "e-shram", "uan", "card", "2 lakh", "database"]):
            info = VERIFIED_KNOWLEDGE_BASE["eshram"]
            matched_blocks.append(
                f"SCHEME: {info['title']}\n"
                f"Description: {info['description']}\n"
                f"Eligibility: {info['eligibility']}\n"
                f"Benefits: {info['benefits']}\n"
                f"Required Documents: {info['documents']}\n"
                f"Application Process: {info['process']}"
            )
            sources.append("e-Shram National Portal")

        if any(k in q for k in ["pmjay", "pm-jay", "ayushman", "hospital", "5 lakh", "health"]):
            info = VERIFIED_KNOWLEDGE_BASE["pmjay"]
            matched_blocks.append(
                f"SCHEME: {info['title']}\n"
                f"Description: {info['description']}\n"
                f"Eligibility: {info['eligibility']}\n"
                f"Benefits: {info['benefits']}\n"
                f"Required Documents: {info['documents']}\n"
                f"Application Process: {info['process']}"
            )
            sources.append("PM-JAY National Health Authority")

        if any(k in q for k in ["aaby", "aam aadmi bima", "life insurance", "accidental death"]):
            info = VERIFIED_KNOWLEDGE_BASE["aaby"]
            matched_blocks.append(
                f"SCHEME: {info['title']}\n"
                f"Description: {info['description']}\n"
                f"Eligibility: {info['eligibility']}\n"
                f"Benefits: {info['benefits']}\n"
                f"Required Documents: {info['documents']}\n"
                f"Application Process: {info['process']}"
            )
            sources.append("Aam Aadmi Bima Yojana")

        # Generic schemes query matching all
        if any(k in q for k in ["scheme", "schemes", "welfare", "yojana", "योजना", "યોજના"]) and not matched_blocks:
            for s_key in ["bocw", "pmsym", "eshram", "pmjay"]:
                info = VERIFIED_KNOWLEDGE_BASE[s_key]
                matched_blocks.append(
                    f"SCHEME: {info['title']}: {info['benefits']} (Eligibility: {info['eligibility']})"
                )
            sources.append("Migrant Saathi Verified Welfare Schemes")

        # 2. Wage Knowledge Lookup
        if any(k in q for k in ["wage", "wages", "salary", "pay", "rate", "rates", "minimum", "earn", "पगार", "मजदूरी", "वेतन", "દરો"]):
            info = VERIFIED_KNOWLEDGE_BASE["wages"]
            matched_blocks.append(
                f"TOPIC: {info['title']}\n"
                f"Official Reference Rates:\n{info['rates']}\n"
                f"Remedy: {info['remedy']}"
            )
            sources.append("Gujarat Labour Department Reference Minimum Wages")

        # 3. Grievance / Safety / Contractor Complaint Lookup
        if any(k in q for k in ["complaint", "grievance", "not paid", "unpaid", "hazard", "unsafe", "accident", "injury", "contractor", "boss", "report", "14434"]):
            info = VERIFIED_KNOWLEDGE_BASE["grievances"]
            matched_blocks.append(
                f"TOPIC: {info['title']}\n"
                f"Description: {info['description']}\n"
                f"Procedure:\n{info['process']}"
            )
            sources.append("Migrant Saathi Labour Grievance & Inspector Redressal System")

        # 4. WorkPlus / Attendance Lookup
        if any(k in q for k in ["workplus", "attendance", "shift", "geofence", "checkin", "check-in", "face"]):
            info = VERIFIED_KNOWLEDGE_BASE["workplus"]
            matched_blocks.append(f"TOPIC: {info['title']}\nDetails: {info['details']}")
            sources.append("WorkPlus Shift Console")

        # 5. Skills Lookup
        if any(k in q for k in ["skill", "skills", "training", "trade", "mason", "painter", "electrician"]):
            info = VERIFIED_KNOWLEDGE_BASE["skills"]
            matched_blocks.append(f"TOPIC: {info['title']}\nDetails: {info['details']}")
            sources.append("Migrant Saathi Skill Mapping Service")

        # 6. Database Lookup for Welfare Schemes in DB
        try:
            from app.models.welfare import WelfareScheme
            stmt = select(WelfareScheme).where(WelfareScheme.is_active == True).limit(5)
            res = await db.execute(stmt)
            db_schemes = res.scalars().all()
            for sch in db_schemes:
                if any(k in sch.name.lower() or k in (sch.scheme_code or "").lower() for k in q.split()):
                    matched_blocks.append(
                        f"DB SCHEME: {sch.name} ({sch.scheme_code})\nBenefits: {sch.benefits_summary}\nDocuments: {sch.required_documents}"
                    )
                    sources.append(f"Database Scheme: {sch.name}")
        except Exception as e:
            logger.debug(f"DB scheme lookup skipped: {e}")

        if matched_blocks:
            context_text = "\n\n".join(matched_blocks)
            return context_text, list(set(sources)), True

        # If question is worker-related (e.g. general worker question), but no specific scheme/rule matched
        return "", [], False


knowledge_service = KnowledgeService()
