import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Loader2, Smartphone, KeyRound } from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'

interface SendOTPResponse {
  message: string
  mock_otp?: string
  email_sent?: boolean
  otp_sent?: boolean
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  role: string
  user_id: string
}

interface MobileForm {
  mobile_number: string
}

interface OTPForm {
  otp: string
}

const RESEND_DELAY = 30

export default function WorkerLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [step, setStep] = useState<'mobile' | 'otp' | 'register'>('mobile')
  const [mobile, setMobile] = useState('')
  const [mockOtp, setMockOtp] = useState<string | undefined>()
  const [emailSent, setEmailSent] = useState(false)
  const [apiError, setApiError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [regForm, setRegForm] = useState({
    fullName: '',
    age: '',
    originState: 'Bihar',
    originDistrict: 'Patna',
    currentDistrict: 'Ahmedabad',
    currentCity: 'Ahmedabad',
    occupation: 'Mason',
  })
  const [savingReg, setSavingReg] = useState(false)

  const mobileForm = useForm<MobileForm>({ defaultValues: { mobile_number: '' } })
  const otpForm = useForm<OTPForm>({ defaultValues: { otp: '' } })

  function startCountdown() {
    setCountdown(RESEND_DELAY)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  async function onSendOTP(values: MobileForm) {
    setApiError('')
    const inputVal = values.mobile_number.trim()
    const isEmail = inputVal.includes('@')
    const payload = isEmail ? { email: inputVal } : { mobile_number: inputVal }

    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', payload)
      setMobile(inputVal)
      setMockOtp(res.data.mock_otp)
      setEmailSent(Boolean(res.data.email_sent))
      setStep('otp')
      startCountdown()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        'Failed to send OTP. Please try again.'
      setApiError(msg)
    }
  }

  async function onVerifyOTP(values: OTPForm) {
    setApiError('')
    const isEmail = mobile.includes('@')
    const payload = isEmail
      ? { email: mobile, otp: values.otp }
      : { mobile_number: mobile, otp: values.otp }

    try {
      const res = await api.post<TokenResponse>('/auth/worker/verify-otp', payload)
      const data = res.data
      setAuth(
        { id: data.user_id, role: data.role as 'worker', email: isEmail ? mobile : undefined, mobile_number: !isEmail ? mobile : undefined },
        data.access_token,
        data.refresh_token,
      )
      // Transition to registration onboarding step
      setStep('register')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        'Invalid OTP. Please try again.'
      setApiError(msg)
    }
  }

  async function onCompleteRegistration() {
    setSavingReg(true)
    try {
      await api.patch('/workers/profile', {
        full_name: regForm.fullName || 'Migrant Worker',
        origin_state: regForm.originState,
        current_district: regForm.currentDistrict,
        current_city: regForm.currentCity,
      })
    } catch {
      // Local fallback
    } finally {
      setSavingReg(false)
      navigate('/worker')
    }
  }

  async function handleResend() {
    setApiError('')
    otpForm.reset()
    const isEmail = mobile.includes('@')
    const payload = isEmail ? { email: mobile } : { mobile_number: mobile }
    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', payload)
      setMockOtp(res.data.mock_otp)
      startCountdown()
    } catch {
      setApiError('Failed to resend OTP. Please try again.')
    }
  }

  const maskedMobile = mobile.includes('@')
    ? mobile
    : mobile
    ? `+91 ${mobile.slice(0, 2)}XXXX${mobile.slice(-4)}`
    : ''

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 px-4 py-10">
      {/* Back arrow */}
      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => navigate('/select-role')}
          className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-blue-100 px-8 py-10">
        {/* App icon + name */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-md mb-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
            Migrant Saathi AI
          </span>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
          Login with Email or Mobile
        </h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          We'll send a 6-digit OTP code to your Gmail account or Mobile
        </p>

        {/* Step 1 — Email / Mobile Number */}
        {step === 'mobile' && (
          <form onSubmit={mobileForm.handleSubmit(onSendOTP)} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="mobile_number"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Gmail / Email or Mobile Number
              </label>
              <div className="flex rounded-xl overflow-hidden border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                <span className="flex items-center px-3.5 bg-gray-50 text-gray-600 font-medium text-xs border-r border-gray-300 select-none">
                  <Smartphone className="h-4 w-4 mr-1 text-gray-400" />
                  ID
                </span>
                <input
                  id="mobile_number"
                  type="text"
                  placeholder="e.g. worker@gmail.com or 9876543210"
                  className="flex-1 px-3.5 py-3.5 text-sm font-medium text-gray-900 bg-white outline-none placeholder:text-gray-400"
                  {...mobileForm.register('mobile_number', {
                    required: 'Email address or mobile number is required',
                  })}
                />
              </div>
              {mobileForm.formState.errors.mobile_number && (
                <p className="mt-1.5 text-xs text-red-600">
                  {mobileForm.formState.errors.mobile_number.message}
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-400">Enter your Gmail address or 10-digit mobile number</p>
            </div>

            {apiError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={mobileForm.formState.isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {mobileForm.formState.isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : null}
              Send OTP →
            </button>
          </form>
        )}

        {/* Step 2 — OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} noValidate className="space-y-5">
            <p className="text-center text-sm text-gray-600 bg-blue-50 rounded-xl py-2.5 px-4 border border-blue-100">
              OTP sent to{' '}
              <span className="font-semibold text-blue-700">{maskedMobile}</span>
            </p>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Enter OTP
              </label>
              <div className="flex items-center rounded-xl border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all overflow-hidden">
                <span className="flex items-center pl-4 pr-2">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="• • • • • •"
                  className="flex-1 px-3 py-4 text-2xl font-bold tracking-[0.4em] text-center text-gray-900 bg-white outline-none placeholder:text-gray-200 placeholder:tracking-[0.3em] placeholder:text-xl"
                  {...otpForm.register('otp', {
                    required: 'OTP is required',
                    pattern: { value: /^\d{4,6}$/, message: 'Enter the OTP received on your mobile' },
                  })}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                    otpForm.setValue('otp', digits, { shouldValidate: true })
                  }}
                />
              </div>
              {otpForm.formState.errors.otp && (
                <p className="mt-1.5 text-xs text-red-600">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            {/* Resend */}
            <div className="text-center text-sm">
              {countdown > 0 ? (
                <span className="text-gray-400">
                  Resend OTP in{' '}
                  <span className="font-semibold text-blue-600">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {apiError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={otpForm.formState.isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {otpForm.formState.isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : null}
              Verify &amp; Login →
            </button>

            <button
              type="button"
              onClick={() => { setStep('mobile'); setApiError(''); otpForm.reset() }}
              className="w-full text-sm text-gray-500 hover:text-gray-800 font-medium py-1 transition-colors"
            >
              ← Change Number
            </button>

            {/* OTP Status Banner */}
            {emailSent ? (
              <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-center text-green-900 shadow-sm space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-800">
                  📧 Email Delivered
                </p>
                <p className="text-xs text-green-800 leading-snug">
                  Verification OTP code sent to <span className="font-semibold">{maskedMobile}</span>. Please check your Gmail Inbox and Spam folder.
                </p>
              </div>
            ) : mockOtp ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center text-amber-900 shadow-sm space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  ⚡ Verification OTP Code Generated
                </p>
                <div className="text-2xl font-extrabold font-mono tracking-[0.3em] text-amber-950">
                  {mockOtp}
                </div>
                <button
                  type="button"
                  onClick={() => otpForm.setValue('otp', mockOtp, { shouldValidate: true })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  Auto-fill OTP Code
                </button>
                <p className="text-[11px] text-amber-700 leading-tight">
                  Enter this 6-digit OTP code above to complete your login. To enable direct Gmail SMTP sending to your inbox, set <code className="font-bold">SMTP_USER</code> &amp; <code className="font-bold">SMTP_PASSWORD</code> in <code className="font-bold">backend/.env</code>.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-center text-green-900 shadow-sm space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-800">
                  📱 OTP Sent
                </p>
                <p className="text-xs text-green-800 leading-snug">
                  An OTP has been sent to <span className="font-semibold">{maskedMobile}</span>. Please check your messages.
                </p>
              </div>
            )}
          </form>
        )}

        {/* Step 3 — Worker Registration Details */}
        {step === 'register' && (
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-2">
              <h2 className="text-xl font-bold text-gray-900">Worker Registration</h2>
              <p className="text-xs text-gray-500">
                Please provide your details to personalize your welfare &amp; wage entitlements.
              </p>
            </div>

            <div className="space-y-3 text-left">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  value={regForm.age}
                  onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Region Where He Belongs (Origin State & District) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Origin State (Belongs to)</label>
                  <select
                    value={regForm.originState}
                    onChange={(e) => setRegForm({ ...regForm, originState: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-600 bg-white"
                  >
                    <option value="Bihar">Bihar</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Origin District</label>
                  <input
                    type="text"
                    placeholder="e.g. Patna / Gaya"
                    value={regForm.originDistrict}
                    onChange={(e) => setRegForm({ ...regForm, originDistrict: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-600"
                  />
                </div>
              </div>

              {/* Where He Is Working (Current District & City) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Current District (Working)</label>
                  <select
                    value={regForm.currentDistrict}
                    onChange={(e) => setRegForm({ ...regForm, currentDistrict: e.target.value, currentCity: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-600 bg-white"
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Occupation / Work</label>
                  <select
                    value={regForm.occupation}
                    onChange={(e) => setRegForm({ ...regForm, occupation: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-600 bg-white"
                  >
                    <option value="Mason">Mason (Construction)</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Welder">Welder</option>
                    <option value="Weaver">Weaver (Textiles)</option>
                    <option value="Diamond Polisher">Diamond Polisher</option>
                    <option value="Factory Operator">Factory Machine Operator</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCompleteRegistration}
              disabled={savingReg}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 text-sm transition-colors shadow-sm mt-3"
            >
              {savingReg ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Registration &amp; Proceed →
            </button>

            <button
              type="button"
              onClick={() => navigate('/worker')}
              className="w-full text-xs text-gray-500 hover:text-gray-800 font-medium py-1 transition-colors"
            >
              Skip &amp; Complete Profile Later
            </button>
          </div>
        )}
      </div>

      {/* Language note */}
      <p className="mt-6 text-xs text-gray-500">
        Available in · <span className="font-medium">English</span> · हिन्दी · ગુજરાતી
      </p>
    </div>
  )
}
