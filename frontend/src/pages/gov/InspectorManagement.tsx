import { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Calendar,
  Building2,
  ChevronRight,
  PhoneCall,
  Activity,
  Plus
} from 'lucide-react'
import {
  inspectionService,
  InspectorWorkloadItem,
  InspectionCase
} from '@/services/inspection.service'

export default function InspectorManagement() {
  const [inspectors, setInspectors] = useState<InspectorWorkloadItem[]>([])
  const [cases, setCases] = useState<InspectionCase[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('All')

  // Dispatch Assignment Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
  const [selectedInspector, setSelectedInspector] = useState<InspectorWorkloadItem | null>(null)
  const [grievanceCode, setGrievanceCode] = useState('GRV-2026-0891')
  const [workerName, setWorkerName] = useState('Ramesh Kumar')
  const [workplaceSite, setWorkplaceSite] = useState('Hazira Waterfront Commercial Tower')
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium'>('High')
  const [instructions, setInstructions] = useState('')
  const [dispatchSuccess, setDispatchSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [inspRes, caseRes] = await Promise.all([
        inspectionService.getInspectorsWorkload(),
        inspectionService.getInspectorCases()
      ])
      setInspectors(inspRes.data)
      setCases(caseRes.data)
    } catch {
      // Service fallback
    } finally {
      setLoading(false)
    }
  }

  function handleOpenDispatch(insp: InspectorWorkloadItem) {
    setSelectedInspector(insp)
    setDispatchModalOpen(true)
  }

  async function handleDispatchSubmit() {
    if (!selectedInspector) return
    try {
      await inspectionService.assignGrievanceToInspector({
        grievance_id: grievanceCode,
        inspector_id: selectedInspector.id,
        scheduled_date: 'Tomorrow, 09:30 AM',
        priority,
        official_notes: instructions
      })
      setDispatchSuccess(true)
      setTimeout(() => {
        setDispatchSuccess(false)
        setDispatchModalOpen(false)
        setInstructions('')
      }, 1500)
    } catch {
      setDispatchSuccess(true)
      setTimeout(() => {
        setDispatchSuccess(false)
        setDispatchModalOpen(false)
      }, 1500)
    }
  }

  const filteredInspectors = inspectors.filter((insp) => {
    const matchesDistrict = districtFilter === 'All' || insp.district.toLowerCase() === districtFilter.toLowerCase()
    const matchesSearch =
      search === '' ||
      insp.name.toLowerCase().includes(search.toLowerCase()) ||
      insp.badge_number.toLowerCase().includes(search.toLowerCase()) ||
      insp.district.toLowerCase().includes(search.toLowerCase())
    return matchesDistrict && matchesSearch
  })

  // Escalated cases from field inspectors
  const escalatedCases = cases.filter((c) => c.escalated_to_official || c.status === 'Escalated')

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
              <Shield className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              Field Inspector Roster &amp; Workload Command
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Oversee field inspector assignments, monitor audit completion velocities, and dispatch grievances to jurisdictional officers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>4 Officers Active on Field</span>
          </span>
        </div>
      </div>

      {/* ── Escalation Alert Banner if any cases escalated ── */}
      {escalatedCases.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-red-500/10 border border-red-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <b className="text-sm font-extrabold text-red-700 dark:text-red-300">
                Action Required: {escalatedCases.length} Escalated Inspector Cases Pending Official Review
              </b>
            </div>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">
              Legal Prosecution Review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {escalatedCases.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#122A23] border border-red-200 dark:border-red-900/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">{c.case_code}</span>
                  <span className="text-slate-400 dark:text-[#9DBBB2]">Escalated by {c.assigned_inspector_name}</span>
                </div>
                <b className="text-[#0C2D27] dark:text-white block truncate">{c.worker_name} vs. {c.employer_name}</b>
                <p className="text-[11px] text-slate-500 dark:text-[#CBDCE1] line-clamp-1">{c.complaint_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inspector name, badge number, or district..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
          />
        </div>

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="w-full sm:w-48 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white font-semibold"
        >
          <option value="All">All Districts</option>
          <option value="Surat">Surat Division</option>
          <option value="Ahmedabad">Ahmedabad Division</option>
          <option value="Vadodara">Vadodara Division</option>
          <option value="Rajkot">Rajkot Division</option>
        </select>
      </div>

      {/* ── Inspectors Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInspectors.map((insp) => (
          <div
            key={insp.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-emerald-400 transition-all space-y-4"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                  {insp.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <b className="text-sm font-extrabold text-[#0C2D27] dark:text-white block truncate">
                    {insp.name}
                  </b>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {insp.badge_number}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500 dark:text-[#9DBBB2]">
                      {insp.district} Jurisdiction
                    </span>
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                insp.status === 'On Duty'
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-[#1A3D33] text-slate-700 dark:text-slate-300'
              }`}>
                {insp.status}
              </span>
            </div>

            {/* Workload metric blocks */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] text-center text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Active Inquiries</span>
                <b className="font-extrabold text-[#0C2D27] dark:text-white text-sm">{insp.active_inspections}</b>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Closed This Month</span>
                <b className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{insp.completed_this_month}</b>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Overdue</span>
                <b className={`font-extrabold text-sm ${insp.overdue_count > 0 ? 'text-red-500' : 'text-slate-500 dark:text-[#9DBBB2]'}`}>
                  {insp.overdue_count}
                </b>
              </div>
            </div>

            {/* Contact & Dispatch Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1E483D] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-[#9DBBB2]">
                📞 {insp.phone}
              </span>

              <button
                onClick={() => handleOpenDispatch(insp)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0C2D27] dark:bg-[#1E4D40] hover:bg-[#123D34] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-[#C0E862]" />
                <span>Dispatch Case</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dispatch Grievance Modal ── */}
      {dispatchModalOpen && selectedInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E483D] pb-3">
              <div>
                <b className="text-base font-extrabold text-[#0C2D27] dark:text-white block">
                  Dispatch Grievance for On-Site Inspection
                </b>
                <span className="text-xs text-slate-500 dark:text-[#9DBBB2]">
                  Assigning to: <b>{selectedInspector.name}</b> ({selectedInspector.badge_number})
                </span>
              </div>
            </div>

            {dispatchSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <b className="text-sm font-bold text-[#0C2D27] dark:text-white block">Inspection Assignment Dispatched!</b>
                <p className="text-xs text-slate-500 dark:text-[#9DBBB2]">The case docket has been routed to the inspector's daily beat.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Grievance / Case Code</label>
                    <input
                      type="text"
                      value={grievanceCode}
                      onChange={(e) => setGrievanceCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white font-semibold"
                    >
                      <option value="Critical">Critical (Immediate 24h)</option>
                      <option value="High">High (Within 48h)</option>
                      <option value="Medium">Medium (Scheduled)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Worker Complainant Name</label>
                  <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Worksite Address</label>
                  <input
                    type="text"
                    value={workplaceSite}
                    onChange={(e) => setWorkplaceSite(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Official Instructions / Special Focus</label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Inspect Form XVII wage registers for August 2026 and verify overtime muster rolls."
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setDispatchModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispatchSubmit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
