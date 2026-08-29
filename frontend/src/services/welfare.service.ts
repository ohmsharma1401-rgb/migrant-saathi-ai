import api from './api'
import type { WelfareScheme, SchemeMatch } from '@/types'

export async function listSchemes(params?: {
  category?: string
  state?: string
  active?: boolean
}): Promise<WelfareScheme[]> {
  const res = await api.get<WelfareScheme[]>('/welfare/schemes', { params })
  return res.data
}

export async function getSchemeById(id: string): Promise<WelfareScheme> {
  const res = await api.get<WelfareScheme>(`/welfare/schemes/${id}`)
  return res.data
}

export async function getMyEligibleSchemes(): Promise<SchemeMatch[]> {
  const res = await api.post<SchemeMatch[]>('/welfare/eligibility-check', {})
  return res.data
}

export async function applyForScheme(schemeId: string): Promise<{ application_id: string }> {
  const res = await api.post<{ application_id: string }>(`/welfare/schemes/${schemeId}/apply`)
  return res.data
}

export async function getWelfareStats(): Promise<{
  total_schemes: number
  eligible_workers: number
  enrolled_workers: number
  by_category: Record<string, number>
}> {
  const res = await api.get('/welfare/stats')
  return res.data
}
