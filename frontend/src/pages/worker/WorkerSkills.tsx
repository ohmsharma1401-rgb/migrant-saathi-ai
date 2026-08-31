import { useState, useEffect } from 'react'
import { useTranslation } from '@/utils/translations'
import {
  Wrench,
  X,
  Plus,
  Bot,
  Loader2,
  Star,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import api from '@/services/api'

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
  Skilled: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  'Semi-skilled': 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  Unskilled: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
}

interface ExtractResult {
  occupation?: string
  skills?: string[]
  experience?: string
  origin?: string
  location?: string
}

interface AddSkillForm {
  name: string
  sector: string
  years: string
  primary: boolean
}

const SKILL_DICTIONARY: { name: string; sector: string; keywords: string[] }[] = [
  { name: 'Mason', sector: 'Construction', keywords: ['mason', 'brick', 'wall', 'राजमिस्त्री', 'मिस्त्री', 'કડિયા', 'ચણતર'] },
  { name: 'Tile Installation', sector: 'Construction', keywords: ['tile', 'flooring', 'ceramic', 'टाइल', 'टाइल्स', 'ટાઇલ્સ'] },
  { name: 'Plastering', sector: 'Construction', keywords: ['plaster', 'wall coating', 'प्लास्टर', 'પ્લાસ્ટર'] },
  { name: 'Carpentry', sector: 'Construction', keywords: ['carpenter', 'wood', 'furniture', 'बढ़ई', 'लकड़ी', 'સુથાર'] },
  { name: 'Painting', sector: 'Construction', keywords: ['painter', 'paint', 'putty', 'पेंटर', 'पुट्टी', 'પેઇન્ટર'] },
  { name: 'Electrical Wiring', sector: 'Manufacturing', keywords: ['electrician', 'wiring', 'electrical', 'इलेक्ट्रीशियन', 'वायरिंग', 'ઇલેક્ટ્રિશિયન'] },
  { name: 'Plumbing', sector: 'Construction', keywords: ['plumber', 'pipe', 'fitting', 'प्लंबर', 'पाइप', 'પ્લમ્બર'] },
  { name: 'Welding', sector: 'Manufacturing', keywords: ['welder', 'fabrication', 'welding', 'वेल्डर', 'वेल्डिंग', 'વેલ્ડર'] },
]

const SKILL_OPTIONS = [
  'Mason', 'Tile Installation', 'Plastering', 'Carpentry', 'Painting',
  'Electrical Wiring', 'Plumbing', 'Welding', 'Fabrication', 'Other',
]

