import { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Building2,
  User,
  Filter,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react'
import { inspectionService, InspectionCase } from '@/services/inspection.service'
import InspectionWorkflowModal from '@/components/inspector/InspectionWorkflowModal'

export default function InspectionRoster() {
  const [cases, setCases] = useState<InspectionCase[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCase, setSelectedCase] = useState<InspectionCase | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadRoster()
  }, [])

  async function loadRoster() {
    setLoading(true)
    try {
      const res = await inspectionService.getInspectionRoster()
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setCases(rawList)
    } catch {
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  function handleOpenInspection(c: InspectionCase) {
    setSelectedCase(c)
    setIsModalOpen(true)
  }

  function handleCaseUpdated(updated: InspectionCase) {
    setCases((prev) => (Array.isArray(prev) ? prev.map((item) => (item.id === updated.id ? updated : item)) : [updated]))
  }

  const safeCases = Array.isArray(cases) ? cases : []
  const filteredCases = safeCases.filter((c) => {
    const matchesStatus = statusFilter === 'All' || (c.status || '').toLowerCase() === statusFilter.toLowerCase()
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      searchQuery === '' ||
      (c.worker_name || '').toLowerCase().includes(q) ||
      (c.employer_name || '').toLowerCase().includes(q) ||
      (c.case_code || '').toLowerCase().includes(q) ||
      (c.workplace_site || '').toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              Daily Inspection Roster &amp; Beat Schedule
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Ordered sequence of physical site audits assigned for today across Surat district jurisdiction.
          </p>
        </div>

        {/* Route Optimization Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <Compass className="h-4 w-4 text-amber-500 animate-spin" />
          <span>Route: Hazira Industrial Corridor → Pandesara GIDC</span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
          {['All', 'Scheduled', 'In Progress', 'Verified', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-[#15342B] text-slate-600 dark:text-[#CBDCE1] hover:bg-slate-200 dark:hover:bg-[#1C4539]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search worker, site, case ID..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── Schedule Timeline / Cards ── */}
      <div className="space-y-4">
        {filteredCases.length > 0 ? (
          filteredCases.map((c, index) => (
            <div
              key={c.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-amber-400/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden"
            >
              {/* Order number tab */}
              <div className="hidden lg:flex flex-col items-center justify-center w-12 border-r border-slate-100 dark:border-[#1E483D] pr-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] uppercase">Stop</span>
                <b className="text-xl font-black text-amber-500">#{index + 1}</b>
              </div>

              {/* Main Info */}
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                    {c.case_code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-[#1A3D33] text-slate-700 dark:text-emerald-300">
                    {c.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.priority === 'Critical'
                      ? 'bg-red-500 text-white'
                      : c.priority === 'High'
                      ? 'bg-[#FF6B53] text-white'
                      : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}>
                    {c.priority} Priority
                  </span>
                  <span className="flex items-center gap-1 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    {c.scheduled_time} ({c.scheduled_date})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2] block">
                      Complainant Worker
                    </span>
                    <div className="flex items-center gap-2 font-bold text-[#0C2D27] dark:text-white">
                      <User className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{c.worker_name}</span>
                      <span className="text-[11px] font-normal text-slate-400 dark:text-[#9DBBB2]">({c.worker_occupation})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-[#9DBBB2] block">
                      Phone: {c.worker_phone} · Origin: {c.worker_domicile}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2] block">
                      Workplace / Site Address
                    </span>
                    <div className="flex items-center gap-2 font-bold text-[#0C2D27] dark:text-white">
                      <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{c.employer_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#CBDCE1]">
                      <MapPin className="h-3 w-3 text-[#FF6B53] shrink-0" />
                      <span className="truncate">{c.workplace_site}</span>
                    </div>
                  </div>
                </div>

                {/* Complaint Summary */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[10px] block mb-0.5">
                    Violation Issue: {c.complaint_category}
                  </span>
                  <p className="text-slate-600 dark:text-[#CBDCE1] leading-relaxed">
                    {c.complaint_description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-[#1E483D]">
                <button
                  onClick={() => handleOpenInspection(c)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>{c.status === 'In Progress' ? 'Resume On-Site Audit' : 'Start Site Inspection'}</span>
                </button>

                <button
                  onClick={() => handleOpenInspection(c)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#173A30] hover:bg-slate-200 dark:hover:bg-[#1E483D] text-[#0C2D27] dark:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>Review Evidence ({c.evidence.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <b className="text-sm font-bold text-[#0C2D27] dark:text-white block">No inspection items match this filter</b>
            <p className="text-xs text-slate-500 dark:text-[#9DBBB2]">Adjust your search query or status filter to see scheduled tasks.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <InspectionWorkflowModal
        inspectionCase={selectedCase}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={handleCaseUpdated}
      />
    </div>
  )
}
