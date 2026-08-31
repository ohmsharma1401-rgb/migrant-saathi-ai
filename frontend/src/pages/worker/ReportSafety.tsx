import { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronRight, Loader2, PhoneCall } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/utils/translations'
import api from '@/services/api'

const ISSUE_TYPES = [
  {
    id: 'safety',
    emoji: '🔴',
    label: 'Workplace Safety',
    desc: 'Falling materials, no PPE, unsafe conditions',
  },
  {
    id: 'wage',
    emoji: '💰',
    label: 'Wage Issue',
    desc: 'Unpaid wages, below minimum wage, deductions',
  },
  {
    id: 'harassment',
    emoji: '😤',
    label: 'Harassment / Discrimination',
    desc: 'Verbal abuse, intimidation, discrimination',
  },
  {
    id: 'conditions',
    emoji: '🏗',
    label: 'Working Conditions',
    desc: 'Excessive hours, no breaks, no facilities',
  },
  {
    id: 'other',
    emoji: '📋',
    label: 'Other',
    desc: 'Other workplace complaints',
  },
]

const DISTRICTS = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bharuch', 'Kutch', 'Mehsana']

function randomComplaintId() {
  return `GRV-2026-${Math.floor(100 + Math.random() * 900)}`
}

export default function ReportSafety() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [district, setDistrict] = useState('Ahmedabad')
  const [employer, setEmployer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [complaintId, setComplaintId] = useState('')

  const canSubmit = issueType && description.trim().length >= 5

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    const newId = randomComplaintId()

    let workerName = 'Ramesh Kumar'
    try {
      const stored = localStorage.getItem('saathi-custom-worker')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.full_name) workerName = parsed.full_name
      }
    } catch {
      // fallback
    }

    const categoryMap: Record<string, string> = {
      safety: 'Safety',
      wage: 'Wage',
      harassment: 'Harassment',
      conditions: 'Conditions',
      other: 'Other',
    }

    const newGrievance = {
      id: newId,
      category: categoryMap[issueType] || 'Safety',
      status: 'open',
      priority: issueType === 'harassment' || issueType === 'safety' ? 'High' : 'Medium',
      description: description.trim(),
      worker: workerName,
      location: district || 'Ahmedabad',
      submittedAgo: 'Just now',
      created: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      inspector: 'Unassigned',
      updates: [
        { date: 'Just now', text: 'Report submitted confidentially and queued for inspector review.' },
      ],
    }

    try {
      await api.post('/grievances', {
        category: newGrievance.category,
        description: newGrievance.description,
        location: newGrievance.location,
        employer_name: employer || undefined,
      })
    } catch {
      // Local storage fallback
    }

    try {
      const existing = JSON.parse(localStorage.getItem('saathi-custom-grievances') || '[]')
      existing.unshift(newGrievance)
      localStorage.setItem('saathi-custom-grievances', JSON.stringify(existing))
    } catch {
      // fallback
    }

    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    setComplaintId(newId)
  }

  if (complaintId) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-6 shadow-md text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Complaint Submitted Successfully!</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Your workplace safety report has been logged confidentially and queued for a Gujarat Labour Inspector.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400 block font-semibold">{t('complaint_id')}</span>
            <span className="text-lg font-extrabold font-mono text-teal-600 dark:text-teal-400">{complaintId}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/worker/grievances')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Track Complaint Status →
            </button>
            <button
              onClick={() => { setComplaintId(''); setDescription(''); setIssueType('') }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/80 shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('safety_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('safety_subtitle')}</p>
        </div>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
            {t('emergency_helpline_text')}
          </span>
        </div>
      </div>

      {/* ── Form Card ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
        {/* Category selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">{t('issue_type_label')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ISSUE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setIssueType(type.id)}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  issueType === type.id
                    ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/60 text-slate-900 dark:text-white shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-base">{type.emoji}</span>
                <div>
                  <p className="text-xs font-bold">{type.label}</p>
                  {type.desc && <p className="text-[11px] text-slate-400 mt-0.5">{type.desc}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* District & Employer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('workplace_location_label')}</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('employer_name_label')}</label>
            <input
              type="text"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              placeholder="e.g. ABC Construction"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Description textarea */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('description_label')}</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, location, dates, or safety hazards..."
            className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Submit action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm disabled:opacity-50 transition-all shadow-sm"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Submitting Report...' : t('submit_complaint_btn')}
          </button>
        </div>
      </div>
    </div>
  )
}
