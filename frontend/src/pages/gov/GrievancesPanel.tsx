import { useState, useEffect } from 'react'
import { AlertTriangle, Search, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'

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
  created: string
}

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
    inspector: 'Insp. Sharma',
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
    inspector: 'Insp. Patel',
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
    inspector: 'Insp. Verma',
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
    inspector: 'Insp. Joshi',
    created: '1 Jun 2024',
  },
]

const PRIORITY_BADGE: Record<string, string> = {
  Critical: 'bg-red-100 text-red-800 border border-red-200',
  High:     'bg-orange-100 text-orange-800 border border-orange-200',
  Medium:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Low:      'bg-gray-100 text-gray-600 border border-gray-200',
}

const STATUS_BADGE: Record<string, string> = {
  Open:           'bg-red-50 text-red-700 border border-red-200',
  'Under Review': 'bg-blue-50 text-blue-700 border border-blue-200',
  Resolved:       'bg-green-50 text-green-700 border border-green-200',
}

const CATEGORY_BADGE: Record<string, string> = {
  Safety:     'bg-orange-50 text-orange-700',
  Wage:       'bg-red-50 text-red-700',
  Harassment: 'bg-purple-50 text-purple-700',
  Conditions: 'bg-yellow-50 text-yellow-800',
  Other:      'bg-gray-100 text-gray-700',
}

const STATUS_HISTORY: Record<string, { date: string; action: string; by: string }[]> = {
  'GRV-2024-088': [
    { date: '11 Jun 2024', action: 'Grievance submitted', by: 'Worker' },
    { date: '12 Jun 2024', action: 'Assigned to Insp. Sharma', by: 'System' },
    { date: '13 Jun 2024', action: 'Field visit scheduled', by: 'Insp. Sharma' },
  ],
}
// ─────────────────────────────────────────────────────────────────────────────

