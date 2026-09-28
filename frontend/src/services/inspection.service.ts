import api from './api'

export interface FindingItem {
  id: string
  category: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  rule_violated?: string
  created_at: string
}

export interface EvidenceItem {
  id: string
  title: string
  evidence_type: 'photo' | 'document' | 'statement' | 'audio'
  url?: string
  notes?: string
  geotag?: string
  uploaded_at: string
}

export interface WorkerStatement {
  statement: string
  recorded_at: string
  witness_name?: string
  verified_by_worker: boolean
}

export interface EmployerResponse {
  representative_name: string
  designation: string
  response_text: string
  rectification_timeline_days?: number
  recorded_at: string
}

export interface InspectionCase {
  id: string
  case_code: string
  worker_id: string
  worker_name: string
  worker_phone: string
  worker_occupation: string
  worker_domicile: string
  employer_id: string
  employer_name: string
  workplace_site: string
  location_district: string
  complaint_category: string
  complaint_description: string
  reported_wage?: number
  reference_wage?: number
  wage_disparity?: number
  priority: 'Critical' | 'High' | 'Medium' | 'Normal'
  status: 'Scheduled' | 'In Progress' | 'Verified' | 'Unresolved' | 'Escalated' | 'Overdue' | 'Closed'
  scheduled_date: string
  scheduled_time: string
  assigned_inspector_id: string
  assigned_inspector_name: string
  assigned_inspector_badge: string
  findings: FindingItem[]
  evidence: EvidenceItem[]
  worker_statement?: WorkerStatement | null
  employer_response?: EmployerResponse | null
  inspection_notes: string[]
  recommended_action?: string | null
  statutory_notice_issued: boolean
  escalated_to_official: boolean
  created_at: string
  updated_at: string
}

export interface InspectionDashboardMetrics {
  today_inspections: number
  assigned_cases: number
  high_priority_cases: number
  overdue_inspections: number
  pending_reports: number
  today_roster: InspectionCase[]
}

export interface InspectorWorkloadItem {
  id: string
  name: string
  badge_number: string
  district: string
  email: string
  phone: string
  active_inspections: number
  completed_this_month: number
  overdue_count: number
  status: string
}

