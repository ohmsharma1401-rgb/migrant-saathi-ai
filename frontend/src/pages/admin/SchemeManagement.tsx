import { useState } from 'react'
import {
  Heart,
  Plus,
  Upload,
  Edit2,
  Eye,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Types ────────────────────────────────────────────────────────────────────
type SchemeCategory = 'housing' | 'health' | 'insurance' | 'pension' | 'food' | 'skill_training' | 'other'

interface DemoScheme {
  id: string
  name: string
  code: string
  description: string
  category: SchemeCategory
  states: string[]
  sectors: string[]
  minAge: number
  maxAge: number
  incomeLimitMonthly: number
  benefits: string
  requiredDocs: string
  applicationUrl: string
  officialSource: string
  active: boolean
  lastVerified: string
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const INITIAL_SCHEMES: DemoScheme[] = [
  {
    id: 'S001', code: 'BOCW-WF',
    name: 'Construction Workers Welfare Fund (BOCW)',
    description: 'Welfare benefits for registered building and construction workers including medical, education, and housing assistance.',
    category: 'health',
    states: ['Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh'],
    sectors: ['Construction'],
    minAge: 18, maxAge: 60, incomeLimitMonthly: 20000,
    benefits: 'Medical reimbursement, education scholarship, housing loan, accident compensation',
    requiredDocs: 'Aadhaar, BOCW Registration, Employer Certificate, Bank Passbook',
    applicationUrl: 'https://bocw.gujarat.gov.in',
    officialSource: 'Building and Other Construction Workers Act, 1996',
    active: true, lastVerified: '2024-05-15',
  },
  {
    id: 'S002', code: 'PM-SYM',
    name: 'Pradhan Mantri Shram Yogi Maan-Dhan (PM-SYM)',
    description: 'Voluntary and contributory pension scheme for unorganised workers.',
    category: 'pension',
    states: ['All States'],
    sectors: ['Construction', 'Textiles', 'Diamond', 'Manufacturing', 'Agriculture'],
    minAge: 18, maxAge: 40, incomeLimitMonthly: 15000,
    benefits: 'Rs 3000/month pension after age 60',
    requiredDocs: 'Aadhaar, Savings Bank Account/Jan Dhan Account, Mobile Number',
    applicationUrl: 'https://maandhan.in',
    officialSource: 'Ministry of Labour & Employment',
    active: true, lastVerified: '2024-04-20',
  },
  {
    id: 'S003', code: 'AABY',
    name: 'Aam Aadmi Bima Yojana (AABY)',
    description: 'Life and disability insurance for rural landless household heads.',
    category: 'insurance',
    states: ['All States'],
    sectors: ['Construction', 'Textiles', 'Manufacturing'],
    minAge: 18, maxAge: 59, incomeLimitMonthly: 0,
    benefits: 'Death: Rs 30,000; Accidental death: Rs 75,000; Partial disability: Rs 37,500',
    requiredDocs: 'Aadhaar, Ration Card, Bank Account',
    applicationUrl: 'https://licindia.in/aaby',
    officialSource: 'LIC of India / Ministry of Finance',
    active: true, lastVerified: '2024-03-10',
  },
  {
    id: 'S004', code: 'NFSA',
    name: 'National Food Security Act (NFSA)',
    description: 'Subsidised food grains for eligible households under PDS.',
    category: 'food',
    states: ['All States'],
    sectors: ['Construction', 'Textiles', 'Diamond', 'Manufacturing', 'Agriculture', 'Domestic'],
    minAge: 0, maxAge: 100, incomeLimitMonthly: 10000,
    benefits: 'Rice/Wheat at Rs 2-3/kg, up to 5 kg per person per month',
    requiredDocs: 'Ration Card, Aadhaar, Income Certificate',
    applicationUrl: 'https://nfsa.gov.in',
    officialSource: 'National Food Security Act, 2013',
    active: true, lastVerified: '2024-05-01',
  },
  {
    id: 'S005', code: 'BOCW-HEALTH',
    name: 'BOCW Health Insurance Scheme',
    description: 'Hospitalisation and health cover for registered construction workers and family.',
    category: 'health',
    states: ['Gujarat', 'Maharashtra', 'Uttar Pradesh', 'Karnataka'],
    sectors: ['Construction'],
    minAge: 18, maxAge: 60, incomeLimitMonthly: 25000,
    benefits: 'Cashless hospitalisation up to Rs 2 Lakh per year',
    requiredDocs: 'BOCW Registration Card, Aadhaar, Family Photo',
    applicationUrl: 'https://bocw.gujarat.gov.in/health',
    officialSource: 'Building and Other Construction Workers Act, 1996',
    active: true, lastVerified: '2024-04-15',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_STYLE: Record<SchemeCategory, string> = {
  health:        'bg-green-100 text-green-800',
  insurance:     'bg-blue-100 text-blue-800',
  pension:       'bg-purple-100 text-purple-800',
  food:          'bg-amber-100 text-amber-800',
  housing:       'bg-orange-100 text-orange-800',
  skill_training:'bg-teal-100 text-teal-800',
  other:         'bg-gray-100 text-gray-700',
}

const CATEGORY_LABEL: Record<SchemeCategory, string> = {
  health: 'Health', insurance: 'Insurance', pension: 'Pension',
  food: 'Food', housing: 'Housing', skill_training: 'Skill Training', other: 'Other',
}

const ALL_STATES = [
  'All States','Gujarat','Maharashtra','Rajasthan','Madhya Pradesh','Uttar Pradesh',
  'Bihar','Karnataka','Tamil Nadu','West Bengal','Odisha','Jharkhand','Chhattisgarh',
]
const ALL_SECTORS = ['Construction','Textiles','Diamond','Manufacturing','Agriculture','Domestic','Other']
const ALL_CATEGORIES: { value: SchemeCategory; label: string }[] = [
  { value: 'health', label: 'Health' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'pension', label: 'Pension' },
  { value: 'food', label: 'Food' },
  { value: 'housing', label: 'Housing' },
  { value: 'skill_training', label: 'Skill Training' },
  { value: 'other', label: 'Other' },
]

// ─── Scheme Form (Add / Edit) ─────────────────────────────────────────────────
const EMPTY_SCHEME: Omit<DemoScheme, 'id' | 'active' | 'lastVerified'> = {
  name: '', code: '', description: '', category: 'health',
  states: [], sectors: [], minAge: 18, maxAge: 60, incomeLimitMonthly: 0,
  benefits: '', requiredDocs: '', applicationUrl: '', officialSource: '',
}

function SchemeFormModal({
  initial,
  title,
  onClose,
  onSave,
}: {
  initial: Omit<DemoScheme, 'id' | 'active' | 'lastVerified'>
  title: string
  onClose: () => void
  onSave: (data: Omit<DemoScheme, 'id' | 'active' | 'lastVerified'>) => void
}) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')

  function toggle<K extends 'states' | 'sectors'>(key: K, val: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }))
  }

  function handleSubmit() {
    if (!form.name.trim()) { setError('Scheme name is required.'); return }
    if (!form.code.trim()) { setError('Scheme code is required.'); return }
    onSave(form)
    onClose()
  }

  const inputCls = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  const selectCls = inputCls + ' appearance-none pr-8'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Scheme Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. BOCW Welfare Fund" />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Scheme Code *</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. BOCW-WF" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium text-gray-700 mb-1">Description</Label>
            <textarea
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the scheme…"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Category</Label>
            <div className="relative">
              <select className={selectCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SchemeCategory }))}>
                {ALL_CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Monthly Income Limit (₹, 0 = no limit)</Label>
            <Input type="number" min={0} value={form.incomeLimitMonthly} onChange={(e) => setForm((f) => ({ ...f, incomeLimitMonthly: Number(e.target.value) }))} />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Min Age</Label>
            <Input type="number" min={0} max={100} value={form.minAge} onChange={(e) => setForm((f) => ({ ...f, minAge: Number(e.target.value) }))} />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Max Age</Label>
            <Input type="number" min={0} max={100} value={form.maxAge} onChange={(e) => setForm((f) => ({ ...f, maxAge: Number(e.target.value) }))} />
          </div>

          {/* States multi-select */}
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium text-gray-700 mb-2">Applicable States</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle('states', s)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    form.states.includes(s)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors multi-select */}
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium text-gray-700 mb-2">Target Sectors</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SECTORS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle('sectors', s)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    form.sectors.includes(s)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label className="text-xs font-medium text-gray-700 mb-1">Benefits</Label>
            <textarea
              rows={2}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.benefits}
              onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))}
              placeholder="List the key benefits…"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-medium text-gray-700 mb-1">Required Documents</Label>
            <textarea
              rows={2}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.requiredDocs}
              onChange={(e) => setForm((f) => ({ ...f, requiredDocs: e.target.value }))}
              placeholder="e.g. Aadhaar, Bank Passbook…"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Application URL</Label>
            <Input value={form.applicationUrl} onChange={(e) => setForm((f) => ({ ...f, applicationUrl: e.target.value }))} placeholder="https://…" />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1">Official Source</Label>
            <Input value={form.officialSource} onChange={(e) => setForm((f) => ({ ...f, officialSource: e.target.value }))} placeholder="Govt. Act / Ministry" />
          </div>
        </div>

        {error && <p className="px-6 pb-2 text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Scheme</Button>
        </div>
      </div>
    </div>
  )
}

