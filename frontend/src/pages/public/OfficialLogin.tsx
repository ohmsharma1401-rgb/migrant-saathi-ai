import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Shield,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'

// ── Types ────────────────────────────────────────────────────────────────────
interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  role: string
  user_id: string
  email?: string
}

// ── Validation ───────────────────────────────────────────────────────────────
const schema = z.object({
  email: z
    .string()
    .min(1, 'Email or Employee ID is required')
    .max(120),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128),
})

type FormValues = z.infer<typeof schema>

// ── Component ────────────────────────────────────────────────────────────────
export default function OfficialLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setApiError('')
    try {
      const res = await api.post<TokenResponse>('/auth/official/login', {
        email: values.email,
        password: values.password,
      })
      const data = res.data
      const role = data.role as 'official' | 'inspector' | 'admin'
      setAuth(
        { id: data.user_id, role, email: data.email ?? values.email },
        data.access_token,
        data.refresh_token,
      )
      if (role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/gov')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        'Invalid credentials. Please try again.'
      setApiError(msg)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 px-12 py-14 text-white">
        {/* Top branding */}
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide">Migrant Saathi AI</span>
          </div>

          <h2 className="text-3xl font-extrabold leading-snug mb-4">
            Secure Government Portal
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-10">
            Authorised access for government officials, labour inspectors,
            and system administrators to monitor, manage, and act on
            migrant worker welfare.
          </p>

          {/* Feature list */}
          <ul className="space-y-4">
            {[
              'Real-time worker registry & compliance dashboard',
              'AI-powered grievance analysis and routing',
              'Wage theft detection and enforcement tools',
              'Secure, role-based access control',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-indigo-100">
                <ShieldCheck className="h-4 w-4 text-indigo-300 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom security notice */}
        <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-3.5 w-3.5 text-indigo-300" />
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">
              Security Notice
            </span>
          </div>
          <p className="text-xs text-indigo-300 leading-relaxed">
            This portal is for authorised government officials only. All access
            is logged, monitored, and subject to the Information Technology
            Act, 2000.
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">
        {/* Back arrow */}
        <div className="w-full max-w-sm mb-6">
          <button
            onClick={() => navigate('/select-role')}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-700 hover:text-indigo-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-md mb-3">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
              Government Portal
            </h1>
            {/* Amber warning badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              Authorized Personnel Only
            </span>
          </div>

          {/* Error alert */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email / Employee ID */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Official Email / Employee ID
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="official@gujarat.gov.in"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Login to Dashboard →
            </button>
          </form>

          {/* Quick Demo Login Shortcuts */}
          <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⚡</span>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Quick Demo Login (1-Click)
                </span>
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full">
                Pre-configured
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuth(
                    { id: 'demo-official-id', role: 'official', email: 'official@gujarat.gov.in' },
                    'demo-access-token',
                    'demo-refresh-token'
                  )
                  navigate('/gov')
                }}
                className="flex items-center justify-between rounded-lg bg-white border border-indigo-200 px-3 py-2 text-xs hover:bg-indigo-600 hover:text-white transition-all text-left shadow-sm group"
              >
                <div>
                  <span className="font-bold block text-slate-800 group-hover:text-white">🏛️ Government Official</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-100 font-mono">official@gujarat.gov.in</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-white">Open Dashboard →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuth(
                    { id: 'demo-inspector-id', role: 'inspector', email: 'inspector@gujarat.gov.in' },
                    'demo-access-token',
                    'demo-refresh-token'
                  )
                  navigate('/gov')
                }}
                className="flex items-center justify-between rounded-lg bg-white border border-indigo-200 px-3 py-2 text-xs hover:bg-indigo-600 hover:text-white transition-all text-left shadow-sm group"
              >
                <div>
                  <span className="font-bold block text-slate-800 group-hover:text-white">🔍 Labour Inspector</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-100 font-mono">inspector@gujarat.gov.in</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-white">Open Dashboard →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuth(
                    { id: 'demo-admin-id', role: 'admin', email: 'admin@saathi.ai' },
                    'demo-access-token',
                    'demo-refresh-token'
                  )
                  navigate('/admin')
                }}
                className="flex items-center justify-between rounded-lg bg-white border border-indigo-200 px-3 py-2 text-xs hover:bg-indigo-600 hover:text-white transition-all text-left shadow-sm group"
              >
                <div>
                  <span className="font-bold block text-slate-800 group-hover:text-white">⚙️ System Administrator</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-100 font-mono">admin@saathi.ai</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:text-white">Open Dashboard →</span>
              </button>
            </div>
          </div>

          {/* Security notice */}
          <p className="mt-5 text-center text-xs text-gray-400 leading-relaxed">
            🔒 This portal is for authorized government officials only.
            All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  )
}
