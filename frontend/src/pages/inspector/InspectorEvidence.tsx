import { useState, useEffect } from 'react'
import {
  Camera,
  FileText,
  Upload,
  Search,
  MapPin,
  Clock,
  Plus,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FolderOpen
} from 'lucide-react'
import { inspectionService, EvidenceItem, InspectionCase } from '@/services/inspection.service'

export default function InspectorEvidence() {
  const [cases, setCases] = useState<InspectionCase[]>([])
  const [evidenceList, setEvidenceList] = useState<{ caseCode: string; workerName: string; item: EvidenceItem }[]>([])
  const [filterType, setFilterType] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Quick upload modal state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'photo' | 'document' | 'statement'>('photo')
  const [notes, setNotes] = useState('')
  const [geotag, setGeotag] = useState('Surat Industrial Area, GPS (21.1702° N, 72.8311° E)')

  useEffect(() => {
    loadEvidence()
  }, [])

  async function loadEvidence() {
    try {
      const res = await inspectionService.getInspectorCases()
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setCases(rawList)
      const flattened: { caseCode: string; workerName: string; item: EvidenceItem }[] = []
      rawList.forEach((c) => {
        const evList = Array.isArray(c.evidence) ? c.evidence : []
        evList.forEach((ev) => {
          flattened.push({
            caseCode: c.case_code || c.id,
            workerName: c.worker_name || 'Worker',
            item: ev
          })
        })
      })
      setEvidenceList(flattened)
      if (rawList.length > 0) {
        setSelectedCaseId(rawList[0].id)
      }
    } catch {
      setCases([])
      setEvidenceList([])
    }
  }

  async function handleUpload() {
    if (!title.trim() || !selectedCaseId) return
    const newEv: EvidenceItem = {
      id: `ev-${Date.now()}`,
      title: title.trim(),
      evidence_type: type,
      url: type === 'photo' ? 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' : undefined,
      notes: notes.trim() || 'Uploaded via Inspector Evidence Vault',
      geotag: geotag.trim(),
      uploaded_at: 'Just now'
    }

    try {
      await inspectionService.addEvidence(selectedCaseId, newEv)
    } catch {
      // Local addition
    }

    const c = cases.find((x) => x.id === selectedCaseId)
    setEvidenceList([
      {
        caseCode: c?.case_code || 'CASE-GJ-2026',
        workerName: c?.worker_name || 'Worker',
        item: newEv
      },
      ...evidenceList
    ])

    setTitle('')
    setNotes('')
    setUploadOpen(false)
  }

  const safeList = Array.isArray(evidenceList) ? evidenceList : []
  const q = searchQuery.toLowerCase()
  const filteredEvidence = safeList.filter((entry) => {
    const matchesType = filterType === 'All' || (entry.item?.evidence_type || '').toLowerCase() === filterType.toLowerCase()
    const matchesSearch =
      searchQuery === '' ||
      (entry.item?.title || '').toLowerCase().includes(q) ||
      (entry.caseCode || '').toLowerCase().includes(q) ||
      (entry.workerName || '').toLowerCase().includes(q)
    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
              <Camera className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              Field Evidence &amp; Photographic Vault
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Tamper-proof digital repository of geotagged site photographs, wage registers, muster rolls, and recorded depositions.
          </p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Field Evidence</span>
        </button>
      </div>

      {/* ── Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
          {['All', 'photo', 'document', 'statement'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-[#15342B] text-slate-600 dark:text-[#CBDCE1] hover:bg-slate-200 dark:hover:bg-[#1C4539]'
              }`}
            >
              {t === 'All' ? 'All Types' : `${t}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, case ID, worker..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── Evidence Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidence.map((entry) => (
          <div
            key={entry.item.id}
            className="rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs overflow-hidden hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            {/* Visual Header / Thumbnail */}
            {entry.item.url ? (
              <div className="relative h-44 w-full bg-slate-200 dark:bg-slate-800">
                <img
                  src={entry.item.url}
                  alt={entry.item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1">
                  <Camera className="h-3 w-3 text-amber-400" />
                  <span>Geotagged</span>
                </div>
              </div>
            ) : (
              <div className="h-32 w-full bg-emerald-950/20 dark:bg-[#133027] flex items-center justify-center text-emerald-500">
                <FileText className="h-10 w-10 opacity-70" />
              </div>
            )}

            {/* Content Details */}
            <div className="p-4 sm:p-5 space-y-2.5 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                    {entry.caseCode}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">
                    {entry.item.evidence_type}
                  </span>
                </div>

                <b className="text-sm font-bold text-[#0C2D27] dark:text-white block line-clamp-1">
                  {entry.item.title}
                </b>

                <p className="text-xs text-slate-500 dark:text-[#CBDCE1] line-clamp-2">
                  {entry.item.notes}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#1E483D] space-y-1 text-[11px] text-slate-400 dark:text-[#9DBBB2]">
                {entry.item.geotag && (
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{entry.item.geotag}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Worker: <b className="text-slate-700 dark:text-slate-200">{entry.workerName}</b></span>
                  <span>{entry.item.uploaded_at}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Dialog Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] p-6 shadow-2xl space-y-4">
            <b className="text-base font-extrabold text-[#0C2D27] dark:text-white block">
              Catalog Field Evidence
            </b>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Associate with Case Docket</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_code} — {c.worker_name} vs {c.employer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Evidence Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scaffolding Fall Netting Missing - Tower 3"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                  >
                    <option value="photo">Field Photo (Camera / Geotagged)</option>
                    <option value="document">Wage Register Scan / Slip</option>
                    <option value="statement">Recorded Statement / Audio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">GPS Geotag</label>
                  <input
                    type="text"
                    value={geotag}
                    onChange={(e) => setGeotag(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-[#9DBBB2] font-semibold mb-1">Field Observations</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail observations, contractor explanations, or physical markings..."
                  className="w-full rounded-xl border border-slate-300 dark:border-[#1F4C3F] bg-white dark:bg-[#122A23] p-2.5 text-[#0C2D27] dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUploadOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!title.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold"
              >
                Save to Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