// ─── View Scheme Modal ────────────────────────────────────────────────────────
function ViewSchemeModal({ scheme, onClose }: { scheme: DemoScheme; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{scheme.name}</h2>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{scheme.code}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 px-6 py-5 text-sm">
          <p className="text-gray-600">{scheme.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Category</p>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${CATEGORY_STYLE[scheme.category]}`}>
                {CATEGORY_LABEL[scheme.category]}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Age Range</p>
              <p className="font-medium text-gray-800">{scheme.minAge} – {scheme.maxAge} years</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Income Limit</p>
              <p className="font-medium text-gray-800">{scheme.incomeLimitMonthly ? `₹${scheme.incomeLimitMonthly.toLocaleString()}/mo` : 'No limit'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Last Verified</p>
              <p className="font-medium text-gray-800">{scheme.lastVerified}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">States</p>
            <div className="flex flex-wrap gap-1">
              {scheme.states.map((s) => <span key={s} className="rounded-full bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 font-medium">{s}</span>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Sectors</p>
            <div className="flex flex-wrap gap-1">
              {scheme.sectors.map((s) => <span key={s} className="rounded-full bg-purple-50 text-purple-700 text-xs px-2 py-0.5 font-medium">{s}</span>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Benefits</p>
            <p className="text-gray-700">{scheme.benefits}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Required Documents</p>
            <p className="text-gray-700">{scheme.requiredDocs}</p>
          </div>
          {scheme.applicationUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Application URL</p>
              <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs break-all">{scheme.applicationUrl}</a>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SchemeManagement() {
  const [schemes, setSchemes] = useState<DemoScheme[]>(INITIAL_SCHEMES)
  const [showAdd, setShowAdd] = useState(false)
  const [editScheme, setEditScheme] = useState<DemoScheme | null>(null)
  const [viewScheme, setViewScheme] = useState<DemoScheme | null>(null)

  function toggleActive(id: string) {
    setSchemes((s) => s.map((sc) => sc.id === id ? { ...sc, active: !sc.active } : sc))
  }

  function handleAdd(data: Omit<DemoScheme, 'id' | 'active' | 'lastVerified'>) {
    const newScheme: DemoScheme = {
      ...data,
      id: `S${Date.now()}`,
      active: true,
      lastVerified: new Date().toISOString().slice(0, 10),
    }
    setSchemes((s) => [newScheme, ...s])
  }

  function handleEdit(data: Omit<DemoScheme, 'id' | 'active' | 'lastVerified'>) {
    if (!editScheme) return
    setSchemes((s) => s.map((sc) => sc.id === editScheme.id ? { ...sc, ...data } : sc))
    setEditScheme(null)
  }

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Welfare Scheme Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage welfare schemes and eligibility criteria</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-1.5 h-4 w-4" />
            Import from CSV
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Scheme
          </Button>
        </div>
      </div>

      {/* ── Scheme cards ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {schemes.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardTitle className="text-sm text-gray-900 leading-snug">{s.name}</CardTitle>
                  </div>
                  <p className="text-xs font-mono text-gray-400">{s.code}</p>
                </div>
                <Badge variant={s.active ? 'success' : 'outline'} className="shrink-0">
                  {s.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {/* Category */}
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLE[s.category]}`}>
                {CATEGORY_LABEL[s.category]}
              </span>

              {/* States */}
              <div className="flex flex-wrap gap-1">
                {s.states.slice(0, 3).map((st) => (
                  <span key={st} className="rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-medium px-2 py-0.5">{st}</span>
                ))}
                {s.states.length > 3 && (
                  <span className="rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5">+{s.states.length - 3} more</span>
                )}
              </div>

              {/* Sectors */}
              <div className="flex flex-wrap gap-1">
                {s.sectors.map((sec) => (
                  <span key={sec} className="rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium px-2 py-0.5">{sec}</span>
                ))}
              </div>

              <p className="text-[10px] text-gray-400">Last verified: {s.lastVerified}</p>

              {/* DEMO label */}
              <div className="rounded bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] font-semibold text-amber-700 inline-block">
                DEMO DATA
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
                <button
                  onClick={() => setViewScheme(s)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button
                  onClick={() => setEditScheme(s)}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(s.id)}
                  className="ml-auto flex items-center gap-1 text-gray-400 hover:text-primary transition-colors"
                  title={s.active ? 'Deactivate scheme' : 'Activate scheme'}
                >
                  {s.active
                    ? <ToggleRight className="h-5 w-5 text-indigo-600" />
                    : <ToggleLeft className="h-5 w-5" />
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showAdd && (
        <SchemeFormModal
          title="Add New Scheme"
          initial={{ ...EMPTY_SCHEME }}
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
        />
      )}
      {editScheme && (
        <SchemeFormModal
          title={`Edit: ${editScheme.name}`}
          initial={{
            name: editScheme.name, code: editScheme.code, description: editScheme.description,
            category: editScheme.category, states: editScheme.states, sectors: editScheme.sectors,
            minAge: editScheme.minAge, maxAge: editScheme.maxAge,
            incomeLimitMonthly: editScheme.incomeLimitMonthly,
            benefits: editScheme.benefits, requiredDocs: editScheme.requiredDocs,
            applicationUrl: editScheme.applicationUrl, officialSource: editScheme.officialSource,
          }}
          onClose={() => setEditScheme(null)}
          onSave={handleEdit}
        />
      )}
      {viewScheme && (
        <ViewSchemeModal scheme={viewScheme} onClose={() => setViewScheme(null)} />
      )}
    </div>
  )
}
