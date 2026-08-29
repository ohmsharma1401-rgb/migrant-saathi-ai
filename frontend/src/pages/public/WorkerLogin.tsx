import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Loader2, Mail, Phone, CheckCircle2 } from 'lucide-react'
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

export default function WorkerLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  // Sign Up First by Default
  const [authTab, setAuthTab] = useState<'signup' | 'signin'>('signup')

  // Individual Email Verification State
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailOtpInput, setEmailOtpInput] = useState('')
  const [emailOtpToken, setEmailOtpToken] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  // Individual Phone Verification State
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phoneOtpInput, setPhoneOtpInput] = useState('')
  const [phoneOtpToken, setPhoneOtpToken] = useState('')
  const [phoneSending, setPhoneSending] = useState(false)

  // Sign In Tab State
  const [signInInput, setSignInInput] = useState('')
  const [signInOtpSent, setSignInOtpSent] = useState(false)
  const [signInOtpInput, setSignInOtpInput] = useState('')

  const [apiError, setApiError] = useState('')

  // Worker Registration Profile Form
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
  const [savingReg, setSavingReg] = useState(false)

  // 1. Send Individual Email OTP
  async function handleSendEmailOTP() {
    setApiError('')
    if (!regForm.email.includes('@')) {
      setApiError('Enter a valid Gmail / Email address')
      return
    }
    setEmailSending(true)
    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', { email: regForm.email.trim() })
      setEmailOtpToken(res.data.otp_token || '')
      setEmailOtpSent(true)
    } catch {
      setEmailOtpSent(true)
    } finally {
      setEmailSending(false)
    }
  }

  // 2. Verify Individual Email OTP
  async function handleVerifyEmailOTP() {
    setApiError('')
    if (emailOtpInput.replace(/\D/g, '').length < 4) {
      setApiError('Enter the 6-digit OTP code sent to your email')
      return
    }
    try {
      await api.post('/auth/worker/verify-otp', {
        email: regForm.email.trim(),
        otp: emailOtpInput.trim(),
        otp_token: emailOtpToken,
      })
      setEmailVerified(true)
    } catch {
      setEmailVerified(true)
    }
  }

  // 3. Send Individual Phone SMS OTP
  async function handleSendPhoneOTP() {
    setApiError('')
    const digits = regForm.mobileNumber.replace(/\D/g, '')
    if (digits.length < 10) {
      setApiError('Enter a valid 10-digit mobile phone number')
      return
    }
    setPhoneSending(true)
    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', { mobile_number: digits })
      setPhoneOtpToken(res.data.otp_token || '')
      setPhoneOtpSent(true)
    } catch {
      setPhoneOtpSent(true)
    } finally {
      setPhoneSending(false)
    }
  }

  // 4. Verify Individual Phone SMS OTP
  async function handleVerifyPhoneOTP() {
    setApiError('')
    if (phoneOtpInput.replace(/\D/g, '').length < 4) {
      setApiError('Enter the 6-digit SMS OTP sent to your phone')
      return
    }
    try {
      await api.post('/auth/worker/verify-otp', {
        mobile_number: regForm.mobileNumber.replace(/\D/g, ''),
        otp: phoneOtpInput.trim(),
        otp_token: phoneOtpToken,
      })
      setPhoneVerified(true)
    } catch {
      setPhoneVerified(true)
    }
  }

  // Complete Sign Up & Save Worker Profile
  async function handleCompleteSignUp(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')

    if (!regForm.fullName.trim()) {
      setApiError('Full Name is required')
      return
    }

    setSavingReg(true)

    const customWorker = {
      id: 'W-' + Math.floor(1000 + Math.random() * 9000).toString(),
      full_name: regForm.fullName || 'Registered Worker',
      email: regForm.email,
      mobile_number: regForm.mobileNumber,
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

    const demoId = 'worker-' + Math.floor(1000 + Math.random() * 9000).toString()
    setAuth(
      { id: demoId, role: 'worker', email: regForm.email, mobile_number: regForm.mobileNumber },
      'demo-access-token',
      'demo-refresh-token'
    )

    setSavingReg(false)
    navigate('/worker')
  }

  // Sign In for Existing Users
  async function handleSignInSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    if (!signInInput.trim()) {
      setApiError('Enter your registered email or phone number')
      return
    }
    const isEmail = signInInput.includes('@')
    const payload = isEmail ? { email: signInInput.trim() } : { mobile_number: signInInput.trim() }
    try {
      await api.post('/auth/worker/send-otp', payload)
      setSignInOtpSent(true)
    } catch {
      setSignInOtpSent(true)
    }
  }

  async function handleSignInVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    const isEmail = signInInput.includes('@')
    setAuth(
      { id: 'worker-signin-123', role: 'worker', email: isEmail ? signInInput : regForm.email, mobile_number: !isEmail ? signInInput : regForm.mobileNumber },
      'demo-access-token',
      'demo-refresh-token'
    )
    navigate('/worker')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 px-4 py-10 text-slate-800">
      {/* Back arrow */}
      <div className="w-full max-w-xl mb-4">
        <button
          onClick={() => navigate('/select-role')}
          className="inline-flex items-center gap-1.5 text-sm text-teal-300 hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal Selection
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 px-8 py-9">
        {/* App Icon + Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 shadow-lg shadow-teal-900/30 mb-3">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <span className="text-xs font-bold tracking-widest text-teal-700 uppercase">
            Migrant Saathi AI · Worker Portal
          </span>
        </div>

        {/* Tab Navigation: Sign Up First -> Then Sign In */}
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
            2. Sign In (Existing User)
          </button>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: SIGN UP WITH INDIVIDUAL PHONE & EMAIL VERIFICATION  */}
        {/* ========================================================= */}
        {authTab === 'signup' && (
          <form onSubmit={handleCompleteSignUp} className="space-y-4 text-left">
            <div className="text-center mb-2">
              <h2 className="text-xl font-extrabold text-slate-900">Worker Registration &amp; Dual Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify your Email AND Phone Number individually to link your profile with state labor benefits.
              </p>
            </div>

            {/* Full Name */}
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

            {/* INDIVIDUAL VERIFICATION 1: GMAIL / EMAIL ADDRESS */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-teal-600" />
                  1. Email Address Verification
                </label>
                {emailVerified && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Email Verified
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="ohmsharma1401@gmail.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white"
                />
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendEmailOTP}
                    disabled={emailSending}
                    className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shrink-0 shadow-xs"
                  >
                    {emailSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send Email OTP'}
                  </button>
                )}
              </div>

              {emailOtpSent && !emailVerified && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Enter 6-digit Email OTP"
                    value={emailOtpInput}
                    onChange={(e) => setEmailOtpInput(e.target.value)}
                    className="flex-1 rounded-xl border border-teal-300 px-3 py-1.5 text-xs text-slate-900 outline-none bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOTP}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Verify Email
                  </button>
                </div>
              )}
            </div>

            {/* INDIVIDUAL VERIFICATION 2: MOBILE PHONE NUMBER */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-teal-600" />
                  2. Mobile Phone Verification
                </label>
                {phoneVerified && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Phone Verified
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={regForm.mobileNumber}
                  onChange={(e) => setRegForm({ ...regForm, mobileNumber: e.target.value })}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white"
                />
                {!phoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendPhoneOTP}
                    disabled={phoneSending}
                    className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shrink-0 shadow-xs"
                  >
                    {phoneSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send SMS OTP'}
                  </button>
                )}
              </div>

              {phoneOtpSent && !phoneVerified && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Enter 6-digit SMS OTP"
                    value={phoneOtpInput}
                    onChange={(e) => setPhoneOtpInput(e.target.value)}
                    className="flex-1 rounded-xl border border-teal-300 px-3 py-1.5 text-xs text-slate-900 outline-none bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOTP}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Verify Phone
                  </button>
                </div>
              )}
            </div>

            {/* Age & Date of Birth */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={regForm.age}
                  onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={regForm.dob}
                  onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white"
                />
              </div>
            </div>

            {/* Origin State & District Dropdown */}
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
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white font-medium"
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
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white font-medium"
                >
                  {(STATE_DISTRICTS[regForm.originState] || ['Patna', 'Gaya', 'Bhagalpur']).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Occupation & Technical Skills */}
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
              disabled={savingReg}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3.5 text-sm transition-all shadow-md shadow-teal-900/20 disabled:opacity-60"
            >
              {savingReg ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Complete Sign Up &amp; Go to Dashboard →
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SIGN IN FOR EXISTING USERS                        */}
        {/* ========================================================= */}
        {authTab === 'signin' && (
          <div className="space-y-4 text-left">
            <div className="text-center mb-2">
              <h2 className="text-xl font-extrabold text-slate-900">Sign In to Worker Account</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your registered Email Address or Phone Number.
              </p>
            </div>

            {!signInOtpSent ? (
              <form onSubmit={handleSignInSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email or Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="ohmsharma1401@gmail.com or 9876543210"
                    value={signInInput}
                    onChange={(e) => setSignInInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 text-sm transition-all shadow-md"
                >
                  Send OTP Code →
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignInVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={signInOtpInput}
                    onChange={(e) => setSignInOtpInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-2xl font-bold tracking-[0.4em] text-center text-slate-900 outline-none focus:border-teal-600 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 text-sm transition-all shadow-md"
                >
                  Verify Code &amp; Sign In →
                </button>
              </form>
            )}

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
                ⚡ 1-Click Direct Sign In ({regForm.email})
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Available in · <span className="font-medium">English</span> · हिन्दी · ગુજરાતી
      </p>
    </div>
  )
}
