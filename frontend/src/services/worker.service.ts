import api from './api'
import type { WorkerProfile, Skill, PaginatedResponse } from '@/types'

export async function getMyProfile(): Promise<WorkerProfile> {
  const res = await api.get<WorkerProfile>('/workers/profile')
  return res.data
}

export async function updateMyProfile(data: Partial<WorkerProfile>): Promise<WorkerProfile> {
  const res = await api.patch<WorkerProfile>('/workers/profile', data)
  return res.data
}

export async function getMySkills(): Promise<Skill[]> {
  const res = await api.get<Skill[]>('/workers/skills')
  return res.data
}

export async function addSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
  const res = await api.post<Skill>('/workers/skills', skill)
  return res.data
}

export async function deleteSkill(skillId: string): Promise<void> {
  await api.delete(`/workers/skills/${skillId}`)
}

export async function listWorkers(params?: {
  page?: number
  limit?: number
  state?: string
  district?: string
  skill?: string
  search?: string
}): Promise<PaginatedResponse<WorkerProfile>> {
  const res = await api.get<PaginatedResponse<WorkerProfile>>('/workers', { params })
  return res.data
}

export async function getWorkerById(id: string): Promise<WorkerProfile> {
  const res = await api.get<WorkerProfile>(`/workers/${id}/profile`)
  return res.data
}
