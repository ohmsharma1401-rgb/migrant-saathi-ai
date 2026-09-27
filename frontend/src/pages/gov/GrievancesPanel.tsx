import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Search,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Film,
  Eye,
  Send,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react'
import { useTranslation } from '@/utils/translations'
import { inspectionService } from '@/services/inspection.service'

export interface ProofMedia {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
  size: string
}

// ─── DEMO DATA ──────────────────────────────────────────────────────────────
interface Grievance {
  id: string
  category: string
  description: string
  worker: string
  location: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Under Review' | 'Resolved'
  inspector: string
  inspectorBadge?: string
  created: string
  proofFiles?: ProofMedia[]
  notes?: string
}

interface InspectorOption {
  id: string
  name: string
  badge: string
  district: string
}

const DEFAULT_INSPECTORS: InspectorOption[] = [
  { id: 'ins-101', name: 'Rajendra Solanki', badge: 'INS-GJ-0418', district: 'Surat' },
  { id: 'ins-102', name: 'Anita Deshmukh', badge: 'INS-GJ-0209', district: 'Ahmedabad' },
  { id: 'ins-103', name: 'Vikram Rathod', badge: 'INS-GJ-0334', district: 'Vadodara' },
  { id: 'ins-104', name: 'Pravin Vaghela', badge: 'INS-GJ-0512', district: 'Rajkot' },
  { id: 'ins-105', name: 'Kavita Shah', badge: 'INS-GJ-0115', district: 'Gandhinagar' },
]

const ALL_GRIEVANCES: Grievance[] = [
  {
    id: 'GRV-2024-089',
    category: 'Safety',
    description: 'Worker reports unsafe scaffolding on construction site without helmets provided.',
    worker: 'Ramesh Kumar',
    location: 'Ahmedabad',
    priority: 'High',
    status: 'Open',
    inspector: 'Unassigned',
    created: '12 Jun 2024',
  },
  {
    id: 'GRV-2024-088',
    category: 'Wage',
    description: 'Wages not received for last 6 weeks. Employer unresponsive.',
    worker: 'Suresh Yadav',
    location: 'Surat',
    priority: 'High',
    status: 'Under Review',
    inspector: 'Rajendra Solanki',
    inspectorBadge: 'INS-GJ-0418',
    created: '11 Jun 2024',
  },
  {
    id: 'GRV-2024-087',
    category: 'Safety',
    description: 'Chemical exposure at textile unit — no protective equipment issued.',
    worker: 'Anita Devi',
    location: 'Surat',
    priority: 'Critical',
    status: 'Open',
    inspector: 'Unassigned',
    created: '10 Jun 2024',
  },
  {
    id: 'GRV-2024-086',
    category: 'Harassment',
    description: 'Verbal harassment by supervisor reported by worker.',
    worker: 'Mohammad Khan',
    location: 'Ahmedabad',
    priority: 'High',
    status: 'Open',
    inspector: 'Unassigned',
    created: '9 Jun 2024',
  },
  {
    id: 'GRV-2024-085',
    category: 'Conditions',
    description: 'Overcrowded dormitory — 18 workers sharing space for 6.',
    worker: 'Pradeep Mishra',
    location: 'Vadodara',
    priority: 'Medium',
    status: 'Under Review',
    inspector: 'Vikram Rathod',
    inspectorBadge: 'INS-GJ-0334',
    created: '7 Jun 2024',
  },
  {
    id: 'GRV-2024-084',
    category: 'Wage',
    description: 'Deductions applied without explanation to monthly wages.',
    worker: 'Santosh Kumar',
    location: 'Rajkot',
    priority: 'Medium',
    status: 'Under Review',
    inspector: 'Pravin Vaghela',
    inspectorBadge: 'INS-GJ-0512',
    created: '5 Jun 2024',
  },
  {
    id: 'GRV-2024-083',
    category: 'Other',
    description: 'Identity documents withheld by employer.',
    worker: 'Arjun Singh',
    location: 'Surat',
    priority: 'High',
    status: 'Open',
    inspector: 'Unassigned',
    created: '3 Jun 2024',
  },
  {
    id: 'GRV-2024-082',
    category: 'Conditions',
    description: 'No clean drinking water available at worksite.',
    worker: 'Ravi Patel',
    location: 'Gandhinagar',
    priority: 'Low',
    status: 'Resolved',
    inspector: 'Kavita Shah',
    inspectorBadge: 'INS-GJ-0115',
    created: '1 Jun 2024',
  },
]

