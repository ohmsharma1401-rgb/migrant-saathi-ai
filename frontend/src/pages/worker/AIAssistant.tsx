import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Loader2, Mic, Sparkles } from 'lucide-react'
import api from '@/services/api'
import { useLanguageStore } from '@/store/languageStore'
import { useTranslation } from '@/utils/translations'
import LanguageSelector from '@/components/LanguageSelector'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// ─── Multilingual Pre-loaded & Demo Content ──────────────────────────────────
const MULTI_SUGGESTED = {
  en: [
    'What welfare schemes am I eligible for?',
    'What is the minimum wage for a mason in Gujarat?',
    'How do I report an unsafe workplace?',
    'What documents do I need to apply for PM-SYM?',
    "My employer hasn't paid me for 2 months. What should I do?",
  ],
  hi: [
    'मैं किन कल्याणकारी योजनाओं के लिए पात्र हूं?',
    'गुजरात में राजमिस्त्री का न्यूनतम वेतन क्या है?',
    'असुरक्षित कार्यस्थल की रिपोर्ट कैसे दर्ज करें?',
    'पीएम-एसवाईएम पेंशन के लिए कौन से दस्तावेज चाहिए?',
    'मेरे नियोक्ता ने 2 महीने से वेतन नहीं दिया है। मुझे क्या करना चाहिए?',
  ],
  gu: [
    'હું કઈ કલ્યાણકારી યોજનાઓ માટે પાત્ર છું?',
    'ગુજરાતમાં કડિયાનું લઘુત્તમ વેતન કેટલું છે?',
    'અસુરક્ષિત કાર્યસ્થળની ફરિયાદ કેવી રીતે નોંધાવવી?',
    'પીએમ-એસવાયએમ પેન્શન માટે કયા દસ્તાવેજો જોઈએ?',
    'મારા માલિકે 2 મહિનાથી પગાર આપ્યો નથી. મારે શું કરવું?',
  ],
}

