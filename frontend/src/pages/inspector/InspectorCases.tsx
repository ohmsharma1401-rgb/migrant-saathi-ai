import { useState, useEffect } from 'react'
import {
  FolderOpen,
  Search,
  Filter,
  User,
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
  PlayCircle,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  FileCheck2,
  Calendar
} from 'lucide-react'
import { inspectionService, InspectionCase } from '@/services/inspection.service'
import InspectionWorkflowModal from '@/components/inspector/InspectionWorkflowModal'

export default function InspectorCases() {
  const [cases, setCases] = useState<InspectionCase[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedCase, setSelectedCase] = useState<InspectionCase | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    setLoading(true)
    try {
      const res = await inspectionService.getInspectorCases()
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setCases(rawList)
    } catch {
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  function handleOpenModal(c: InspectionCase) {
    setSelectedCase(c)
    setIsModalOpen(true)
  }

  function handleCaseUpdated(updated: InspectionCase) {
    setCases((prev) => (Array.isArray(prev) ? prev.map((item) => (item.id === updated.id ? updated : item)) : [updated]))
  }

  const safeCases = Array.isArray(cases) ? cases : []
  const filteredCases = safeCases.filter((c) => {
    const matchesCategory =
      categoryFilter === 'All' || (c.complaint_category || '').toLowerCase() === categoryFilter.toLowerCase()
    const matchesPriority =
      priorityFilter === 'All' || (c.priority || '').toLowerCase() === priorityFilter.toLowerCase()
    const matchesStatus =
      statusFilter === 'All' || (c.status || '').toLowerCase() === statusFilter.toLowerCase()
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      searchQuery === '' ||
      (c.worker_name || '').toLowerCase().includes(q) ||
      (c.employer_name || '').toLowerCase().includes(q) ||
      (c.case_code || '').toLowerCase().includes(q) ||
      (c.worker_id || '').toLowerCase().includes(q)
    return matchesCategory && matchesPriority && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
              <FolderOpen className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              Assigned Worker Grievances &amp; Case Dockets
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Active enforcement dockets assigned to your beat by the District Joint Labour Commissioner.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-[#9DBBB2]">
          <span>Total Assigned:</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold">
            {cases.length} Dockets
          </span>
        </div>
      </div>

      {/* ── Filter Controls ── */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, Aadhaar ID, case code, or employer..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white font-semibold"
            >
              <option value="All">All Complaint Categories</option>
              <option value="Wage">Wage Non-Payment</option>
              <option value="Safety">Safety &amp; PPE Hazards</option>
              <option value="Living Conditions">Sanitation &amp; Housing</option>
              <option value="Working Hours">Working Hours &amp; Overtime</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white font-semibold"
            >
              <option value="All">All Priority Levels</option>
              <option value="Critical">Critical (Immediate)</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Case Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
          >
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                  {c.case_code}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.priority === 'Critical'
                      ? 'bg-red-500 text-white'
                      : c.priority === 'High'
                      ? 'bg-[#FF6B53] text-white'
                      : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}>
                    {c.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#1A3D33] text-slate-700 dark:text-emerald-300">
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Worker & Employer */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0C2D27] dark:text-white">
                  <User className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{c.worker_name}</span>
                  <span className="text-xs font-normal text-slate-400 dark:text-[#9DBBB2]">({c.worker_occupation})</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#CBDCE1]">
                  <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate font-medium">{c.employer_name}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9DBBB2]">
                  <MapPin className="h-3 w-3 text-[#FF6B53] shrink-0" />
                  <span className="truncate">{c.workplace_site}</span>
                </div>
              </div>

              {/* Wage details if applicable */}
              {c.wage_disparity && c.wage_disparity > 0 && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-red-700 dark:text-red-300">Disparity / Unpaid Arrears:</span>
                  <b className="font-black text-red-600 dark:text-red-400">₹{c.wage_disparity.toLocaleString()}</b>
                </div>
              )}

              {/* Complaint summary */}
              <p className="text-xs text-slate-600 dark:text-[#CBDCE1] line-clamp-2 leading-relaxed">
                "{c.complaint_description}"
              </p>
            </div>

            {/* Footer Stats & Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#1E483D] flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-[#9DBBB2]">
                <span>Findings: <b>{c.findings.length}</b></span>
                <span>Evidence: <b>{c.evidence.length}</b></span>
              </div>

              <button
                onClick={() => handleOpenModal(c)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Open Docket</span>
              </button>
            </div>
          </div>
        ))}
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
