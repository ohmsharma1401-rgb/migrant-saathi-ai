import api from './api'
import type { DashboardOverview } from '@/types'

export async function getWorkerDashboard(): Promise<DashboardOverview> {
  const res = await api.get<DashboardOverview>('/dashboard/overview')
  return res.data
}

export async function getGovDashboard(): Promise<DashboardOverview> {
  const res = await api.get<DashboardOverview>('/dashboard/overview')
  return res.data
}

export async function getAdminDashboard(): Promise<DashboardOverview> {
  const res = await api.get<DashboardOverview>('/dashboard/overview')
  return res.data
}

export async function getWageComplianceSummary(): Promise<{
  compliant: number
  non_compliant: number
  under_review: number
  by_sector: Record<string, { compliant: number; violations: number }>
}> {
  const res = await api.get('/dashboard/wage-compliance')
  return res.data
}

export async function getMigrationFlowStats(): Promise<{
  source_states: Record<string, number>
  destination_states: Record<string, number>
  top_corridors: Array<{ from: string; to: string; count: number }>
}> {
  const res = await api.get('/dashboard/migration-flow')
  return res.data
}