const PRIORITY_BADGE: Record<string, string> = {
  Critical: 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
  High:     'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30',
  Medium:   'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
  Low:      'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30',
}

const STATUS_BADGE: Record<string, string> = {
  Open:           'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
  'Under Review': 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
  Resolved:       'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
}

const CATEGORY_BADGE: Record<string, string> = {
  Safety:     'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  Wage:       'bg-red-500/10 text-red-700 dark:text-red-300',
  Harassment: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  Conditions: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Other:      'bg-slate-500/10 text-slate-700 dark:text-slate-300',
}

const INITIAL_STATUS_HISTORY: Record<string, { date: string; action: string; by: string }[]> = {
  'GRV-2024-088': [
    { date: '11 Jun 2024', action: 'Grievance submitted by worker', by: 'Worker' },
    { date: '12 Jun 2024', action: 'Assigned to Inspector Rajendra Solanki (Surat)', by: 'Gov Official' },
    { date: '13 Jun 2024', action: 'Field inspection scheduled at workplace', by: 'Rajendra Solanki' },
  ],
  'GRV-2024-085': [
    { date: '7 Jun 2024', action: 'Grievance submitted by worker', by: 'Worker' },
    { date: '8 Jun 2024', action: 'Assigned to Inspector Vikram Rathod (Vadodara)', by: 'Gov Official' },
  ],
  'GRV-2024-084': [
    { date: '5 Jun 2024', action: 'Grievance submitted by worker', by: 'Worker' },
    { date: '6 Jun 2024', action: 'Assigned to Inspector Pravin Vaghela (Rajkot)', by: 'Gov Official' },
  ],
}

