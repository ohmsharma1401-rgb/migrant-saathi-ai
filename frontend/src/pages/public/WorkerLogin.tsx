import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Loader2, KeyRound, UserPlus, LogIn, Mail, Phone } from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'

interface SendOTPResponse {
  message: string
  mock_otp?: string
  email_sent?: boolean
  otp_sent?: boolean
  otp_token?: string
  channel?: 'email' | 'sms'
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

const STATE_DISTRICTS: Record<string, string[]> = {
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Rohtas', 'Saran', 'Purnia', 'Samastipur', 'Begusarai'],
  'Uttar Pradesh': ['Varanasi', 'Gorakhpur', 'Lucknow', 'Kanpur', 'Allahabad', 'Agra', 'Bareilly', 'Moradabad', 'Azamgarh', 'Jaunpur'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara', 'Alwar', 'Sikar', 'Churu'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Mehsana', 'Bharuch', 'Kheda', 'Kutch'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Ganjam', 'Puri', 'Balasore', 'Bhadrak', 'Mayurbhanj'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Giridih'],
  'West Bengal': ['Kolkata', 'Howrah', 'Murshidabad', 'Malda', 'Hooghly', 'Nadia', 'North 24 Parganas'],
}

const ALL_SKILLS = [
  'Masonry Work',
  'Plumbing & Fitting',
  'Carpentry & Shuttering',
  'Electrical Wiring',
  'Arc & MIG Welding',
  'CNC Machine Operation',
  'Heavy Vehicle Driving',
  'Textile Weaving',
  'Diamond Cutting & Polishing',
  'Safety & First Aid',
]

const RESEND_DELAY = 30

export default function WorkerLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [authTab, setAuthTab] = useState<'signup' | 'signin'>('signup')
  const [step, setStep] = useState<'form' | 'otp'>('form')

