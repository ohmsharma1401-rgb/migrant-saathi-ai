import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Building2,
  User,
  ArrowUpRight,
  PlayCircle,
  Camera,
  FolderOpen
} from 'lucide-react'
import {
  inspectionService,
  InspectionCase,
  InspectionDashboardMetrics
} from '@/services/inspection.service'
import InspectionWorkflowModal from '@/components/inspector/InspectionWorkflowModal'

export default function InspectorDashboard() {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<InspectionDashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<InspectionCase | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const res = await inspectionService.getInspectorDashboard()
      setMetrics(res.data)
    } catch {
      // Fallback handled by service
    } finally {
      setLoading(false)
    }
  }

  function handleStartInspection(c: InspectionCase) {
    setSelectedCase(c)
    setIsModalOpen(true)
  }

  function handleCaseUpdated(updated: InspectionCase) {
    if (!metrics) return
    const currentRoster = Array.isArray(metrics.today_roster) ? metrics.today_roster : []
    const updatedRoster = currentRoster.map((item) =>
      item.id === updated.id ? updated : item
    )
    setMetrics({
      ...metrics,
      today_roster: updatedRoster
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B231C] via-[#0E2F26] to-[#0A1F18] border border-[#184537] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Field Officer Dispatch Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Inspection Operations Command
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Verify employer wage compliance, document worksite conditions, record worker depositions, and enforce statutory protections across Surat &amp; South Gujarat division.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/inspector/roster')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              <span>View Route &amp; Schedule</span>
            </button>
            <button
              onClick={() => navigate('/inspector/evidence')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Evidence Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Today's Inspections */}
        <div
          onClick={() => navigate('/inspector/roster')}
          className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-amber-400 dark:hover:border-amber-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9DBBB2]">
              Today's Route
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <b className="text-2xl sm:text-3xl font-black text-[#0C2D27] dark:text-white block">
            {metrics?.today_inspections ?? 4}
          </b>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
            2 pending on site
          </span>
        </div>

        {/* Assigned Active Cases */}
        <div
          onClick={() => navigate('/inspector/cases')}
          className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-emerald-400 dark:hover:border-emerald-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9DBBB2]">
              Active Cases
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-4 w-4" />
            </div>
          </div>
          <b className="text-2xl sm:text-3xl font-black text-[#0C2D27] dark:text-white block">
            {metrics?.assigned_cases ?? 7}
          </b>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
            Under active inquiry
          </span>
        </div>

        {/* High Priority Cases */}
        <div
          onClick={() => navigate('/inspector/cases?filter=Critical')}
          className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-red-400 dark:hover:border-red-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9DBBB2]">
              Critical Urgency
            </span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <b className="text-2xl sm:text-3xl font-black text-[#0C2D27] dark:text-white block">
            {metrics?.high_priority_cases ?? 2}
          </b>
          <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold block mt-1">
            Requires 24h action
          </span>
        </div>

        {/* Overdue Inspections */}
        <div
          onClick={() => navigate('/inspector/roster?status=Overdue')}
          className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-orange-400 dark:hover:border-orange-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9DBBB2]">
              Overdue Followup
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <b className="text-2xl sm:text-3xl font-black text-[#0C2D27] dark:text-white block">
            {metrics?.overdue_inspections ?? 1}
          </b>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold block mt-1">
            Exceeded deadline
          </span>
        </div>

        {/* Pending Reports */}
        <div
          onClick={() => navigate('/inspector/reports')}
          className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-teal-400 dark:hover:border-teal-400/60 transition-all cursor-pointer group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9DBBB2]">
              Report Filings
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <b className="text-2xl sm:text-3xl font-black text-[#0C2D27] dark:text-white block">
            {metrics?.pending_reports ?? 3}
          </b>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block mt-1">
            Draft reports pending
          </span>
        </div>
      </div>

      {/* ── Today's Inspection Roster Section ── */}
      <div className="rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1E483D] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-extrabold text-[#0C2D27] dark:text-white">
                Today's Inspection Schedule &amp; Priority Route
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-0.5">
              Assigned physical worksite inspections scheduled for today across your beat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/inspector/roster')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Calendar</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Case Cards List */}
        <div className="space-y-3">
          {metrics?.today_roster && metrics.today_roster.length > 0 ? (
            metrics.today_roster.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] hover:border-amber-400/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Case Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      {item.case_code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.priority === 'Critical'
                        ? 'bg-red-500 text-white'
                        : item.priority === 'High'
                        ? 'bg-[#FF6B53] text-white'
                        : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                    }`}>
                      {item.priority} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-[#1C4237] text-slate-800 dark:text-emerald-300">
                      {item.complaint_category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-[#9DBBB2]">
                      <Clock className="h-3 w-3 text-amber-500" />
                      {item.scheduled_time}
                    </span>
                  </div>

                  {/* Worker & Workplace */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[#0C2D27] dark:text-white">
                      <User className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="font-bold truncate">{item.worker_name}</span>
                      <span className="text-slate-400 dark:text-[#9DBBB2] text-[11px]">({item.worker_occupation})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0C2D27] dark:text-white">
                      <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="font-semibold truncate">{item.employer_name}</span>
                    </div>
                  </div>

                  {/* Location & Summary */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-[#CBDCE1]">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6B53] shrink-0 mt-0.5" />
                    <span className="truncate">{item.workplace_site}</span>
                  </div>

                  {item.wage_disparity && item.wage_disparity > 0 && (
                    <div className="text-[11px] font-bold text-red-600 dark:text-red-400">
                      Disputed Wage Gap: ₹{item.wage_disparity.toLocaleString()} (₹{item.reported_wage} vs Reference ₹{item.reference_wage})
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-[#1E483D]">
                  <button
                    onClick={() => handleStartInspection(item)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>{item.status === 'In Progress' ? 'Resume Inspection' : 'Start Inspection'}</span>
                  </button>

                  <button
                    onClick={() => handleStartInspection(item)}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-[#1A3D33] text-[#0C2D27] dark:text-white hover:bg-slate-300 dark:hover:bg-[#235043] transition-colors cursor-pointer"
                    title="View Inspection File"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#1F4C3F] text-center text-xs text-slate-500 dark:text-[#9DBBB2]">
              No inspections scheduled for today. Great job!
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Section: Quick Guidance & Field Tools ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
            <Camera className="h-4 w-4" />
            <span>Field Evidence Camera</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#CBDCE1] leading-relaxed">
            Record geotagged site photos, muster rolls, wage registers, and audio memos directly tied to case files.
          </p>
          <button
            onClick={() => navigate('/inspector/evidence')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Open Evidence Repository</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            <Building2 className="h-4 w-4" />
            <span>Monitored Workplaces</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#CBDCE1] leading-relaxed">
            Access register of 60+ registered contractors, construction sites, and factories in Surat jurisdiction.
          </p>
          <button
            onClick={() => navigate('/inspector/workplaces')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Inspect Workplaces</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B53] uppercase">
            <ShieldAlert className="h-4 w-4" />
            <span>Enforcement SOP &amp; Law</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#CBDCE1] leading-relaxed">
            Statutory clauses for Inter-State Migrant Workmen Act 1979, Minimum Wages Act 1948, and BOCW Act.
          </p>
          <button
            onClick={() => navigate('/inspector/help')}
            className="text-xs font-bold text-[#FF6B53] hover:underline flex items-center gap-1"
          >
            <span>Read Inspection SOPs</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Inspection Workflow Modal ── */}
      <InspectionWorkflowModal
        inspectionCase={selectedCase}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={handleCaseUpdated}
      />
    </div>
  )
}
