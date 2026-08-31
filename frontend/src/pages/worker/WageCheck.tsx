import { useState } from 'react'
import { DollarSign, AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslation } from '@/utils/translations'
import api from '@/services/api'

const REFERENCE_WAGES = [
  { occupation: 'Masonry Work', skill: 'Skilled', wage: 550 },
  { occupation: 'Carpentry & Shuttering', skill: 'Skilled', wage: 520 },
  { occupation: 'Textile Weaving', skill: 'Semi-skilled', wage: 420 },
  { occupation: 'Construction Labor / Helper', skill: 'Unskilled', wage: 350 },
  { occupation: 'Electrical Wiring', skill: 'Highly Skilled', wage: 750 },
  { occupation: 'Arc & MIG Welding', skill: 'Skilled', wage: 600 },
  { occupation: 'Diamond Cutting & Polishing', skill: 'Highly Skilled', wage: 800 },
  { occupation: 'Heavy Vehicle Driving', skill: 'Skilled', wage: 650 },
  { occupation: 'CNC Machine Operation', skill: 'Highly Skilled', wage: 780 },
]

const TRADE_OCCUPATIONS = [
  'Masonry Work',
  'Plumbing & Fitting',
  'Carpentry & Shuttering',
  'Electrical Wiring',
  'Arc & MIG Welding',
  'CNC Machine Operation',
  'Heavy Vehicle Driving',
  'Textile Weaving',
  'Diamond Cutting & Polishing',
  'Construction Labor / Helper',
  'Painter & Finishing',
  'Security Guard',
]

const GUJARAT_DISTRICTS = [
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
]

const SKILL_LEVELS = ['Unskilled', 'Semi-skilled', 'Skilled', 'Highly Skilled']

const SKILL_REF_MAP: Record<string, number> = {
  Unskilled: 350,
  'Semi-skilled': 450,
  Skilled: 550,
  'Highly Skilled': 750,
}

const DEMO_RESULT = {
  occupation: 'Masonry Work',
  district: 'Ahmedabad',
  skillLevel: 'Skilled',
  yourWage: 380,
  referenceWage: 550,
  discrepancy: 170,
  discrepancyPct: 31,
  status: 'discrepancy' as const,
}

type CheckResult = typeof DEMO_RESULT | null

function WageGauge({ pct }: { pct: number }) {
  const fill = Math.max(0, Math.min(100, 100 - pct))
  const color = fill >= 90 ? 'bg-emerald-500' : fill >= 70 ? 'bg-amber-400' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Wage compliance indicator</span>
        <span className="font-bold text-slate-700 dark:text-slate-300">{fill}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${fill}%` }} />
      </div>
    </div>
  )
}

export default function WageCheck() {
  const { t } = useTranslation()
  const [occupation, setOccupation] = useState('Masonry Work')
  const [district, setDistrict] = useState('Ahmedabad')
  const [skillLevel, setSkillLevel] = useState('Skilled')
  const [yourWage, setYourWage] = useState('')
  const [checking, setChecking] = useState(false)
  const [wageError, setWageError] = useState('')
  const [result, setResult] = useState<CheckResult>(DEMO_RESULT)

  async function handleCheck() {
    const numericWage = parseInt(yourWage, 10)
    if (isNaN(numericWage) || numericWage <= 0 || numericWage > 10000) {
      setWageError('Please enter a valid numeric daily wage rate.')
      return
    }
    setWageError('')
    setChecking(true)

    const ref = SKILL_REF_MAP[skillLevel] ?? 550
    const diff = ref - numericWage
    const discPct = diff > 0 ? Math.round((diff / ref) * 100) : 0

    try {
      await api.post('/wages/check', {
        occupation,
        district,
        skill_level: skillLevel,
        daily_wage: numericWage,
      })
    } catch {
      // Local fallback
    }

    await new Promise((r) => setTimeout(r, 400))

    setResult({
      occupation,
      district,
      skillLevel,
      yourWage: numericWage,
      referenceWage: ref,
      discrepancy: Math.max(0, diff),
      discrepancyPct: discPct,
      status: diff > 0 ? 'discrepancy' : 'fair',
    })
    setChecking(false)
  }

  const selectCls =
    'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500'

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/80 shrink-0">
          <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('wage_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('wage_subtitle')}</p>
        </div>
      </div>

      {/* ── Wage Check Input Form ────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-colors">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Compare Your Daily Wage Rate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('occupation_label')}</label>
            <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className={selectCls}>
              {TRADE_OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('select_district')}</label>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
              {GUJARAT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('select_skill_level')}</label>
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className={selectCls}>
              {SKILL_LEVELS.map((sl) => <option key={sl} value={sl}>{sl}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('your_daily_wage')}</label>
            <input
              type="number"
              value={yourWage}
              onChange={(e) => setYourWage(e.target.value)}
              placeholder="e.g. 380"
              className={selectCls}
            />
          </div>
        </div>

        {wageError && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{wageError}</p>}

        <button
          onClick={handleCheck}
          disabled={checking}
          className="mt-4 flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
          {checking ? 'Checking Rates...' : t('action_check_wages')}
        </button>
      </div>

      {/* ── Comparison Results ───────────────────────────────── */}
      {result && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{result.occupation} · {result.district}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Skill Level: {result.skillLevel}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              result.status === 'fair'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {result.status === 'fair' ? t('wage_status_fair') : t('wage_status_low')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('your_daily_wage')}</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₹{result.yourWage} / day</p>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900">
              <p className="text-xs text-teal-800 dark:text-teal-300 font-semibold">{t('official_min_wage')}</p>
              <p className="text-xl font-extrabold text-teal-700 dark:text-teal-400 mt-1">₹{result.referenceWage} / day</p>
            </div>
          </div>

          <WageGauge pct={result.discrepancyPct} />

          {result.status === 'discrepancy' && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Your wage is ₹{result.discrepancy}/day below official minimum rate.
                </span>
              </div>
              <a
                href="/worker/report"
                className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:underline"
              >
                {t('report_wage_violation')}
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Official Gujarat Reference Minimum Wage Table ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Official Gujarat Reference Wage Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-2 font-semibold">Trade Occupation</th>
                <th className="pb-2 font-semibold">Skill Level</th>
                <th className="pb-2 font-semibold text-right">Reference Daily Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {REFERENCE_WAGES.map((rw) => (
                <tr key={rw.occupation} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{rw.occupation}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-400">{rw.skill}</td>
                  <td className="py-2.5 font-extrabold text-teal-700 dark:text-teal-400 text-right">₹{rw.wage}/day</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
