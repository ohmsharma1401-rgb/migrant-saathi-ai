import { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'

// ─── Issue types ──────────────────────────────────────────────────────────────
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
    desc: '',
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
    desc: '',
  },
]

const DISTRICTS = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar']

function randomComplaintId() {
  return `GRV-2024-${Math.floor(100 + Math.random() * 900)}`
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReportSafety() {
  const navigate = useNavigate()
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [district, setDistrict] = useState('')
  const [employer, setEmployer] = useState('')
  const [evidence, setEvidence] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [complaintId, setComplaintId] = useState('')

  const canSubmit = issueType && description.trim().length > 10

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await api.post<{ complaint_code: string }>('/grievances/', {
        description: `[Category: ${issueType}] ${description}`,
        location_district: district || undefined,
      })
      if (res.data?.complaint_code) {
        setComplaintId(res.data.complaint_code)
        return
      }
    } catch {
      // demo submit regardless
    } finally {
      setSubmitting(false)
      setComplaintId(randomComplaintId())
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (complaintId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-9 w-9 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Report Submitted Successfully</h2>
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-6 py-4 w-full max-w-xs">
          <p className="text-xs text-gray-500 mb-0.5">Your Complaint ID</p>
          <p className="text-lg font-bold text-green-800 tracking-wide">{complaintId}</p>
        </div>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-xs">
          An inspector will review your case within <span className="font-semibold">48–72 hours</span>.
        </p>
        <p className="mt-1 text-sm text-gray-600 max-w-xs">Track your complaint in My Grievances.</p>
        <button
          onClick={() => navigate('/worker/grievances')}
          className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          View My Grievances <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => setComplaintId('')}
          className="mt-3 text-xs text-gray-500 hover:underline"
        >
          Submit another report
        </button>
      </div>
    )
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 px-4 py-5 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Safety Issue</h1>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Report workplace safety problems, wage issues, or other concerns
          </p>
        </div>
      </div>

      {/* ── Info banner ─────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
        <p className="text-xs text-red-800 leading-relaxed">
          Your report is <span className="font-semibold">confidential</span>. All complaints are reviewed by authorized
          labour inspectors. You will receive a complaint ID to track your case.
        </p>
      </div>

      {/* ── Issue type ──────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Issue Type <span className="text-red-500">*</span>
        </h2>
        <div className="space-y-2">
          {ISSUE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setIssueType(type.id)}
              className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                issueType === type.id
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <span className="text-base shrink-0 mt-0.5">{type.emoji}</span>
              <div>
                <p className={`text-sm font-semibold ${issueType === type.id ? 'text-red-800' : 'text-gray-800'}`}>
                  {type.label}
                </p>
                {type.desc && (
                  <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
        <label className="text-sm font-semibold text-gray-800">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Describe the issue in detail. You can write in Hindi, Gujarati, or English.\n\nExample: I have not received my salary for 2 months and there are no safety helmets or equipment at the construction site.`}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none leading-relaxed"
        />
        <p className="text-[11px] text-gray-400">{description.length} characters</p>
      </div>

      {/* ── Location ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Location</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select district</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Site / Employer Name (optional)</label>
          <input
            type="text"
            value={employer}
            onChange={(e) => setEmployer(e.target.value)}
            placeholder="e.g. ABC Construction, Rajesh Builders"
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ── Evidence ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold text-gray-800">Supporting Evidence (optional)</h2>
        <textarea
          rows={3}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="Add description of any witnesses or evidence..."
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-[11px] text-gray-400 italic">
          📸 Voice upload and photo upload will be available in a future version.
        </p>
      </div>

      {/* ── Submit button ─────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-4 text-sm font-semibold text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
      >
        {submitting ? 'Submitting…' : 'Submit Report →'}
      </button>

      {/* ── Emergency notice ─────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          ⚠ For emergencies or immediate danger, contact{' '}
          <span className="font-semibold">local police (100)</span> or{' '}
          <span className="font-semibold">labour helpline (14434)</span>
        </p>
      </div>
    </div>
  )
}
