import re
from typing import Tuple, Dict

OUT_OF_SCOPE_RESPONSES: Dict[str, str] = {
    "en": (
        "Sorry, Migrant Saathi is designed specifically for migrant worker-related questions, "
        "including employment, wages, welfare schemes, skills, workplace safety, grievances, "
        "and related government services. Please ask a question related to these areas."
    ),
    "hi": (
        "क्षमा करें, प्रवासी साथी विशेष रूप से प्रवासी श्रमिकों से संबंधित प्रश्नों के लिए बनाया गया है, "
        "जिसमें रोजगार, मजदूरी, कल्याणकारी योजनाएं, कौशल, कार्यस्थल सुरक्षा, शिकायतें और संबंधित "
        "सरकारी सेवाएं शामिल हैं। कृपया इन क्षेत्रों से संबंधित प्रश्न पूछें।"
    ),
    "gu": (
        "દિલગીર છીએ, પ્રવાસી સાથી ખાસ કરીને પ્રવાસી શ્રમિક સંબંધિત પ્રશ્નો માટે બનાવવામાં આવ્યું છે, "
        "જેમાં રોજગાર, વેતન, કલ્યાણકારી યોજનાઓ, કૌશલ્ય, કાર્યસ્થળ સુરક્ષા, ફરિયાદો અને સંબંધિત સરકારી "
        "સેવાઓનો સમાવેશ થાય છે. કૃપા કરીને આ વિષયો સંબંધિત પ્રશ્ન પૂછો."
    ),
}

# Explicit out-of-scope patterns (coding, sports, trivia, jokes, weather, recipes, etc.)
OUT_OF_SCOPE_PATTERNS = [
    r"\bpython\b", r"\bjava\b", r"\bjavascript\b", r"\bcode\b", r"\bcoding\b", r"\bprogram\b",
    r"\bprogramming\b", r"\bscript\b", r"\bfunction\b", r"\bclass\b", r"\bhtml\b", r"\bcss\b",
    r"\bcricket\b", r"\bfootball\b", r"\bmatch\b", r"\bipl\b", r"\bscore\b", r"\bworld cup\b",
    r"\bjoke\b", r"\bjokes\b", r"\blove letter\b", r"\bpoem\b", r"\bmovie\b", r"\bcinema\b",
    r"\bcapital of\b", r"\bquantum\b", r"\bphysics\b", r"\bchemistry\b", r"\bmath\b", r"\balgebra\b",
    r"\bweather\b", r"\brecipe\b", r"\bcook\b", r"\bcooking\b", r"\bdish\b", r"\brust\b", r"\bc\+\+\b",
    r"\bwho won\b", r"\btell me a story\b", r"\bsong\b", r"\blyrics\b"
]

# Core worker / migrant / labor domain keywords (including common follow-up question keywords)
IN_SCOPE_KEYWORDS = [
    # English keywords
    "worker", "workers", "migrant", "labour", "labor", "labourer", "laborer", "employee",
    "wage", "wages", "salary", "pay", "paid", "unpaid", "contractor", "employer", "boss",
    "job", "jobs", "employment", "hiring", "work", "workplace", "site", "factory",
    "scheme", "schemes", "welfare", "bocw", "pm-sym", "pmsym", "eshram", "e-shram", "pmjay",
    "pm-jay", "aaby", "nfsa", "pension", "insurance", "grant", "subsidy", "benefit", "benefits",
    "eligible", "eligibility", "documents", "required", "apply", "procedure", "process",
    "safety", "hazard", "unsafe", "accident", "injury", "grievance", "complaint", "inspect",
    "inspector", "helpline", "14434", "registration", "register", "card", "document",
    "aadhaar", "uan", "skill", "skills", "training", "mason", "painter", "carpenter", "plumber",
    "electrician", "driver", "welder", "helper", "gujarat", "surat", "ahmedabad", "rajkot",
    "workplus", "geofence", "attendance", "shift", "overtime",
    # Hindi / Gujarati transliterated or native terms
    "मजदूर", "मजदूरी", "वेतन", "पगार", "ठेकेदार", "मालिक", "योजना", "पात्र", "शिकायत", "सुरक्षा",
    "पेंशन", "बीमा", "कार्ड", "श्रम", "रोजगार", "દરો", "કોન્ટ્રાક્ટર", "યોજના",
    "ફરિયાદ", "શ્રમ", "રોજગાર", "કડિયા", "સહાય"
]


class DomainClassifier:
    """Classifies user queries into IN_SCOPE vs OUT_OF_SCOPE deterministically."""

    @staticmethod
    def classify(text: str, language: str = "en") -> Tuple[str, str]:
        """
        Returns (classification, rejection_message_if_out_of_scope).
        classification is either 'in_scope' or 'out_of_scope'.
        """
        q = text.lower().strip()
        lang = language if language in OUT_OF_SCOPE_RESPONSES else "en"

        # 1. Check explicit out-of-scope regex patterns first
        for pat in OUT_OF_SCOPE_PATTERNS:
            if re.search(pat, q):
                return "out_of_scope", OUT_OF_SCOPE_RESPONSES[lang]

        # 2. Check in-scope domain keywords or worker contextual signals
        has_in_scope_keyword = any(kw in q for kw in IN_SCOPE_KEYWORDS)

        # 3. Contextual worker sentence patterns (e.g. "I came from Bihar to Gujarat", "not paid for 2 months", "how to apply", follow-ups)
        contextual_worker_patterns = [
            r"not paid", r"haven't paid", r"didn't pay", r"pay me", r"my money", r"my salary",
            r"need (a )?job", r"find work", r"looking for work", r"came from", r"moved from",
            r"how (can|do) i (apply|register)", r"what documents", r"which schemes?",
            r"who is eligible", r"what can i do", r"how to apply", r"what benefits",
            r"how much (salary|wage|pay)", r"report", r"help me"
        ]
        has_contextual_signal = any(re.search(pat, q) for pat in contextual_worker_patterns)

        if has_in_scope_keyword or has_contextual_signal:
            return "in_scope", ""

        # 4. Default for short queries or follow-ups (3 words or fewer without explicit out-of-scope trigger)
        if len(q.split()) <= 3:
            return "in_scope", ""

        # Otherwise, query is unrelated trivia/general question -> OUT_OF_SCOPE
        return "out_of_scope", OUT_OF_SCOPE_RESPONSES[lang]


domain_classifier = DomainClassifier()