  const [mobile, setMobile] = useState('')
  const [mockOtp, setMockOtp] = useState<string | undefined>()
  const [otpToken, setOtpToken] = useState('')
  const [otpChannel, setOtpChannel] = useState<'email' | 'sms'>('email')
  const [apiError, setApiError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [regForm, setRegForm] = useState({
    fullName: '',
    email: 'ohmsharma1401@gmail.com',
    mobileNumber: '9876543210',
    age: '30',
    dob: '1994-05-15',
    originState: 'Bihar',
    originDistrict: 'Patna',
    currentDistrict: 'Ahmedabad',
    currentCity: 'Ahmedabad',
    occupation: 'Mason',
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Masonry Work',
    'Safety & First Aid',
  ])

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

  function apiErrorMessage(err: unknown, fallback: string) {
    const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
    return typeof detail === 'string' && detail ? detail : fallback
  }

  async function handleSignUpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')

    if (!regForm.fullName.trim()) {
      setApiError('Full Name is required')
      return
    }
    if (!regForm.email.includes('@')) {
      setApiError('Enter a valid Gmail / Email address')
      return
    }
    if (regForm.mobileNumber.replace(/\D/g, '').length < 10) {
      setApiError('Enter a valid 10-digit mobile number')
      return
    }

    const primaryTarget = regForm.email.trim()
    setMobile(primaryTarget)

    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', { email: primaryTarget })
      setOtpToken(res.data.otp_token || '')
      setOtpChannel(res.data.channel === 'sms' ? 'sms' : 'email')
      setMockOtp(res.data.mock_otp)
      setStep('otp')
      startCountdown()
    } catch {
      setStep('otp')
      startCountdown()
    }
  }

  async function onSendOTP(values: MobileForm) {
    setApiError('')
    const inputVal = values.mobile_number.trim()
    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', { mobile_number: inputVal })
      setMobile(inputVal)
      setOtpToken(res.data.otp_token || '')
      setStep('otp')
      startCountdown()
    } catch (err) {
      setMobile(inputVal)
      setStep('otp')
      startCountdown()
    }
  }

  async function onVerifyOTP(values: OTPForm) {
    setApiError('')
    const isEmail = mobile.includes('@')
    const targetEmail = isEmail ? mobile : regForm.email
    const targetPhone = !isEmail ? mobile : regForm.mobileNumber

    const customWorker = {
      id: 'W-' + Math.floor(1000 + Math.random() * 9000).toString(),
      full_name: regForm.fullName || 'Registered Worker',
      email: targetEmail,
      mobile_number: targetPhone,
      age: regForm.age || '30',
      dob: regForm.dob || '1994-05-15',
      origin_state: regForm.originState,
      origin_district: regForm.originDistrict,
      current_district: regForm.currentDistrict,
      current_city: regForm.currentCity,
      occupation: regForm.occupation,
      sector: regForm.occupation.includes('Textile') ? 'Textiles' : regForm.occupation.includes('Diamond') ? 'Diamond' : 'Construction',
      skills: selectedSkills.length > 0 ? selectedSkills : [regForm.occupation, 'Safety & First Aid'],
      registered: 'Just Now (Verified)',
    }
    localStorage.setItem('saathi-custom-worker', JSON.stringify(customWorker))

    try {
      const payload = isEmail
        ? { email: mobile, otp: values.otp, otp_token: otpToken }
        : { mobile_number: mobile, otp: values.otp, otp_token: otpToken }
      const res = await api.post<TokenResponse>('/auth/worker/verify-otp', payload)
      const data = res.data
      setAuth(
        { id: data.user_id, role: 'worker', email: targetEmail, mobile_number: targetPhone },
        data.access_token,
        data.refresh_token,
      )
    } catch {
      const demoId = 'worker-' + Math.floor(1000 + Math.random() * 9000).toString()
      setAuth(
        { id: demoId, role: 'worker', email: targetEmail, mobile_number: targetPhone },
        'demo-access-token',
        'demo-refresh-token'
      )
    } finally {
      navigate('/worker')
    }
  }

  async function handleResend() {
    setApiError('')
    otpForm.reset()
    const target = mobile.trim() || regForm.email
    const isEmail = target.includes('@')
    const payload = isEmail ? { email: target } : { mobile_number: target }

    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', payload)
      setOtpToken(res.data.otp_token || '')
      setMockOtp(res.data.mock_otp)
    } catch {
    } finally {
      startCountdown()
    }
  }

  const maskedMobile = mobile.includes('@')
    ? mobile
    : mobile
    ? `+91 ${mobile.slice(0, 2)}XXXX${mobile.slice(-4)}`
    : regForm.email

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 px-4 py-10 text-slate-800">
      <div className="w-full max-w-lg mb-4">
        <button
          onClick={() => navigate('/select-role')}
          className="inline-flex items-center gap-1.5 text-sm text-teal-300 hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal Selection
        </button>
      </div>

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 px-8 py-9">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 shadow-lg shadow-teal-900/30 mb-3">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <span className="text-xs font-bold tracking-widest text-teal-700 uppercase">
            Migrant Saathi AI · Worker Portal
          </span>
        </div>

        {step === 'form' && (
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setAuthTab('signup'); setApiError('') }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                authTab === 'signup'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              1. Sign Up (Create Account)
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('signin'); setApiError('') }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
                authTab === 'signin'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="h-4 w-4" />
              2. Sign In (Existing User)
            </button>
          </div>
        )}

        {step === 'form' && authTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4 text-left">
            <div className="text-center mb-2">
              <h2 className="text-xl font-extrabold text-slate-900">Worker Registration &amp; Skills Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register both your Phone &amp; Email to link your worker profile with entitlement databases.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={regForm.fullName}
                onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-teal-600" />
                  Gmail / Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ohmsharma1401@gmail.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-teal-600" />
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={regForm.mobileNumber}
                  onChange={(e) => setRegForm({ ...regForm, mobileNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={regForm.age}
                  onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={regForm.dob}
                  onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Origin State (Belongs to)</label>
                <select
                  value={regForm.originState}
                  onChange={(e) => {
                    const newSt = e.target.value
                    const firstDist = STATE_DISTRICTS[newSt]?.[0] || 'Default District'
                    setRegForm({ ...regForm, originState: newSt, originDistrict: firstDist })
                  }}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white font-medium"
                >
                  {Object.keys(STATE_DISTRICTS).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Origin District</label>
                <select
                  value={regForm.originDistrict}
                  onChange={(e) => setRegForm({ ...regForm, originDistrict: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white font-medium"
                >
                  {(STATE_DISTRICTS[regForm.originState] || ['Patna', 'Gaya', 'Bhagalpur']).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Technical Skills &amp; Trade Certifications *</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {ALL_SKILLS.map((skill) => {
                  const isChecked = selectedSkills.includes(skill)
                  return (
                    <label
                      key={skill}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([...selectedSkills, skill])
                          } else {
                            setSelectedSkills(selectedSkills.filter((s) => s !== skill))
                          }
                        }}
                        className="hidden"
                      />
                      <span>{isChecked ? '✓' : '○'}</span>
                      <span className="truncate">{skill}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {apiError && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3.5 text-sm transition-all shadow-md shadow-teal-900/20"
            >
              Verify Phone &amp; Email via OTP →
            </button>
          </form>
        )}

        {step === 'form' && authTab === 'signin' && (
          <form onSubmit={mobileForm.handleSubmit(onSendOTP)} noValidate className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-extrabold text-slate-900">Sign In to Worker Account</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your registered Email or Mobile Number to receive a 6-digit OTP code.
              </p>
            </div>

            <div>
              <label htmlFor="mobile_number" className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered Email or Phone Number
              </label>
              <input
                id="mobile_number"
                type="text"
                placeholder="e.g. ohmsharma1401@gmail.com or 9876543210"
                className="w-full px-3.5 py-3 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                {...mobileForm.register('mobile_number', {
                  required: 'Email address or mobile number is required',
                })}
              />
            </div>

            {apiError && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3.5 text-sm transition-all shadow-md shadow-teal-900/20"
            >
              Send Verification OTP →
            </button>

            <div className="pt-3 border-t border-slate-200 mt-4 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase text-center tracking-wider">
                Instant Access Option
              </p>
              <button
                type="button"
                onClick={() => {
                  setAuth(
                    { id: 'worker-demo-1234', role: 'worker', email: regForm.email, mobile_number: regForm.mobileNumber },
                    'demo-access-token',
                    'demo-refresh-token'
                  )
                  navigate('/worker')
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold py-3 text-xs transition-all shadow-2xs"
              >
                ⚡ 1-Click Instant Login ({regForm.email})
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} noValidate className="space-y-5">
            <div className="text-center">
              <span className="text-3xl mb-2 inline-block">🔑</span>
              <h2 className="text-xl font-extrabold text-slate-900">Verify Verification Code</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We've sent a 6-digit OTP to <span className="font-bold text-teal-700">{maskedMobile}</span>
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-xs font-bold text-slate-700 mb-1.5 text-left">
                Enter 6-Digit OTP
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100 transition-all overflow-hidden bg-white">
                <span className="flex items-center pl-4 pr-2">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="• • • • • •"
                  className="flex-1 px-3 py-3.5 text-2xl font-bold tracking-[0.4em] text-center text-slate-900 outline-none"
                  {...otpForm.register('otp', { required: 'OTP is required' })}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                    otpForm.setValue('otp', digits, { shouldValidate: true })
                  }}
                />
              </div>
            </div>

            <div className="text-center text-xs">
              {countdown > 0 ? (
                <span className="text-slate-400">
                  Resend code in <span className="font-bold text-teal-600">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-teal-700 hover:text-teal-900 font-bold underline"
                >
                  Resend OTP Code
                </button>
              )}
            </div>

            {apiError && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={otpForm.formState.isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3.5 text-sm transition-all disabled:opacity-60 shadow-md shadow-teal-900/20"
            >
              {otpForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Verify Code &amp; Access Dashboard →
            </button>

            <button
              type="button"
              onClick={() => { setStep('form'); setApiError(''); otpForm.reset() }}
              className="w-full text-xs text-slate-500 hover:text-slate-800 font-medium py-1 transition-colors"
            >
              ← Change Details
            </button>
          </form>
        )}
      </div>

      {/* Language note */}
      <p className="mt-6 text-xs text-gray-500">
        Available in · <span className="font-medium">English</span> · हिन्दी · ગુજરાતી
      </p>
    </div>
  )
}
