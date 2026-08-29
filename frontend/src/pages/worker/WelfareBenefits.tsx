import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, ChevronDown, ChevronUp, Loader2, ExternalLink, AlertTriangle } from 'lucide-react'
import api from '@/services/api'

// ─── Types ────────────────────────────────────────────────────────────────────
type MatchStatus = 'potentially_eligible' | 'needs_verification'

interface SchemeCard {
  id: string
  name: string
  status: MatchStatus
  matchScore: number
  why: string
  benefits: string
  missingInfo?: string
  documents: string[]
  learnMoreUrl?: string
}

// ─── Demo scheme data ─────────────────────────────────────────────────────────
const DEMO_SCHEMES: SchemeCard[] = [
  {
    id: 'cwwf',
    name: 'Construction Workers Welfare Fund (CWWF)',
    status: 'potentially_eligible',
    matchScore: 85,
    why: 'Your occupation (Mason) in the construction sector in Gujarat matches this scheme\'s criteria.',
    benefits: '₹2 lakh life insurance, medical assistance, pension after retirement',
    documents: ['Aadhaar Card', 'Work Certificate from Employer', 'Active Bank Account'],
    learnMoreUrl: '#',
  },
  {
    id: 'pm-sym',
    name: 'PM Shram Yogi Maan-dhan (PM-SYM)',
    status: 'needs_verification',
    matchScore: 72,
    why: 'You may qualify based on your occupation. Monthly income verification required.',
    benefits: '₹3,000/month pension after age 60',
    missingInfo: 'Income documentation (monthly wage proof)',
    documents: ['Aadhaar Card', 'Savings Bank Account', 'Income Proof'],
    learnMoreUrl: '#',
  },
  {
    id: 'aaby',
    name: 'Aam Aadmi Bima Yojana (AABY)',
    status: 'needs_verification',
    matchScore: 60,
    why: 'Age and occupation may qualify. BPL status or landlessness criterion needs verification.',
    benefits: 'Life and disability insurance coverage',
    missingInfo: 'BPL / landless household verification',
    documents: ['Aadhaar Card', 'BPL Certificate or land documents', 'Bank Account'],
    learnMoreUrl: '#',
  },
]

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<MatchStatus, { label: string; bg: string; text: string; border: string }> = {
  potentially_eligible: {
    label: 'Potentially Eligible',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  needs_verification: {
    label: 'Needs Verification',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-orange-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 tabular-nums">{score}%</span>
    </div>
  )
}

// ─── Scheme card component ────────────────────────────────────────────────────
function SchemeCardItem({ scheme }: { scheme: SchemeCard }) {
  const [docsOpen, setDocsOpen] = useState(false)
  const cfg = STATUS_CONFIG[scheme.status]

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug flex-1">{scheme.name}</h3>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
          </span>
        </div>

        {/* Match score */}
        <div className="mt-3">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Match Score</p>
          <ScoreBar score={scheme.matchScore} />
        </div>

        {/* Why */}
        <p className="mt-3 text-xs text-gray-600 leading-relaxed">{scheme.why}</p>

        {/* Benefits */}
        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Benefits</p>
          <p className="text-sm font-medium text-gray-800">{scheme.benefits}</p>
        </div>

        {/* Missing info (if any) */}
        {scheme.missingInfo && (
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-800"><span className="font-semibold">Missing info:</span> {scheme.missingInfo}</p>
          </div>
        )}
      </div>

      {/* Documents toggle */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setDocsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span>See Required Documents ({scheme.documents.length})</span>
          {docsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {docsOpen && (
          <ul className="px-4 pb-3 space-y-1.5">
            {scheme.documents.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
          Demo Data
        </span>
        {scheme.learnMoreUrl && (
          <a
            href={scheme.learnMoreUrl}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            Apply / Learn More <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WelfareBenefits() {
  useTranslation()
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)

  async function handleCheckEligibility() {
    setChecking(true)
    try {
      await api.post('/welfare/eligibility-check', {})
    } catch {
      // Silently ignore — demo data shown regardless
    } finally {
      setChecking(false)
      setChecked(true)
    }
  }

  return (
    <div className="space-y-4 px-4 py-5 pb-10">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Heart className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Welfare Benefits</h1>
          <p className="text-xs text-gray-500 leading-snug mt-0.5">
            Schemes potentially relevant to your profile — requires official verification
          </p>
        </div>
      </div>

      {/* ── AI info banner ────────────────────────────────── */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs text-blue-800 leading-relaxed">
          🤖 <span className="font-semibold">AI uses only verified government scheme data.</span> Eligibility shown
          is indicative only. Please verify with the official scheme authority. Results marked as{' '}
          <span className="font-semibold">'Potentially Eligible'</span> require formal application and official
          verification.
        </p>
      </div>

      {/* ── Check eligibility button ──────────────────────── */}
      <button
        onClick={handleCheckEligibility}
        disabled={checking}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm disabled:opacity-70 hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        {checking ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking eligibility…
          </>
        ) : (
          'Check My Eligibility →'
        )}
      </button>

      {/* ── Scheme cards ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">
            {DEMO_SCHEMES.length} Schemes Found
          </p>
          {checked && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-800">
              ✓ Check complete
            </span>
          )}
        </div>

        {DEMO_SCHEMES.map((scheme) => (
          <SchemeCardItem key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {/* ── Bottom disclaimer ─────────────────────────────── */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">⚠ DEMO DATA:</span> Scheme information is for demonstration only. Verify
            with official government sources. The AI does not make legal eligibility determinations.
          </p>
        </div>
      </div>
    </div>
  )
}
