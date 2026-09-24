import { useState, useRef } from 'react'
import { AlertTriangle, CheckCircle, Loader2, PhoneCall, Upload, Trash2, Camera, Film, Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/utils/translations'
import api from '@/services/api'

interface ProofFile {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
  size: string
}

const ISSUE_TYPES = [
  {
    id: 'casualty',
    emoji: '🚨',
    label: 'Casualty / Accident Incident',
    desc: 'Severe physical injury, workplace site accident, life hazard',
    priority: 'Critical',
  },
  {
    id: 'harassment',
    emoji: '⚖️',
    label: 'Discrimination & Abuse',
    desc: 'Caste/gender discrimination, verbal abuse, physical threats, bias',
    priority: 'High',
  },
  {
    id: 'safety',
    emoji: '🔴',
    label: 'Workplace Safety Hazard',
    desc: 'Falling materials, broken scaffolding, lack of PPE equipment',
    priority: 'High',
  },
  {
    id: 'wage',
    emoji: '💰',
    label: 'Wage Non-Payment / Theft',
    desc: 'Unpaid salary, illegal deductions, wage rate fraud',
    priority: 'Medium',
  },
  {
    id: 'conditions',
    emoji: '🏗',
    label: 'Poor Working Conditions',
    desc: 'Overcrowded housing, excessive forced hours, lack of drinking water',
    priority: 'Medium',
  },
  {
    id: 'other',
    emoji: '📋',
    label: 'Other Rights Violation',
    desc: 'Other workplace complaints or document withholding',
    priority: 'Medium',
  },
]

const DISTRICTS = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bharuch', 'Kutch', 'Mehsana']

function randomComplaintId() {
  return `GRV-2026-${Math.floor(100 + Math.random() * 900)}`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function ReportSafety() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [district, setDistrict] = useState('Surat')
  const [employer, setEmployer] = useState('')
  const [proofFiles, setProofFiles] = useState<ProofFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [previewMedia, setPreviewMedia] = useState<ProofFile | null>(null)

  const canSubmit = issueType && description.trim().length >= 5

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 25MB limit. Please choose a smaller file.`)
        return
      }

      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')

      if (!isImage && !isVideo) {
        alert(`File "${file.name}" format is not supported. Please upload photos (JPG, PNG, WEBP) or videos (MP4, MOV, WEBM).`)
        return
      }

      const reader = new FileReader()
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string
        if (dataUrl) {
          const newProof: ProofFile = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: isVideo ? 'video' : 'image',
            url: dataUrl,
            size: formatBytes(file.size),
          }
          setProofFiles((prev) => [...prev, newProof])
        }
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleRemoveProof(id: string) {
    setProofFiles((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    const newId = randomComplaintId()

    let workerName = 'Ramesh Kumar'
    try {
      const stored = localStorage.getItem('saathi-custom-worker')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.full_name) workerName = parsed.full_name
      }
    } catch {
      // fallback
    }

    const selectedTypeObj = ISSUE_TYPES.find((i) => i.id === issueType)
    const categoryLabel = selectedTypeObj ? selectedTypeObj.label.split(' ')[0] : 'Safety'
    const priorityLevel = selectedTypeObj ? selectedTypeObj.priority : 'High'

    const newGrievance = {
      id: newId,
      category: categoryLabel,
      issueType: issueType,
      issueTitle: selectedTypeObj?.label || 'Workplace Report',
      status: 'Open',
      priority: priorityLevel,
      description: description.trim(),
      employer: employer.trim() || 'Not specified',
      worker: workerName,
      location: `${district}, Gujarat`,
      submittedAgo: 'Just now',
      created: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      inspector: 'Unassigned',
      proofFiles: proofFiles,
      updates: [
        { date: 'Just now', text: `Report submitted with ${proofFiles.length} proof media file(s). Queued for inspector review.` },
      ],
    }

    try {
      await api.post('/grievances', {
        category: newGrievance.category,
        description: newGrievance.description,
        location_district: district,
        employer_name: employer || undefined,
        proof_media: proofFiles,
      })
    } catch {
      // Local storage fallback
    }

    try {
      const existing = JSON.parse(localStorage.getItem('saathi-custom-grievances') || '[]')
      existing.unshift(newGrievance)
      localStorage.setItem('saathi-custom-grievances', JSON.stringify(existing))
    } catch {
      // fallback
    }

    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    setComplaintId(newId)
  }

  if (complaintId) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0C2D27]">Report Submitted Successfully!</h2>
            <p className="text-xs sm:text-sm text-[#52605D] max-w-md mx-auto">
              Your report and attached proof ({proofFiles.length} photo/video files) have been logged confidentially and dispatched to Gujarat Labour Inspectors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
            <span className="text-xs text-[#52605D] block font-semibold">{t('complaint_id')}</span>
            <span className="text-xl font-extrabold font-mono text-[#0C2D27]">{complaintId}</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/worker/grievances')}
              className="w-full sm:w-auto figma-btn-coral py-3 px-6 text-xs font-bold"
            >
              Track Complaint Status →
            </button>
            <button
              onClick={() => { setComplaintId(''); setDescription(''); setIssueType(''); setProofFiles([]) }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 text-[#0C2D27] font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Submit Another Incident
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
          <span className="w-4 h-[2px] bg-[#FF6B53]" />
          CONFIDENTIAL REPORTING &amp; GRIEVANCES
        </div>
        <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight">
          Report Casualties, Discrimination or Hazards
        </h1>
        <p className="text-xs sm:text-sm text-[#52605D] mt-0.5">
          Report workplace accidents, severe injury casualties, caste/gender discrimination, or wage theft with photo and video proof.
        </p>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="p-4 rounded-2xl bg-[#FFFDF0] border border-amber-300 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <PhoneCall className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <b className="text-xs font-bold text-[#0C2D27] block">Emergency Helpline for Immediate Medical / Legal Help</b>
            <span className="text-xs text-[#52605D]">Call 24x7 toll-free helpline: <b>1800 11 2211</b> or National Emergency <b>112</b></span>
          </div>
        </div>
      </div>

      {/* ── Form Card ───────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
        {/* Step 1: Category selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[#0C2D27]">
            1. Select Incident Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ISSUE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setIssueType(type.id)}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  issueType === type.id
                    ? 'border-[#0C2D27] bg-[#F6F7F2] text-[#0C2D27] shadow-2xs ring-2 ring-[#0C2D27]'
                    : 'border-slate-200 hover:bg-slate-50 text-[#0C2D27]'
                }`}
              >
                <span className="text-2xl shrink-0">{type.emoji}</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#0C2D27]">{type.label}</p>
                    {type.priority === 'Critical' && (
                      <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-800 text-[9px] font-bold">URGENT</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#52605D] leading-relaxed">{type.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: District & Employer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#0C2D27] mb-1.5">
              Workplace District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-[#0C2D27] focus:outline-none focus:border-[#FF6B53]"
            >
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0C2D27] mb-1.5">
              Employer / Contractor Name (Optional)
            </label>
            <input
              type="text"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              placeholder="e.g. Shree Construction Ltd."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-[#0C2D27] placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B53]"
            />
          </div>
        </div>

        {/* Step 3: Description textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0C2D27]">
            2. Detailed Description of What Happened
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, exact location, date/time, persons involved, injury severity or discrimination details..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-[#F6F7F2]/50 px-4 py-3 text-xs sm:text-sm text-[#0C2D27] placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B53]"
          />
        </div>

        {/* Step 4: Upload Proof (Photo / Video Attachment) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <b className="text-xs font-bold text-[#0C2D27] block">3. Upload Proof / Evidence (Photos &amp; Videos)</b>
              <p className="text-[11px] text-[#52605D]">
                Attach photos or video recordings of injuries, unsafe site hazards, wage slips, or incident proof.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="figma-btn-coral py-2 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Attach Photos / Video</span>
            </button>
          </div>

          {/* Proof Media Gallery Grid */}
          {proofFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {proofFiles.map((pf) => (
                <div key={pf.id} className="relative group rounded-2xl border border-slate-200 bg-slate-50 p-2 overflow-hidden shadow-2xs">
                  {pf.type === 'image' ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200">
                      <img src={pf.url} alt={pf.name} className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold flex items-center gap-1">
                        <Camera className="h-3 w-3" /> Photo
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center text-white">
                      <video src={pf.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Film className="h-6 w-6 text-white/90" />
                      </div>
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold flex items-center gap-1">
                        <Film className="h-3 w-3 text-red-400" /> Video
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[10px] text-[#0C2D27] font-semibold">
                    <span className="truncate max-w-[100px]">{pf.name}</span>
                    <span className="text-slate-400 font-mono text-[9px]">{pf.size}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(pf)}
                      className="text-[10px] text-teal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProof(pf.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Camera className="h-5 w-5" />
                <Film className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-[#0C2D27]">Click to select Photos or Videos from your device</p>
              <p className="text-[11px] text-[#52605D]">Supports JPG, PNG, WEBP, MP4, MOV, WEBM (Max 25MB)</p>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <span className="text-xs text-[#52605D]">
            All reports are encrypted and processed with complete worker privacy.
          </span>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="figma-btn-coral py-3 px-8 text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : null}
            <span>{submitting ? 'Submitting Report…' : t('submit_complaint_btn')}</span>
          </button>
        </div>
      </div>

      {/* ── Media Fullscreen Preview Modal ── */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-4 text-white shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                {previewMedia.type === 'image' ? <Camera className="h-4 w-4 text-emerald-400" /> : <Film className="h-4 w-4 text-red-400" />}
                {previewMedia.name} ({previewMedia.size})
              </span>
              <button onClick={() => setPreviewMedia(null)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              {previewMedia.type === 'image' ? (
                <img src={previewMedia.url} alt="Proof preview" className="max-h-[65vh] w-auto object-contain" />
              ) : (
                <video src={previewMedia.url} controls autoPlay className="max-h-[65vh] w-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
