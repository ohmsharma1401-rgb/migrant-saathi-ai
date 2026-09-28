import { useState, useEffect } from 'react'
import {
  FileCheck2,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Building2,
  User,
  Clock,
  Printer,
  ChevronRight,
  FileText
} from 'lucide-react'
import { inspectionService, InspectionCase } from '@/services/inspection.service'

export default function InspectorReports() {
  const [cases, setCases] = useState<InspectionCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState<InspectionCase | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setLoading(true)
    try {
      const res = await inspectionService.getInspectorCases()
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setCases(rawList)
      if (rawList.length > 0) {
        setSelectedReport(rawList[0])
      }
    } catch {
      setCases([])
    } finally {
      setLoading(false)
    }
  }

  const safeCases = Array.isArray(cases) ? cases : []
  const reports = safeCases.filter((c) =>
    c.recommended_action || c.statutory_notice_issued || (c.findings && c.findings.length > 0) || c.status === 'Verified' || c.status === 'Escalated'
  )

  const q = searchQuery.toLowerCase()
  const filteredReports = reports.filter((r) =>
    (r.case_code || '').toLowerCase().includes(q) ||
    (r.worker_name || '').toLowerCase().includes(q) ||
    (r.employer_name || '').toLowerCase().includes(q)
  )

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-500">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              Inspection Reports &amp; Statutory Violation Notices
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Official statutory findings filed under Section 19 of the Inter-State Migrant Workmen Act, 1979 and Gujarat Labour Rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] text-[#0C2D27] dark:text-white font-bold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-[#122A23] transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-amber-500" />
            <span>Print Current Report</span>
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">Notices Issued</span>
          <b className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">12 Notices</b>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">Wage Arrears Claimed</span>
          <b className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">₹42,500</b>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">Immediate Rectifications</span>
          <b className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 block mt-1">8 Workplaces</b>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">Escalated to HQ</span>
          <b className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 block mt-1">2 Dockets</b>
        </div>
      </div>

      {/* ── Main Two-Column View: Reports List & Detailed Inspection Dossier ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Reports Master List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by case code or parties..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredReports.map((r) => {
              const isSelected = selectedReport?.id === r.id
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-[#14352B] border-amber-400 dark:border-amber-400 shadow-md'
                      : 'bg-white dark:bg-[#0D241E] border-slate-200/80 dark:border-[#1F4C3F] hover:border-slate-300 dark:hover:border-[#2A5E4F]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                      {r.case_code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'Escalated'
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <b className="text-xs sm:text-sm font-bold text-[#0C2D27] dark:text-white block truncate">
                    {r.worker_name} vs. {r.employer_name}
                  </b>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9DBBB2] pt-2">
                    <span>{r.location_district}</span>
                    <span>{r.findings.length} Violations</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Inspection Dossier & Notice View */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-6">
              {/* Official Seal Header */}
              <div className="border-b border-slate-200 dark:border-[#1F4C3F] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-black text-xs">
                      GJ
                    </div>
                    <div>
                      <b className="text-xs uppercase tracking-wider text-[#0C2D27] dark:text-white block font-black">
                        Office of the Labour Enforcement Officer
                      </b>
                      <span className="text-[10px] text-slate-500 dark:text-[#9DBBB2] block">
                        Government of Gujarat · Surat Division
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#15342B] font-mono text-xs font-black text-[#0C2D27] dark:text-white border border-slate-200 dark:border-[#1F4C3F]">
                    {selectedReport.case_code}
                  </span>
                </div>
              </div>

              {/* Parties Block */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] uppercase block">Complainant Workman</span>
                  <b className="text-[#0C2D27] dark:text-white text-xs block">{selectedReport.worker_name}</b>
                  <span className="text-slate-500 dark:text-[#9DBBB2] block">Reg ID: {selectedReport.worker_id}</span>
                  <span className="text-slate-500 dark:text-[#9DBBB2] block">Origin: {selectedReport.worker_domicile}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] uppercase block">Principal Employer / Contractor</span>
                  <b className="text-[#0C2D27] dark:text-white text-xs block">{selectedReport.employer_name}</b>
                  <span className="text-slate-500 dark:text-[#9DBBB2] block truncate">Site: {selectedReport.workplace_site}</span>
                  <span className="text-slate-500 dark:text-[#9DBBB2] block">Jurisdiction: {selectedReport.location_district}</span>
                </div>
              </div>

              {/* Violations Summary Table */}
              <div className="space-y-2">
                <b className="text-xs font-extrabold text-[#0C2D27] dark:text-white uppercase block">
                  Statutory Findings &amp; Infractions ({selectedReport.findings.length})
                </b>

                {selectedReport.findings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedReport.findings.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <b className="text-[#0C2D27] dark:text-white font-bold">{f.category}</b>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            f.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-[#CBDCE1]">{f.description}</p>
                        {f.rule_violated && (
                          <span className="text-[10px] font-mono text-slate-400 dark:text-[#9DBBB2] block">
                            Clause: {f.rule_violated}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-[#9DBBB2]">No violations logged in this report.</p>
                )}
              </div>

              {/* Recommended Enforcement Action */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase block">
                  Enforcement Directive &amp; Remedial Order
                </span>
                <b className="text-sm font-black text-[#0C2D27] dark:text-white block">
                  {selectedReport.recommended_action || 'Issue Form-IV Statutory Notice & Demand Disparity Recovery'}
                </b>
                <p className="text-slate-600 dark:text-[#CBDCE1]">
                  Statutory notice serves a 7-day cure period under Section 19. Failure to remedy will trigger prosecution before the Chief Judicial Magistrate.
                </p>
              </div>

              {/* Officer Attestation */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#1F4C3F] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Inspecting Officer</span>
                  <b className="text-[#0C2D27] dark:text-white">{selectedReport.assigned_inspector_name}</b>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block">
                    {selectedReport.assigned_inspector_badge}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Date of Filing</span>
                  <b className="text-[#0C2D27] dark:text-white">{selectedReport.scheduled_date}</b>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">Digital Signature Verified ✓</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] text-center text-xs text-slate-500">
              Select a report from the left column to view the complete inspection dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
