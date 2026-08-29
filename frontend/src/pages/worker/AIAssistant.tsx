import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Loader2, Mic } from 'lucide-react'
import api from '@/services/api'
import i18n from '@/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// ─── Demo pre-loaded conversation ─────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'What welfare schemes can I apply for?',
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'Based on your profile as a Mason in Ahmedabad (Construction sector), I found 3 potentially relevant schemes:\n\n(1) Construction Workers Welfare Fund — Potentially Eligible based on your occupation and location.\n\n(2) PM-SYM Pension — Needs Verification — income documentation required.\n\n(3) AABY Insurance — Potentially Eligible.\n\n⚠ These are potential matches only. Official eligibility requires formal verification with the scheme authority. Would you like more details on any of these?',
  },
]

const SUGGESTED = [
  'What welfare schemes am I eligible for?',
  'What is the minimum wage for a mason in Gujarat?',
  'How do I report an unsafe workplace?',
  'What documents do I need to apply for PM-SYM?',
  'My employer hasn\'t paid me for 2 months. What should I do?',
]

const LANG_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'gu', label: 'GU' },
]

// Demo AI responses
const DEMO_RESPONSES: Record<string, string> = {
  default:
    'I can help you with information about welfare schemes, your rights as a worker, wage regulations, and how to file grievances. Please ask me a specific question and I\'ll do my best to assist you.\n\n⚠ I provide general information only. For legal matters, please consult official channels.',
  wage:
    'The minimum daily wage for a Mason (Skilled) in Gujarat is approximately ₹500/day as per the latest reference data. For Semi-skilled workers it is around ₹380/day and Unskilled workers ₹290/day.\n\n⚠ These are reference figures. Verify with the Gujarat Labour Department for current official rates.',
  report:
    'To report an unsafe workplace:\n1. Go to the "Report Safety Issue" section in this app\n2. Select "Workplace Safety" as the issue type\n3. Describe the hazard in detail\n4. Submit — you\'ll receive a Complaint ID\n\nFor immediate danger, call the Labour Helpline: 14434 or Police: 100.',
  pm_sym:
    'For PM-SYM Pension, you will need:\n• Aadhaar Card\n• Savings Bank Account passbook\n• Mobile number linked to Aadhaar\n• Income/wage proof (monthly wage below ₹15,000)\n\nVisit your nearest CSC (Common Service Centre) or apply via the PM-SYM portal.',
  unpaid:
    'If your employer has not paid your wages:\n1. First, make a written request to your employer.\n2. File a complaint through this app ("Report Safety Issue" → Wage Issue).\n3. Contact your nearest Labour Commissioner office.\n4. You can also call the Labour Helpline: 14434.\n\n⚠ Under the Payment of Wages Act, wages must be paid by the 7th (or 10th) of the following month.',
}

function getDemoResponse(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('wage') || lower.includes('salary') || lower.includes('minimum')) return DEMO_RESPONSES.wage
  if (lower.includes('report') || lower.includes('unsafe') || lower.includes('safety') || lower.includes('ppe')) return DEMO_RESPONSES.report
  if (lower.includes('pm-sym') || lower.includes('document') || lower.includes('pension')) return DEMO_RESPONSES.pm_sym
  if (lower.includes("haven't paid") || lower.includes('not paid') || lower.includes('unpaid') || lower.includes('2 month')) return DEMO_RESPONSES.unpaid
  return DEMO_RESPONSES.default
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 mt-0.5">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      )}
      <div className={`max-w-[82%] flex flex-col gap-0.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          {msg.content}
        </div>
        {!isUser && (
          <span className="text-[10px] text-gray-400 px-1">IBM Granite AI</span>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 mt-0.5">
          <User className="h-4 w-4 text-gray-500" />
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentLang = i18n.language ?? 'en'

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
      // use demo response
    }

    await new Promise((r) => setTimeout(r, 1500))

    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getDemoResponse(trimmed),
    }
    setMessages((m) => [...m, reply])
    setLoading(false)
    inputRef.current?.focus()
  }

  const showSuggestions = messages.length === INITIAL_MESSAGES.length && !loading

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">AI Assistant</p>
            <p className="text-[11px] text-gray-500">
              Ask me anything about your rights, welfare schemes, or workplace issues
            </p>
          </div>
        </div>
        {/* IBM badge */}
        <span className="shrink-0 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700 leading-tight text-center">
          IBM Granite<br />watsonx.ai
        </span>
      </div>

      {/* ── Language selector ────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-white px-4 py-2">
        <span className="text-[11px] text-gray-400 mr-1">Language:</span>
        {LANG_OPTIONS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => void i18n.changeLanguage(code)}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
              currentLang === code
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Messages ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4 bg-gray-50">
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggested questions ──────────────────────────────── */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-white px-4 py-2.5">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => void sendMessage(s)}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3">
        {/* Voice button */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowVoiceTooltip(true)}
            onMouseLeave={() => setShowVoiceTooltip(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <Mic className="h-4 w-4" />
          </button>
          {showVoiceTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 rounded-lg bg-gray-800 px-2.5 py-1 text-[11px] text-white whitespace-nowrap">
              Coming soon
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void sendMessage(input) }}
          placeholder="Type your question in English, हिन्दी, or ગુજરાતી..."
          className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => void sendMessage(input)}
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Disclaimer ───────────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-white px-4 py-2">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          🤖 AI responses are based on government scheme data and reference information. Not legal advice. Eligibility determinations require official verification.
        </p>
      </div>
    </div>
  )
}