export default function GrievancesPanel() {
  const { t, lang } = useTranslation()
  const [grievanceList, setGrievanceList] = useState<Grievance[]>(ALL_GRIEVANCES)
  const [statusHistory, setStatusHistory] = useState<Record<string, { date: string; action: string; by: string }[]>>(INITIAL_STATUS_HISTORY)
  const [inspectors, setInspectors] = useState<InspectorOption[]>(DEFAULT_INSPECTORS)

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatus]       = useState('All')
  const [catFilter, setCat]             = useState('All')
  const [priFilter, setPri]             = useState('All')

  // Selected for slide-over drawer
  const [selected, setSelected]         = useState<Grievance | null>(null)
  const [activeNotes, setActiveNotes]   = useState('')

  // Assign inspector modal state
  const [assigningGrievance, setAssigningGrievance] = useState<Grievance | null>(null)
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('ins-101')
  const [scheduledTimeline, setScheduledTimeline]   = useState('Within 24 Hours')
  const [officialInstructions, setOfficialInstructions] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const [toastMessage, setToastMessage] = useState('')
  const [previewMedia, setPreviewMedia] = useState<ProofMedia | null>(null)

  function getCatName(cat: string) {
    if (lang === 'hi') {
      if (cat === 'Wage') return 'वेतन'
      if (cat === 'Safety') return 'सुरक्षा'
      if (cat === 'Harassment') return 'उत्पीड़न'
      if (cat === 'Conditions') return 'स्थितियां'
      return 'अन्य'
    }
    if (lang === 'gu') {
      if (cat === 'Wage') return 'વેતન'
      if (cat === 'Safety') return 'સુરક્ષા'
      if (cat === 'Harassment') return 'હેરાનગતિ'
      if (cat === 'Conditions') return 'સ્થિતિઓ'
      return 'અન્ય'
    }
    return cat
  }

  function getPriName(pri: string) {
    if (lang === 'hi') {
      if (pri === 'Critical') return 'गंभीर'
      if (pri === 'High') return 'उच्च'
      if (pri === 'Medium') return 'मध्यम'
      return 'निम्न'
    }
    if (lang === 'gu') {
      if (pri === 'Critical') return 'ગંભીર'
      if (pri === 'High') return 'ઉચ્ચ'
      if (pri === 'Medium') return 'મધ્યમ'
      return 'ઓછું'
    }
    return pri
  }

  function getStatusName(status: string) {
    if (lang === 'hi') {
      if (status === 'Open') return 'खुला'
      if (status === 'Under Review') return 'समीक्षाधीन'
      if (status === 'Resolved') return 'समाधान किया'
      return status
    }
    if (lang === 'gu') {
      if (status === 'Open') return 'ખુલ્લું'
      if (status === 'Under Review') return 'સમીક્ષા હેઠળ'
      if (status === 'Resolved') return 'ઉકેલાયેલ'
      return status
    }
    return status
  }

  function getInspName(insp: string) {
    if (insp === 'Unassigned' || !insp) {
      return lang === 'hi' ? 'अनावंटित' : lang === 'gu' ? 'અણફાળવેલ' : 'Unassigned'
    }
    return insp
  }

  // Load and merge persistent assignments and custom worker grievances
  useEffect(() => {
    try {
      // Load saved assignments map
      const savedAssignmentsStr = localStorage.getItem('saathi-assigned-grievances')
      const assignmentsMap: Record<string, { inspector: string; inspectorBadge?: string; status: 'Open' | 'Under Review' | 'Resolved'; notes?: string }> =
        savedAssignmentsStr ? JSON.parse(savedAssignmentsStr) : {}

      // Load saved status history
      const savedHistoryStr = localStorage.getItem('saathi-grievance-history')
      if (savedHistoryStr) {
        setStatusHistory((prev) => ({ ...prev, ...JSON.parse(savedHistoryStr) }))
      }

      // Load custom worker grievances
      const customStr = localStorage.getItem('saathi-custom-grievances') || localStorage.getItem('saathi-user-grievances')
      let customItems: Grievance[] = []
      if (customStr) {
        const parsed = JSON.parse(customStr)
        if (Array.isArray(parsed) && parsed.length > 0) {
          customItems = parsed.map((item: any) => ({
            id: item.id || `GRV-${Date.now()}`,
            category: item.category || 'Safety',
            description: item.description || '',
            worker: item.worker || 'Registered Worker',
            location: item.location || 'Surat, Gujarat',
            priority: (item.priority === 'Critical' ? 'Critical' : item.priority === 'High' ? 'High' : item.priority === 'Low' ? 'Low' : 'Medium') as any,
            status: (item.status === 'under_review' || item.status === 'Under Review' ? 'Under Review' : item.status === 'resolved' || item.status === 'Resolved' ? 'Resolved' : 'Open') as any,
            inspector: item.inspector || 'Unassigned',
            inspectorBadge: item.inspectorBadge || undefined,
            created: item.created || item.submittedAgo || 'Today',
            proofFiles: item.proofFiles || item.proof_media || [],
            notes: item.notes || ''
          }))
        }
      }

      // Merge custom items with demo list
      const combined = [...customItems, ...ALL_GRIEVANCES]

      // Apply saved assignments
      const finalItems = combined.map((g) => {
        if (assignmentsMap[g.id]) {
          return {
            ...g,
            inspector: assignmentsMap[g.id].inspector,
            inspectorBadge: assignmentsMap[g.id].inspectorBadge || g.inspectorBadge,
            status: assignmentsMap[g.id].status,
            notes: assignmentsMap[g.id].notes !== undefined ? assignmentsMap[g.id].notes : g.notes
          }
        }
        return g
      })

      setGrievanceList(finalItems)
    } catch {
      // Fallback
    }

    // Also fetch live inspector workloads from inspectionService
    inspectionService.getInspectorsWorkload().then((res) => {
      if (res?.data && res.data.length > 0) {
        const mapped = res.data.map((i) => ({
          id: i.id,
          name: i.name,
          badge: i.badge_number,
          district: i.district
        }))
        setInspectors(mapped)
      }
    }).catch(() => {})
  }, [])

  // Open assign modal and smartly select default inspector by grievance location
  function handleOpenAssignModal(g: Grievance) {
    setAssigningGrievance(g)
    setOfficialInstructions(g.notes || '')

    // Match inspector by district if possible
    const loc = g.location.toLowerCase()
    const matched = inspectors.find((i) => loc.includes(i.district.toLowerCase()))
    if (matched) {
      setSelectedInspectorId(matched.id)
    } else if (inspectors.length > 0) {
      setSelectedInspectorId(inspectors[0].id)
    }
  }

  // Handle assignment execution
  async function handleAssignSubmit() {
    if (!assigningGrievance) return
    setIsAssigning(true)
    const targetInspector = inspectors.find((i) => i.id === selectedInspectorId) || inspectors[0]
    const gId = assigningGrievance.id
    const inspName = targetInspector.name
    const inspBadge = targetInspector.badge

    // 1. Update React state
    const updatedList = grievanceList.map((g) =>
      g.id === gId
        ? {
            ...g,
            inspector: inspName,
            inspectorBadge: inspBadge,
            status: 'Under Review' as const,
            notes: officialInstructions.trim() || g.notes
          }
        : g
    )
    setGrievanceList(updatedList)

    // Update selected if currently viewing this grievance
    if (selected && selected.id === gId) {
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              inspector: inspName,
              inspectorBadge: inspBadge,
              status: 'Under Review' as const,
              notes: officialInstructions.trim() || prev.notes
            }
          : null
      )
      setActiveNotes(officialInstructions.trim())
    }

    // 2. Update Timeline History
    const newHistoryEvent = {
      date: 'Today, ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      action: `Assigned to Inspector ${inspName} (${inspBadge}) [${scheduledTimeline}]`,
      by: 'Gov Official'
    }
    const updatedHistory = {
      ...statusHistory,
      [gId]: [newHistoryEvent, ...(statusHistory[gId] || [{ date: assigningGrievance.created, action: 'Grievance submitted by worker', by: 'Worker' }])]
    }
    setStatusHistory(updatedHistory)
    localStorage.setItem('saathi-grievance-history', JSON.stringify(updatedHistory))

    // 3. Persist to saathi-assigned-grievances map
    try {
      const savedStr = localStorage.getItem('saathi-assigned-grievances')
      const assignmentsMap = savedStr ? JSON.parse(savedStr) : {}
      assignmentsMap[gId] = {
        inspector: inspName,
        inspectorBadge: inspBadge,
        status: 'Under Review',
        notes: officialInstructions.trim()
      }
      localStorage.setItem('saathi-assigned-grievances', JSON.stringify(assignmentsMap))
    } catch {}

    // 4. Update in saathi-custom-grievances if custom worker grievance
    try {
      const customStr = localStorage.getItem('saathi-custom-grievances')
      if (customStr) {
        const customItems = JSON.parse(customStr)
        if (Array.isArray(customItems)) {
          const updatedCustom = customItems.map((item: any) => {
            if (item.id === gId) {
              const prevUpdates = item.updates || []
              return {
                ...item,
                inspector: inspName,
                inspectorBadge: inspBadge,
                status: 'under_review',
                updates: [
                  {
                    date: 'Today',
                    text: `Field Inspector ${inspName} (${inspBadge}) assigned by Gujarat Labour Department for on-site inquiry.`
                  },
                  ...prevUpdates
                ]
              }
            }
            return item
          })
          localStorage.setItem('saathi-custom-grievances', JSON.stringify(updatedCustom))
        }
      }
    } catch {}

    // 5. Connect to inspectionService to route docket to field inspector
    try {
      await inspectionService.assignGrievanceToInspector({
        grievance_id: gId,
        inspector_id: targetInspector.id,
        scheduled_date: scheduledTimeline,
        priority: assigningGrievance.priority,
        official_notes: officialInstructions.trim() || `Dispatched for on-site inquiry: ${assigningGrievance.description}`
      })
    } catch (err) {
      console.warn('Inspection backend sync:', err)
    }

    setIsAssigning(false)
    setAssigningGrievance(null)
    setToastMessage(`✓ Grievance ${gId} successfully assigned to ${inspName} (${inspBadge})`)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handle status update from detail panel
  function handleStatusChange(newStatus: 'Open' | 'Under Review' | 'Resolved') {
    if (!selected) return
    const gId = selected.id

    const updatedList = grievanceList.map((g) =>
      g.id === gId ? { ...g, status: newStatus } : g
    )
    setGrievanceList(updatedList)
    setSelected((prev) => (prev ? { ...prev, status: newStatus } : null))

    // Update history
    const newEvent = {
      date: 'Today',
      action: `Status updated to "${newStatus}"`,
      by: 'Gov Official'
    }
    const updatedHistory = {
      ...statusHistory,
      [gId]: [newEvent, ...(statusHistory[gId] || [])]
    }
    setStatusHistory(updatedHistory)
    localStorage.setItem('saathi-grievance-history', JSON.stringify(updatedHistory))

    // Save in assignments map
    try {
      const savedStr = localStorage.getItem('saathi-assigned-grievances')
      const assignmentsMap = savedStr ? JSON.parse(savedStr) : {}
      assignmentsMap[gId] = {
        ...(assignmentsMap[gId] || {}),
        status: newStatus
      }
      localStorage.setItem('saathi-assigned-grievances', JSON.stringify(assignmentsMap))
    } catch {}

    setToastMessage(`Status for ${gId} changed to ${newStatus}`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Handle saving inspector notes from detail panel
  function handleSaveNotes() {
    if (!selected) return
    const gId = selected.id
    const updatedList = grievanceList.map((g) =>
      g.id === gId ? { ...g, notes: activeNotes } : g
    )
    setGrievanceList(updatedList)
    setSelected((prev) => (prev ? { ...prev, notes: activeNotes } : null))

    try {
      const savedStr = localStorage.getItem('saathi-assigned-grievances')
      const assignmentsMap = savedStr ? JSON.parse(savedStr) : {}
      assignmentsMap[gId] = {
        ...(assignmentsMap[gId] || {}),
        notes: activeNotes
      }
      localStorage.setItem('saathi-assigned-grievances', JSON.stringify(assignmentsMap))
    } catch {}

    setToastMessage(`Official notes saved for ${gId}`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const filtered = grievanceList.filter((g) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      g.worker.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.inspector.toLowerCase().includes(q) ||
      g.location.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || g.status === statusFilter
    const matchCat    = catFilter    === 'All' || g.category === catFilter
    const matchPri    = priFilter    === 'All' || g.priority === priFilter
    return matchSearch && matchStatus && matchCat && matchPri
  })

  const total    = grievanceList.length
  const open     = grievanceList.filter(g => g.status === 'Open').length
  const review   = grievanceList.filter(g => g.status === 'Under Review').length
  const resolved = grievanceList.filter(g => g.status === 'Resolved').length

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              {t('nav_gov_grievances')} &amp; Labour Enforcement Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            {lang === 'hi'
              ? 'श्रमिकों की सुरक्षा रिपोर्ट और शिकायतों की समीक्षा करें और श्रम निरीक्षकों को आवंटित करें'
              : lang === 'gu'
              ? 'શ્રમિકોની સુરક્ષા અને ફરિયાદોની સમીક્ષા કરો અને શ્રમ નિરીક્ષકોને ફાળવો'
              : 'Review worker safety reports, wage complaints, and dispatch field inspectors across districts.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-[#9DBBB2]">
          <span>Active Inspectors:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold">
            {inspectors.length} Officers on Duty
          </span>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[
          { label: lang === 'hi' ? 'कुल शिकायतें' : lang === 'gu' ? 'કુલ ફરિયાદો' : 'Total Grievances', value: total,    color: 'border-l-slate-400',  icon: <AlertCircle className="h-4 w-4 text-slate-500" />,  numColor: 'text-[#0C2D27] dark:text-white' },
          { label: lang === 'hi' ? 'लंबित (खुला)' : lang === 'gu' ? 'બાકી (ખુલ્લું)' : 'Open / Unassigned', value: open,     color: 'border-l-red-500',    icon: <Clock className="h-4 w-4 text-red-500" />,  numColor: 'text-red-600 dark:text-red-400' },
          { label: lang === 'hi' ? 'समीक्षाधीन' : lang === 'gu' ? 'સમીક્ષા હેઠળ' : 'Under Investigation', value: review,   color: 'border-l-blue-500',   icon: <UserCheck className="h-4 w-4 text-blue-500" />, numColor: 'text-blue-600 dark:text-blue-400' },
          { label: lang === 'hi' ? 'समाधान किया गया' : lang === 'gu' ? 'ઉકેલાયેલ' : 'Resolved & Closed', value: resolved, color: 'border-l-emerald-500', icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, numColor: 'text-emerald-600 dark:text-emerald-400' },
        ].map((c) => (
          <div
            key={c.label}
            className={`p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] border-l-4 ${c.color} shadow-xs flex items-center gap-3.5`}
          >
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#15342B] shrink-0">{c.icon}</div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500 dark:text-[#9DBBB2] uppercase tracking-wider truncate">{c.label}</p>
              <p className={`text-2xl font-black ${c.numColor}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters & Search ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px] flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9DBBB2]">
            {lang === 'hi' ? 'खोजें' : lang === 'gu' ? 'શોધો' : 'Search Grievances'}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'hi' ? 'आईडी, श्रमिक या विवरण द्वारा खोजें...' : lang === 'gu' ? 'આઇડી, શ્રમિક કે વિગત વડે શોધો...' : 'Search by ID, worker, inspector, or city...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {[
          { label: lang === 'hi' ? 'स्थिति' : lang === 'gu' ? 'સ્થિતિ' : 'Status',   val: statusFilter, set: setStatus, opts: ['All', 'Open', 'Under Review', 'Resolved'] },
          { label: lang === 'hi' ? 'श्रेणी' : lang === 'gu' ? 'કેટેગરી' : 'Category', val: catFilter,    set: setCat,    opts: ['All', 'Wage', 'Safety', 'Harassment', 'Conditions', 'Other'] },
          { label: lang === 'hi' ? 'प्राथमिकता' : lang === 'gu' ? 'પ્રાધાન્ય' : 'Priority', val: priFilter,    set: setPri,    opts: ['All', 'Critical', 'High', 'Medium', 'Low'] },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#9DBBB2]">{f.label}</label>
            <select
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className="py-2 px-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs font-semibold text-[#0C2D27] dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {f.opts.map((o) => (
                <option key={o} value={o}>
                  {o === 'All' ? (lang === 'hi' ? 'सभी' : lang === 'gu' ? 'તમામ' : 'All') : f.label.includes('Status') || f.label.includes('स्थिति') || f.label.includes('સ્થિતિ') ? getStatusName(o) : f.label.includes('Category') || f.label.includes('श्रेणी') || f.label.includes('કેટેગરી') ? getCatName(o) : getPriName(o)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* ── Grievances Table ── */}
      <div className="rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1F4C3F] text-slate-400 dark:text-[#9DBBB2] uppercase text-[10px] font-bold bg-slate-50/70 dark:bg-[#091D17]">
                <th className="py-3 px-4">{lang === 'hi' ? 'आईडी' : lang === 'gu' ? 'આઇડી' : 'Docket ID'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'श्रेणी' : lang === 'gu' ? 'કેટેગરી' : 'Category'}</th>
                <th className="py-3 px-4 max-w-[240px]">{lang === 'hi' ? 'विवरण' : lang === 'gu' ? 'વિગત' : 'Complaint'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'श्रमिक' : lang === 'gu' ? 'શ્રમિક' : 'Worker'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'स्थान' : lang === 'gu' ? 'સ્થળ' : 'Location'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'प्राथमिकता' : lang === 'gu' ? 'પ્રાધાન્ય' : 'Priority'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'स्थिति' : lang === 'gu' ? 'સ્થિતિ' : 'Status'}</th>
                <th className="py-3 px-4">{lang === 'hi' ? 'निरीक्षक' : lang === 'gu' ? 'નિરીક્ષક' : 'Assigned Inspector'}</th>
                <th className="py-3 px-4 text-center">{lang === 'hi' ? 'कार्रवाई' : lang === 'gu' ? 'કાર્યવાહી' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E483D]">
              {filtered.map((g) => {
                const isAssigned = g.inspector && g.inspector !== 'Unassigned'
                return (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-[#122A23] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-[#0C2D27] dark:text-white whitespace-nowrap">
                      {g.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${CATEGORY_BADGE[g.category] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        {getCatName(g.category)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-[#CBDCE1] max-w-[240px]">
                      <p className="line-clamp-2 leading-relaxed">{g.description}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0C2D27] dark:text-white whitespace-nowrap">
                      {g.worker}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#9DBBB2] whitespace-nowrap">
                      {g.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${PRIORITY_BADGE[g.priority]}`}>
                        {g.priority === 'Critical' ? '🔴 ' : g.priority === 'High' ? '🟠 ' : ''}{getPriName(g.priority)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[g.status]}`}>
                        {getStatusName(g.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isAssigned ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <div>
                            <b className="text-xs text-[#0C2D27] dark:text-white block font-bold truncate max-w-[130px]">
                              {g.inspector}
                            </b>
                            {g.inspectorBadge && (
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-semibold">
                                {g.inspectorBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-[#9DBBB2]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 justify-center">
                        <button
                          onClick={() => handleOpenAssignModal(g)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1 ${
                            isAssigned
                              ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <Send className="h-3 w-3" />
                          <span>{isAssigned ? 'Reassign' : 'Assign'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelected(g)
                            setActiveNotes(g.notes || '')
                          }}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#16382E] hover:bg-slate-200 dark:hover:bg-[#1F4C3F] text-[#0C2D27] dark:text-white transition-colors cursor-pointer"
                        >
                          {lang === 'hi' ? 'विवरण' : lang === 'gu' ? 'વિગતો' : 'Details'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C2D27] dark:bg-[#143B30] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 animate-in slide-in-from-bottom">
          <CheckCircle className="h-4 w-4 text-[#C0E862]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Assign Inspector Modal ── */}
      {assigningGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E483D] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0C2D27] dark:text-white">
                    Assign Field Labour Inspector
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#9DBBB2]">
                    Dispatch grievance docket for physical worksite audit
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAssigningGrievance(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#9DBBB2]">Docket ID:</span>
                <b className="font-mono text-amber-600 dark:text-amber-400 font-bold">{assigningGrievance.id}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#9DBBB2]">Complainant Worker:</span>
                <b className="text-[#0C2D27] dark:text-white">{assigningGrievance.worker}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#9DBBB2]">Worksite Location:</span>
                <b className="text-[#0C2D27] dark:text-white">{assigningGrievance.location}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-[#9DBBB2]">Category &amp; Priority:</span>
                <span className="font-bold text-[#0C2D27] dark:text-white">
                  {assigningGrievance.category} · {assigningGrievance.priority} Priority
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Select Jurisdictional Field Inspector
                </label>
                <select
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-3 text-xs text-[#0C2D27] dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {inspectors.map((insp) => (
                    <option key={insp.id} value={insp.id}>
                      {insp.name} — {insp.district} Division ({insp.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Investigation SLA / Timeline
                </label>
                <select
                  value={scheduledTimeline}
                  onChange={(e) => setScheduledTimeline(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-xs text-[#0C2D27] dark:text-white font-semibold"
                >
                  <option value="Immediate (Today)">Immediate Action Required (Today)</option>
                  <option value="Within 24 Hours">High Priority (Within 24 Hours)</option>
                  <option value="Within 48 Hours">Standard Priority (Within 48 Hours)</option>
                  <option value="Scheduled Beat Visit (3-5 Days)">Routine Inspection Beat (3-5 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Official Instructions to Inspector (Optional)
                </label>
                <textarea
                  rows={2}
                  value={officialInstructions}
                  onChange={(e) => setOfficialInstructions(e.target.value)}
                  placeholder="e.g. Verify Form XVII wage registers for unpaid overtime and inspect scaffolding safety gear."
                  className="w-full rounded-2xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAssigningGrievance(null)}
                className="flex-1 bg-slate-100 dark:bg-[#16382E] hover:bg-slate-200 dark:hover:bg-[#1F4C3F] text-slate-700 dark:text-slate-200 font-bold text-xs py-3 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
                disabled={isAssigning}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs py-3 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isAssigning ? 'Dispatching...' : 'Confirm Assignment ✓'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grievance Details Slide-Over Drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in">
          {/* Backdrop */}
          <div className="flex-1 bg-black/60 backdrop-blur-xs" onClick={() => setSelected(null)} />

          {/* Side Panel */}
          <div className="w-full max-w-lg bg-white dark:bg-[#0D241E] border-l border-slate-200 dark:border-[#1F4C3F] shadow-2xl flex flex-col overflow-y-auto">
            {/* Panel Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-[#1E483D] bg-slate-50/70 dark:bg-[#091D17]">
              <div>
                <p className="text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400">{selected.id}</p>
                <h2 className="text-base font-extrabold text-[#0C2D27] dark:text-white mt-0.5">
                  Grievance Docket File
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#16382E] text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Quick Assignment Status Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                    Assigned Inspector
                  </span>
                  <b className="text-sm font-black text-[#0C2D27] dark:text-white block">
                    {selected.inspector && selected.inspector !== 'Unassigned'
                      ? selected.inspector
                      : 'Not Assigned Yet'}
                  </b>
                  {selected.inspectorBadge && (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                      Badge: {selected.inspectorBadge}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenAssignModal(selected)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-colors shrink-0"
                >
                  {selected.inspector && selected.inspector !== 'Unassigned' ? 'Reassign' : 'Assign Now'}
                </button>
              </div>

              {/* Complaint Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 dark:text-[#9DBBB2] uppercase tracking-wider">
                  Complaint Particulars
                </h3>
                <div className="bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">Complainant Workman:</span>
                    <span className="font-bold text-[#0C2D27] dark:text-white">{selected.worker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">Location / Jurisdiction:</span>
                    <span className="font-bold text-[#0C2D27] dark:text-white">{selected.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">Category:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${CATEGORY_BADGE[selected.category] ?? 'bg-slate-100 text-slate-700'}`}>
                      {selected.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">Priority:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[selected.priority]}`}>
                      {selected.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">Current Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-[#1F4C3F]">
                    <p className="text-slate-400 dark:text-[#9DBBB2] font-semibold mb-1">Factual Description:</p>
                    <p className="text-[#0C2D27] dark:text-[#CBDCE1] leading-relaxed">{selected.description}</p>
                  </div>

                  {/* Attached Proof Media Section */}
                  {selected.proofFiles && selected.proofFiles.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-[#1F4C3F] space-y-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <Camera className="h-4 w-4 text-amber-500" /> Uploaded Proof ({selected.proofFiles.length} Files)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selected.proofFiles.map((pf) => (
                          <div
                            key={pf.id}
                            onClick={() => setPreviewMedia(pf)}
                            className="relative group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden h-24 cursor-pointer shadow-xs hover:scale-102 transition-transform"
                          >
                            {pf.type === 'image' ? (
                              <img src={pf.url} alt={pf.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                <video src={pf.url} className="w-full h-full object-cover opacity-70" />
                                <Film className="h-6 w-6 absolute text-white" />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                              <Eye className="h-3.5 w-3.5" /> Inspect Evidence
                            </div>

                            <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] truncate">
                              {pf.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 dark:text-[#9DBBB2] uppercase tracking-wider">
                  Audit &amp; Assignment Trail
                </h3>
                <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F]">
                  {(statusHistory[selected.id] ?? [
                    { date: selected.created, action: 'Grievance submitted by worker', by: 'Worker' },
                  ]).map((ev, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                        {i < (statusHistory[selected.id] ?? [{}]).length - 1 && (
                          <div className="w-px flex-1 bg-slate-200 dark:bg-[#1E483D] my-1" />
                        )}
                      </div>
                      <div className="pb-1.5 min-w-0">
                        <p className="font-bold text-[#0C2D27] dark:text-white">{ev.action}</p>
                        <p className="text-[11px] text-slate-400 dark:text-[#9DBBB2]">{ev.date} · {ev.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official / Inspector Notes Form */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-[#9DBBB2] uppercase tracking-wider">
                    Official Directive / Direct Notes
                  </h3>
                  <button
                    onClick={handleSaveNotes}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={activeNotes}
                  onChange={(e) => setActiveNotes(e.target.value)}
                  placeholder="Record instructions for field inspector or internal department commentary..."
                  className="w-full rounded-2xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-3 text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
                />
              </div>

              {/* Status Update Form */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1E483D]">
                <h3 className="text-xs font-bold text-slate-400 dark:text-[#9DBBB2] uppercase tracking-wider">
                  Update Docket Status
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['Open', 'Under Review', 'Resolved'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`text-xs font-bold py-2 px-2 rounded-xl border transition-all cursor-pointer ${
                        selected.status === s
                          ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-[#122A23] border-slate-200 dark:border-[#1F4C3F] text-slate-600 dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#16382E]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Proof Inspection Modal ── */}
      {previewMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-150">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-4 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                {previewMedia.type === 'image' ? <Camera className="h-4 w-4 text-emerald-400" /> : <Film className="h-4 w-4 text-red-400" />}
                Evidence Inspection: {previewMedia.name} ({previewMedia.size})
              </span>
              <button onClick={() => setPreviewMedia(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              {previewMedia.type === 'image' ? (
                <img src={previewMedia.url} alt="Evidence proof preview" className="max-h-[65vh] w-auto object-contain" />
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
