import { useState, useEffect } from 'react'
import { ClipboardList, Plus, ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/utils/translations'

type GrievanceStatus = 'open' | 'under_review' | 'resolved' | 'closed'
type GrievanceCategory = 'Safety' | 'Wage' | 'Conditions' | 'Harassment' | 'Other'

interface GrievanceUpdate {
  date: string
  text: string
}

interface Grievance {
  id: string
  category: GrievanceCategory
  status: GrievanceStatus
  priority: 'High' | 'Medium' | 'Low'
  description: string
  location: string
  submittedAgo: string
  updates: GrievanceUpdate[]
}

const DEMO_GRIEVANCES: Grievance[] = [
  {
    id: 'GRV-2026-089',
    category: 'Safety',
    status: 'open',
    priority: 'High',
    description: 'Workplace safety hazards at construction site — no PPE provided',
    location: 'Ahmedabad',
    submittedAgo: '2 days ago',
    updates: [],
  },
  {
    id: 'GRV-2026-076',
    category: 'Wage',
    status: 'under_review',
    priority: 'High',
    description: 'Salary not paid for 6 weeks',
    location: 'Surat',
    submittedAgo: '5 days ago',
    updates: [
      { date: '1 day ago', text: 'Inspector assigned. Investigation in progress.' },
    ],
  },
  {
    id: 'GRV-2026-061',
    category: 'Conditions',
    status: 'resolved',
    priority: 'Medium',
    description: 'Excessive working hours without break',
    location: 'Vadodara',
    submittedAgo: '15 days ago',
    updates: [
      { date: '8 days ago', text: 'Inspector visited worksite.' },
      { date: '3 days ago', text: 'Resolved: Employer counselled by labour inspector.' },
    ],
  },
]

const STATUS_BADGE: Record<GrievanceStatus, { label: string; bg: string }> = {
  open: { label: 'Pending Review', bg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
  under_review: { label: 'Inspector Assigned', bg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' },
  resolved: { label: 'Resolved & Closed', bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' },
  closed: { label: 'Closed', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
}

export default function MyGrievances() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [grievances, setGrievances] = useState<Grievance[]>(DEMO_GRIEVANCES)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const customStr = localStorage.getItem('saathi-custom-grievances')
      if (customStr) {
        const customList = JSON.parse(customStr)
        if (Array.isArray(customList) && customList.length > 0) {
          setGrievances([...customList, ...DEMO_GRIEVANCES])
        }
      }
    } catch {
      // Fallback
    }
  }, [])

  function toggleExpand(id: string) {
    setExpandedId((curr) => (curr === id ? null : id))
  }

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 shrink-0">
            <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('grievances_title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('grievances_subtitle')}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/worker/report')}
          className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {t('action_report_issue')}
        </button>
      </div>

      {/* ── Grievance List ──────────────────────────────────── */}
      <div className="space-y-3">
        {grievances.map((g) => {
          const isExpanded = expandedId === g.id
          const st = STATUS_BADGE[g.status] || STATUS_BADGE.open

          return (
            <div
              key={g.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-teal-600 dark:text-teal-400">{g.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.bg}`}>
                      {st.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{g.description}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {g.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {g.submittedAgo}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(g.id)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Expand"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* Timeline details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('timeline_title')}:</h4>
                  {g.updates && g.updates.length > 0 ? (
                    <ul className="space-y-2">
                      {g.updates.map((u, idx) => (
                        <li key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
                          <span className="text-teal-600 dark:text-teal-400 font-semibold">{u.date}: </span>
                          <span className="text-slate-700 dark:text-slate-300">{u.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">Report queued confidentially for inspector assignment.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