export default function GrievancesPanel() {
  const [grievanceList, setGrievanceList] = useState<Grievance[]>(ALL_GRIEVANCES)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('All')
  const [catFilter, setCat]       = useState('All')
  const [priFilter, setPri]       = useState('All')
  const [selected, setSelected]   = useState<Grievance | null>(null)
  const [assigningGrievance, setAssigningGrievance] = useState<Grievance | null>(null)
  const [selectedInspector, setSelectedInspector] = useState('Insp. Arjun Patel')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saathi-user-grievances')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mappedCustom: Grievance[] = parsed.map((item: any) => ({
            id: item.id,
            category: item.category,
            description: item.description,
            worker: item.worker || 'Registered Worker',
            location: item.location || 'Ahmedabad',
            priority: item.priority === 'High' ? 'High' : item.priority === 'Critical' ? 'Critical' : 'Medium',
            status: item.status === 'open' ? 'Open' : item.status === 'under_review' ? 'Under Review' : 'Resolved',
            inspector: item.inspector || 'Unassigned',
            created: item.created || 'Today',
          }))
          setGrievanceList([...mappedCustom, ...ALL_GRIEVANCES])
        }
      }
    } catch {
      // fallback
    }
  }, [])

  const INSPECTORS = [
    'Insp. Arjun Patel (Ahmedabad)',
    'Insp. Vikram Sharma (Surat)',
    'Insp. Sunita Verma (Vadodara)',
    'Insp. Rajesh Joshi (Rajkot)'
  ]

  const handleAssignSubmit = (gId: string) => {
    const inspName = selectedInspector.split(' (')[0]
    setGrievanceList((prev) =>
      prev.map((g) =>
        g.id === gId ? { ...g, inspector: inspName, status: 'Under Review' } : g
      )
    )
    if (selected && selected.id === gId) {
      setSelected((prev) => prev ? { ...prev, inspector: inspName, status: 'Under Review' } : null)
    }
    setToastMessage(`Grievance ${gId} assigned to ${inspName}`)
    setAssigningGrievance(null)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const filtered = grievanceList.filter((g) => {
    const q = search.toLowerCase()
    const matchSearch = !q || g.worker.toLowerCase().includes(q) || g.id.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
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
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Safety &amp; Grievances
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage worker safety reports and grievances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Grievances', value: total,    color: 'border-l-gray-400',   icon: <AlertCircle className="h-4 w-4 text-gray-500" />,  bg: 'bg-gray-50'   },
          { label: 'Open',             value: open,     color: 'border-l-red-500',    icon: <Clock        className="h-4 w-4 text-red-500"  />,  bg: 'bg-red-50'    },
          { label: 'Under Review',     value: review,   color: 'border-l-blue-500',   icon: <Clock        className="h-4 w-4 text-blue-500" />,  bg: 'bg-blue-50'   },
          { label: 'Resolved',         value: resolved, color: 'border-l-green-500',  icon: <CheckCircle  className="h-4 w-4 text-green-500" />, bg: 'bg-green-50'  },
        ].map((c) => (
          <div key={c.label} className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${c.color} p-4 flex items-center gap-4`}>
            <div className={`p-2 rounded-lg ${c.bg}`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, worker, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {[
          { label: 'Status',   val: statusFilter, set: setStatus, opts: ['All', 'Open', 'Under Review', 'Resolved'] },
          { label: 'Category', val: catFilter,    set: setCat,    opts: ['All', 'Wage', 'Safety', 'Harassment', 'Conditions', 'Other'] },
          { label: 'Priority', val: priFilter,    set: setPri,    opts: ['All', 'Low', 'Medium', 'High', 'Critical'] },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">{f.label}</label>
            <select
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {f.opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold max-w-[220px]">Description</th>
                <th className="px-4 py-3 font-semibold">Worker</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Inspector</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((g, idx) => (
                <tr key={g.id} className={`hover:bg-indigo-50/20 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{g.id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[g.category] ?? 'bg-gray-100 text-gray-700'}`}>
                      {g.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[220px]">
                    <p className="line-clamp-2">{g.description}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{g.worker}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{g.location}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[g.priority]}`}>
                      {g.priority === 'Critical' ? '🔴 ' : g.priority === 'High' ? '🟠 ' : ''}{g.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[g.status]}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{g.inspector}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{g.created}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <button
                        onClick={() => setAssigningGrievance(g)}
                        className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-2 py-1 rounded transition-colors whitespace-nowrap"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setSelected(g)}
                        className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded transition-colors whitespace-nowrap"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-800 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Assign Inspector Modal */}
      {assigningGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Assign Labour Inspector</h3>
              <button onClick={() => setAssigningGrievance(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Assigning inspector for case <span className="font-mono font-bold text-gray-800">{assigningGrievance.id}</span> ({assigningGrievance.category} Issue in {assigningGrievance.location}).
              </p>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Select Field Inspector</label>
                <select
                  value={selectedInspector}
                  onChange={(e) => setSelectedInspector(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {INSPECTORS.map((insp) => (
                    <option key={insp} value={insp}>{insp}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAssigningGrievance(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignSubmit(assigningGrievance.id)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel / Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={() => setSelected(null)} />

          {/* Side Panel */}
          <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto">
            {/* Panel Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <p className="text-xs font-mono text-gray-500">{selected.id}</p>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">Grievance Details</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors mt-0.5"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Complaint Details */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Complaint Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Worker</span>
                    <span className="font-medium text-gray-900">{selected.worker}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-gray-900">{selected.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[selected.category] ?? 'bg-gray-100 text-gray-700'}`}>
                      {selected.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Priority</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_BADGE[selected.priority]}`}>
                      {selected.priority}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-gray-200">
                    <p className="text-gray-500 mb-1">Description</p>
                    <p className="text-gray-800 leading-relaxed">{selected.description}</p>
                  </div>
                </div>
              </div>

              {/* AI Classification */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  🤖 AI Classification — IBM Granite
                </h3>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-indigo-700 font-medium">Category</span>
                    <span className="text-indigo-900 font-semibold">{selected.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-700 font-medium">Severity</span>
                    <span className="text-indigo-900 font-semibold">{selected.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-700 font-medium">Confidence</span>
                    <span className="text-indigo-900 font-semibold">87%</span>
                  </div>
                  <p className="text-[11px] text-indigo-500 pt-1 border-t border-indigo-200">
                    AI classification is indicative only. Official verification is required before any action.
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status Timeline</h3>
                <div className="space-y-2">
                  {(STATUS_HISTORY[selected.id] ?? [
                    { date: selected.created, action: 'Grievance submitted', by: 'Worker' },
                  ]).map((ev, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                        {i < (STATUS_HISTORY[selected.id] ?? [{}]).length - 1 && (
                          <div className="w-px flex-1 bg-indigo-100 my-1" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="font-medium text-gray-800">{ev.action}</p>
                        <p className="text-gray-400">{ev.date} · {ev.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspector Notes */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Inspector Notes</h3>
                <textarea
                  rows={3}
                  placeholder="Add notes from field visit..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>

              {/* Status Update Form */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {(['Open', 'Under Review', 'Resolved'] as const).map((s) => (
                    <button
                      key={s}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                        selected.status === s
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-1.5 rounded-lg ml-auto transition-colors">
                    Save Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
