import api from './api'
import type { Grievance, PaginatedResponse } from '@/types'

export interface CreateGrievancePayload {
  category: string
  description: string
  location?: string
  employer_name?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export async function submitGrievance(payload: CreateGrievancePayload): Promise<Grievance> {
  const res = await api.post<Grievance>('/grievances/', {
    description: payload.description,
    location_district: payload.location,
  })
  return res.data
}

export async function getMyGrievances(): Promise<PaginatedResponse<Grievance>> {
  const res = await api.get<PaginatedResponse<Grievance>>('/grievances/')
  return res.data
}

export async function getGrievanceById(id: string): Promise<Grievance> {
  const res = await api.get<Grievance>(`/grievances/${id}`)
  return res.data
}

export async function listGrievances(params?: {
  page?: number
  limit?: number
  status?: string
  severity?: string
  category?: string
}): Promise<PaginatedResponse<Grievance>> {
  const res = await api.get<PaginatedResponse<Grievance>>('/grievances/', { params })
  return res.data
}

export async function updateGrievanceStatus(
  id: string,
  status: string,
  resolution_notes?: string
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(`/grievances/${id}/updates`, {
    status_change: status,
    note: resolution_notes,
  })
  return res.data
}