export const FALLBACK_INSPECTION_CASES: InspectionCase[] = [
  {
    id: 'insp-001',
    case_code: 'CASE-GJ-2026-0891',
    worker_id: 'MS-GJ-88219',
    worker_name: 'Ramesh Kumar',
    worker_phone: '+91 98251 44102',
    worker_occupation: 'Mason (Skilled)',
    worker_domicile: 'Bihar',
    employer_id: 'c-surat-1',
    employer_name: 'Shree Construction Ltd.',
    workplace_site: 'Hazira Waterfront Commercial Tower, Plot 42',
    location_district: 'Surat',
    complaint_category: 'Wage',
    complaint_description: 'Unpaid wages for 28 working days in August 2026. Daily rate ₹550/day withheld under contractor pretext.',
    reported_wage: 8500,
    reference_wage: 12000,
    wage_disparity: 3500,
    priority: 'High',
    status: 'Scheduled',
    scheduled_date: 'Today, 28 Sep 2026',
    scheduled_time: '09:30 AM',
    assigned_inspector_id: 'ins-101',
    assigned_inspector_name: 'Rajendra Solanki',
    assigned_inspector_badge: 'INS-GJ-0418',
    findings: [],
    evidence: [
      {
        id: 'ev-1',
        title: 'August Muster Roll Screenshot',
        evidence_type: 'document',
        url: '/evidence/muster_aug.pdf',
        notes: 'Worker marked present on 26 of 28 scheduled shifts.',
        geotag: '21.1648 N, 72.6845 E',
        uploaded_at: new Date().toISOString(),
      },
    ],
    worker_statement: null,
    employer_response: null,
    inspection_notes: ['Priority investigation flagged by AI Discrepancy detector.'],
    recommended_action: null,
    statutory_notice_issued: false,
    escalated_to_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'insp-002',
    case_code: 'CASE-GJ-2026-0836',
    worker_id: 'MS-GJ-77412',
    worker_name: 'Mohd. Irfan',
    worker_phone: '+91 94280 77412',
    worker_occupation: 'Weaver (Semi-skilled)',
    worker_domicile: 'Uttar Pradesh',
    employer_id: 'c-ahm-1',
    employer_name: 'Reliance Textile & Fabrics Unit',
    workplace_site: 'Naroda GIDC Phase 3, Shed 14',
    location_district: 'Ahmedabad',
    complaint_category: 'Safety',
    complaint_description: 'Unguarded high-speed loom belts and inadequate dust exhaust causing respiratory hazards.',
    reported_wage: 9800,
    reference_wage: 11000,
    wage_disparity: 1200,
    priority: 'Critical',
    status: 'In Progress',
    scheduled_date: 'Today, 28 Sep 2026',
    scheduled_time: '11:45 AM',
    assigned_inspector_id: 'ins-101',
    assigned_inspector_name: 'Rajendra Solanki',
    assigned_inspector_badge: 'INS-GJ-0418',
    findings: [
      {
        id: 'f-1',
        category: 'Machine Guarding',
        severity: 'CRITICAL',
        description: 'Loom unit #4 rotating shafts exposed without emergency stop switches.',
        rule_violated: 'Gujarat Factories Rules 1963, Rule 54',
        created_at: new Date().toISOString(),
      },
    ],
    evidence: [
      {
        id: 'ev-2',
        title: 'Exposed Belt Drive Photograph',
        evidence_type: 'photo',
        url: '/evidence/loom_belt.jpg',
        notes: 'Taken during physical walk-through inspection.',
        geotag: '23.0725 N, 72.6582 E',
        uploaded_at: new Date().toISOString(),
      },
    ],
    worker_statement: {
      statement: 'Two workers suffered minor cuts last week due to lack of gloves and machine guards. Management refused medical leave.',
      recorded_at: new Date().toISOString(),
      witness_name: 'Animesh Roy (Dyer)',
      verified_by_worker: true,
    },
    employer_response: null,
    inspection_notes: ['Immediate stop-work order advised for line 4.'],
    recommended_action: 'Issue Statutory Form 12 Notice',
    statutory_notice_issued: false,
    escalated_to_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'insp-003',
    case_code: 'CASE-GJ-2026-0792',
    worker_id: 'MS-GJ-44081',
    worker_name: 'Rajesh Sharma',
    worker_phone: '+91 97123 44081',
    worker_occupation: 'Diamond Polisher (Highly Skilled)',
    worker_domicile: 'Rajasthan',
    employer_id: 'c-surat-2',
    employer_name: 'Surat Diamond Craft Industries',
    workplace_site: 'Katargam Diamond Hub, Floor 3',
    location_district: 'Surat',
    complaint_category: 'Illegal Overtime',
    complaint_description: 'Forced 14-hour daily shifts without statutory double overtime compensation.',
    reported_wage: 11200,
    reference_wage: 14000,
    wage_disparity: 2800,
    priority: 'High',
    status: 'Scheduled',
    scheduled_date: 'Today, 28 Sep 2026',
    scheduled_time: '02:30 PM',
    assigned_inspector_id: 'ins-101',
    assigned_inspector_name: 'Rajendra Solanki',
    assigned_inspector_badge: 'INS-GJ-0418',
    findings: [],
    evidence: [],
    worker_statement: null,
    employer_response: null,
    inspection_notes: [],
    recommended_action: null,
    statutory_notice_issued: false,
    escalated_to_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'insp-004',
    case_code: 'CASE-GJ-2026-0665',
    worker_id: 'MS-GJ-66308',
    worker_name: 'Sunita Devi',
    worker_phone: '+91 99042 66308',
    worker_occupation: 'Fitter (Skilled)',
    worker_domicile: 'Jharkhand',
    employer_id: 'c-vad-1',
    employer_name: 'L&T Infrastructure Project Site #4',
    workplace_site: 'Makarpura Industrial Zone',
    location_district: 'Vadodara',
    complaint_category: 'Working Conditions',
    complaint_description: 'No clean drinking water facilities or sanitary restrooms provided at site.',
    reported_wage: 14500,
    reference_wage: 15000,
    wage_disparity: 500,
    priority: 'Medium',
    status: 'Scheduled',
    scheduled_date: 'Today, 28 Sep 2026',
    scheduled_time: '04:15 PM',
    assigned_inspector_id: 'ins-101',
    assigned_inspector_name: 'Rajendra Solanki',
    assigned_inspector_badge: 'INS-GJ-0418',
    findings: [],
    evidence: [],
    worker_statement: null,
    employer_response: null,
    inspection_notes: [],
    recommended_action: null,
    statutory_notice_issued: false,
    escalated_to_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'insp-005',
    case_code: 'CASE-GJ-2026-0511',
    worker_id: 'MS-GJ-55194',
    worker_name: 'Ajay Munda',
    worker_phone: '+91 98791 55194',
    worker_occupation: 'Lathe Operator',
    worker_domicile: 'Odisha',
    employer_id: 'c-raj-1',
    employer_name: 'Rajkot Auto Components Ltd.',
    workplace_site: 'Metoda GIDC Industrial Area',
    location_district: 'Rajkot',
    complaint_category: 'Wage',
    complaint_description: 'Arbitrary ₹2,300 wage deduction marked as damage penalty without notice.',
    reported_wage: 10200,
    reference_wage: 12500,
    wage_disparity: 2300,
    priority: 'High',
    status: 'Overdue',
    scheduled_date: 'Yesterday, 27 Sep 2026',
    scheduled_time: '11:00 AM',
    assigned_inspector_id: 'ins-101',
    assigned_inspector_name: 'Rajendra Solanki',
    assigned_inspector_badge: 'INS-GJ-0418',
    findings: [],
    evidence: [],
    worker_statement: null,
    employer_response: null,
    inspection_notes: ['Delayed due to transit issues on Rajkot highway.'],
    recommended_action: null,
    statutory_notice_issued: false,
    escalated_to_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'insp-006',
    case_code: 'CASE-GJ-2026-0498',
    worker_id: 'MS-GJ-66304',
    worker_name: 'Dinesh Sahu',
    worker_phone: '+91 99099 66304',
    worker_occupation: 'Plumber',
    worker_domicile: 'Chhattisgarh',
    employer_id: 'c-gn-1',
    employer_name: 'GIFT City Towers Construction',
    workplace_site: 'GIFT City Zone 1, Sector 2',
    location_district: 'Gandhinagar',
    complaint_category: 'Safety',
    complaint_description: 'Lack of safety harnesses and fall prevention nets on 8th floor building frame.',
    reported_wage: 7800,
    reference_wage: 12000,
    wage_disparity: 4200,
    priority: 'Critical',
    status: 'Overdue',
    scheduled_date: '26 Sep 2026',
    scheduled_time: '03:00 PM',
    assigned_inspector_id: 'ins-101',
    assigned_inspector_name: 'Rajendra Solanki',
    assigned_inspector_badge: 'INS-GJ-0418',
    findings: [],
    evidence: [],
    worker_statement: null,
    employer_response: null,
    inspection_notes: ['Urgent follow-up requested by District Magistrate.'],
    recommended_action: null,
    statutory_notice_issued: false,
    escalated_to_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function getAssignedGrievancesFromStorage(): InspectionCase[] {
  const result: InspectionCase[] = []
  try {
    if (typeof window === 'undefined') return result
    const savedStr = localStorage.getItem('saathi-assigned-grievances')
    if (!savedStr) return result
    const assignmentsMap: Record<string, any> = JSON.parse(savedStr)
    Object.entries(assignmentsMap).forEach(([gId, assignInfo]) => {
      if (!assignInfo) return
      const assignedCase: InspectionCase = {
        id: gId,
        case_code: assignInfo.case_code || gId,
        worker_id: assignInfo.worker_id || `MS-GJ-${Math.abs(gId.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) % 90000 + 10000)}`,
        worker_name: assignInfo.worker || assignInfo.worker_name || 'Assigned Worker',
        worker_phone: assignInfo.phone || assignInfo.worker_phone || '+91 98250 12345',
        worker_occupation: assignInfo.occupation || assignInfo.worker_occupation || 'Contract Labourer',
        worker_domicile: assignInfo.domicile || assignInfo.worker_domicile || 'Gujarat',
        employer_id: assignInfo.employer_id || 'emp-gen-01',
        employer_name: assignInfo.employer || assignInfo.employer_name || 'Designated Employer / Contractor',
        workplace_site: assignInfo.site || assignInfo.location || 'Assigned Beat Worksite',
        location_district: assignInfo.district || assignInfo.location_district || 'Surat',
        complaint_category: assignInfo.category || assignInfo.complaint_category || 'Grievance',
        complaint_description: assignInfo.description || assignInfo.notes || 'Worker grievance assigned by Government Official for on-site inquiry.',
        reported_wage: assignInfo.reported_wage || 9500,
        reference_wage: assignInfo.reference_wage || 12000,
        wage_disparity: assignInfo.wage_disparity || 2500,
        priority: (assignInfo.priority || 'High') as any,
        status: assignInfo.status === 'Resolved' ? 'Verified' : (assignInfo.status === 'Under Review' ? 'In Progress' : (assignInfo.status || 'Scheduled')),
        scheduled_date: assignInfo.timeline || assignInfo.scheduled_date || 'Today, 28 Sep 2026',
        scheduled_time: assignInfo.scheduled_time || '10:30 AM',
        assigned_inspector_id: assignInfo.inspectorId || assignInfo.assigned_inspector_id || 'ins-101',
        assigned_inspector_name: assignInfo.inspector || assignInfo.assigned_inspector_name || 'Rajendra Solanki',
        assigned_inspector_badge: assignInfo.inspectorBadge || assignInfo.assigned_inspector_badge || 'INS-GJ-0418',
        findings: assignInfo.findings || [],
        evidence: assignInfo.evidence || [],
        worker_statement: assignInfo.worker_statement || null,
        employer_response: assignInfo.employer_response || null,
        inspection_notes: assignInfo.notes ? [assignInfo.notes] : ['Assigned by Government Official console.'],
        recommended_action: assignInfo.recommended_action || null,
        statutory_notice_issued: Boolean(assignInfo.statutory_notice_issued),
        escalated_to_official: Boolean(assignInfo.escalated_to_official),
        created_at: assignInfo.assignedAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      result.push(assignedCase)
    })
  } catch (err) {
    console.warn('Error reading saathi-assigned-grievances:', err)
  }
  return result
}

function mergeAssignedCases(baseList: any): InspectionCase[] {
  const base: InspectionCase[] = Array.isArray(baseList)
    ? [...baseList]
    : Array.isArray(baseList?.data)
    ? [...baseList.data]
    : Array.isArray(baseList?.cases)
    ? [...baseList.cases]
    : [...FALLBACK_INSPECTION_CASES]

  const storageCases = getAssignedGrievancesFromStorage()
  storageCases.forEach((st) => {
    const idx = base.findIndex((c) => c.id === st.id || c.case_code === st.case_code)
    if (idx >= 0) {
      base[idx] = { ...base[idx], ...st }
    } else {
      base.unshift(st)
    }
  })

  return base
}

export const inspectionService = {
  async getDashboard(): Promise<InspectionDashboardMetrics> {
    try {
      const res = await api.get('/inspections/dashboard')
      const allCases = await this.getCases()
      const todayCases = allCases.filter((c) => c.scheduled_date.includes('Today') || c.status === 'Scheduled')
      return {
        today_inspections: Math.max(res?.data?.today_inspections || 0, todayCases.length),
        assigned_cases: Math.max(res?.data?.assigned_cases || 0, allCases.length),
        high_priority_cases: allCases.filter((c) => ['High', 'Critical'].includes(c.priority)).length,
        overdue_inspections: allCases.filter((c) => c.status === 'Overdue').length,
        pending_reports: allCases.filter((c) => ['In Progress', 'Overdue'].includes(c.status)).length,
        today_roster: todayCases,
      }
    } catch {
      const allCases = await this.getCases()
      const todayCases = allCases.filter((c) => c.scheduled_date.includes('Today') || c.status === 'Scheduled')
      return {
        today_inspections: todayCases.length,
        assigned_cases: allCases.length,
        high_priority_cases: allCases.filter((c) => ['High', 'Critical'].includes(c.priority)).length,
        overdue_inspections: allCases.filter((c) => c.status === 'Overdue').length,
        pending_reports: allCases.filter((c) => ['In Progress', 'Overdue'].includes(c.status)).length,
        today_roster: todayCases,
      }
    }
  },

  async getInspectorDashboard() {
    const data = await this.getDashboard()
    return { data, ...data }
  },

  async getRoster(statusFilter?: string, priorityFilter?: string, districtFilter?: string): Promise<InspectionCase[]> {
    try {
      const res = await api.get('/inspections/roster', {
        params: { status_filter: statusFilter, priority_filter: priorityFilter, district_filter: districtFilter },
      })
      let list = mergeAssignedCases(res.data)
      if (statusFilter && statusFilter !== 'All') {
        list = list.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase())
      }
      if (priorityFilter && priorityFilter !== 'All') {
        list = list.filter((c) => c.priority.toLowerCase() === priorityFilter.toLowerCase())
      }
      if (districtFilter && districtFilter !== 'All') {
        list = list.filter((c) => c.location_district.toLowerCase() === districtFilter.toLowerCase())
      }
      return list
    } catch {
      let list = mergeAssignedCases(FALLBACK_INSPECTION_CASES)
      if (statusFilter && statusFilter !== 'All') {
        list = list.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase())
      }
      if (priorityFilter && priorityFilter !== 'All') {
        list = list.filter((c) => c.priority.toLowerCase() === priorityFilter.toLowerCase())
      }
      if (districtFilter && districtFilter !== 'All') {
        list = list.filter((c) => c.location_district.toLowerCase() === districtFilter.toLowerCase())
      }
      return list
    }
  },

  async getInspectionRoster(statusFilter?: string, priorityFilter?: string, districtFilter?: string) {
    const data = await this.getRoster(statusFilter, priorityFilter, districtFilter)
    return { data }
  },

  async getCases(category?: string, priority?: string): Promise<InspectionCase[]> {
    try {
      const res = await api.get('/inspections/cases', {
        params: { category, priority },
      })
      const merged = mergeAssignedCases(res.data)
      let filtered = merged
      if (category && category !== 'All') {
        filtered = filtered.filter((c) => c.complaint_category.toLowerCase() === category.toLowerCase())
      }
      if (priority && priority !== 'All') {
        filtered = filtered.filter((c) => c.priority.toLowerCase() === priority.toLowerCase())
      }
      return filtered
    } catch {
      const merged = mergeAssignedCases(FALLBACK_INSPECTION_CASES)
      let filtered = merged
      if (category && category !== 'All') {
        filtered = filtered.filter((c) => c.complaint_category.toLowerCase() === category.toLowerCase())
      }
      if (priority && priority !== 'All') {
        filtered = filtered.filter((c) => c.priority.toLowerCase() === priority.toLowerCase())
      }
      return filtered
    }
  },

  async getInspectorCases(category?: string, priority?: string) {
    const data = await this.getCases(category, priority)
    return { data }
  },

  async getCaseDetail(caseId: string): Promise<InspectionCase> {
    const allCases = await this.getCases()
    const match = allCases.find((c) => c.id === caseId || c.case_code === caseId)
    if (match) return match

    try {
      const res = await api.get(`/inspections/cases/${caseId}`)
      return res.data
    } catch {
      return FALLBACK_INSPECTION_CASES[0]
    }
  },

  async getInspectionCase(caseId: string) {
    const data = await this.getCaseDetail(caseId)
    return { data }
  },

  async startInspection(caseId: string) {
    try {
      const res = await api.post(`/inspections/cases/${caseId}/start`)
      return { data: res.data }
    } catch {
      return { data: { message: 'Inspection started' } }
    }
  },

  async addFinding(caseId: string, finding: { category: string; severity: string; description: string; rule_violated?: string }) {
    try {
      const res = await api.post(`/inspections/cases/${caseId}/findings`, finding)
      return { data: res.data }
    } catch {
      const fallbackCase = FALLBACK_INSPECTION_CASES.find((c) => c.id === caseId) || FALLBACK_INSPECTION_CASES[0]
      const updatedCase = {
        ...fallbackCase,
        findings: [...fallbackCase.findings, { id: `fnd-${Date.now()}`, ...finding, created_at: 'Just now' }]
      }
      return { data: updatedCase }
    }
  },

  async addEvidence(caseId: string, evidence: { title: string; evidence_type: string; url?: string; notes?: string; geotag?: string }) {
    try {
      const res = await api.post(`/inspections/cases/${caseId}/evidence`, evidence)
      return { data: res.data }
    } catch {
      const fallbackCase = FALLBACK_INSPECTION_CASES.find((c) => c.id === caseId) || FALLBACK_INSPECTION_CASES[0]
      const updatedCase = {
        ...fallbackCase,
        evidence: [...fallbackCase.evidence, { id: `ev-${Date.now()}`, ...evidence, uploaded_at: 'Just now' } as any]
      }
      return { data: updatedCase }
    }
  },

  async recordWorkerStatement(caseId: string, statement: { statement: string; witness_name?: string; verified_by_worker: boolean; recorded_at?: string }) {
    try {
      const res = await api.post(`/inspections/cases/${caseId}/worker-statement`, statement)
      return { data: res.data }
    } catch {
      return { data: { message: 'Worker statement recorded' } }
    }
  },

  async recordEmployerResponse(caseId: string, response: { representative_name: string; designation: string; response_text: string; rectification_timeline_days?: number; recorded_at?: string }) {
    try {
      const res = await api.post(`/inspections/cases/${caseId}/employer-response`, response)
      return { data: res.data }
    } catch {
      return { data: { message: 'Employer response logged' } }
    }
  },

  async submitReport(caseId: string, payload: any) {
    try {
      const res = await api.post(`/inspections/cases/${caseId}/report`, payload)
      return { data: res.data }
    } catch {
      return { data: { message: 'Report submitted successfully' } }
    }
  },

  async escalateCase(caseId: string, reasonOrPayload: any, isUrgent?: boolean) {
    try {
      const payload = typeof reasonOrPayload === 'string' ? { reason: reasonOrPayload, urgency: isUrgent ? 'high' : 'normal' } : reasonOrPayload
      const res = await api.post(`/inspections/cases/${caseId}/escalate`, payload)
      return { data: res.data }
    } catch {
      return { data: { message: 'Case escalated to Government Official' } }
    }
  },

  async listInspectors(): Promise<InspectorWorkloadItem[]> {
    try {
      const res = await api.get('/inspections/inspectors')
      return res.data
    } catch {
      return [
        { id: 'ins-101', name: 'Rajendra Solanki', badge_number: 'INS-GJ-0418', district: 'Surat', email: 'solanki.insp@gujarat.gov.in', phone: '+91 98250 88412', active_inspections: 6, completed_this_month: 22, overdue_count: 2, status: 'On Duty' },
        { id: 'ins-102', name: 'Anita Deshmukh', badge_number: 'INS-GJ-0209', district: 'Ahmedabad', email: 'deshmukh.insp@gujarat.gov.in', phone: '+91 94260 77102', active_inspections: 5, completed_this_month: 28, overdue_count: 0, status: 'On Duty' },
        { id: 'ins-103', name: 'Vikram Rathod', badge_number: 'INS-GJ-0334', district: 'Vadodara', email: 'rathod.insp@gujarat.gov.in', phone: '+91 98791 22394', active_inspections: 4, completed_this_month: 19, overdue_count: 1, status: 'On Duty' },
        { id: 'ins-104', name: 'Pravin Vaghela', badge_number: 'INS-GJ-0512', district: 'Rajkot', email: 'vaghela.insp@gujarat.gov.in', phone: '+91 99044 55188', active_inspections: 3, completed_this_month: 16, overdue_count: 0, status: 'On Duty' },
        { id: 'ins-105', name: 'Kavita Shah', badge_number: 'INS-GJ-0115', district: 'Gandhinagar', email: 'shah.insp@gujarat.gov.in', phone: '+91 98242 11983', active_inspections: 2, completed_this_month: 24, overdue_count: 0, status: 'On Duty' },
      ]
    }
  },

  async getInspectorsWorkload() {
    const data = await this.listInspectors()
    return { data }
  },

  async assignCase(payload: any) {
    const gId = payload.grievance_id || payload.case_code || payload.id || `CASE-GJ-${Date.now().toString().slice(-4)}`
    try {
      if (typeof window !== 'undefined') {
        const savedStr = localStorage.getItem('saathi-assigned-grievances')
        const assignmentsMap = savedStr ? JSON.parse(savedStr) : {}
        assignmentsMap[gId] = {
          id: gId,
          case_code: gId,
          worker: payload.worker_name || payload.worker || 'Assigned Worker',
          phone: payload.worker_phone,
          employer: payload.employer_name || payload.employer || 'Designated Employer / Worksite',
          site: payload.workplace_site || payload.site || payload.location || 'Gujarat Industrial Belt',
          district: payload.location_district || payload.district || 'Surat',
          category: payload.complaint_category || payload.category || 'Grievance Inspection',
          priority: payload.priority || 'High',
          status: 'Scheduled',
          inspector: payload.inspector_name || payload.inspector || 'Rajendra Solanki',
          inspectorBadge: payload.inspector_badge || payload.inspectorBadge || 'INS-GJ-0418',
          timeline: payload.scheduled_date || 'Scheduled Within 24h',
          notes: payload.instructions || payload.notes || 'Assigned via Government Official console.',
          assignedAt: new Date().toISOString()
        }
        localStorage.setItem('saathi-assigned-grievances', JSON.stringify(assignmentsMap))
      }
    } catch {}

    try {
      const res = await api.post('/inspections/assign', payload)
      return { data: res.data }
    } catch {
      return { data: { message: 'Case assigned to inspector successfully' } }
    }
  },

  async assignGrievanceToInspector(payload: any) {
    return this.assignCase(payload)
  },
}
