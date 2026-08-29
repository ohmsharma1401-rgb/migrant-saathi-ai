import api from './api'
import type { AIInsight } from '@/types'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface ChatRequest {
  message: string
  language?: 'en' | 'hi' | 'gu'
  context?: string
  history?: ChatMessage[]
}

export interface ChatResponse {
  reply: string
  suggested_actions?: string[]
  sources?: string[]
  language: string
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const res = await api.post<ChatResponse>('/ai/chat', payload)
  return res.data
}

export async function getAIInsights(): Promise<AIInsight[]> {
  const res = await api.get<AIInsight[]>('/ai/insights')
  return res.data
}

export async function getWorkerAIAnalysis(workerId: string): Promise<{
  skill_gaps: string[]
  recommended_training: string[]
  welfare_eligibility_summary: string
  risk_factors: string[]
}> {
  const res = await api.get(`/ai/worker-analysis/${workerId}`)
  return res.data
}

export async function getWageAnomalyReport(): Promise<{
  anomalies: Array<{
    worker_id: string
    expected_wage: number
    actual_wage: number
    discrepancy_pct: number
    severity: string
  }>
  summary: string
}> {
  const res = await api.get('/ai/wage-anomalies')
  return res.data
}
