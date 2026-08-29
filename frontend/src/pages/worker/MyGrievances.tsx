import { useState } from 'react'
import { ClipboardList, Plus, ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_GRIEVANCES: Grievance[] = [
  {
    id: 'GRV-2024-089',
    category: 'Safety',
    status: 'open',
    priority: 'High',
    description: 'Workplace safety hazards at construction site — no PPE provided',
    location: 'Ahmedabad',
    submittedAgo: '2 days ago',
    updates: [],
  },
  {
    id: 'GRV-2024-076',
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
    id: 'GRV-2024-061',
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

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<GrievanceStatus, { label: string; bg: string; text: string; border: string }> = {
  open: { label: 'Open', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  under_review: { label: 'Under Review', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  resolved: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  closed: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
}

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CFG: Record<GrievanceCategory, { bg: string; text: string }> = {
  Safety:     { bg: 'bg-red-100',    text: 'text-red-800' },
  Wage:       { bg: 'bg-amber-100',  text: 'text-amber-800' },
  Conditions: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Harassment: { bg: 'bg-purple-100', text: 'text-purple-800' },
  Other:      { bg: 'bg-gray-100',   text: 'text-gray-700' },
}

const PRIORITY_CFG: Record<string, { bg: string; text: string }> = {
  High:   { bg: 'bg-red-100',   text: 'text-red-800' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Low:    { bg: 'bg-gray-100',  text: 'text-gray-600' },
}

const FILTER_TABS: { label: string; value: GrievanceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

// ─── Individual grievance card ────────────────────────────────────────────────
function GrievanceCard({ g }: { g: Grievance }) {
  const [expanded, setExpanded] = useState(false)
  const sc = STATUS_CFG[g.status]
  const cc = CAT_CFG[g.category]
  const pc = PRIORITY_CFG[g.priority]

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Main content */}
      <div className="p-4">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cc.bg} ${cc.text}`}>
            {g.category}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${sc.bg} ${sc.text} ${sc.border}`}>
            {sc.label}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${pc.bg} ${pc.text}`}>
            {g.priority}
          </span>
          <span className="ml-auto text-[11px] font-mono text-gray-400">{g.id}</span>
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{g.description}</p>

        {/* Meta */}
        <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {g.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {g.submittedAgo}
          </span>
        </div>

        {/* Latest update snippet */}
        {g.updates.length > 0 ? (
          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Latest Update</p>
            <p className="text-xs text-gray-700">{g.updates[g.updates.length - 1].text}</p>
          </div>
        ) : (
          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
            <p className="text-xs text-gray-400 italic">No response yet</p>
          </div>
        )}
      </div>

      {/* Expand / View Details */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span>View Details</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Updates Timeline</p>
            {g.updates.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No updates yet. Your complaint is queued for review.</p>
            ) : (
              <ol className="relative border-l border-gray-200 ml-2 space-y-3">
                {g.updates.map((u, i) => (
                  <li key={i} className="ml-4">
                    <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-400 ring-2 ring-white" />
                    <p className="text-xs font-semibold text-gray-700">{u.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{u.date}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MyGrievances() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<GrievanceStatus | 'all'>('all')

  const filtered =
    activeFilter === 'all'
      ? DEMO_GRIEVANCES
      : DEMO_GRIEVANCES.filter((g) => g.status === activeFilter)

  const total = DEMO_GRIEVANCES.length
  const open = DEMO_GRIEVANCES.filter((g) => g.status === 'open').length
  const resolved = DEMO_GRIEVANCES.filter((g) => g.status === 'resolved').length

  return (
    <div className="space-y-4 px-4 py-5 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
            <ClipboardList className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Grievances</h1>
            <p className="text-xs text-gray-500 mt-0.5">Track your submitted complaints</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/worker/report')}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> New Report
        </button>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total', value: total, bg: 'bg-gray-50', text: 'text-gray-800' },
          { label: 'Open', value: open, bg: 'bg-red-50', text: 'text-red-700' },
          { label: 'Resolved', value: resolved, bg: 'bg-green-50', text: 'text-green-700' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`rounded-xl border border-gray-200 ${bg} p-3 text-center`}>
            <p className={`text-2xl font-bold ${text}`}>{value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === tab.value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Grievance list ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <ClipboardList className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-600">No complaints filed yet.</p>
          <p className="text-xs text-gray-400 mt-1">Stay safe and know your rights.</p>
          <button
            onClick={() => navigate('/worker/report')}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            File a Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => <GrievanceCard key={g.id} g={g} />)}
        </div>
      )}
    </div>
  )
}