const MULTI_DEMO_RESPONSES = {
  en: {
    default:
      "I can help you with information about welfare schemes, your rights as a worker, wage regulations, and how to file grievances. Please ask me a specific question and I'll do my best to assist you.\n\n⚠ I provide general information only. For legal matters, please consult official channels.",
    wage:
      'The minimum daily wage for a Mason (Skilled) in Gujarat is approximately ₹500/day as per the latest reference data. For Semi-skilled workers it is around ₹380/day and Unskilled workers ₹290/day.\n\n⚠ These are reference figures. Verify with the Gujarat Labour Department for current official rates.',
    report:
      'To report an unsafe workplace:\n1. Go to the "Report Safety Issue" section in this app\n2. Select "Workplace Safety" as the issue type\n3. Describe the hazard in detail\n4. Submit — you\'ll receive a Complaint ID\n\nFor immediate danger, call the Labour Helpline: 14434 or Police: 100.',
    pm_sym:
      'For PM-SYM Pension, you will need:\n• Aadhaar Card\n• Savings Bank Account passbook\n• Mobile number linked to Aadhaar\n• Income/wage proof (monthly wage below ₹15,000)\n\nVisit your nearest CSC (Common Service Centre) or apply via the PM-SYM portal.',
    unpaid:
      'If your employer has not paid your wages:\n1. First, make a written request to your employer.\n2. File a complaint through this app ("Report Safety Issue" → Wage Issue).\n3. Contact your nearest Labour Commissioner office.\n4. You can also call the Labour Helpline: 14434.\n\n⚠ Under the Payment of Wages Act, wages must be paid by the 7th (or 10th) of the following month.',
  },
  hi: {
    default:
      'मैं आपको कल्याणकारी योजनाओं, श्रमिक अधिकारों, मजदूरी नियमों और शिकायतों के बारे में सहायता कर सकता हूं। कृपया अपना प्रश्न पूछें।\n\n⚠ यह सामान्य जानकारी है। कानूनी मामलों के लिए आधिकारिक श्रम विभाग से संपर्क करें।',
    wage:
      'गुजरात में कुशल राजमिस्त्री (Mason) का न्यूनतम दैनिक वेतन लगभग ₹500/दिन है। अर्ध-कुशल श्रमिकों के लिए ₹380/दिन और अकुशल श्रमिकों के लिए ₹290/दिन है।\n\n⚠ श्रम विभाग द्वारा वर्तमान आधिकारिक दरों की पुष्टि करें।',
    report:
      'असुरक्षित कार्यस्थल की रिपोर्ट दर्ज करने के लिए:\n1. इस ऐप के "सुरक्षा शिकायत दर्ज करें" अनुभाग में जाएं\n2. "कार्यस्थल सुरक्षा" चुनें\n3. विवरण दर्ज करें और सबमिट करें।\n\nआपात स्थिति में श्रम हेल्पलाइन 14434 पर कॉल करें।',
    pm_sym:
      'पीएम-एसवाईएम पेंशन योजना के लिए आवश्यक दस्तावेज:\n• आधार कार्ड\n• बचत बैंक खाता पासबुक\n• आधार से लिंक मोबाइल नंबर\n• मासिक आय ₹15,000 से कम का प्रमाण।',
    unpaid:
      'यदि आपके नियोक्ता ने मजदूरी का भुगतान नहीं किया है:\n1. इस ऐप के माध्यम से वेतन शिकायत दर्ज करें।\n2. निकटतम श्रम आयुक्त कार्यालय से संपर्क करें।\n3. श्रम हेल्पलाइन 14434 पर कॉल करें।',
  },
  gu: {
    default:
      'હું તમને કલ્યાણકારી યોજનાઓ, શ્રમિક અધિકારો, વેતન નિયમો અને ફરિયાદો વિશે માહિતી આપવામાં મદદ કરી શકું છું. કૃપા કરીને તમારો પ્રશ્ન પૂછો.\n\n⚠ આ સામાન્ય માહિતી છે. કાનૂની બાબતો માટે અધિકૃત શ્રમ વિભાગનો સંપર્ક કરો.',
    wage:
      'ગુજરાતમાં કુશળ કડિયા (Mason) માટે લઘુત્તમ દૈનિક વેતન આશરે ₹500/દિવસ છે. અર્ધ-કુશળ શ્રમિકો માટે ₹380/દિવસ અને અકુશળ શ્રમિકો માટે ₹290/દિવસ છે.\n\n⚠ વર્તમાન અધિકૃત દરો માટે શ્રમ વિભાગની ચકાસણી કરો.',
    report:
      'અસુરક્ષિત કાર્યસ્થળની ફરિયાદ નોંધાવવા માટે:\n1. આ એપ્લિકેશનમાં "સુરક્ષા ફરિયાદ નોંધાવો" વિભાગમાં જાઓ\n2. વિગતો ભરો અને સબમિટ કરો.\n\nઇમરજન્સી હેલ્પલાઇન: 14434.',
    pm_sym:
      'પીએમ-એસવાયએમ પેન્શન માટે જરૂરી દસ્તાવેજો:\n• આધાર કાર્ડ\n• બેંક ખાતા પાસબુક\n• આધાર સાથે લિંક થયેલ મોબાઇલ નંબર\n• આવકનો પુરાવો (માસિક આવક ₹15,000 થી ઓછી).',
    unpaid:
      'જો તમારા માલિકે પગાર આપ્યો નથી:\n1. આ એપ્લિકેશન દ્વારા પગાર ફરિયાદ નોંધાવો.\n2. નજીકની શ્રમ કમિશનર કચેરીનો સંપર્ક કરો.\n3. શ્રમ હેલ્પલાઇન 14434 પર કોલ કરો.',
  },
}

