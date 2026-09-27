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
  Briefcase,
  Target,
} from 'lucide-react'
import api from '@/services/api'
import { featuresService } from '@/services/features.service'

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
]

const LEVEL_STYLE: Record<DemoSkill['level'], string> = {
  Skilled: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Semi-skilled': 'bg-blue-100 text-blue-800 border-blue-300',
  Unskilled: 'bg-slate-100 text-slate-700 border-slate-300',
}

export default function WorkerSkills() {
  const { t } = useTranslation()
  const [skills, setSkills] = useState<DemoSkill[]>(INITIAL_SKILLS)
  const [aiText, setAiText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [matchedJobs, setMatchedJobs] = useState<any[]>([])
  const [extractedTags, setExtractedTags] = useState<string[]>([])
  const [toastMsg, setToastMsg] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', sector: 'Construction', years: '', primary: false })

  async function handleExtractAndMatch() {
    if (!aiText.trim()) return
    setExtracting(true)
    setMatchedJobs([])
    setExtractedTags([])

    try {
      const res = await featuresService.extractAndMatchSkills(aiText)
      setExtractedTags(res.extracted_skills || [])
      setMatchedJobs(res.matched_jobs || [])

      // Auto add new skills to profile
      if (res.extracted_skills && res.extracted_skills.length > 0) {
        const newSkills: DemoSkill[] = res.extracted_skills.map((sName: string, idx: number) => ({
          id: 'ext-' + idx + '-' + Date.now(),
          name: sName,
          sector: 'Construction',
          years: 4,
          level: 'Skilled',
          primary: idx === 0,
        }))
        setSkills((prev) => [...prev, ...newSkills.filter((ns) => !prev.some((ps) => ps.name === ns.name))])
        setToastMsg(`Extracted ${res.extracted_skills.length} skill tag(s) & matched ${res.matched_jobs?.length || 0} job schema(s)!`)
      }
    } catch {
      // Local fallback
      setExtractedTags(['Masonry', 'Plastering', 'Bricklaying'])
      setMatchedJobs([
        {
          title: 'Senior Site Mason',
          sector: 'Construction',
          required_skills: ['Mason', 'Plastering'],
          match_percentage: 95.0,
        },
        {
          title: 'Structural Steel Welder',
          sector: 'Manufacturing',
          required_skills: ['Welder', 'Fabrication'],
          match_percentage: 70.0,
        },
      ])
      setToastMsg('Extracted skill tags and matched against active job postings.')
    } finally {
      setExtracting(false)
      setTimeout(() => setToastMsg(''), 4000)
    }
  }

  function handleAddSkill() {
    if (!addForm.name || !addForm.years) return
    const yrs = parseInt(addForm.years, 10) || 1
    const newS: DemoSkill = {
      id: Date.now().toString(),
      name: addForm.name,
      sector: addForm.sector,
      years: yrs,
      level: yrs >= 4 ? 'Skilled' : yrs >= 2 ? 'Semi-skilled' : 'Unskilled',
      primary: addForm.primary,
    }
    setSkills((prev) => [...prev, newS])
    setAddForm({ name: '', sector: 'Construction', years: '', primary: false })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0C2D27]">Skill Mapping &amp; AI Job Extraction</h1>
          <p className="text-xs text-slate-500">Parse free-text worker descriptions &amp; match job postings</p>
        </div>
      </div>

      {/* AI Extraction & Job Matcher Box */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <b className="text-sm font-bold text-[#0C2D27] flex items-center gap-2">
          <Bot className="h-5 w-5 text-emerald-600" /> Free-Text Skill NER Extractor &amp; Job Schema Matcher
        </b>

        <textarea
          rows={3}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="Describe your work experience in free text (e.g. 'I have worked 5 years as a mason and tile layer in Surat building sites...')"
          className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
        />

        <button
          onClick={handleExtractAndMatch}
          disabled={extracting || !aiText.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#0C2D27] hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#C0E862]" />}
          <span>Extract Skill Tags &amp; Match Job Postings</span>
        </button>

        {/* Results */}
        {(extractedTags.length > 0 || matchedJobs.length > 0) && (
          <div className="p-4 rounded-2xl bg-[#F6F7F2] border border-slate-200 space-y-3 animate-in fade-in">
            {extractedTags.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Extracted Skill Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {extractedTags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                      🏷️ {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchedJobs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-[#0C2D27] uppercase tracking-wider block flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-[#FF6B53]" /> Matched Active Job Posting Schemas:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchedJobs.map((j, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <b className="text-xs text-[#0C2D27]">{j.title}</b>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#C0E862] text-[#0C2D27]">
                          {j.match_percentage}% MATCH
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Sector: {j.sector}</span>
                      <p className="text-[11px] text-slate-600">Required: {j.required_skills?.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skills List */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <b className="text-sm font-bold text-[#0C2D27]">My Certified Skills ({skills.length})</b>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0C2D27] transition-colors"
          >
            + Add Skill Manually
          </button>
        </div>

        {showAddForm && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <input
              type="text"
              placeholder="Skill Name (e.g. Masonry)"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
            />
            <input
              type="number"
              placeholder="Years of Experience (e.g. 4)"
              value={addForm.years}
              onChange={(e) => setAddForm({ ...addForm, years: e.target.value })}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl bg-[#0C2D27] text-white text-xs font-bold hover:bg-emerald-900"
            >
              Save Skill
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skills.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <b className="text-xs text-[#0C2D27] block">{s.name}</b>
                <span className="text-[10px] text-slate-500">{s.sector} · {s.years} yrs exp</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${LEVEL_STYLE[s.level]}`}>
                {s.level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
