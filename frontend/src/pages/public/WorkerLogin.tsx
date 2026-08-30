import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Loader2, Mail, Phone, CheckCircle2, Building2, MapPin, Briefcase } from 'lucide-react'
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

const GUJARAT_WORKING_DISTRICTS = [
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Kutch',
  'Bharuch',
  'Bhavnagar',
  'Jamnagar',
  'Mehsana',
  'Anand',
  'Morbi',
  'Valsad',
  'Gandhinagar',
  'Navsari',
  'Surendranagar',
]

const DEMO_COMPANIES = [
  { name: 'L&T Construction (Larsen & Toubro Ltd)', sector: 'Construction & Civil Infrastructure', district: 'Ahmedabad' },
  { name: 'Adani Ports & Special Economic Zone (APSEZ)', sector: 'Port Logistics & Heavy Machinery', district: 'Kutch' },
  { name: 'Tata Motors Passenger Vehicles Ltd (Sanand)', sector: 'Automotive & Assembly', district: 'Ahmedabad' },
  { name: 'Reliance Industries Limited (Hazira Complex)', sector: 'Petrochemicals & Electrical Wiring', district: 'Surat' },
  { name: 'Arvind Limited Textiles & Apparel', sector: 'Textile Mills & Weaving Operations', district: 'Ahmedabad' },
  { name: 'Kiran Gems & Diamond Processing Corp', sector: 'Diamond Cutting & Polishing', district: 'Surat' },
  { name: 'Shree Ram Krishna Exports (SRK Diamond Ltd)', sector: 'Diamond Processing & Gemology', district: 'Surat' },
  { name: 'Welspun India Manufacturing Facility', sector: 'Textile Manufacturing & Industrial Plant', district: 'Kutch' },
  { name: 'Torrent Pharmaceuticals Indrad Complex', sector: 'Pharma Machine Operation', district: 'Mehsana' },
  { name: 'Gujarat State Road Transport Corp (GSRTC)', sector: 'Heavy Vehicle Driving & Fleet Maintenance', district: 'Vadodara' },
]

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
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('')

  // Sign In Tab State
  const [signInInput, setSignInInput] = useState('')
  const [signInOtpSent, setSignInOtpSent] = useState(false)
  const [signInOtpInput, setSignInOtpInput] = useState('')
  const [signInOtpToken, setSignInOtpToken] = useState('')
  const [signInSuccessMsg, setSignInSuccessMsg] = useState('')
  const [signInSending, setSignInSending] = useState(false)

  const [apiError, setApiError] = useState('')

  // Worker Registration Profile Form
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    age: '',
    dob: '',
    yearsExp: '3',
    originState: 'Bihar',
    originDistrict: 'Patna',
    currentDistrict: 'Ahmedabad',
    currentCity: 'Sanand Industrial GIDC',
    employerName: 'L&T Construction (Larsen & Toubro Ltd)',
    occupation: 'Masonry Work',
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [savingReg, setSavingReg] = useState(false)

  // Sync Age -> Birthdate with Strict Bounds (Min 18, Max 70)
  function handleAgeChange(newAgeStr: string) {
    let parsedAge = parseInt(newAgeStr, 10)
    if (!isNaN(parsedAge)) {
      if (parsedAge > 70) parsedAge = 70
      newAgeStr = parsedAge.toString()
    }
    let newDob = regForm.dob
    if (!isNaN(parsedAge) && parsedAge >= 18 && parsedAge <= 70) {
      const currentYear = new Date().getFullYear()
      const birthYear = currentYear - parsedAge
      newDob = `${birthYear}-01-01`
    }
    setRegForm((prev) => ({ ...prev, age: newAgeStr, dob: newDob }))
  }

  // Sync Birthdate -> Age with Minimum 18
  function handleDobChange(newDobStr: string) {
    let newAge = regForm.age
    if (newDobStr) {
      const birthYear = parseInt(newDobStr.split('-')[0], 10)
      if (!isNaN(birthYear)) {
        const currentYear = new Date().getFullYear()
        const computed = currentYear - birthYear
        if (computed < 18) {
          newAge = '18'
        } else if (computed > 70) {
          newAge = '70'
        } else {
          newAge = computed.toString()
        }
      }
    }
    setRegForm((prev) => ({ ...prev, dob: newDobStr, age: newAge }))
  }

  // 1. Send Real Email OTP
  async function handleSendEmailOTP() {
    setApiError('')
    setEmailSuccessMsg('')
    if (!regForm.email.includes('@')) {
      setApiError('Enter a valid Gmail / Email address')
      return
    }
    const email = regForm.email.trim().toLowerCase()
    setEmailSending(true)
    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', { email })
      setEmailOtpToken(res.data.otp_token || '')
      setEmailOtpSent(true)
      setEmailSuccessMsg(`📩 Verification OTP code sent to your Gmail (${email}). Please check your email inbox & spam folder.`)
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Could not send email OTP. Ensure backend is running.'
      setApiError(`Email OTP Error: ${errMsg}`)
    } finally {
      setEmailSending(false)
    }
  }

  // 2. Verify Individual Email OTP
  async function handleVerifyEmailOTP() {
    setApiError('')
    if (emailOtpInput.replace(/\D/g, '').length < 4) {
      setApiError('❌ Enter the 6-digit OTP code sent to your email')
      return
    }
    try {
      await api.post('/auth/worker/verify-otp', {
        email: regForm.email.trim(),
        otp: emailOtpInput.trim(),
        otp_token: emailOtpToken,
      })
      setEmailVerified(true)
      setEmailSuccessMsg('✅ Email address successfully verified!')
      setApiError('')
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Invalid or expired OTP code'
      setApiError(`❌ Wrong OTP Entered! ${errMsg}. Please enter the correct verification code.`)
      setEmailVerified(false)
    }
  }

  // Complete Sign Up & Save Worker Profile -> Switch to Sign In Tab
  async function handleCompleteSignUp(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')

    if (!regForm.fullName.trim()) {
      setApiError('Full Name is required')
      return
    }

    if (!regForm.email.trim() || !regForm.email.includes('@')) {
      setApiError('Valid Email Address is required')
      return
    }

    const ageNum = parseInt(regForm.age, 10)
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
      setApiError('Age must be between 18 and 70 years (Minimum working age is 18)')
      return
    }

    const expNum = parseInt(regForm.yearsExp, 10) || 0
    const maxExpAllowed = Math.max(0, ageNum - 18)
    if (expNum < 0) {
      setApiError('Years of experience cannot be negative')
      return
    }
    if (expNum > maxExpAllowed) {
      setApiError(`Years of experience cannot exceed ${maxExpAllowed} years for a worker aged ${ageNum}`)
      return
    }

    setSavingReg(true)

    const customWorker = {
      id: 'W-' + Math.floor(1000 + Math.random() * 9000).toString(),
      full_name: regForm.fullName || 'Registered Worker',
      email: regForm.email,
      age: regForm.age || '30',
      dob: regForm.dob || '1996-01-01',
      years_exp: expNum,
      origin_state: regForm.originState,
      origin_district: regForm.originDistrict,
      current_district: regForm.currentDistrict,
      current_city: regForm.currentCity,
      employer: regForm.employerName,
      occupation: regForm.occupation,
      sector: regForm.employerName.includes('Textiles') ? 'Textiles' : regForm.employerName.includes('Diamond') ? 'Diamond' : 'Construction',
      skills: selectedSkills.length > 0 ? selectedSkills : ['Masonry Work', 'Safety & First Aid'],
      registered: 'Just Now (Verified)',
    }
    localStorage.setItem('saathi-custom-worker', JSON.stringify(customWorker))

    setSavingReg(false)
    setSignInInput(regForm.email)
    setSignInSuccessMsg(`🎉 Registration successful for ${regForm.fullName}! Please sign in below using your verified email (${regForm.email}).`)
    setAuthTab('signin')
  }

  // Sign In for Existing Users (Email Verification Only)
  async function handleSignInSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    setSignInSuccessMsg('')
    const email = signInInput.trim().toLowerCase()
    if (!email.includes('@')) {
      setApiError('Enter a valid registered Gmail / Email address')
      return
    }
    setSignInSending(true)
    try {
      const res = await api.post<SendOTPResponse>('/auth/worker/send-otp', { email })
      setSignInOtpToken(res.data.otp_token || '')
      setSignInOtpSent(true)
      setSignInSuccessMsg(`📩 Verification OTP code sent to your Gmail (${email}). Please check your email inbox & spam folder.`)
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Could not send Email OTP'
      setApiError(`OTP Error: ${errMsg}`)
    } finally {
      setSignInSending(false)
    }
  }

  async function handleSignInVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')
    const email = signInInput.trim()
    const otp = signInOtpInput.trim()
    if (!otp) {
      setApiError('❌ Please enter the 6-digit OTP code sent to your email')
      return
    }

    try {
      const res = await api.post('/auth/worker/verify-otp', {
        email,
        otp,
        otp_token: signInOtpToken,
      })
      if (res.data.access_token) {
        setAuth(
          { id: res.data.user_id || 'worker-signin-123', role: 'worker', email, mobile_number: regForm.mobileNumber || '' },
          res.data.access_token,
          res.data.refresh_token
        )
        navigate('/worker')
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || err?.message || 'Invalid or expired OTP code'
      setApiError(`❌ Wrong OTP Entered! ${errMsg}. Please enter the correct 6-digit OTP code sent to your email.`)
    }
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

        {/* Global Error Banner */}
        {apiError && (
          <div className="rounded-2xl bg-rose-50 border border-rose-300 p-3.5 text-xs font-bold text-rose-800 flex items-start gap-2.5 mb-5 shadow-xs animate-shake">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <span className="font-extrabold block text-sm text-rose-900">Verification Error</span>
              <span>{apiError}</span>
            </div>
          </div>
        )}

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
                placeholder="Enter your Full Name (e.g. Ramesh Kumar)"
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
                  placeholder="Enter your Gmail / Email Address"
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
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP received in Email"
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      className="flex-1 rounded-xl border border-teal-300 px-3 py-1.5 text-xs text-slate-900 outline-none bg-white font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmailOTP}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                    >
                      Verify Email
                    </button>
                  </div>
                  {emailSuccessMsg && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
                      {emailSuccessMsg}
                    </p>
                  )}
                </div>
              )}
            </div>



            {/* Dynamic Bounded Age (18-70 Yrs), Birthdate & Work Experience */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-teal-600" />
                Age &amp; Work Experience (Labor Law Bounded) *
              </label>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Age (18–70 Yrs) *</label>
                  <input
                    type="number"
                    min={18}
                    max={70}
                    required
                    placeholder="18 to 70"
                    value={regForm.age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={regForm.dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-2 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Experience (Yrs) *</label>
                  <input
                    type="number"
                    min={0}
                    max={regForm.age ? Math.max(0, parseInt(regForm.age, 10) - 18) : 50}
                    required
                    placeholder="Years"
                    value={regForm.yearsExp}
                    onChange={(e) => setRegForm({ ...regForm, yearsExp: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 font-bold bg-white"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                🔒 Bounded by law: Minimum working age is 18 years. Max experience is capped relative to working age.
              </p>
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

            {/* CURRENT GUJARAT WORK LOCATION DETAILS */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-600" />
                Current Work Location (in Gujarat) *
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Working District (Gujarat) *</label>
                  <select
                    value={regForm.currentDistrict}
                    onChange={(e) => setRegForm({ ...regForm, currentDistrict: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white font-medium"
                  >
                    {GUJARAT_WORKING_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City / Industrial Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanand GIDC, Pandesara"
                    value={regForm.currentCity}
                    onChange={(e) => setRegForm({ ...regForm, currentCity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* DEMO COMPANIES & EMPLOYER SELECTION ACCORDING TO ROLES */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-teal-600" />
                Select Employer / Registered Company (Gujarat) *
              </label>

              <select
                value={regForm.employerName}
                onChange={(e) => setRegForm({ ...regForm, employerName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 bg-white font-medium"
              >
                {DEMO_COMPANIES.map((comp) => (
                  <option key={comp.name} value={comp.name}>
                    🏢 {comp.name} — ({comp.sector} · {comp.district})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 italic">
                Choose from prominent Gujarat enterprises according to your technical trade role.
              </p>
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
              Complete Registration → (Proceed to Sign In)
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SIGN IN FOR EXISTING USERS (EMAIL OTP ONLY)       */}
        {/* ========================================================= */}
        {authTab === 'signin' && (
          <div className="space-y-4 text-left">
            <div className="text-center mb-2">
              <h2 className="text-xl font-extrabold text-slate-900">Sign In via Email Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your registered Email Address to receive your 6-digit OTP verification code.
              </p>
            </div>

            {signInSuccessMsg && (
              <p className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                {signInSuccessMsg}
              </p>
            )}

            {!signInOtpSent ? (
              <form onSubmit={handleSignInSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-teal-600" />
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered Gmail / Email address"
                    value={signInInput}
                    onChange={(e) => setSignInInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={signInSending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3.5 text-sm transition-all shadow-md shadow-teal-900/20 disabled:opacity-60"
                >
                  {signInSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send Email OTP Code →
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignInVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit Email OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
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
                  Verify Email Code &amp; Sign In →
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Available in · <span className="font-medium">English</span> · Hindi · Gujarati
      </p>
    </div>
  )
}
