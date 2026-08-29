import { useState } from 'react'
import { DollarSign, AlertTriangle, Loader2, Info } from 'lucide-react'
import api from '@/services/api'

// ─── Reference wage table ─────────────────────────────────────────────
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

// ─── Demo result (shown on first render) ─────────────────────────────────────
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

// ─── Wage gauge bar ───────────────────────────────────────────────────────────
function WageGauge({ pct }: { pct: number }) {
  const fill = Math.max(0, Math.min(100, 100 - pct))
  const color = fill >= 90 ? 'bg-green-500' : fill >= 70 ? 'bg-yellow-400' : 'bg-amber-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>Your wage as % of reference</span>
        <span className="font-semibold text-gray-700">{fill}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${fill}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>₹0</span>
        <span>Reference Wage</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WageCheck() {
  const [occupation, setOccupation] = useState('Masonry Work')
  const [district, setDistrict] = useState('Ahmedabad')
  const [skillLevel, setSkillLevel] = useState('Skilled')
  const [yourWage, setYourWage] = useState('')
  const [checking, setChecking] = useState(false)
  const [wageError, setWageError] = useState('')
  const [result, setResult] = useState<CheckResult>(DEMO_RESULT)

  async function handleCheck() {
    setWageError('')
    const wageNum = Number(yourWage)

    if (isNaN(wageNum) || wageNum < 50 || wageNum > 3000) {
      setWageError('Please enter a valid daily wage between ₹50 and ₹3,000 / day.')
      return
    }

    if (!occupation || !district || !skillLevel || !yourWage) return
    setChecking(true)

    try {
      await api.post('/wages/check', {
        occupation,
        district,
        state: 'Gujarat',
        skill_level: skillLevel.toLowerCase().replace(' ', '_'),
        reported_daily_wage: wageNum,
      })
    } catch {
      // demo data fallback
    } finally {
      setChecking(false)
      const ref = SKILL_REF_MAP[skillLevel] || 550
      const reported = wageNum
      const disc = Math.max(0, ref - reported)
      const pct = ref > 0 ? Math.round((disc / ref) * 100) : 0
      setResult({
        occupation,
        district,
        skillLevel,
        yourWage: reported,
        referenceWage: ref,
        discrepancy: disc,
        discrepancyPct: pct,
        status: disc > 0 ? 'discrepancy' : 'discrepancy',
      })
    }
  }

  const hasDiscrepancy = result && result.discrepancy > 0

  return (
    <div className="space-y-4 px-4 py-5 pb-10">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Wage Check</h1>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Compare your wages with government reference data
          </p>
        </div>
      </div>

      {/* ── Info banner ─────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          This tool compares your reported wage with official reference data. A{' '}
          <span className="font-semibold">'Potential Discrepancy'</span> means your wage may be below reference
          levels — not a legal conclusion. Report through official channels for investigation.
        </p>
      </div>

      {/* ── Input form ──────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Enter Your Wage Details</h2>

        {/* Occupation Select Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Occupation / Trade *</label>
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {TRADE_OCCUPATIONS.map((occ) => (
              <option key={occ} value={occ}>{occ}</option>
            ))}
          </select>
        </div>

        {/* District Select Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Working District (Gujarat) *</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {GUJARAT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Skill Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Skill Level *</label>
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {SKILL_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Daily wage with min ₹50 and max ₹3,000 bounds */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Your Daily Wage (₹50 to ₹3,000 / day) *</label>
          <input
            type="number"
            min={50}
            max={3000}
            value={yourWage}
            onChange={(e) => {
              setYourWage(e.target.value)
              setWageError('')
            }}
            placeholder="e.g. 450"
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
          />
          {wageError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              {wageError}
            </p>
          )}
        </div>

        <button
          onClick={handleCheck}
          disabled={checking || !occupation || !district || !skillLevel || !yourWage}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 hover:bg-green-700 transition-colors shadow-sm"
        >
          {checking ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : 'Check Wage →'}
        </button>
      </div>

      {/* ── Result card ─────────────────────────────────────── */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Wage comparison row */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Your Reported Wage</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">₹{result.yourWage}</p>
              <p className="text-xs text-gray-500">per day</p>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Reference Wage</p>
              <p className="mt-1 text-2xl font-bold text-green-700">₹{result.referenceWage}</p>
              <p className="text-xs text-gray-500">per day</p>
            </div>
          </div>

          {/* Gauge */}
          <div className="px-4 pb-3 pt-1">
            <WageGauge pct={result.discrepancyPct} />
          </div>

          {/* Discrepancy box */}
          {hasDiscrepancy && (
            <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Potential Discrepancy: ₹{result.discrepancy}/day ({result.discrepancyPct}%)
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your wage appears to be below the reference level. This is not a legal determination.
                </p>
              </div>
            </div>
          )}

          {/* Risk badge */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
            <span className="text-xs font-medium text-gray-500">Risk Level</span>
            {hasDiscrepancy ? (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                POTENTIAL DISCREPANCY
              </span>
            ) : (
              <span className="rounded-full bg-green-100 border border-green-300 px-3 py-0.5 text-[11px] font-bold text-green-800 uppercase tracking-wide">
                WITHIN RANGE
              </span>
            )}
          </div>

          {/* AI explanation */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">AI Explanation</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Your reported daily wage of ₹{result.yourWage} appears to be approximately {result.discrepancyPct}% below
              the reference wage for {result.occupation} ({result.skillLevel}) in {result.district} district (₹{result.referenceWage}/day).
              This is flagged as a potential discrepancy based on available reference data.{' '}
              <span className="font-semibold">This does not constitute a legal determination.</span> You may wish to report
              this through official grievance channels for investigation.
            </p>
          </div>

          {/* Legal disclaimer */}
          <div className="border-t border-gray-100 px-4 py-2.5">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              ⚠ Reference wages are indicative. Source: DEMO DATA. Verify with Gujarat Labour Department. This is not a legal determination.
            </p>
          </div>
        </div>
      )}

      {/* ── Reference wage table ─────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-gray-800">Reference Wages — Gujarat</h2>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">Demo Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Occupation</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Skill Level</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-600">Daily Wage (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {REFERENCE_WAGES.map((row) => (
                <tr key={row.occupation} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{row.occupation}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.skill}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-900">₹{row.wage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-2.5">
          <p className="text-[10px] text-gray-400">⚠ Demo data only. Actual rates vary. Verify with Gujarat Labour Department.</p>
        </div>
      </div>
    </div>
  )
}
