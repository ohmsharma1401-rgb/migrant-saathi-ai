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
  Plus,
  Briefcase,
  FileText,
  MapPin,
  ExternalLink,
  Check,
  X
} from 'lucide-react'
import {
  inspectionService,
  InspectorWorkloadItem,
  InspectionCase
} from '@/services/inspection.service'

interface AssignedTaskItem {
  id: string
  case_code: string
  worker_name: string
  worker_phone?: string
  employer_name: string
  workplace_site: string
  location_district: string
  category: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: string
  assigned_inspector_id: string
  assigned_inspector_name: string
  assigned_inspector_badge: string
  scheduled_date: string
  instructions?: string
  assigned_at: string
}

export default function InspectorManagement() {
  const [inspectors, setInspectors] = useState<InspectorWorkloadItem[]>([])
  const [cases, setCases] = useState<InspectionCase[]>([])
  const [assignedTasks, setAssignedTasks] = useState<AssignedTaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('All')
  const [selectedInspectorFilter, setSelectedInspectorFilter] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inspectors' | 'tasks'>('inspectors')

  // Dispatch Assignment Modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
  const [selectedInspector, setSelectedInspector] = useState<InspectorWorkloadItem | null>(null)
  const [grievanceCode, setGrievanceCode] = useState('GRV-2026-0891')
  const [workerName, setWorkerName] = useState('Ramesh Kumar')
  const [workplaceSite, setWorkplaceSite] = useState('Hazira Waterfront Commercial Tower')
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium'>('High')
  const [timeline, setTimeline] = useState('Within 24 Hours')
  const [instructions, setInstructions] = useState('')
  const [dispatchSuccess, setDispatchSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

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

      const rawInspectors: InspectorWorkloadItem[] = inspRes?.data || inspRes || []
      const rawCases: InspectionCase[] = caseRes?.data || caseRes || []

      // Build initial assigned tasks list from backend cases
      const tasksList: AssignedTaskItem[] = rawCases.map((c) => ({
        id: c.id,
        case_code: c.case_code || c.id,
        worker_name: c.worker_name,
        worker_phone: c.worker_phone,
        employer_name: c.employer_name,
        workplace_site: c.workplace_site,
        location_district: c.location_district,
        category: c.complaint_category || 'Workplace Inspection',
        priority: (c.priority || 'High') as any,
        status: c.status || 'Scheduled',
        assigned_inspector_id: c.assigned_inspector_id || 'ins-101',
        assigned_inspector_name: c.assigned_inspector_name || 'Rajendra Solanki',
        assigned_inspector_badge: c.assigned_inspector_badge || 'INS-GJ-0418',
        scheduled_date: c.scheduled_date || 'Today',
        instructions: c.inspection_notes?.join('; ') || '',
        assigned_at: c.created_at || 'Recently'
      }))

      // Merge tasks assigned in localStorage (from GrievancesPanel or Dispatch modal)
      const savedAssignmentsStr = localStorage.getItem('saathi-assigned-grievances')
      if (savedAssignmentsStr) {
        try {
          const assignmentsMap: Record<string, any> = JSON.parse(savedAssignmentsStr)
          Object.entries(assignmentsMap).forEach(([gId, assignInfo]) => {
            // Find existing task or add new task
            const existingIdx = tasksList.findIndex((t) => t.id === gId || t.case_code === gId)
            const insp = rawInspectors.find((i) => i.name.toLowerCase() === assignInfo.inspector?.toLowerCase())
            const taskObj: AssignedTaskItem = {
              id: gId,
              case_code: gId,
              worker_name: assignInfo.worker || 'Registered Worker',
              employer_name: assignInfo.employer || 'Principal Contractor / Worksite',
              workplace_site: assignInfo.site || assignInfo.location || 'Gujarat Industrial Belt',
              location_district: assignInfo.district || insp?.district || 'Surat',
              category: assignInfo.category || 'Grievance Inspection',
              priority: assignInfo.priority || 'High',
              status: assignInfo.status || 'Under Review',
              assigned_inspector_id: insp?.id || 'ins-101',
              assigned_inspector_name: assignInfo.inspector,
              assigned_inspector_badge: assignInfo.inspectorBadge || insp?.badge_number || 'INS-GJ',
              scheduled_date: assignInfo.scheduled_date || 'Scheduled Within 24h',
              instructions: assignInfo.notes || 'Dispatched from Government Official console.',
              assigned_at: 'Assigned recently'
            }

            if (existingIdx >= 0) {
              tasksList[existingIdx] = { ...tasksList[existingIdx], ...taskObj }
            } else {
              tasksList.unshift(taskObj)
            }
          })
        } catch {}
      }

      // Update inspector active_inspections count to accurately reflect all assigned tasks
      const updatedInspectors = rawInspectors.map((insp) => {
        const assignedCount = tasksList.filter(
          (t) =>
            (t.assigned_inspector_name || '').toLowerCase().includes((insp.name || '').toLowerCase()) ||
            t.assigned_inspector_id === insp.id
        ).length
        return {
          ...insp,
          active_inspections: Math.max(insp.active_inspections, assignedCount)
        }
      })

      setInspectors(updatedInspectors)
      setCases(rawCases)
      setAssignedTasks(tasksList)
    } catch {
      // Service fallback
    } finally {
      setLoading(false)
    }
  }

  function handleOpenDispatch(insp: InspectorWorkloadItem) {
    setSelectedInspector(insp)
    setGrievanceCode(`GRV-${Date.now().toString().slice(-6)}`)
    setDispatchModalOpen(true)
  }

  async function handleDispatchSubmit() {
    if (!selectedInspector) return
    const newTask: AssignedTaskItem = {
      id: grievanceCode,
      case_code: grievanceCode,
      worker_name: workerName.trim(),
      employer_name: 'Workplace Contractor Entity',
      workplace_site: workplaceSite.trim(),
      location_district: selectedInspector.district,
      category: 'Official Assigned Inspection',
      priority,
      status: 'Under Review',
      assigned_inspector_id: selectedInspector.id,
      assigned_inspector_name: selectedInspector.name,
      assigned_inspector_badge: selectedInspector.badge_number,
      scheduled_date: timeline,
      instructions: instructions.trim() || 'Dispatched for priority on-site verification.',
      assigned_at: 'Just now'
    }

    // 1. Update state immediately
    const updatedTasks = [newTask, ...assignedTasks]
    setAssignedTasks(updatedTasks)

    // Update inspector active workload count (+1)
    setInspectors((prev) =>
      prev.map((i) =>
        i.id === selectedInspector.id ? { ...i, active_inspections: i.active_inspections + 1 } : i
      )
    )

    // 2. Persist to saathi-assigned-grievances map
    try {
      const savedStr = localStorage.getItem('saathi-assigned-grievances')
      const assignmentsMap = savedStr ? JSON.parse(savedStr) : {}
      assignmentsMap[grievanceCode] = {
        inspector: selectedInspector.name,
        inspectorBadge: selectedInspector.badge_number,
        status: 'Under Review',
        worker: workerName.trim(),
        site: workplaceSite.trim(),
        district: selectedInspector.district,
        priority,
        scheduled_date: timeline,
        notes: instructions.trim()
      }
      localStorage.setItem('saathi-assigned-grievances', JSON.stringify(assignmentsMap))
    } catch {}

    // 3. Connect to backend service
    try {
      await inspectionService.assignGrievanceToInspector({
        grievance_id: grievanceCode,
        inspector_id: selectedInspector.id,
        scheduled_date: timeline,
        priority,
        official_notes: instructions.trim() || 'Dispatched from Government Official console.'
      })
    } catch {}

    setDispatchSuccess(true)
    setTimeout(() => {
      setDispatchSuccess(false)
      setDispatchModalOpen(false)
      setInstructions('')
      setToastMessage(`✓ Task ${grievanceCode} dispatched to ${selectedInspector.name} (${selectedInspector.badge_number})`)
      setTimeout(() => setToastMessage(''), 4000)
    }, 1200)
  }

  const safeInspectors = Array.isArray(inspectors) ? inspectors : []
  const filteredInspectors = safeInspectors.filter((insp) => {
    const matchesDistrict = districtFilter === 'All' || (insp.district || '').toLowerCase() === districtFilter.toLowerCase()
    const q = search.toLowerCase()
    const matchesSearch =
      search === '' ||
      (insp.name || '').toLowerCase().includes(q) ||
      (insp.badge_number || '').toLowerCase().includes(q) ||
      (insp.district || '').toLowerCase().includes(q)
    return matchesDistrict && matchesSearch
  })

  const safeTasks = Array.isArray(assignedTasks) ? assignedTasks : []
  const filteredTasks = safeTasks.filter((task) => {
    const inspFilter = (selectedInspectorFilter || '').toLowerCase()
    const matchesInspector =
      !selectedInspectorFilter ||
      (task.assigned_inspector_name || '').toLowerCase().includes(inspFilter) ||
      task.assigned_inspector_id === selectedInspectorFilter
    const matchesDistrict = districtFilter === 'All' || (task.location_district || '').toLowerCase() === districtFilter.toLowerCase()
    const q = search.toLowerCase()
    const matchesSearch =
      search === '' ||
      (task.case_code || '').toLowerCase().includes(q) ||
      (task.worker_name || '').toLowerCase().includes(q) ||
      (task.assigned_inspector_name || '').toLowerCase().includes(q) ||
      (task.workplace_site || '').toLowerCase().includes(q)
    return matchesInspector && matchesDistrict && matchesSearch
  })

  // Escalated cases from field inspectors
  const safeCases = Array.isArray(cases) ? cases : []
  const escalatedCases = safeCases.filter((c) => c.escalated_to_official || c.status === 'Escalated')

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
              Field Inspector Command &amp; Task Assignment
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Oversee field inspector assignments, monitor audit velocities, and dispatch worker grievances directly to jurisdictional officers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>{inspectors.length} Officers On Duty · {assignedTasks.length} Active Tasks</span>
          </span>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C2D27] dark:bg-[#143B30] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 animate-in slide-in-from-bottom">
          <CheckCircle2 className="h-4 w-4 text-[#C0E862]" />
          <span>{toastMessage}</span>
        </div>
      )}

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

      {/* ── Tabs: Inspectors Roster vs. Assigned Tasks & Inquiries ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1F4C3F] pb-2">
        <button
          onClick={() => { setActiveTab('inspectors'); setSelectedInspectorFilter(null) }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inspectors'
              ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white shadow-xs'
              : 'text-slate-600 dark:text-[#9DBBB2] hover:bg-slate-100 dark:hover:bg-[#122A23]'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Field Inspectors Roster ({inspectors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white shadow-xs'
              : 'text-slate-600 dark:text-[#9DBBB2] hover:bg-slate-100 dark:hover:bg-[#122A23]'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Assigned Tasks &amp; Inquiries ({assignedTasks.length})</span>
          {assignedTasks.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
              {assignedTasks.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inspector, docket code, worker, or site..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedInspectorFilter && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold">
              <span>Filtered: {selectedInspectorFilter}</span>
              <button onClick={() => setSelectedInspectorFilter(null)} className="hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="py-2 px-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white font-semibold"
          >
            <option value="All">All Districts</option>
            <option value="Surat">Surat Division</option>
            <option value="Ahmedabad">Ahmedabad Division</option>
            <option value="Vadodara">Vadodara Division</option>
            <option value="Rajkot">Rajkot Division</option>
            <option value="Gandhinagar">Gandhinagar Division</option>
          </select>
        </div>
      </div>

      {/* ── TAB 1: INSPECTORS ROSTER ── */}
      {activeTab === 'inspectors' && (
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
                <div
                  onClick={() => {
                    setSelectedInspectorFilter(insp.name)
                    setActiveTab('tasks')
                  }}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A3D33] p-1 rounded-xl transition-colors"
                  title="Click to view assigned tasks for this inspector"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Active Tasks</span>
                  <b className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">{insp.active_inspections} 📋</b>
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

              {/* Contact, View Tasks & Dispatch Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#1E483D] flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedInspectorFilter(insp.name)
                    setActiveTab('tasks')
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Tasks ({insp.active_inspections})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleOpenDispatch(insp)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0C2D27] dark:bg-[#1E4D40] hover:bg-[#123D34] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 text-[#C0E862]" />
                  <span>Dispatch Task</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: ASSIGNED TASKS & FIELD INQUIRIES LIST ── */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E483D] pb-3 mb-4">
              <div>
                <b className="text-base font-extrabold text-[#0C2D27] dark:text-white block">
                  All Active Assigned Tasks &amp; Inquiries ({filteredTasks.length})
                </b>
                <p className="text-xs text-slate-500 dark:text-[#9DBBB2]">
                  Worker grievances and on-site audit dockets assigned to field inspectors.
                </p>
              </div>

              {selectedInspectorFilter && (
                <button
                  onClick={() => setSelectedInspectorFilter(null)}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Show All Inspectors
                </button>
              )}
            </div>

            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-400 transition-all"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          {task.case_code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          task.priority === 'Critical'
                            ? 'bg-red-500 text-white'
                            : task.priority === 'High'
                            ? 'bg-[#FF6B53] text-white'
                            : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300">
                          Status: {task.status}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-[#9DBBB2] flex items-center gap-1 font-semibold">
                          <Clock className="h-3 w-3 text-amber-500" />
                          {task.scheduled_date}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 dark:text-[#9DBBB2] text-[10px] block">WORKER &amp; COMPLAINT</span>
                          <b className="text-[#0C2D27] dark:text-white">{task.worker_name}</b>
                          <p className="text-[11px] text-slate-500 dark:text-[#CBDCE1] line-clamp-1">
                            {task.instructions || task.category}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-[#9DBBB2] text-[10px] block">SITE LOCATION</span>
                          <div className="flex items-center gap-1 text-[#0C2D27] dark:text-white font-medium truncate">
                            <MapPin className="h-3 w-3 text-[#FF6B53] shrink-0" />
                            <span className="truncate">{task.workplace_site} ({task.location_district})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-[#1E483D]">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] text-right">
                        <span className="text-[10px] text-slate-400 dark:text-[#9DBBB2] block">ASSIGNED OFFICER</span>
                        <b className="text-xs text-[#0C2D27] dark:text-white block font-extrabold">{task.assigned_inspector_name}</b>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold">
                          {task.assigned_inspector_badge}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-[#9DBBB2]">
                No assigned tasks match the current search or inspector filter.
              </div>
            )}
          </div>
        </div>
      )}

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
                  Assigning to: <b>{selectedInspector.name}</b> ({selectedInspector.badge_number} - {selectedInspector.district} Division)
                </span>
              </div>
              <button onClick={() => setDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {dispatchSuccess ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <b className="text-sm font-bold text-[#0C2D27] dark:text-white block">Inspection Assignment Dispatched!</b>
                <p className="text-xs text-slate-500 dark:text-[#9DBBB2]">The case docket has been routed to the inspector's active workload.</p>
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
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Worksite Location Address</label>
                  <input
                    type="text"
                    value={workplaceSite}
                    onChange={(e) => setWorkplaceSite(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Investigation Timeline</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white font-semibold"
                  >
                    <option value="Immediate Action Required (Today)">Immediate Action Required (Today)</option>
                    <option value="Within 24 Hours">High Priority (Within 24 Hours)</option>
                    <option value="Within 48 Hours">Standard (Within 48 Hours)</option>
                    <option value="Scheduled Beat Visit (3-5 Days)">Routine Inspection Beat (3-5 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Official Instructions / Directives</label>
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
