import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Loader2, Mic, Cpu, PlusCircle, ShieldCheck } from 'lucide-react'
import api from '@/services/api'
import { useLanguageStore } from '@/store/languageStore'
import { useTranslation } from '@/utils/translations'
import LanguageSelector from '@/components/LanguageSelector'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  classification?: string
  actionLink?: { label: string; route: string }
}

// ─── Multilingual Suggested Prompts ──────────────────────────────────────────
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

          {/* Sources badges if returned */}
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-teal-500" /> Verified Knowledge:
              </span>
              {msg.sources.map((src, idx) => (
                <span key={idx} className="text-[10px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
                  {src}
                </span>
              ))}
            </div>
          )}

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
            Ask Saathi AI Engine · Official Helper
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

  const getInitialWelcome = (lang: 'en' | 'hi' | 'gu'): Message[] => [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        lang === 'hi'
          ? 'नमस्ते! मैं आपका **प्रवासी साथी AI** सहायक हूँ। मैं आपकी मजदूरी, योजनाओं, सुरक्षा शिकायतों और अधिकारों में सहायता कर सकता हूँ। आप मुझसे क्या पूछना चाहते हैं?'
          : lang === 'gu'
          ? 'નમસ્તે! હું તમારો **પ્રવાસી સાથી AI** મદદનીશ છું. હું તમારા વેતન, કલ્યાણ યોજનાઓ, સુરક્ષા તકરારો અને અધિકારો અંગે મદદ કરી શકું છું.'
          : 'Welcome to **Ask Saathi AI**! I am your verified assistant for migrant worker rights, minimum wages, welfare schemes (BOCW, PM-SYM, e-Shram), workplace safety, and grievances.',
    },
  ]

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>(getInitialWelcome(currentLang))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; model?: string }>({ available: false })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.get('/ask-saathi/health')
        if (res.data?.ollama) {
          setOllamaStatus({ available: true, model: res.data.model || 'llama3' })
        }
      } catch {
        try {
          const resFallback = await api.get('/ai/status')
          if (resFallback.data?.ollama_available) {
            setOllamaStatus({ available: true, model: resFallback.data.ollama_model || 'llama3' })
          }
        } catch {
          // Keep offline state
        }
      }
    }
    checkStatus()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleNewConversation() {
    setLoading(true)
    try {
      const res = await api.post('/ask-saathi/conversations/new', { language: currentLang })
      if (res.data?.conversation_id) {
        setConversationId(res.data.conversation_id)
      }
    } catch {
      setConversationId(null)
    }
    setMessages(getInitialWelcome(currentLang))
    setLoading(false)
    inputRef.current?.focus()
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const userMsg: Message = { id: msgId, role: 'user', content: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      console.log('[AskSaathi UI] Sending message to /ask-saathi/chat:', trimmed)
      const res = await api.post('/ask-saathi/chat', {
        conversation_id: conversationId,
        message_id: msgId,
        message: trimmed,
        language: currentLang,
      })

      console.log('[AskSaathi UI] Response received:', res.data)

      if (res.data?.conversation_id) {
        setConversationId(res.data.conversation_id)
      }

      const answerText = res.data?.answer || res.data?.reply
      if (!answerText || !answerText.trim()) {
        throw new Error('Received empty response from backend')
      }

      const replyMsg: Message = {
        id: res.data.message_id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: answerText,
        classification: res.data.classification,
        sources: res.data.sources || [],
      }
      setMessages((m) => [...m, replyMsg])
    } catch (err) {
      console.warn('[AskSaathi UI] /ask-saathi/chat error, attempting /ai/ask fallback:', err)
      try {
        const resFallback = await api.post('/ai/ask', { message: trimmed, language: currentLang })
        console.log('[AskSaathi UI] Fallback response received:', resFallback.data)
        const fallbackText = resFallback.data?.reply || resFallback.data?.answer
        if (!fallbackText || !fallbackText.trim()) {
          throw new Error('Received empty fallback response')
        }
        const replyMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackText,
        }
        setMessages((m) => [...m, replyMsg])
      } catch (fallbackErr) {
        console.error('[AskSaathi UI] Both AI endpoints failed:', fallbackErr)
        const errReply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            currentLang === 'hi'
              ? 'साथी एआई सेवा अस्थायी रूप से अनुपलब्ध है। कृपया कुछ देर बाद पुनः प्रयास करें।'
              : currentLang === 'gu'
              ? 'સાથી AI સેવા ક્ષણિક રીતે અનુપલબ્ધ છે. કૃપા કરીને થોડી ક્ષણો પછી ફરી પ્રયાસ કરો.'
              : 'Saathi AI is temporarily unavailable. Please try again in a moment.',
        }
        setMessages((m) => [...m, errReply])
      }
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
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
          {/* New Conversation Button */}
          <button
            onClick={handleNewConversation}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors shadow-2xs cursor-pointer"
            title="Start New Conversation"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {currentLang === 'hi' ? 'नया चैट' : currentLang === 'gu' ? 'નવી વાતચીત' : 'New Chat'}
            </span>
          </button>

          <LanguageSelector />

          <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-full">
            <Cpu className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            {ollamaStatus.available ? `Ollama (${ollamaStatus.model})` : 'Saathi NLP'}
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
              className="rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-900 dark:text-teal-300 px-3 py-1 text-xs font-semibold transition-all shadow-2xs shrink-0 cursor-pointer"
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
