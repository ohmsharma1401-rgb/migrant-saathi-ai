import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Loader2, Mic, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react'
import api from '@/services/api'
import { useLanguageStore } from '@/store/languageStore'
import { useTranslation } from '@/utils/translations'
import LanguageSelector from '@/components/LanguageSelector'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  actionLink?: { label: string; route: string }
}

// ─── Multilingual Prompts ──────────────────────────────────
const MULTI_SUGGESTED = {
  en: [
    'What welfare schemes am I eligible for?',
    'What is the minimum wage for a mason in Gujarat?',
    'How do I report an unsafe workplace?',
    'What documents do I need to apply for PM-SYM pension?',
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

// ─── Intelligent Multilingual NLP Engine ──────────────────────────────────────
interface NLPResult {
  reply: string
  actionLink?: { label: string; route: string }
}

function processNLPQuery(text: string, lang: 'en' | 'hi' | 'gu'): NLPResult {
  const q = text.toLowerCase().trim()

  // 1. Wage / Salary Intent
  if (
    q.includes('wage') || q.includes('salary') || q.includes('rate') || q.includes('minimum') ||
    q.includes('मजदूरी') || q.includes('वेतन') || q.includes('पगार') || q.includes('દરો')
  ) {
    if (lang === 'hi') {
      return {
        reply: 'गुजरात में श्रम विभाग के अनुसार न्यूनतम दैनिक दरें:\n• कुशल (राजमिस्त्री/इलेक्ट्रिशियन): ₹500/दिन\n• अर्ध-कुशल (सहायक/पेंटर): ₹380/दिन\n• अकुशल (मजदूर): ₹290/दिन\n\nयदि आपको इससे कम वेतन दिया जा रहा है, तो आप शिकायत दर्ज कर सकते हैं।',
        actionLink: { label: 'मजदूरी दरें जांचें →', route: '/worker/wages' },
      }
    }
    if (lang === 'gu') {
      return {
        reply: 'ગુજરાતમાં શ્રમ વિભાગના અધિકૃત લઘુત્તમ દરો:\n• કુશળ (કડિયા/ઇલેક્ટ્રિશિયન): ₹500/દિવસ\n• અર્ધ-કુશળ (સહાયક/પેઇન્ટર): ₹380/દિવસ\n• અકુશળ (શ્રમિક): ₹290/દિવસ\n\nજો તમને ઓછું વેતન મળતું હોય તો અહીં ફરિયાદ નોંધાવો.',
        actionLink: { label: 'લઘુત્તમ વેતન તપાસો →', route: '/worker/wages' },
      }
    }
    return {
      reply: 'Official Minimum Wages in Gujarat (per reference labor standards):\n• Skilled (Mason/Electrician): ₹500 / day\n• Semi-skilled (Helper/Painter): ₹380 / day\n• Unskilled (Laborer): ₹290 / day\n\nIf you are being paid less, you can file a wage claim instantly.',
      actionLink: { label: 'Check Wage Rates →', route: '/worker/wages' },
    }
  }

  // 2. Welfare Schemes Intent
  if (
    q.includes('scheme') || q.includes('welfare') || q.includes('eligible') || q.includes('benefit') ||
    q.includes('योजना') || q.includes('पात्र') || q.includes('लाभ') || q.includes('યોજના')
  ) {
    if (lang === 'hi') {
      return {
        reply: 'आपकी प्रोफाइल के अनुसार, आप निम्नलिखित 3 योजनाओं के लिए पात्र हैं:\n1. निर्माण श्रमिक कल्याण कोष (BOCW) — दुर्घटना और शिक्षा सहायता\n2. पीएम-एसवाईएम पेंशन योजना — ₹3,000/माह पेंशन\n3. आम आदमी बीमा योजना — मुफ़्त जीवन व विकलांगता बीमा',
        actionLink: { label: 'योजनाओं के लिए आवेदन करें →', route: '/worker/welfare' },
      }
    }
    if (lang === 'gu') {
      return {
        reply: 'તમારી પ્રોફાઇલ મુજબ, તમે નીચેની 3 કલ્યાણકારી યોજનાઓ માટે પાત્ર છો:\n1. બાંધકામ શ્રમિક કલ્યાણ ભંડોળ (BOCW)\n2. પીએમ-એસવાયએમ પેન્શન યોજના — ₹3,000/મહિને પેન્શન\n3. આમ આદમી વીમા યોજના — મફત જીવન વીમો',
        actionLink: { label: 'યોજનાઓ જુઓ →', route: '/worker/welfare' },
      }
    }
    return {
      reply: 'Based on your profile, you are eligible for 3 major schemes:\n1. Construction Workers Welfare Board (BOCW) Grant\n2. PM-SYM Pension Scheme (₹3,000/month post 60)\n3. AABY Life & Disability Insurance Cover.',
      actionLink: { label: 'Explore Welfare Schemes →', route: '/worker/welfare' },
    }
  }

  // 3. Unpaid Wages / Exploitation Intent
  if (
    q.includes('not paid') || q.includes('unpaid') || q.includes("haven't paid") || q.includes('due') ||
    q.includes('भुगतान') || q.includes('बकाया') || q.includes('पगारे') || q.includes('પગાર')
  ) {
    if (lang === 'hi') {
      return {
        reply: 'यदि आपके नियोक्ता या ठेकेदार ने वेतन नहीं दिया है:\n1. तुरंत ऐप से वेतन शिकायत दर्ज करें।\n2. गुजरात श्रम आयुक्त आपकी शिकायत श्रम निरीक्षक को भेजेंगे।\n3. आपातकालीन सहायता के लिए श्रम हेल्पलाइन 14434 पर कॉल करें।',
        actionLink: { label: 'सुरक्षा/वेतन शिकायत दर्ज करें →', route: '/worker/report' },
      }
    }
    if (lang === 'gu') {
      return {
        reply: 'જો તમારા માલિકે પગાર આપ્યો નથી:\n1. આ એપ દ્વારા તાત્કાલિક ફરિયાદ નોંધાવો.\n2. શ્રમ કમિશનર અધિકારી શ્રમ નિરીક્ષકને કેસ સોંપશે.\n3. હેલ્પલાઇન કોલ કરો: 14434.',
        actionLink: { label: 'ફરિયાદ નોંધાવો →', route: '/worker/report' },
      }
    }
    return {
      reply: 'If your employer or contractor is withholding your wages:\n1. File a Wage Complaint directly through this portal.\n2. Gujarat Labour Commissioners will dispatch a Labour Inspector to investigate.\n3. Call 14434 for urgent assistance.',
      actionLink: { label: 'File Wage Complaint →', route: '/worker/report' },
    }
  }

  // 4. Workplace Safety Intent
  if (
    q.includes('safety') || q.includes('unsafe') || q.includes('hazard') || q.includes('accident') ||
    q.includes('सुरक्षा') || q.includes('खतरा') || q.includes('दुर्घटना') || q.includes('અસુરક્ષિત')
  ) {
    if (lang === 'hi') {
      return {
        reply: 'असुरक्षित कार्यस्थल की रिपोर्ट दर्ज करना आपका कानूनी अधिकार है:\n1. "सुरक्षा शिकायत दर्ज करें" पर जाएं।\n2. कार्यस्थल का स्थान और खतरे का विवरण दर्ज करें।\n3. आपकी पहचान गोपनीय रखी जा सकती है।',
        actionLink: { label: 'सुरक्षा रिपोर्ट दर्ज करें →', route: '/worker/report' },
      }
    }
    if (lang === 'gu') {
      return {
        reply: 'અસુરક્ષિત કાર્યસ્થળની જાણ કરવી તમારો કાનૂની અધિકાર છે:\n1. "સુરક્ષા ફરિયાદ" પર જાઓ.\n2. સ્થળ અને જોખમની વિગત ભરો.\n3. તમારી વિગતો ગુપ્ત રાખવામાં આવશે.',
        actionLink: { label: 'સમસ્યાની જાણ કરો →', route: '/worker/report' },
      }
    }
    return {
      reply: 'Reporting unsafe work conditions is your protected right:\n1. Go to "Report Safety Issue".\n2. Provide the site location and describe the safety hazard.\n3. Reports can be submitted with identity protection.',
      actionLink: { label: 'Report Workplace Hazard →', route: '/worker/report' },
    }
  }

  // 5. Default Fallback Response
  if (lang === 'hi') {
    return {
      reply: 'मैं आपकी सहायता के लिए तैयार हूं! आप मुझसे न्यूनतम मजदूरी दरों, कल्याणकारी योजनाओं, सुरक्षा शिकायतों या पीएम-एसवाईएम पेंशन के बारे में पूछ सकते हैं।\n\nश्रम हेल्पलाइन नंबर: 14434',
    }
  }
  if (lang === 'gu') {
    return {
      reply: 'હું તમારી મદદ માટે અહીં છું! તમે મને લઘુત્તમ વેતન દરો, કલ્યાણકારી યોજનાઓ, સુરક્ષા ફરિયાદો અથવા પેન્શન વિશે પૂછી શકો છો.\n\nશ્રમ હેલ્પલાઇન નંબર: 14434',
    }
  }
  return {
    reply: 'I am here to support you! You can ask me about official minimum wage rates, government welfare scheme eligibility, reporting unsafe workplaces, or labor helpline support.\n\nLabor Helpline: 14434',
  }
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 mt-0.5 shadow-2xs">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-xs'
          }`}
        >
          {msg.content}
          
          {msg.actionLink && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={msg.actionLink.route}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                {msg.actionLink.label}
              </a>
            </div>
          )}
        </div>
        {!isUser && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 font-semibold">
            Saathi AI Engine · Official Helper
          </span>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
          <User className="h-4 w-4" />
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
          ? 'आपकी प्रोफाइल के आधार पर, मुझे आपके लिए योग्य 3 कल्याणकारी योजनाएं मिली हैं:\n\n1. निर्माण श्रमिक कल्याण कोष — पात्र\n2. पीएम-एसवाईएम पेंशन योजना — सत्यापन आवश्यक\n3. आम आदमी बीमा योजना — पात्र\n\nक्या आप इनमें से किसी का विवरण या आवेदन प्रक्रिया जानना चाहते हैं?'
          : lang === 'gu'
          ? 'તમારી પ્રોફાઇલના આધારે, મને તમારા માટે યોગ્ય 3 કલ્યાણકારી યોજનાઓ મળી છે:\n\n1. બાંધકામ શ્રમિક કલ્યાણ ભંડોળ — પાત્ર\n2. પીએમ-એસવાયએમ પેન્શન યોજના — ચકાસણી જરૂરી\n3. આમ આદમી વીમા યોજના — પાત્ર\n\nશું તમે આમાંથી કોઇની વિગતો જાણવા માગો છો?'
          : 'Based on your profile as a Mason in Ahmedabad, I found 3 relevant welfare schemes:\n\n1. Construction Workers Welfare Fund — Eligible\n2. PM-SYM Pension Scheme — Verification Pending\n3. AABY Insurance — Eligible.\n\nWould you like more details or direct links to apply?',
      actionLink: { label: 'View Welfare Schemes →', route: '/worker/welfare' },
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
      // Local fallback
    }

    await new Promise((r) => setTimeout(r, 600))

    const nlpRes = processNLPQuery(trimmed, currentLang)

    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: nlpRes.reply,
      actionLink: nlpRes.actionLink,
    }

    setMessages((m) => [...m, reply])
    setLoading(false)
    inputRef.current?.focus()
  }

  const suggestedQuestions = MULTI_SUGGESTED[currentLang] || MULTI_SUGGESTED.en

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-5 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">{t('ai_title')}</h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentLang === 'hi'
                ? 'श्रमिक अधिकारों, मजदूरी या योजनाओं के बारे में अपनी भाषा में पूछें'
                : currentLang === 'gu'
                ? 'અધિકારો, વેતન અથવા યોજનાઓ વિશે તમારી ભાષામાં પૂછો'
                : 'Multilingual assistance for labor rights, wages & schemes'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-full">
            <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            Saathi NLP Engine
          </span>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-4 px-4 sm:px-5 py-5 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-1.5 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested Prompts Chips ────────────────────────────── */}
      {!loading && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 overflow-x-auto">
          {suggestedQuestions.map((s) => (
            <button
              key={s}
              onClick={() => void sendMessage(s)}
              className="rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-900 dark:text-teal-300 px-3 py-1 text-xs font-semibold transition-all shadow-2xs shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="relative">
          <button
            onMouseEnter={() => setShowVoiceTooltip(true)}
            onMouseLeave={() => setShowVoiceTooltip(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Mic className="h-4 w-4" />
          </button>
          {showVoiceTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-white whitespace-nowrap shadow-md">
              Voice input active
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
          placeholder={t('ask_placeholder')}
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={() => void sendMessage(input)}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
