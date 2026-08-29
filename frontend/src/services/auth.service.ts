import api from './api'

export interface OTPResponse {
  message: string
  mock_otp?: string
  email_sent?: boolean
  otp_sent?: boolean
  otp_token?: string
  channel?: 'email' | 'sms'
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  role: 'worker' | 'official' | 'inspector' | 'admin'
  user_id: string
}

export async function sendOTP(identifier: string): Promise<OTPResponse> {
  const isEmail = identifier.includes('@')
  const payload = isEmail ? { email: identifier } : { mobile_number: identifier }
  const res = await api.post<OTPResponse>('/auth/worker/send-otp', payload)
  return res.data
}

export async function verifyOTP(identifier: string, otp: string, otpToken?: string): Promise<AuthTokens> {
  const isEmail = identifier.includes('@')
  const payload = isEmail
    ? { email: identifier, otp, otp_token: otpToken }
    : { mobile_number: identifier, otp, otp_token: otpToken }
  const res = await api.post<AuthTokens>('/auth/worker/verify-otp', payload)
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
