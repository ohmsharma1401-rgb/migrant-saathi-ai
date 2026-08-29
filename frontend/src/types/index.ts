// ─── Shared utility ───────────────────────────────────────────────────────────
export type Role = 'worker' | 'official' | 'inspector' | 'admin'

// ─── User / Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string
  role: Role
  mobile_number?: string
  email?: string
  created_at: string
  is_active: boolean
}

// ─── Worker Profile ───────────────────────────────────────────────────────────
export interface Address {
  street?: string
  village?: string
  district: string
  state: string
  pincode?: string
}

export interface WorkerProfile {
  id: string
  user_id: string
  full_name: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  mobile_number: string
  aadhaar_number?: string
  profile_photo_url?: string
  home_address: Address
  current_address?: Address
  occupation?: string
  sector?: string
  employer_name?: string
  employer_contact?: string
  monthly_wage?: number
  work_start_date?: string
  skills: Skill[]
  languages_spoken: string[]
  education_level?: string
  emergency_contact_name?: string
  emergency_contact_mobile?: string
  is_profile_complete: boolean
  registration_number?: string
  created_at: string
  updated_at: string
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export interface Skill {
  id: string
  name: string
  category: string
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years_experience?: number
  certified?: boolean
  certification_body?: string
}

// ─── Welfare Schemes ──────────────────────────────────────────────────────────
export type SchemeCategory =
  | 'housing'
  | 'health'
  | 'education'
  | 'insurance'
  | 'pension'
  | 'food'
  | 'skill_training'
  | 'other'

export interface WelfareScheme {
  id: string
  name: string
  description: string
  category: SchemeCategory
  implementing_agency: string
  eligibility_criteria: string[]
  benefits: string[]
  application_url?: string
  documents_required: string[]
  applicable_states: string[]
  is_active: boolean
  max_benefit_amount?: number
  created_at: string
  updated_at: string
}

export interface SchemeMatch {
  scheme: WelfareScheme
  eligibility_score: number
  status: 'potentially_eligible' | 'needs_verification' | 'enrolled' | 'applied' | 'not_eligible'
  missing_documents?: string[]
  notes?: string
}

// ─── Wages ────────────────────────────────────────────────────────────────────
export interface ReferenceWage {
  id: string
  state: string
  sector: string
  occupation: string
  skill_level: 'unskilled' | 'semi_skilled' | 'skilled' | 'highly_skilled'
  daily_wage: number
  monthly_wage: number
  effective_date: string
  source: string
  updated_at: string
}

export interface WageCheck {
  worker_id: string
  reference_wage: ReferenceWage
  reported_wage: number
  discrepancy: number
  discrepancy_pct: number
  status: 'compliant' | 'potential_discrepancy' | 'review_recommended'
  last_checked: string
}

// ─── Grievances ───────────────────────────────────────────────────────────────
export type GrievanceCategory =
  | 'wage_theft'
  | 'safety_violation'
  | 'discrimination'
  | 'harassment'
  | 'housing'
  | 'food'
  | 'contract_violation'
  | 'other'

export type GrievanceStatus =
  | 'open'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'escalated'

export interface Grievance {
  id: string
  ticket_number: string
  worker_id: string
  category: GrievanceCategory
  description: string
  location?: string
  employer_name?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: GrievanceStatus
  assigned_to?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardStat {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  unit?: string
}

export interface DashboardOverview {
  stats: DashboardStat[]
  recent_grievances?: Grievance[]
  scheme_matches?: SchemeMatch[]
  wage_check?: WageCheck
  worker_profile?: WorkerProfile
  // Gov/Admin specific
  total_workers?: number
  active_grievances?: number
  compliance_rate?: number
  welfare_enrollment_rate?: number
  alerts?: DashboardAlert[]
}

export interface DashboardAlert {
  id: string
  type: 'warning' | 'info' | 'critical'
  message: string
  action_url?: string
  created_at: string
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export interface AIInsight {
  id: string
  title: string
  summary: string
  category: 'welfare' | 'wages' | 'safety' | 'migration' | 'general'
  severity?: 'info' | 'warning' | 'critical'
  data?: Record<string, unknown>
  generated_at: string
  source_model: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}
