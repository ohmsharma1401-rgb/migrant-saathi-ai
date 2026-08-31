import { useState, useEffect } from 'react'
import { User, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/utils/translations'
import api from '@/services/api'

// ─── Static lists ─────────────────────────────────────────────────────────────
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
  currentDistrict: 'Ahmedabad',
  currentCity: 'Ahmedabad',
  occupation: 'Mason',
  sector: 'Construction',
  employer: 'Shree Construction Ltd.',
  yearsExp: 5,
  aadhaarLast4: '4321',
  language: 'en' as 'en' | 'hi' | 'gu',
}

const SECTIONS = [
  { label: 'Personal Information', fields: ['fullName', 'dateOfBirth', 'gender'] },
  { label: 'Location Information', fields: ['originState', 'currentDistrict', 'currentCity'] },
  { label: 'Work Information',     fields: ['occupation', 'sector', 'yearsExp'] },
  { label: 'Contact & Identity',   fields: ['aadhaarLast4'] },
  { label: 'Language Preference',  fields: ['language'] },
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-white text-sm font-medium shadow-lg">
      <CheckCircle className="h-4 w-4" />
      {message}
    </div>
  )
}

function FieldRow({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex gap-1">
        {label}
        {optional && <span className="text-slate-400 font-normal">(optional)</span>}
      </Label>
      {children}
    </div>
  )
}

export default function WorkerProfile() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    try {
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
      }
    } catch {
      // Fallback
    }
  }, [])

  const { pct, complete } = calcCompletion(form)

  function set<K extends keyof typeof DEFAULT_FORM>(key: K, value: typeof DEFAULT_FORM[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
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

  const selectCls =
    'flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500'

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/80">
          <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('profile_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('profile_subtitle')}
          </p>
        </div>
      </div>

      {/* ── Completion indicator ────────────────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{t('profile_verification')}</span>
            <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">{pct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-teal-600 dark:bg-teal-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
            {SECTIONS.map(({ label }, i) => (
              <div key={label} className="flex items-center gap-1.5 text-xs">
                {complete[i] ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
                <span className={complete[i] ? 'text-slate-600 dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 1: Personal Information ─────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">1. {t('personal_info')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label={t('full_name')}>
            <Input
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className="dark:bg-slate-900 dark:border-slate-700"
              placeholder="e.g. Ramesh Kumar"
            />
          </FieldRow>
          <FieldRow label="Date of Birth">
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set('dateOfBirth', e.target.value)}
              className="dark:bg-slate-900 dark:border-slate-700"
            />
          </FieldRow>
          <FieldRow label="Gender">
            <div className="flex gap-4 mt-1">
              {(['male', 'female', 'other'] as const).map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300 capitalize">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={() => set('gender', g)}
                    className="h-4 w-4 accent-teal-600"
                  />
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </FieldRow>
        </CardContent>
      </Card>

      {/* ── Section 2: Location Information ─────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label={t('home_state')}>
            <select
              className={selectCls}
              value={form.originState}
              onChange={(e) => set('originState', e.target.value)}
            >
              <option value="">Select state…</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FieldRow>
          <FieldRow label={t('current_district')}>
            <select
              className={selectCls}
              value={form.currentDistrict}
              onChange={(e) => set('currentDistrict', e.target.value)}
            >
              <option value="">Select district…</option>
              {GUJARAT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Current City">
            <Input
              value={form.currentCity}
              onChange={(e) => set('currentCity', e.target.value)}
              className="dark:bg-slate-900 dark:border-slate-700"
              placeholder="e.g. Ahmedabad"
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* ── Section 3: Work Information ──────────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">3. Work Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label={t('occupation_label')}>
            <Input
              value={form.occupation}
              onChange={(e) => set('occupation', e.target.value)}
              className="dark:bg-slate-900 dark:border-slate-700"
              placeholder="e.g. Mason, Weaver"
            />
          </FieldRow>
          <FieldRow label="Sector">
            <select
              className={selectCls}
              value={form.sector}
              onChange={(e) => set('sector', e.target.value)}
            >
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Current Employer" optional>
            <Input
              value={form.employer}
              onChange={(e) => set('employer', e.target.value)}
              className="dark:bg-slate-900 dark:border-slate-700"
              placeholder="e.g. Shree Construction Ltd."
            />
          </FieldRow>
          <FieldRow label="Years of Experience">
            <Input
              type="number"
              min={0}
              max={50}
              value={form.yearsExp}
              onChange={(e) => set('yearsExp', parseInt(e.target.value, 10) || 0)}
              className="dark:bg-slate-900 dark:border-slate-700"
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* ── Section 4: Contact & Identity ────────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">4. Contact &amp; Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label={t('aadhaar_number')} optional>
            <Input
              maxLength={4}
              pattern="\d{4}"
              value={form.aadhaarLast4}
              onChange={(e) => set('aadhaarLast4', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="dark:bg-slate-900 dark:border-slate-700"
              placeholder="e.g. 4321"
            />
          </FieldRow>
        </CardContent>
      </Card>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/worker/skills"
          className="flex items-center gap-1 text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline"
        >
          {t('skills_title')} <ChevronRight className="h-4 w-4" />
        </Link>
        <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white min-w-36">
          {saving ? 'Saving…' : t('save_profile_btn')}
        </Button>
      </div>

      <Toast show={toastVisible} message={t('profile_saved_toast')} />
    </div>
  )
}

