import { useState, useEffect } from 'react'
import { ClipboardList, Plus, ChevronDown, ChevronUp, MapPin, Clock, Camera, Film, Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/utils/translations'

type GrievanceStatus = 'open' | 'under_review' | 'resolved' | 'closed'
type GrievanceCategory = 'Safety' | 'Wage' | 'Conditions' | 'Harassment' | 'Casualty' | 'Discrimination' | 'Other'

interface ProofFile {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
  size: string
}

interface GrievanceUpdate {
  date: string
  text: string
}

interface Grievance {
  id: string
  category: GrievanceCategory | string
  status: GrievanceStatus | string
  priority: 'High' | 'Medium' | 'Low' | 'Critical' | string
  description: string
  location: string
  submittedAgo: string
  proofFiles?: ProofFile[]
  updates: GrievanceUpdate[]
}

const DEMO_GRIEVANCES: Grievance[] = [
  {
    id: 'GRV-2026-089',
    category: 'Casualty Incident',
    status: 'open',
    priority: 'Critical',
    description: 'Scaffolding collapse accident causing leg injury to 2 workers. No helmet or safety harnesses supplied.',
    location: 'Ahmedabad',
    submittedAgo: '2 hours ago',
    proofFiles: [
      {
        id: 'p1',
        name: 'Site_Scaffold_Collapse.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
        size: '1.4 MB',
      },
    ],
    updates: [
      { date: '2 hours ago', text: 'Report filed confidentially with site photo proof. Emergency Labour Inspector notified.' },
    ],
  },
  {
    id: 'GRV-2026-076',
    category: 'Wage',
    status: 'under_review',
    priority: 'High',
    description: 'Salary not paid for last 6 weeks. Overtime hours withheld.',
    location: 'Surat',
    submittedAgo: '5 days ago',
    updates: [
      { date: '1 day ago', text: 'Inspector assigned. Investigation in progress with employer.' },
    ],
  },
  {
    id: 'GRV-2026-061',
    category: 'Conditions',
    status: 'resolved',
    priority: 'Medium',
    description: 'Excessive working hours without mandated break facilities.',
    location: 'Vadodara',
    submittedAgo: '15 days ago',
    updates: [
      { date: '8 days ago', text: 'Inspector visited worksite.' },
      { date: '3 days ago', text: 'Resolved: Employer counselled by labour inspector.' },
    ],
  },
]

const STATUS_BADGE: Record<string, { label: string; bg: string }> = {
  open: { label: 'Pending Review', bg: 'bg-amber-100 text-amber-800' },
  Open: { label: 'Pending Review', bg: 'bg-amber-100 text-amber-800' },
  under_review: { label: 'Inspector Assigned', bg: 'bg-blue-100 text-blue-800' },
  'Under Review': { label: 'Inspector Assigned', bg: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Resolved & Closed', bg: 'bg-emerald-100 text-emerald-800' },
  Resolved: { label: 'Resolved & Closed', bg: 'bg-emerald-100 text-emerald-800' },
  closed: { label: 'Closed', bg: 'bg-slate-100 text-slate-700' },
}

export default function MyGrievances() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [grievances, setGrievances] = useState<Grievance[]>(DEMO_GRIEVANCES)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [previewMedia, setPreviewMedia] = useState<ProofFile | null>(null)

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
            <span className="w-4 h-[2px] bg-[#FF6B53]" />
            MY INCIDENT REPORTS
          </div>
          <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight">
            {t('grievances_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#52605D] mt-0.5">
            {t('grievances_subtitle')} Track status of reported casualties, discrimination, and hazards.
          </p>
        </div>

        <button
          onClick={() => navigate('/worker/report')}
          className="figma-btn-coral py-3 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t('action_report_issue')}</span>
        </button>
      </div>

      {/* ── Grievance List ──────────────────────────────────── */}
      <div className="space-y-4">
        {grievances.map((g) => {
          const isExpanded = expandedId === g.id
          const st = STATUS_BADGE[g.status] || STATUS_BADGE.open

          return (
            <div
              key={g.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-extrabold text-[#0C2D27] bg-slate-100 px-2 py-0.5 rounded-md">
                      {g.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.bg}`}>
                      {st.label}
                    </span>
                    {g.priority === 'Critical' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        🚨 CRITICAL
                      </span>
                    )}
                    {g.proofFiles && g.proofFiles.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Camera className="h-3 w-3" /> {g.proofFiles.length} Proof File(s)
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#0C2D27] leading-snug">{g.description}</h3>

                  <div className="flex items-center gap-4 text-xs text-[#52605D] pt-1 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {g.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> {g.submittedAgo}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(g.id)}
                  className="p-2.5 rounded-2xl bg-slate-100 text-[#0C2D27] hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Toggle details"
                >
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {/* Expanded details & proof media */}
              {isExpanded && (
                <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
                  {/* Proof Attachments Section */}
                  {g.proofFiles && g.proofFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#0C2D27] flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-[#FF6B53]" /> Attached Photo &amp; Video Proof:
                      </h4>

                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {g.proofFiles.map((pf) => (
                          <div
                            key={pf.id}
                            onClick={() => setPreviewMedia(pf)}
                            className="relative group rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shrink-0 w-36 h-24 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                          >
                            {pf.type === 'image' ? (
                              <img src={pf.url} alt={pf.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                <video src={pf.url} className="w-full h-full object-cover opacity-70" />
                                <Film className="h-6 w-6 absolute text-white" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                              <Eye className="h-3.5 w-3.5" /> Preview
                            </div>

                            <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] truncate">
                              {pf.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#0C2D27]">{t('timeline_title')}:</h4>
                    {g.updates && g.updates.length > 0 ? (
                      <ul className="space-y-2">
                        {g.updates.map((u, idx) => (
                          <li key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                            <span className="text-[#FF6B53] font-bold">{u.date}: </span>
                            <span className="text-[#0C2D27] font-normal">{u.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#52605D]">Report queued confidentially for Gujarat Labour Inspector review.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Media Fullscreen Preview Modal ── */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-4 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                {previewMedia.type === 'image' ? <Camera className="h-4 w-4 text-emerald-400" /> : <Film className="h-4 w-4 text-red-400" />}
                {previewMedia.name} ({previewMedia.size})
              </span>
              <button onClick={() => setPreviewMedia(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              {previewMedia.type === 'image' ? (
                <img src={previewMedia.url} alt="Proof preview" className="max-h-[65vh] w-auto object-contain" />
              ) : (
                <video src={previewMedia.url} controls autoPlay className="max-h-[65vh] w-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
