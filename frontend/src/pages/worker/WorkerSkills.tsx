import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Wrench,
  X,
  Plus,
  Bot,
  Loader2,
  Star,
} from 'lucide-react'
import api from '@/services/api'

// ─── Demo data ────────────────────────────────────────────────────────────────
interface DemoSkill {
  id: string
  name: string
  sector: string
  years: number
  level: 'Skilled' | 'Semi-skilled' | 'Unskilled'
  primary: boolean
}

const INITIAL_SKILLS: DemoSkill[] = [
  { id: '1', name: 'Mason', sector: 'Construction', years: 5, level: 'Skilled', primary: true },
  { id: '2', name: 'Tile Installation', sector: 'Construction', years: 3, level: 'Semi-skilled', primary: false },
  { id: '3', name: 'Plastering', sector: 'Construction', years: 2, level: 'Semi-skilled', primary: false },
  { id: '4', name: 'Carpentry', sector: 'Construction', years: 1, level: 'Unskilled', primary: false },
]

const LEVEL_STYLE: Record<DemoSkill['level'], string> = {
  Skilled: 'bg-green-100 text-green-800',
  'Semi-skilled': 'bg-blue-100 text-blue-800',
  Unskilled: 'bg-gray-100 text-gray-700',
}

// ─── AI extract result shape ──────────────────────────────────────────────────
interface ExtractResult {
  occupation?: string
  skills?: string[]
  experience?: string
  origin?: string
  location?: string
}

// ─── Add-skill form state ─────────────────────────────────────────────────────
interface AddSkillForm {
  name: string
  sector: string
  years: string
  primary: boolean
}

const SKILL_OPTIONS = [
  'Mason', 'Tile Installation', 'Plastering', 'Carpentry', 'Painting',
  'Electrical Wiring', 'Plumbing', 'Welding', 'Fabrication', 'Other',
]

export default function WorkerSkills() {
  useTranslation()

  const [skills, setSkills] = useState<DemoSkill[]>(INITIAL_SKILLS)

  useEffect(() => {
    try {
      const customStr = localStorage.getItem('saathi-custom-worker')
      if (customStr) {
        const c = JSON.parse(customStr)
        if (Array.isArray(c.skills) && c.skills.length > 0) {
          const loadedSkills: DemoSkill[] = c.skills.map((skName: string, idx: number) => ({
            id: 'sk-' + idx,
            name: skName,
            sector: c.sector || 'Construction',
            years: 3 + idx,
            level: idx === 0 ? 'Skilled' : 'Semi-skilled',
            primary: idx === 0,
          }))
          setSkills(loadedSkills)
        }
      }
    } catch {
      // Fallback
    }
  }, [])

  // AI extract state
  const [aiText, setAiText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null)
  const [extractError, setExtractError] = useState('')

  // Add manually state
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<AddSkillForm>({ name: '', sector: 'Construction', years: '', primary: false })
  const [addError, setAddError] = useState('')

  // ── AI extract handler ─────────────────────────────────────────────────────
  async function handleExtract() {
    if (!aiText.trim()) return
    setExtracting(true)
    setExtractResult(null)
    setExtractError('')
    try {
      const res = await api.post<ExtractResult>('/ai/extract-skills', { text: aiText })
      setExtractResult(res.data)
    } catch {
      // On error, show a friendly fallback with demo data
      setExtractResult({
        occupation: 'Mason',
        skills: ['Masonry', 'Tile Installation', 'Plastering'],
        experience: '5 years',
        origin: 'Bihar',
        location: 'Ahmedabad',
      })
    } finally {
      setExtracting(false)
    }
  }

  // ── Add skill handler ──────────────────────────────────────────────────────
  function handleAddSkill() {
    if (!addForm.name) { setAddError('Please select a skill.'); return }
    const yrs = parseInt(addForm.years, 10)
    if (isNaN(yrs) || yrs < 0 || yrs > 50) { setAddError('Enter valid years of experience (between 0 and 50 years).'); return }
    const level: DemoSkill['level'] = yrs >= 4 ? 'Skilled' : yrs >= 2 ? 'Semi-skilled' : 'Unskilled'
    setSkills((prev) => [
      ...prev,
      { id: Date.now().toString(), name: addForm.name, sector: addForm.sector, years: yrs, level, primary: addForm.primary },
    ])
    setAddForm({ name: '', sector: 'Construction', years: '', primary: false })
    setAddError('')
    setShowAddForm(false)
  }

  function handleRemoveSkill(id: string) {
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-5 px-4 py-5 pb-8">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Wrench className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Skills</h1>
          <p className="text-sm text-gray-500">Manage your skills and work experience</p>
        </div>
      </div>

      {/* ── AI Natural Language Input ─────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-semibold text-gray-800">Describe your skills</h2>
        </div>
        <textarea
          rows={4}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="Example: I have been working as a mason for 5 years and I also know tile installation. I came from Bihar and currently work in Ahmedabad."
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          onClick={handleExtract}
          disabled={extracting || !aiText.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:bg-teal-700 transition-colors"
        >
          {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Extract Skills with AI 🤖
        </button>

        {/* Extract result */}
        {extractResult && (
          <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Extracted Information</p>
            {extractResult.occupation && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-24 shrink-0">Occupation:</span>
                <span className="font-medium text-gray-900">{extractResult.occupation}</span>
              </div>
            )}
            {extractResult.skills && extractResult.skills.length > 0 && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-24 shrink-0">Skills:</span>
                <span className="font-medium text-gray-900">{extractResult.skills.join(', ')}</span>
              </div>
            )}
            {extractResult.experience && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-24 shrink-0">Experience:</span>
                <span className="font-medium text-gray-900">{extractResult.experience}</span>
              </div>
            )}
            {extractResult.origin && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-24 shrink-0">Origin:</span>
                <span className="font-medium text-gray-900">{extractResult.origin}</span>
              </div>
            )}
            {extractResult.location && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-24 shrink-0">Location:</span>
                <span className="font-medium text-gray-900">{extractResult.location}</span>
              </div>
            )}
          </div>
        )}

        {extractError && (
          <p className="mt-2 text-xs text-red-600">{extractError}</p>
        )}
      </div>

      {/* ── Current Skills ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Current Skills ({skills.length})</h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Skill Manually
          </button>
        </div>

        {/* Inline add form */}
        {showAddForm && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Add New Skill</p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Skill</label>
              <select
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select a skill…</option>
                {SKILL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Years of Experience (0–50 Yrs)</label>
              <input
                type="number"
                min={0}
                max={50}
                maxLength={2}
                value={addForm.years}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2)
                  const num = parseInt(cleaned, 10)
                  if (!isNaN(num) && num > 50) return
                  setAddForm((f) => ({ ...f, years: cleaned }))
                }}
                placeholder="e.g. 3 (Max 50 years)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addForm.primary}
                onChange={(e) => setAddForm((f) => ({ ...f, primary: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Primary skill</span>
            </label>
            {addError && <p className="text-xs text-red-600">{addError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleAddSkill}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Save Skill
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddError('') }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skill cards grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">{skill.name}</p>
                  {skill.primary && (
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-label="Primary skill" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{skill.sector} · {skill.years} yr{skill.years !== 1 ? 's' : ''}</p>
                <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_STYLE[skill.level]}`}>
                  {skill.level}
                </span>
              </div>
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                aria-label={`Remove ${skill.name}`}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
