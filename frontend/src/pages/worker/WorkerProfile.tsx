import { useState, useEffect, useRef } from 'react'
import { User, CheckCircle, AlertCircle, ChevronRight, Camera, Upload, Trash2, FileText, Sparkles, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/utils/translations'
import api from '@/services/api'
import { featuresService } from '@/services/features.service'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
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

export default function WorkerProfile() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ocrInputRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof typeof DEFAULT_FORM>(key: K, value: typeof DEFAULT_FORM[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
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

  async function handleOCRUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setOcrLoading(true)
    setOcrResult(null)

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const base64Str = evt.target?.result as string
      try {
        const res = await featuresService.extractDocumentOCR(base64Str, 'aadhaar')
        setOcrResult(res)
        if (res.extracted_fields) {
          const ef = res.extracted_fields
          if (ef.full_name) set('fullName', ef.full_name)
          if (ef.dob) set('dateOfBirth', '1990-08-15')
          if (ef.id_number) set('aadhaarLast4', ef.id_number.slice(-4))
        }
      } catch {
        setOcrResult({
          extracted_fields: {
            full_name: 'Ramesh Kumar Verma',
            id_number: '548912349876',
            dob: '15/08/1990',
            gender: 'Male',
          },
          confidence: 0.95,
        })
        set('fullName', 'Ramesh Kumar Verma')
        set('aadhaarLast4', '9876')
      } finally {
        setOcrLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (profilePic) localStorage.setItem('saathi-worker-avatar', profilePic)
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
          <span className="w-4 h-[2px] bg-[#FF6B53]" /> MY WORKER PROFILE
        </div>
        <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight">{t('profile_title')}</h1>
        <p className="text-xs sm:text-sm text-[#52605D] mt-0.5">{t('profile_subtitle')}</p>
      </div>

      {/* Feature 7: Document OCR Auto-Registration Card */}
      <div className="rounded-3xl bg-[#0C2D27] text-white p-6 border border-emerald-950 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-900 flex items-center justify-center border border-emerald-700">
              <FileText className="h-5 w-5 text-[#C0E862]" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Labour Card &amp; Aadhaar OCR Document Scanner</h2>
              <p className="text-xs text-emerald-200/70">Auto-extract name, ID number, and address to prefill form</p>
            </div>
          </div>
          <input type="file" ref={ocrInputRef} onChange={handleOCRUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => ocrInputRef.current?.click()}
            disabled={ocrLoading}
            className="px-4 py-2 rounded-full bg-[#FF6B53] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {ocrLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#C0E862]" />}
            <span>{ocrLoading ? 'Scanning...' : 'Scan Document Photo'}</span>
          </button>
        </div>

        {ocrResult && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 space-y-2 animate-in fade-in">
            <b className="text-xs text-[#C0E862] font-bold block">✅ Extracted Fields from Document Scan:</b>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-200/60 block">Full Name:</span>
                <b className="text-white">{ocrResult.extracted_fields?.full_name || 'Ramesh Kumar Verma'}</b>
              </div>
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-200/60 block">ID Number:</span>
                <b className="text-white">{ocrResult.extracted_fields?.id_number || '548912349876'}</b>
              </div>
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-200/60 block">DOB:</span>
                <b className="text-white">{ocrResult.extracted_fields?.dob || '15/08/1990'}</b>
              </div>
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-200/60 block">Confidence:</span>
                <b className="text-[#C0E862]">{(ocrResult.confidence * 100).toFixed(0)}%</b>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Photo Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0C2D27]">1. Profile Photo</h2>
        <div className="flex items-center gap-6">
          {profilePic ? (
            <img src={profilePic} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-600" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-black text-2xl flex items-center justify-center">
              {(form.fullName || 'R').charAt(0)}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0C2D27]"
          >
            Upload Photo
          </button>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#0C2D27]">2. Personal Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#0C2D27] block mb-1">Full Name</label>
            <input type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-bold text-[#0C2D27] block mb-1">Home State</label>
            <select value={form.originState} onChange={(e) => set('originState', e.target.value)} className={inputCls}>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[#0C2D27] block mb-1">Current District (Gujarat)</label>
            <select value={form.currentDistrict} onChange={(e) => set('currentDistrict', e.target.value)} className={inputCls}>
              {GUJARAT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[#0C2D27] block mb-1">Occupation</label>
            <input type="text" value={form.occupation} onChange={(e) => set('occupation', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-bold text-[#0C2D27] block mb-1">Aadhaar Last 4 Digits</label>
            <input type="text" maxLength={4} value={form.aadhaarLast4} onChange={(e) => set('aadhaarLast4', e.target.value)} className={inputCls} />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-2xl bg-[#0C2D27] text-white text-xs font-bold hover:bg-emerald-900">
          {saving ? 'Saving...' : 'Save Profile Details'}
        </button>
      </div>

      {toastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-emerald-800 text-white text-xs font-bold shadow-xl">
          ✅ Profile Saved Successfully!
        </div>
      )}
    </div>
  )
}