function getDemoResponse(text: string, lang: 'en' | 'hi' | 'gu'): string {
  const lower = text.toLowerCase()
  const responses = MULTI_DEMO_RESPONSES[lang] || MULTI_DEMO_RESPONSES.en
  if (lower.includes('wage') || lower.includes('salary') || lower.includes('minimum') || lower.includes('वेतन') || lower.includes('વેતન')) return responses.wage
  if (lower.includes('report') || lower.includes('unsafe') || lower.includes('safety') || lower.includes('सुरक्षा') || lower.includes('ફરિયાદ')) return responses.report
  if (lower.includes('pm-sym') || lower.includes('document') || lower.includes('pension') || lower.includes('दस्तावेज') || lower.includes('દસ્તાવેજ')) return responses.pm_sym
  if (lower.includes("haven't paid") || lower.includes('not paid') || lower.includes('unpaid') || lower.includes('2 month') || lower.includes('भुगतान') || lower.includes('પગાર')) return responses.unpaid
  return responses.default
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 mt-0.5">
          <Bot className="h-4 w-4 text-teal-700" />
        </div>
      )}
      <div className={`max-w-[82%] flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-teal-600 text-white rounded-tr-sm shadow-xs'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-xs'
          }`}
        >
          {msg.content}
        </div>
        {!isUser && (
          <span className="text-[10px] text-slate-400 px-1 font-medium">IBM Granite AI</span>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 mt-0.5">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  )
}

export default function AIAssistant() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const currentLang = (language || 'en') as 'en' | 'hi' | 'gu'

  const getInitialMessages = (lang: 'en' | 'hi' | 'gu'): Message[] => [
    {
      id: '1',
      role: 'user',
      content: MULTI_SUGGESTED[lang]?.[0] || MULTI_SUGGESTED.en[0],
    },
    {
      id: '2',
      role: 'assistant',
      content:
        lang === 'hi'
          ? 'आपकी प्रोफाइल के आधार पर, मुझे आपके लिए योग्य 3 कल्याणकारी योजनाएं मिली हैं:\n\n(1) निर्माण श्रमिक कल्याण कोष — पात्र\n(2) पीएम-एसवाईएम पेंशन योजना — सत्यापन आवश्यक\n(3) आम आदमी बीमा योजना — पात्र\n\nक्या आप इनमें से किसी का विवरण चाहते हैं?'
          : lang === 'gu'
          ? 'તમારી પ્રોફાઇલના આધારે, મને તમારા માટે યોગ્ય 3 કલ્યાણકારી યોજનાઓ મળી છે:\n\n(1) બાંધકામ શ્રમિક કલ્યાણ ભંડોળ — પાત્ર\n(2) પીએમ-એસવાયએમ પેન્શન યોજના — ચકાસણી જરૂરી\n(3) આમ આદમી વીમા યોજના — પાત્ર\n\nશું તમે આમાંથી કોઇની વિગતો ઇચ્છો છો?'
          : 'Based on your profile as a Mason in Ahmedabad (Construction sector), I found 3 potentially relevant schemes:\n\n(1) Construction Workers Welfare Fund — Potentially Eligible\n(2) PM-SYM Pension — Needs Verification\n(3) AABY Insurance — Potentially Eligible.\n\nWould you like more details on any of these?',
    },
  ]

  const [messages, setMessages] = useState<Message[]>(getInitialMessages(currentLang))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages(getInitialMessages(currentLang))
  }, [currentLang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      await api.post('/ai/ask', { message: trimmed, language: currentLang })
    } catch {
      // fallback
    }

    await new Promise((r) => setTimeout(r, 1200))

    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getDemoResponse(trimmed, currentLang),
    }
    setMessages((m) => [...m, reply])
    setLoading(false)
    inputRef.current?.focus()
  }

  const suggestedQuestions = MULTI_SUGGESTED[currentLang] || MULTI_SUGGESTED.en

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col bg-slate-50/50 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">{t('nav_ai')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentLang === 'hi'
                ? 'अपने अधिकारों, कल्याणकारी योजनाओं या कार्यस्थल के मुद्दों के बारे में पूछें'
                : currentLang === 'gu'
                ? 'તમારા અધિકારો, કલ્યાણકારી યોજનાઓ અથવા સમસ્યાઓ વિશે પૂછો'
                : 'Ask me anything about your rights, welfare schemes, or workplace issues'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full">
            <Sparkles className="h-3 w-3" />
            IBM Granite
          </span>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3.5 px-5 py-5 bg-slate-50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100">
              <Bot className="h-4 w-4 text-teal-700" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-3 flex items-center gap-1.5 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested questions ──────────────────────────────── */}
      {!loading && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white px-5 py-3">
          {suggestedQuestions.map((s) => (
            <button
              key={s}
              onClick={() => void sendMessage(s)}
              className="rounded-full border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 px-3 py-1.5 text-xs font-semibold transition-all shadow-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 border-t border-slate-200 bg-white px-5 py-3.5">
        <div className="relative">
          <button
            onMouseEnter={() => setShowVoiceTooltip(true)}
            onMouseLeave={() => setShowVoiceTooltip(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Mic className="h-4 w-4" />
          </button>
          {showVoiceTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white whitespace-nowrap shadow-md">
              Voice input coming soon
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void sendMessage(input)
          }}
          placeholder={
            currentLang === 'hi'
              ? 'अपना प्रश्न हिन्दी, English या ગુજરાતી में लिखें...'
              : currentLang === 'gu'
              ? 'તમારો પ્રશ્ન ગુજરાતી, English અથવા हिन्दी માં લખો...'
              : 'Type your question in English, हिन्दी, or ગુજરાતી...'
          }
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={() => void sendMessage(input)}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white disabled:opacity-50 hover:bg-teal-700 active:bg-teal-800 transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
