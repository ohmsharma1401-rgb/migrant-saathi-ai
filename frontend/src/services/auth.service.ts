import api from './api'

export interface OTPResponse {
  message: string
  mock_otp?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  role: 'worker' | 'official' | 'inspector' | 'admin'
  user_id: string
}

export async function sendOTP(mobile: string): Promise<OTPResponse> {
  const res = await api.post<OTPResponse>('/auth/worker/send-otp', { mobile_number: mobile })
  return res.data
}

export async function verifyOTP(mobile: string, otp: string): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>('/auth/worker/verify-otp', { mobile_number: mobile, otp })
  return res.data
}

export async function officialLogin(email: string, password: string): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>('/auth/official/login', { email, password })
  return res.data
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>('/auth/refresh', { refresh_token: token })
  return res.data
}
