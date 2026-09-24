import { useState, useEffect, useRef } from 'react'
import { User, CheckCircle, AlertCircle, ChevronRight, Camera, Upload, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/utils/translations'
import api from '@/services/api'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Puducherry','Chandigarh',
]

const GUJARAT_DISTRICTS = [
  'Ahmedabad','Amreli','Anand','Arvalli','Banaskantha','Bharuch',
  'Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka',
  'Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch',
  'Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal',
  'Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar',
  'Tapi','Vadodara','Valsad',
]

const SECTORS = ['Construction','Textiles','Diamond','Manufacturing','Agriculture','Domestic','Other']

const DEFAULT_FORM = {
  fullName: 'Ramesh Kumar',
  dateOfBirth: '1990-06-15',
  gender: 'male' as 'male' | 'female' | 'other',
  originState: 'Bihar',
  currentDistrict: 'Surat',
  currentCity: 'Surat',
  occupation: 'Mason',
  sector: 'Construction',
  employer: 'Shree Construction Ltd.',
  yearsExp: 5,
  aadhaarLast4: '4321',
  language: 'en' as 'en' | 'hi' | 'gu',
}

const SECTIONS = [
  { label: 'Profile Picture',      fields: ['fullName'] },
  { label: 'Personal Information', fields: ['fullName', 'dateOfBirth', 'gender'] },
  { label: 'Location Information', fields: ['originState', 'currentDistrict', 'currentCity'] },
  { label: 'Work Information',     fields: ['occupation', 'sector', 'yearsExp'] },
  { label: 'Contact & Identity',   fields: ['aadhaarLast4'] },
]

function calcCompletion(form: typeof DEFAULT_FORM): { pct: number; complete: boolean[] } {
  const complete = SECTIONS.map(({ fields }) =>
    fields.every((f) => {
      const val = form[f as keyof typeof form]
      return val !== '' && val !== null && val !== undefined && val !== 0
    })
  )
  const pct = Math.round((complete.filter(Boolean).length / SECTIONS.length) * 100)
  return { pct, complete }
}

function Toast({ show, message }: { show: boolean; message: string }) {
  if (!show) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-[#0C2D27] px-6 py-3.5 text-white text-xs font-bold shadow-xl border border-emerald-800">
      <CheckCircle className="h-4 w-4 text-[#C0E862]" />
      {message}
    </div>
  )
}

