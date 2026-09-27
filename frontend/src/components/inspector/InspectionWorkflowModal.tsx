import { useState } from 'react'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Camera,
  MessageSquare,
  ShieldAlert,
  Send,
  Plus,
  Trash2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  Upload
} from 'lucide-react'
import {
  InspectionCase,
  FindingItem,
  EvidenceItem,
  WorkerStatement,
  EmployerResponse,
  inspectionService
} from '@/services/inspection.service'

interface Props {
  inspectionCase: InspectionCase | null
  isOpen: boolean
  onClose: () => void
  onUpdated: (updatedCase: InspectionCase) => void
}

type TabType = 'overview' | 'workplace' | 'findings' | 'evidence' | 'statements' | 'submission'

export default function InspectionWorkflowModal({
  inspectionCase,
  isOpen,
  onClose,
  onUpdated
}: Props) {
  if (!isOpen || !inspectionCase) return null

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [currentCase, setCurrentCase] = useState<InspectionCase>(inspectionCase)

  // Finding form state
  const [findingCategory, setFindingCategory] = useState('Minimum Wage')
  const [findingSeverity, setFindingSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH')
  const [findingDescription, setFindingDescription] = useState('')
  const [findingRule, setFindingRule] = useState('Minimum Wages Act 1948 - Sec 12')

  // Evidence state
  const [evidenceTitle, setEvidenceTitle] = useState('')
  const [evidenceType, setEvidenceType] = useState<'photo' | 'document' | 'statement'>('photo')
  const [evidenceNotes, setEvidenceNotes] = useState('')

  // Statements state
  const [workerStmtText, setWorkerStmtText] = useState(currentCase.worker_statement?.statement || '')
  const [witnessName, setWitnessName] = useState(currentCase.worker_statement?.witness_name || '')
  const [workerVerified, setWorkerVerified] = useState(currentCase.worker_statement?.verified_by_worker || true)

  const [employerRep, setEmployerRep] = useState(currentCase.employer_response?.representative_name || '')
  const [employerDesig, setEmployerDesig] = useState(currentCase.employer_response?.designation || '')
  const [employerText, setEmployerText] = useState(currentCase.employer_response?.response_text || '')
  const [rectificationDays, setRectificationDays] = useState(currentCase.employer_response?.rectification_timeline_days || 7)

  // Report submission state
  const [recommendedAction, setRecommendedAction] = useState(currentCase.recommended_action || 'Issue Form-IV Statutory Notice & Demand Disparity Recovery')
  const [officerNotes, setOfficerNotes] = useState('')
  const [issueNotice, setIssueNotice] = useState(currentCase.statutory_notice_issued || true)
  const [escalateNow, setEscalateNow] = useState(false)
  const [escalationReason, setEscalationReason] = useState('Uncooperative employer representative and deliberate withholding of migrant passbook.')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleAddFinding() {
    if (!findingDescription.trim()) return
    try {
      const res = await inspectionService.addFinding(currentCase.id, {
        category: findingCategory,
        severity: findingSeverity,
        description: findingDescription.trim(),
        rule_violated: findingRule,
      })
      if (res.data) {
        setCurrentCase(res.data)
        onUpdated(res.data)
        setFindingDescription('')
        setFeedbackMsg({ type: 'success', text: 'Violation finding recorded into official log.' })
        setTimeout(() => setFeedbackMsg(null), 3000)
      }
    } catch {
      // Local fallback
      const newFinding: FindingItem = {
        id: `fnd-${Date.now()}`,
        category: findingCategory,
        severity: findingSeverity,
        description: findingDescription.trim(),
        rule_violated: findingRule,
        created_at: 'Just now'
      }
      const updated = {
        ...currentCase,
        findings: [...currentCase.findings, newFinding],
        status: currentCase.status === 'Scheduled' ? ('In Progress' as const) : currentCase.status
      }
      setCurrentCase(updated)
      onUpdated(updated)
      setFindingDescription('')
    }
  }

  async function handleAddEvidence() {
    if (!evidenceTitle.trim()) return
    const newEv: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: evidenceTitle.trim(),
      evidence_type: evidenceType,
      url: evidenceType === 'photo' ? 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80' : undefined,
      notes: evidenceNotes.trim() || 'Captured during site inspection on GPS coordinates (21.1702° N, 72.8311° E)',
      geotag: 'Surat Industrial Belt, Hazira (21.1702, 72.8311)',
      uploaded_at: 'Just now'
    }
    try {
      const res = await inspectionService.addEvidence(currentCase.id, newEv)
      if (res.data) {
        setCurrentCase(res.data)
        onUpdated(res.data)
        setEvidenceTitle('')
        setEvidenceNotes('')
        setFeedbackMsg({ type: 'success', text: 'Evidence cataloged and timestamped.' })
        setTimeout(() => setFeedbackMsg(null), 3000)
      }
    } catch {
      const updated = {
        ...currentCase,
        evidence: [...currentCase.evidence, newEv]
      }
      setCurrentCase(updated)
      onUpdated(updated)
      setEvidenceTitle('')
      setEvidenceNotes('')
    }
  }

  async function handleSaveStatements() {
    try {
      if (workerStmtText) {
        await inspectionService.recordWorkerStatement(currentCase.id, {
          statement: workerStmtText,
          witness_name: witnessName || undefined,
          verified_by_worker: workerVerified,
          recorded_at: 'Recorded on site'
        })
      }
      if (employerRep && employerText) {
        await inspectionService.recordEmployerResponse(currentCase.id, {
          representative_name: employerRep,
          designation: employerDesig || 'Site Incharge',
          response_text: employerText,
          rectification_timeline_days: Number(rectificationDays),
          recorded_at: 'Recorded on site'
        })
      }
      const updated: InspectionCase = {
        ...currentCase,
        worker_statement: {
          statement: workerStmtText,
          witness_name: witnessName,
          verified_by_worker: workerVerified,
          recorded_at: 'Recorded on site'
        },
        employer_response: {
          representative_name: employerRep,
          designation: employerDesig,
          response_text: employerText,
          rectification_timeline_days: Number(rectificationDays),
          recorded_at: 'Recorded on site'
        }
      }
      setCurrentCase(updated)
      onUpdated(updated)
      setFeedbackMsg({ type: 'success', text: 'Deposition & employer response logged successfully.' })
      setTimeout(() => setFeedbackMsg(null), 3000)
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Could not record statements. Saved locally.' })
    }
  }

  async function handleSubmitFinalReport() {
    setIsSubmitting(true)
    try {
      if (escalateNow) {
        await inspectionService.escalateCase(currentCase.id, escalationReason, true)
      }
      const res = await inspectionService.submitReport(currentCase.id, {
        recommended_action: recommendedAction,
        statutory_notice_issued: issueNotice,
        officer_notes: officerNotes || 'On-site verification completed according to Section 19 of the Inter-State Migrant Workmen Act.'
      })
      if (res.data) {
        setCurrentCase(res.data)
        onUpdated(res.data)
      } else {
        const updated: InspectionCase = {
          ...currentCase,
          status: escalateNow ? 'Escalated' : 'Verified',
          recommended_action: recommendedAction,
          statutory_notice_issued: issueNotice,
          escalated_to_official: escalateNow,
          inspection_notes: [...currentCase.inspection_notes, officerNotes || 'On-site inspection finalized by field officer.']
        }
        setCurrentCase(updated)
        onUpdated(updated)
      }
      setFeedbackMsg({
        type: 'success',
        text: escalateNow
          ? 'Case report submitted and ESCALATED to Joint Labour Commissioner.'
          : 'Inspection report submitted and statutory notice registered.'
      })
      setTimeout(() => {
        setIsSubmitting(false)
        onClose()
      }, 1500)
    } catch {
      setIsSubmitting(false)
      setFeedbackMsg({ type: 'error', text: 'Submission failed. Please try again.' })
    }
  }

  const tabs = [
    { id: 'overview' as const, label: '1. Worker & Case', icon: User },
    { id: 'workplace' as const, label: '2. Site & Employer', icon: Building2 },
    { id: 'findings' as const, label: `3. Violations (${currentCase.findings.length})`, icon: AlertTriangle },
    { id: 'evidence' as const, label: `4. Evidence Vault (${currentCase.evidence.length})`, icon: Camera },
    { id: 'statements' as const, label: '5. Statements', icon: MessageSquare },
    { id: 'submission' as const, label: '6. Report & Escalate', icon: FileText },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-[#1F4C3F] flex items-center justify-between bg-slate-50 dark:bg-[#091D17]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {currentCase.case_code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentCase.priority === 'Critical'
                    ? 'bg-red-500 text-white'
                    : currentCase.priority === 'High'
                    ? 'bg-[#FF6B53] text-white'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}>
                  {currentCase.priority} Priority
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-[#16382E] text-slate-800 dark:text-emerald-300">
                  Status: {currentCase.status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0C2D27] dark:text-white">
                On-Site Field Inspection: {currentCase.worker_name} vs. {currentCase.employer_name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#16382E] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-slate-200 dark:border-[#1F4C3F] bg-slate-100/70 dark:bg-[#0B201A] overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  active
                    ? 'border-amber-500 text-amber-600 dark:text-amber-300 bg-white dark:bg-[#0D241E]'
                    : 'border-transparent text-slate-500 dark:text-[#9DBBB2] hover:text-[#0C2D27] dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-amber-500' : ''}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Alert Banner if any */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-b border-emerald-500/20'
                : 'bg-red-500/10 text-red-600 dark:text-red-300 border-b border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-[10px] underline">Dismiss</button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: WORKER & GRIEVANCE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Worker Identity Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-[#9DBBB2] uppercase">
                    <User className="h-4 w-4 text-emerald-500" />
                    <span>Worker Demographics</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-[#9DBBB2]">Full Name:</span>
                      <b className="text-[#0C2D27] dark:text-white font-bold">{currentCase.worker_name}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-[#9DBBB2]">Migrant ID:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{currentCase.worker_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-[#9DBBB2]">Contact Phone:</span>
                      <b className="text-[#0C2D27] dark:text-white">{currentCase.worker_phone}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-[#9DBBB2]">Trade / Skill:</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-[#1C4237] text-[#0C2D27] dark:text-emerald-300 font-medium">
                        {currentCase.worker_occupation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-[#9DBBB2]">Home Domicile:</span>
                      <b className="text-[#0C2D27] dark:text-white">{currentCase.worker_domicile}</b>
                    </div>
                  </div>
                </div>

                {/* Wage Disparity Alert Card */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Wage Audit Summary</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">Contractor Paid Rate:</span>
                      <b className="text-base font-extrabold text-red-600 dark:text-red-400">
                        ₹{currentCase.reported_wage ? currentCase.reported_wage.toLocaleString() : 'N/A'}
                      </b>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">Gujarat Statutory Rate:</span>
                      <b className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{currentCase.reference_wage ? currentCase.reference_wage.toLocaleString() : 'N/A'}
                      </b>
                    </div>
                    <div className="pt-2 border-t border-amber-500/20 flex justify-between items-center">
                      <span className="font-bold text-amber-800 dark:text-amber-300">Disparity / Unpaid Sum:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 font-extrabold text-sm">
                        ₹{currentCase.wage_disparity ? currentCase.wage_disparity.toLocaleString() : '0'} Underpayment
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grievance Complaint Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-[#9DBBB2] uppercase block">
                  Original Grievance Logged by Worker
                </span>
                <p className="text-xs sm:text-sm text-[#0C2D27] dark:text-[#CBDCE1] leading-relaxed">
                  "{currentCase.complaint_description}"
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-[#9DBBB2] pt-2">
                  <span>Category: <b>{currentCase.complaint_category}</b></span>
                  <span>Scheduled on: <b>{currentCase.scheduled_date} at {currentCase.scheduled_time}</b></span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('workplace')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Proceed to Workplace Verification</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WORKPLACE & EMPLOYER */}
          {activeTab === 'workplace' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-[#9DBBB2] uppercase">
                  <Building2 className="h-4 w-4 text-amber-500" />
                  <span>Workplace Inspection Site</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">Employer / Principal Entity:</span>
                    <b className="text-[#0C2D27] dark:text-white">{currentCase.employer_name}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">Site Location:</span>
                    <b className="text-[#0C2D27] dark:text-white flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#FF6B53]" />
                      {currentCase.workplace_site}
                    </b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-[#9DBBB2]">District Jurisdiction:</span>
                    <b className="text-[#0C2D27] dark:text-white">{currentCase.location_district}</b>
                  </div>
                </div>
              </div>

              {/* On-Site Verification Checklist */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-3">
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white block uppercase">
                  Statutory Checklist Verified on Site
                </b>
                <div className="space-y-2 text-xs">
                  {[
                    'Form XVII Register of Wages checked against actual bank credits',
                    'Working hours muster roll inspected (overtime hours recorded)',
                    'Adequate potable drinking water and clean sanitation facility on site',
                    'Helmets, safety harnesses, and high-visibility jackets provided',
                    'Migrant passbooks provided to inter-state migrant workmen'
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#18382F] border border-slate-200/80 dark:border-[#1F4C3F] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1E483D]">
                      <input type="checkbox" defaultChecked={idx < 2} className="h-4 w-4 rounded accent-amber-500" />
                      <span className="text-[#0C2D27] dark:text-[#CBDCE1] font-medium">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveTab('findings')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Proceed to Log Findings</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FINDINGS & VIOLATIONS */}
          {activeTab === 'findings' && (
            <div className="space-y-6">
              {/* Existing Findings List */}
              <div className="space-y-3">
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white block uppercase">
                  Logged Statutory Violations ({currentCase.findings.length})
                </b>

                {currentCase.findings.length === 0 ? (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#1F4C3F] text-center text-xs text-slate-500 dark:text-[#9DBBB2]">
                    No violations recorded yet. Use the form below to record on-site infractions.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentCase.findings.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              f.severity === 'CRITICAL'
                                ? 'bg-red-500 text-white'
                                : f.severity === 'HIGH'
                                ? 'bg-[#FF6B53] text-white'
                                : 'bg-amber-500/30 text-amber-800 dark:text-amber-300'
                            }`}>
                              {f.severity}
                            </span>
                            <b className="text-xs font-bold text-[#0C2D27] dark:text-white">{f.category}</b>
                            {f.rule_violated && (
                              <span className="text-[10px] font-mono text-slate-400 dark:text-[#9DBBB2]">
                                [{f.rule_violated}]
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#52605D] dark:text-[#CBDCE1]">{f.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-[#9DBBB2] shrink-0">{f.created_at}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Finding Form */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-[#15342B] border border-amber-500/20 dark:border-[#1F4C3F] space-y-3">
                <b className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                  <Plus className="h-4 w-4" />
                  Add Violation Finding
                </b>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Violation Category</label>
                    <select
                      value={findingCategory}
                      onChange={(e) => setFindingCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    >
                      <option>Minimum Wage Non-Payment</option>
                      <option>Overtime Withholding</option>
                      <option>Safety Equipment / PPE Missing</option>
                      <option>Hazardous Scaffolding / Fall Hazard</option>
                      <option>Inhumane Sanitation / Housing</option>
                      <option>Withholding of Identity / Passbook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Severity Level</label>
                    <select
                      value={findingSeverity}
                      onChange={(e) => setFindingSeverity(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Statutory Clause</label>
                    <input
                      type="text"
                      value={findingRule}
                      onChange={(e) => setFindingRule(e.target.value)}
                      placeholder="e.g. Min Wages Act Sec 12"
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">
                    Factual Description &amp; Concrete Observation on Site
                  </label>
                  <textarea
                    rows={2}
                    value={findingDescription}
                    onChange={(e) => setFindingDescription(e.target.value)}
                    placeholder="Enter factual observations (e.g. 14 workers working at 5th floor slab without safety netting or harnesses)."
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2.5 text-xs text-[#0C2D27] dark:text-white"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddFinding}
                    disabled={!findingDescription.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Record Violation</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab('workplace')}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Proceed to Evidence Capture</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: EVIDENCE VAULT */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Evidence Gallery */}
              <div className="space-y-3">
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white block uppercase">
                  Captured Evidence Repository ({currentCase.evidence.length})
                </b>

                {currentCase.evidence.length === 0 ? (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#1F4C3F] text-center text-xs text-slate-500 dark:text-[#9DBBB2]">
                    No photo or document evidence uploaded. Upload site photos or contractor register snapshots below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentCase.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] flex gap-3"
                      >
                        {ev.url ? (
                          <img
                            src={ev.url}
                            alt={ev.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-[#1F4C3F] shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-400">
                            <FileText className="h-6 w-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 text-xs">
                          <b className="text-[#0C2D27] dark:text-white block truncate">{ev.title}</b>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold block">
                            Type: {ev.evidence_type}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-[#9DBBB2] line-clamp-2">{ev.notes}</p>
                          {ev.geotag && (
                            <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 block truncate">
                              📍 {ev.geotag}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Evidence Form */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-3">
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white flex items-center gap-1.5 uppercase">
                  <Camera className="h-4 w-4 text-amber-500" />
                  Capture / Upload Site Evidence
                </b>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Evidence Title</label>
                    <input
                      type="text"
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      placeholder="e.g. Scaffolding Missing Safety Guardrail"
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Evidence Type</label>
                    <select
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    >
                      <option value="photo">Field Photo (Camera / Geotagged)</option>
                      <option value="document">Wage Register / Slip Scan</option>
                      <option value="statement">Audio Memo / Written Record</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">
                    Inspector Notes / Geotag Details
                  </label>
                  <input
                    type="text"
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="e.g. Captured at 10:15 AM at Tower C Ground Floor. GPS: 21.1702, 72.8311"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2.5 text-xs text-[#0C2D27] dark:text-white"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddEvidence}
                    disabled={!evidenceTitle.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload &amp; Timestamp Evidence</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab('findings')}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveTab('statements')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Proceed to Statements</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: STATEMENTS */}
          {activeTab === 'statements' && (
            <div className="space-y-6">
              {/* Worker Statement */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-3">
                <div className="flex items-center justify-between">
                  <b className="text-xs font-bold text-[#0C2D27] dark:text-white uppercase flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-500" />
                    Worker / Complainant Deposition
                  </b>
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#CBDCE1] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workerVerified}
                      onChange={(e) => setWorkerVerified(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Verified by Worker thumbprint/signature</span>
                  </label>
                </div>

                <textarea
                  rows={3}
                  value={workerStmtText}
                  onChange={(e) => setWorkerStmtText(e.target.value)}
                  placeholder="Record worker's formal testimony in their own words..."
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2.5 text-xs text-[#0C2D27] dark:text-white"
                />

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-[#9DBBB2]">Witness Name (Optional):</span>
                  <input
                    type="text"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    placeholder="e.g. Sitaram Yadav (Co-worker)"
                    className="flex-1 rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                  />
                </div>
              </div>

              {/* Employer / Site Incharge Response */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-3">
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white uppercase flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-500" />
                  Employer / Contractor Official Explanation
                </b>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Representative Name</label>
                    <input
                      type="text"
                      value={employerRep}
                      onChange={(e) => setEmployerRep(e.target.value)}
                      placeholder="e.g. Mr. Hiren Patel"
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Designation</label>
                    <input
                      type="text"
                      value={employerDesig}
                      onChange={(e) => setEmployerDesig(e.target.value)}
                      placeholder="e.g. Project Manager / Sub-contractor"
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Rectification Days</label>
                    <input
                      type="number"
                      value={rectificationDays}
                      onChange={(e) => setRectificationDays(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2 text-xs text-[#0C2D27] dark:text-white"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={employerText}
                  onChange={(e) => setEmployerText(e.target.value)}
                  placeholder="Record employer's formal rebuttal or commitment to clear arrears..."
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2.5 text-xs text-[#0C2D27] dark:text-white"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveStatements}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Depositions</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveTab('submission')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Proceed to Final Report</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: REPORT SUBMISSION & ESCALATION */}
          {activeTab === 'submission' && (
            <div className="space-y-6">
              {/* Recommended Action */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-3">
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white block uppercase">
                  Inspector Recommendation &amp; Enforcement Action
                </b>

                <div className="space-y-2 text-xs">
                  {[
                    'Issue Form-IV Statutory Notice & Demand Disparity Recovery',
                    'Direct Contractor to Pay Arrears in Cash before Inspector',
                    'Impose Statutory Penalty under Section 12 (Minimum Wages Act)',
                    'Re-inspection Scheduled in 48 Hours for Compliance Verification',
                    'Close Case — Full Compliance Verified & Arrears Handed Over'
                  ].map((act) => (
                    <label key={act} className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#18382F] border border-slate-200/80 dark:border-[#1F4C3F] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1E483D]">
                      <input
                        type="radio"
                        name="recommendedAction"
                        checked={recommendedAction === act}
                        onChange={() => setRecommendedAction(act)}
                        className="accent-amber-500"
                      />
                      <span className="text-[#0C2D27] dark:text-[#CBDCE1] font-semibold">{act}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={issueNotice}
                      onChange={(e) => setIssueNotice(e.target.checked)}
                      className="rounded accent-amber-500 h-4 w-4"
                    />
                    <span>Issue Official Form-IV Statutory Notice immediately to Employer</span>
                  </label>
                </div>
              </div>

              {/* Officer Remarks */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200 dark:border-[#1F4C3F] space-y-2">
                <label className="block text-xs font-bold text-[#0C2D27] dark:text-white uppercase">
                  Final Field Inspection Report Summary
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Summarize the on-site verification, evidence gathered, and employer cooperation status..."
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#0D241E] p-2.5 text-xs text-[#0C2D27] dark:text-white"
                />
              </div>

              {/* Escalation to Government Official Toggle */}
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <b className="text-xs font-bold text-red-700 dark:text-red-300 block">
                        Escalate Case to District Joint Labour Commissioner
                      </b>
                      <span className="text-[11px] text-red-600/80 dark:text-red-300/70 block">
                        Direct this file to the Government Official workspace for prosecution or formal hearing.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={escalateNow}
                    onChange={(e) => setEscalateNow(e.target.checked)}
                    className="h-5 w-5 rounded accent-red-600 cursor-pointer"
                  />
                </div>

                {escalateNow && (
                  <div className="pt-2 border-t border-red-500/20 space-y-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-red-700 dark:text-red-300">
                      Reason for Escalation to Department Headquarters:
                    </label>
                    <textarea
                      rows={2}
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      className="w-full rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-[#0D241E] p-2 text-xs text-red-900 dark:text-red-100"
                    />
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveTab('statements')}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitFinalReport}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md ${
                      escalateNow
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    <Send className="h-4 w-4" />
                    <span>{escalateNow ? 'Submit & Escalate Case ⚠️' : 'Submit Inspection Report ✓'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
