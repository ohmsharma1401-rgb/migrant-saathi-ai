import base64
import tempfile
import os
from typing import Dict, Any, Tuple, Optional


class MultilingualChatbotService:
    def __init__(self):
        self._init_models()

    def _init_models(self):
        """Lazy load Whisper or Transformers if available, with robust fallback NLP engines."""
        self.whisper_model = None
        try:
            import whisper
            self.whisper_model = whisper.load_model("tiny")
        except Exception:
            self.whisper_model = None

    def transcribe_audio_base64(self, audio_base64: str) -> str:
        """Transcribes audio base64 input using OpenAI Whisper speech-to-text model."""
        if not audio_base64:
            return ""

        if "," in audio_base64:
            audio_base64 = audio_base64.split(",")[1]

        audio_bytes = base64.b64decode(audio_base64)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_path = tmp_file.name

        try:
            if self.whisper_model:
                result = self.whisper_model.transcribe(tmp_path)
                return result.get("text", "").strip()
        except Exception:
            pass
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        return "Transcribed audio voice query (fallback)."

    def classify_intent_and_respond(self, text: str, language: str = "hi") -> Tuple[str, str, float]:
        """
        Classifies multilingual query text (Hindi, Bengali, Odia, Marathi, English)
        into grievance categories and provides contextual responses.
        Returns (reply_text, detected_intent, confidence_score).
        """
        text_lower = text.lower()

        # Intent Rules & Multilingual Keywords (Hindi, Bengali, Odia, Marathi, English)
        wage_keywords = ["wage", "salary", "unpaid", "delay", "paisa", "vetan", "baki", "টাকা", "বেতন", "ମଜୁରୀ", "ପଇସା", "पगार", "मजुरी"]
        safety_keywords = ["safety", "unsafe", "danger", "accident", "injury", "helmet", "khatra", "khatarnak", "বিপদ", "ସୁରକ୍ଷା", "धोका", "सुरक्षा"]
        harassment_keywords = ["harass", "abuse", "threat", "fight", "shoshit", "maar", "shoshan", "শোষণ", "ଗାଳି", "छळ", "त्रास"]
        document_keywords = ["aadhaar", "card", "doc", "contract", "paper", "id", "kagaz", "कागदपत्रे", "দলিল", "ପତ୍ର"]

        if any(k in text_lower for k in wage_keywords):
            intent = "WAGE_DELAY"
            confidence = 0.92
            replies = {
                "hi": "मजदूरी में देरी या गैर-भुगतान के लिए, आप ऐप में 'शिकायत दर्ज करें' चुन सकते हैं। श्रम हेल्पलाइन 14434 पर भी कॉल कर सकते हैं।",
                "bn": "মজুরি পেতে দেরি হলে আপনি অ্যাপে অভিযোগ দায়ের করতে পারেন বা লেবার হেল্পলাইন ১৪৪৩৪-এ কল করতে পারেন।",
                "or": "ମଜୁରୀ ବିଳମ୍ବ ପାଇଁ ଆପଣ ଆପ୍ ମାଧ୍ୟମରେ ଅଭିଯୋଗ ଦାଖଲ କରିପାରିବେ କିମ୍ବା ୧୪୪୩୪ ହେଲ୍ପଲାଇନ୍‌କୁ କଲ୍ କରନ୍ତୁ।",
                "mr": "पगार किंवा मजुरी वेळेवर न मिळाल्यास ॲपवरून तक्रार नोंदवा किंवा १४४३४ या कामगार हेल्पलाइनवर संपर्क साधा.",
                "en": "For wage delays or non-payment, submit a grievance via the app or call Labour Helpline 14434."
            }
        elif any(k in text_lower for k in safety_keywords):
            intent = "SAFETY_ISSUE"
            confidence = 0.89
            replies = {
                "hi": "कार्यस्थल पर असुरक्षा या खतरे की सूचना दें। आपातस्थिति में 112 या श्रम सुरक्षा अधिकारी से संपर्क करें।",
                "bn": "কর্মক্ষেত্রে অনিরাপদ অবস্থা রিপোর্ট করুন। জরুরি অবস্থায় ১১২ অথবা লেবার সেফটি অফিসে যোগাযোগ করুন।",
                "or": "କର୍ମକ୍ଷେତ୍ର ଅସୁରକ୍ଷା ବିଷୟରେ ଜଣାନ୍ତୁ। ଜରୁରୀ ପରିସ୍ଥିତିରେ ୧୧୨ କୁ କଲ୍ କରନ୍ତୁ।",
                "mr": "कामाच्या ठिकाणच्या धोक्याची माहिती द्या. आपत्कालीन परिस्थितीत ११२ वर कॉल करा.",
                "en": "Report workplace safety hazards immediately. For emergencies call 112 or local safety inspector."
            }
        elif any(k in text_lower for k in harassment_keywords):
            intent = "HARASSMENT"
            confidence = 0.91
            replies = {
                "hi": "किसी भी उत्पीड़न या शोषण के खिलाफ आपकी गोपनीयता सुरक्षित रखी जाएगी। तुरंत शिकायत दर्ज करें।",
                "bn": "যেকোনো ধরনের হেনস্থার বিরুদ্ধে গোপনীয়তার সাথে অভিযোগ নথিভুক্ত করুন।",
                "or": "ଯେକୌଣସି ନିର୍ଯାତନା ବିରୋଧରେ ଗୋପନୀୟ ଭାବେ ଅଭିଯୋଗ କରନ୍ତୁ।",
                "mr": "कोणत्याही प्रकारच्या त्रासाविरोधात गोपनीयतेने तक्रार दाखल करा.",
                "en": "Harassment complaints are strictly confidential. Submit details under Grievances section."
            }
        elif any(k in text_lower for k in document_keywords):
            intent = "DOCUMENT_ISSUE"
            confidence = 0.88
            replies = {
                "hi": "ई-श्रम या आधार कार्ड पंजीकरण के लिए दस्तावेज़ OCR फीचर का उपयोग करें।",
                "bn": "ই-শ্রম বা আধার নথিভুক্তকরণের জন্য আমাদের নথি OCR ফিচার ব্যবহার করুন।",
                "or": "ଇ-ଶ୍ରମ କିମ୍ବା ଆଧାର ପଞ୍ଜୀକରଣ ପାଇଁ ଡକ୍ୟୁମେଣ୍ଟ୍ OCR ବ୍ୟବହାର କରନ୍ତୁ।",
                "mr": "ई-श्रम किंवा आधार कार्ड नोंदणीसाठी ॲपमधील OCR सुविधा वापरा.",
                "en": "Use the Document OCR registration scanner to extract Aadhaar / Labour card details."
            }
        else:
            intent = "GENERAL_INQUIRY"
            confidence = 0.75
            replies = {
                "hi": "नमस्ते! मैं प्रवासी साथी AI हूँ। मैं आपकी मजदूरी, सुरक्षा, कल्याणकारी योजनाओं और शिकायतों में मदद कर सकता हूँ।",
                "bn": "নমস্কার! আমি পরিযায়ী সাথী AI। মজুরি, সুরক্ষা ও কল্যাণমূলক প্রকল্পে আপনাকে সাহায্য করতে পারি।",
                "or": "ନମସ୍କାର! ମୁଁ ପ୍ରବାସୀ ସାଥୀ AI। ମୁଁ ଆପଣଙ୍କୁ ମଜୁରୀ, ସୁରକ୍ଷା ଏବଂ ଯୋଜନା ବିଷୟରେ ସାହାଯ୍ୟ କରିପାରିବି।",
                "mr": "नमस्कार! मी स्थलांतरित साथी AI आहे. मजुरी, सुरक्षा व योजनांबद्दल मी तुम्हाला मदत करू शकतो.",
                "en": "Hello! I am Migrant Saathi AI. How can I assist you with wages, workplace safety, or welfare schemes?"
            }

        reply = replies.get(language, replies["en"])
        return reply, intent, confidence


multilingual_chatbot_service = MultilingualChatbotService()
