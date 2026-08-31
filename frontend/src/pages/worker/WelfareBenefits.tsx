import { useState } from 'react'
import { useTranslation } from '@/utils/translations'
import { Heart, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from 'lucide-react'
import api from '@/services/api'

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

const DEMO_SCHEMES: SchemeCard[] = [
  {
    id: 'cwwf',
    name: 'Gujarat Building & Construction Workers Welfare Fund (BOCW)',
    status: 'potentially_eligible',
    matchScore: 85,
    why: 'Your occupation (Mason) in the construction sector in Gujarat matches this scheme\'s criteria.',
    benefits: '₹2 lakh life insurance, medical assistance, education grant for children, pension',
    documents: ['Aadhaar Card', 'Work Certificate from Employer', 'Active Bank Account'],
    learnMoreUrl: '#',
  },
  {
    id: 'pm-sym',
    name: 'PM Shram Yogi Maan-dhan (PM-SYM)',
    status: 'needs_verification',
    matchScore: 72,
    why: 'You qualify based on unorganized sector work. Monthly income verification required.',
    benefits: '₹3,000/month assured pension after age 60',
    missingInfo: 'Income documentation (monthly wage below ₹15,000)',
    documents: ['Aadhaar Card', 'Savings Bank Account', 'Income Self-Declaration'],
    learnMoreUrl: '#',
  },
  {
    id: 'aaby',
    name: 'Aam Aadmi Bima Yojana (AABY)',
    status: 'needs_verification',
    matchScore: 60,
    why: 'Age and unorganized occupation qualify. Primary breadwinner criterion verification.',
    benefits: 'Life cover of ₹75,000 and disability insurance cover up to ₹75,000',
    missingInfo: 'Head of family / breadwinner verification',
    documents: ['Aadhaar Card', 'Ration Card / BPL Proof', 'Bank Account Passbook'],
    learnMoreUrl: '#',
  },
]

export default function WelfareBenefits() {
  const { t } = useTranslation()
  const [schemes, setSchemes] = useState<SchemeCard[]>(DEMO_SCHEMES)
  const [checking, setChecking] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleRefreshEligibility() {
    setChecking(true)
    try {
      await api.get('/welfare/matches')
    } catch {
      // Local fallback
    }
    await new Promise((r) => setTimeout(r, 500))
    setSchemes(DEMO_SCHEMES)
    setChecking(false)
  }

  function toggleExpand(id: string) {
    setExpandedId((curr) => (curr === id ? null : id))
  }

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/80 shrink-0">
            <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('welfare_title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('welfare_subtitle')}</p>
          </div>
        </div>

        <button
          onClick={handleRefreshEligibility}
          disabled={checking}
          className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 transition-all shadow-sm"
        >
          {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {checking ? 'Refreshing Eligibility...' : 'Re-Check Eligibility 🔄'}
        </button>
      </div>

      {/* ── Schemes List ────────────────────────────────────── */}
      <div className="space-y-4">
        {schemes.map((s) => {
          const isExpanded = expandedId === s.id
          const isEligible = s.status === 'potentially_eligible'

          return (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 max-w-xl">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isEligible
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {isEligible ? t('eligible_badge') : t('verification_needed_badge')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{s.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.why}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">Match Confidence</span>
                    <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{s.matchScore}%</span>
                  </div>

                  <button
                    onClick={() => toggleExpand(s.id)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Details"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Benefits highlight */}
              <div className="mt-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900">
                <p className="text-xs text-purple-950 dark:text-purple-200 font-bold">🎁 Benefits &amp; Cover:</p>
                <p className="text-xs text-purple-800 dark:text-purple-300 mt-0.5 font-medium">{s.benefits}</p>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in">
                  {s.missingInfo && (
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      ⚠ Pending: {s.missingInfo}
                    </p>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">Required Application Documents:</h4>
                    <div className="flex flex-wrap gap-2">
                      {s.documents.map((doc) => (
                        <span
                          key={doc}
                          className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={() => alert(`Applying for ${s.name}... Your application request has been saved!`)}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      {t('apply_now')} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