export default function WorkerSkills() {
  const { t } = useTranslation()
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
  const [toastMsg, setToastMsg] = useState('')

  // Add manually state
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<AddSkillForm>({ name: '', sector: 'Construction', years: '', primary: false })
  const [addError, setAddError] = useState('')

  // Save to local storage helper
  function saveSkillsToStorage(updatedSkills: DemoSkill[]) {
    try {
      const customStr = localStorage.getItem('saathi-custom-worker') || '{}'
      const c = JSON.parse(customStr)
      c.skills = updatedSkills.map((s) => s.name)
      localStorage.setItem('saathi-custom-worker', JSON.stringify(c))
    } catch {
      // ignore
    }
  }

  // ── AI Extract Skills Bot Handler ─────────────────────────────────────────────
  async function handleExtract() {
    if (!aiText.trim()) return
    setExtracting(true)
    setExtractResult(null)

    try {
      await api.post<ExtractResult>('/ai/extract-skills', { text: aiText })
    } catch {
      // Local NLP extraction fallback
    }

    await new Promise((r) => setTimeout(r, 900))

    const textLower = aiText.toLowerCase()
    
    // Parse years of experience using regex
    let yearsFound = 3
    const yearsMatch = textLower.match(/(\d+)\s*(year|yr|साल|વર્ષ)/)
    if (yearsMatch && yearsMatch[1]) {
      yearsFound = Math.min(50, Math.max(1, parseInt(yearsMatch[1], 10)))
    }

    // Match skills from dictionary
    const extractedSkillsList: DemoSkill[] = []
    const extractedNames: string[] = []

    SKILL_DICTIONARY.forEach((entry) => {
      const hasMatch = entry.keywords.some((kw) => textLower.includes(kw))
      if (hasMatch && !skills.some((s) => s.name.toLowerCase() === entry.name.toLowerCase())) {
        const level: DemoSkill['level'] = yearsFound >= 4 ? 'Skilled' : yearsFound >= 2 ? 'Semi-skilled' : 'Unskilled'
        extractedNames.push(entry.name)
        extractedSkillsList.push({
          id: 'ext-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: entry.name,
          sector: entry.sector,
          years: yearsFound,
          level,
          primary: false,
        })
      }
    })

    // If no specific keyword matched, extract default Masonry/Plastering
    if (extractedSkillsList.length === 0) {
      const fallbackName = 'Mason'
      if (!skills.some((s) => s.name === fallbackName)) {
        extractedNames.push(fallbackName)
        extractedSkillsList.push({
          id: 'ext-' + Date.now(),
          name: fallbackName,
          sector: 'Construction',
          years: yearsFound,
          level: yearsFound >= 4 ? 'Skilled' : 'Semi-skilled',
          primary: false,
        })
      }
    }

    // Update state and storage
    if (extractedSkillsList.length > 0) {
      setSkills((prev) => {
        const next = [...prev, ...extractedSkillsList]
        saveSkillsToStorage(next)
        return next
      })
      setToastMsg(`${extractedSkillsList.length} new skill(s) extracted and added to your profile!`)
    } else {
      setToastMsg('Extracted skills are already in your list.')
    }

    setTimeout(() => setToastMsg(''), 4000)

    setExtractResult({
      occupation: extractedNames[0] || 'Mason',
      skills: extractedNames.length > 0 ? extractedNames : ['Masonry', 'Plastering'],
      experience: `${yearsFound} years`,
      origin: 'Worker Profile',
      location: 'Gujarat',
    })

    setExtracting(false)
  }

  // ── Add Skill Handler ──────────────────────────────────────────────────────
  function handleAddSkill() {
    if (!addForm.name) { setAddError('Please select a skill.'); return }
    const yrs = parseInt(addForm.years, 10)
    if (isNaN(yrs) || yrs < 0 || yrs > 50) { setAddError('Enter valid years of experience (between 0 and 50 years).'); return }
    const level: DemoSkill['level'] = yrs >= 4 ? 'Skilled' : yrs >= 2 ? 'Semi-skilled' : 'Unskilled'
    
    setSkills((prev) => {
      const next = [
        ...prev,
        { id: Date.now().toString(), name: addForm.name, sector: addForm.sector, years: yrs, level, primary: addForm.primary },
      ]
      saveSkillsToStorage(next)
      return next
    })

    setAddForm({ name: '', sector: 'Construction', years: '', primary: false })
    setAddError('')
    setShowAddForm(false)
    setToastMsg(t('skill_added_toast'))
    setTimeout(() => setToastMsg(''), 3000)
  }

  function handleRemoveSkill(id: string) {
    setSkills((prev) => {
      const next = prev.filter((s) => s.id !== id)
      saveSkillsToStorage(next)
      return next
    })
  }

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 pb-8">
      {/* Toast message */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-white" />
          {toastMsg}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/80 shrink-0">
          <Wrench className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('skills_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('skills_subtitle')}</p>
        </div>
      </div>

      {/* ── AI Skill Extraction Bot Card ─────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
            <Bot className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            {t('describe_skills_title')}
            <Sparkles className="h-3.5 w-3.5 text-teal-500" />
          </h2>
        </div>

        <textarea
          rows={3}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder={t('describe_skills_placeholder')}
          className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={handleExtract}
          disabled={extracting || !aiText.trim()}
          className="mt-3 flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-white disabled:opacity-50 transition-all shadow-sm"
        >
          {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {extracting ? t('extracting_skills') : t('extract_skills_btn')}
        </button>

        {/* Extract Result Output Card */}
        {extractResult && (
          <div className="mt-4 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/70 dark:bg-teal-950/40 p-4 space-y-2 animate-in fade-in">
            <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              Extracted Skill Results (Saved to Profile)
            </p>
            {extractResult.skills && extractResult.skills.length > 0 && (
              <div className="flex gap-2 text-xs sm:text-sm">
                <span className="text-slate-500 dark:text-slate-400 w-24 shrink-0 font-medium">Extracted Skills:</span>
                <span className="font-bold text-slate-900 dark:text-white">{extractResult.skills.join(', ')}</span>
              </div>
            )}
            {extractResult.experience && (
              <div className="flex gap-2 text-xs sm:text-sm">
                <span className="text-slate-500 dark:text-slate-400 w-24 shrink-0 font-medium">Experience:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{extractResult.experience}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Current Skills ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {t('current_skills')} ({skills.length})
          </h2>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('add_skill_manually')}
          </button>
        </div>

        {/* Inline Add Skill Form */}
        {showAddForm && (
          <div className="mb-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 p-4 space-y-3">
            <p className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">Add New Skill</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Skill</label>
              <select
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a skill…</option>
                {SKILL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                max={50}
                value={addForm.years}
                onChange={(e) => setAddForm((f) => ({ ...f, years: e.target.value }))}
                placeholder="e.g. 4"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {addError && <p className="text-xs text-red-600 font-semibold">{addError}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddSkill}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition-colors"
              >
                Save Skill
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddError('') }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-all hover:border-teal-200 dark:hover:border-teal-800"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{skill.name}</p>
                  {skill.primary && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{skill.sector} · {skill.years} {t('years_exp')}</p>
                <span className={`mt-1.5 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${LEVEL_STYLE[skill.level]}`}>
                  {skill.level}
                </span>
              </div>
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                title="Remove Skill"
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