function FieldRow({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0C2D27] mb-1.5 flex items-center gap-1">
        <span>{label}</span>
        {optional && <span className="text-slate-400 font-normal">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

export default function WorkerProfile() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const savedPic = localStorage.getItem('saathi-worker-avatar')
      if (savedPic) {
        setProfilePic(savedPic)
      }
      const customStr = localStorage.getItem('saathi-custom-worker')
      if (customStr) {
        const c = JSON.parse(customStr)
        setForm((f) => ({
          ...f,
          fullName: c.full_name || f.fullName,
          dateOfBirth: c.dob || f.dateOfBirth,
          originState: c.origin_state || f.originState,
          currentDistrict: c.current_district || f.currentDistrict,
          currentCity: c.current_city || f.currentCity,
          occupation: c.occupation || f.occupation,
          sector: c.sector || f.sector,
        }))
        if (c.profile_pic) {
          setProfilePic(c.profile_pic)
        }
      }
    } catch {
      // Fallback
    }
  }, [])

  const { pct, complete } = calcCompletion(form)

  function set<K extends keyof typeof DEFAULT_FORM>(key: K, value: typeof DEFAULT_FORM[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Handle Image File Selection from Gallery / Device
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      if (dataUrl) {
        setProfilePic(dataUrl)
        localStorage.setItem('saathi-worker-avatar', dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleRemovePhoto() {
    setProfilePic(null)
    localStorage.removeItem('saathi-worker-avatar')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (profilePic) {
        localStorage.setItem('saathi-worker-avatar', profilePic)
      } else {
        localStorage.removeItem('saathi-worker-avatar')
      }

      const customWorker = {
        full_name: form.fullName,
        dob: form.dateOfBirth,
        origin_state: form.originState,
        current_district: form.currentDistrict,
        current_city: form.currentCity,
        occupation: form.occupation,
        sector: form.sector,
        profile_pic: profilePic,
      }
      localStorage.setItem('saathi-custom-worker', JSON.stringify(customWorker))

      await api.patch('/workers/profile', {
        full_name: form.fullName,
        origin_state: form.originState,
        current_district: form.currentDistrict,
        current_city: form.currentCity,
        gender: form.gender,
        dob: form.dateOfBirth || undefined,
        preferred_language: form.language,
      })
    } catch {
      // Local fallback
    } finally {
      setSaving(false)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 3000)
    }
  }

  const inputCls =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-[#0C2D27] placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B53]'

  const initial = (form.fullName || 'R').charAt(0).toUpperCase()

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
          <span className="w-4 h-[2px] bg-[#FF6B53]" />
          MY WORKER PROFILE
        </div>
        <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight">{t('profile_title')}</h1>
        <p className="text-xs sm:text-sm text-[#52605D] mt-0.5">
          {t('profile_subtitle')}
        </p>
      </div>

      {/* ── Completion Indicator Card ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-[#0C2D27]">{t('profile_verification')}</span>
          <span className="text-xs sm:text-sm font-black text-[#0C2D27]">{pct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0C2D27] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {SECTIONS.map(({ label }, i) => (
            <div key={label} className="flex items-center gap-1.5 text-xs font-medium">
              {complete[i] ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              )}
              <span className={complete[i] ? 'text-slate-600' : 'text-amber-700'}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Profile Picture Upload Card (Device / Gallery Upload) ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0C2D27]">1. Profile Picture (Photo ID)</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
          {/* Avatar Preview */}
          <div className="relative group">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-black text-3xl flex items-center justify-center border-4 border-orange-100 shadow-md">
                {initial}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#FF6B53] text-white shadow-md hover:bg-[#FF5A43] transition-transform hover:scale-105 cursor-pointer"
              title="Upload photo from device"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 text-center sm:text-left">
            <b className="text-sm font-bold text-[#0C2D27] block">Upload Profile Photo</b>
            <p className="text-xs text-[#52605D] max-w-xs leading-relaxed">
              Upload a clear photo from your phone or device gallery. Supported formats: JPG, PNG, WEBP (Max 5MB).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 justify-center sm:justify-start">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="figma-btn-coral py-2 px-4 text-xs font-bold flex items-center gap-2"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Choose Photo from Device</span>
              </button>

              {profilePic && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Personal Information ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0C2D27]">2. {t('personal_info')}</h2>
        <div className="space-y-4">
          <FieldRow label={t('full_name')}>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={inputCls}
              placeholder="e.g. Ramesh Kumar"
            />
          </FieldRow>

          <FieldRow label="Date of Birth">
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Gender">
            <div className="flex gap-6 mt-1">
              {(['male', 'female', 'other'] as const).map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0C2D27] capitalize">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={() => set('gender', g)}
                    className="h-4 w-4 accent-[#0C2D27]"
                  />
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </FieldRow>
        </div>
      </div>

      {/* ── Section 3: Location Information ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0C2D27]">3. Location Information</h2>
        <div className="space-y-4">
          <FieldRow label={t('home_state')}>
            <select
              className={inputCls}
              value={form.originState}
              onChange={(e) => set('originState', e.target.value)}
            >
              <option value="">Select state…</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FieldRow>

          <FieldRow label={t('current_district')}>
            <select
              className={inputCls}
              value={form.currentDistrict}
              onChange={(e) => set('currentDistrict', e.target.value)}
            >
              <option value="">Select district…</option>
              {GUJARAT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </FieldRow>

          <FieldRow label="Current City">
            <input
              type="text"
              value={form.currentCity}
              onChange={(e) => set('currentCity', e.target.value)}
              className={inputCls}
              placeholder="e.g. Surat"
            />
          </FieldRow>
        </div>
      </div>

      {/* ── Section 4: Work Information ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0C2D27]">4. Work Information</h2>
        <div className="space-y-4">
          <FieldRow label={t('occupation_label')}>
            <input
              type="text"
              value={form.occupation}
              onChange={(e) => set('occupation', e.target.value)}
              className={inputCls}
              placeholder="e.g. Mason, Weaver"
            />
          </FieldRow>

          <FieldRow label="Sector">
            <select
              className={inputCls}
              value={form.sector}
              onChange={(e) => set('sector', e.target.value)}
            >
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FieldRow>

          <FieldRow label="Current Employer" optional>
            <input
              type="text"
              value={form.employer}
              onChange={(e) => set('employer', e.target.value)}
              className={inputCls}
              placeholder="e.g. Shree Construction Ltd."
            />
          </FieldRow>

          <FieldRow label="Years of Experience">
            <input
              type="number"
              min={0}
              max={50}
              value={form.yearsExp}
              onChange={(e) => set('yearsExp', parseInt(e.target.value, 10) || 0)}
              className={inputCls}
            />
          </FieldRow>
        </div>
      </div>

      {/* ── Section 5: Contact & Identity ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0C2D27]">5. Contact &amp; Identity</h2>
        <div className="space-y-4">
          <FieldRow label={t('aadhaar_number')} optional>
            <input
              type="text"
              maxLength={4}
              pattern="\d{4}"
              value={form.aadhaarLast4}
              onChange={(e) => set('aadhaarLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className={inputCls}
              placeholder="e.g. 4321"
            />
          </FieldRow>
        </div>
      </div>

      {/* ── Save Action ── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link
          to="/worker/skills"
          className="flex items-center gap-1 text-xs font-bold text-[#0C2D27] hover:underline"
        >
          {t('skills_title')} <ChevronRight className="h-4 w-4" />
        </Link>

        <button
          onClick={handleSave}
          disabled={saving}
          className="figma-btn-coral py-3 px-8 text-xs font-bold cursor-pointer"
        >
          {saving ? 'Saving Profile…' : t('save_profile_btn')}
        </button>
      </div>

      <Toast show={toastVisible} message="Profile & Photo saved successfully!" />
    </div>
  )
}
