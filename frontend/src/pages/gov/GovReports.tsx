import { useState } from 'react'
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  BarChart2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  ShieldCheck
} from 'lucide-react'

export default function GovReports() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q3 (Jul - Sep 2026)')
  const [selectedDistrict, setSelectedDistrict] = useState('Surat')

  const SECTOR_METRICS = [
    { sector: 'Construction & Real Estate', inspected: 142, complianceRate: 81, arrearsRecovered: '₹3,45,000', openViolations: 18 },
    { sector: 'Textiles & Dyeing Mills', inspected: 98, complianceRate: 76, arrearsRecovered: '₹1,85,000', openViolations: 12 },
    { sector: 'Diamond Cutting & Polishing', inspected: 110, complianceRate: 92, arrearsRecovered: '₹62,000', openViolations: 4 },
    { sector: 'Heavy Engineering & Fabrication', inspected: 64, complianceRate: 95, arrearsRecovered: '₹40,000', openViolations: 2 },
    { sector: 'Chemicals & Petrochemicals', inspected: 48, complianceRate: 88, arrearsRecovered: '₹1,12,000', openViolations: 5 },
  ]

  function handleExportCSV() {
    const headers = 'Industry Sector,Sites Inspected,Compliance Rate (%),Arrears Recovered (INR),Open Violations\n'
    const rows = SECTOR_METRICS.map(
      (s) => `"${s.sector}",${s.inspected},${s.complianceRate},"${s.arrearsRecovered}",${s.openViolations}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `District_Labour_Compliance_Report_${selectedDistrict}_2026.csv`
    a.click()
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
              <FileText className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              District Labour &amp; Compliance Policy Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Macro-level workforce statistics, wage recovery summaries, and welfare scheme disbursement dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] text-[#0C2D27] dark:text-white font-bold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-[#122A23] transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0C2D27] dark:bg-[#1E4D40] hover:bg-[#123D34] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[#C0E862]" />
            <span>Print Official Dossier</span>
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold text-[#0C2D27] dark:text-white">Reporting Period:</span>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs font-semibold text-[#0C2D27] dark:text-white"
          >
            <option>Q3 (Jul - Sep 2026)</option>
            <option>Q2 (Apr - Jun 2026)</option>
            <option>Q1 (Jan - Mar 2026)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#0C2D27] dark:text-white">District Jurisdiction:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs font-semibold text-[#0C2D27] dark:text-white"
          >
            <option>Surat</option>
            <option>Ahmedabad</option>
            <option>Vadodara</option>
            <option>Rajkot</option>
            <option>Gujarat State Aggregate</option>
          </select>
        </div>
      </div>

      {/* ── Key Performance Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">
            Total Inspections Executed
          </span>
          <b className="text-2xl sm:text-3xl font-black text-[#0C2D27] dark:text-white block">
            462 Sites
          </b>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            +18% from previous quarter
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">
            Wage Arrears Recovered
          </span>
          <b className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
            ₹7,44,000
          </b>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Disbursed to 318 workmen
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">
            Average Resolution Time
          </span>
          <b className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 block">
            3.8 Days
          </b>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
            Target SLA: &lt; 5.0 days
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#9DBBB2]">
            Statutory Notice Compliance
          </span>
          <b className="text-2xl sm:text-3xl font-black text-[#0C2D27] dark:text-white block">
            86.4%
          </b>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Cured within 7 calendar days
          </span>
        </div>
      </div>

      {/* ── Table: Sector Compliance Breakdown ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <b className="text-base font-extrabold text-[#0C2D27] dark:text-white block">
              Industry Sector Compliance Breakdown
            </b>
            <span className="text-xs text-slate-500 dark:text-[#9DBBB2]">
              Surat District Enforcement Statistics ({selectedQuarter})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1F4C3F] text-slate-400 dark:text-[#9DBBB2] uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4">Sites Inspected</th>
                <th className="py-3 px-4">Compliance Rating</th>
                <th className="py-3 px-4">Arrears Recovered</th>
                <th className="py-3 px-4">Open Violations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E483D]">
              {SECTOR_METRICS.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#122A23] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0C2D27] dark:text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{s.sector}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-[#CBDCE1] font-semibold">{s.inspected} establishments</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.complianceRate < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${s.complianceRate}%` }}
                        />
                      </div>
                      <b className="text-xs text-[#0C2D27] dark:text-white">{s.complianceRate}%</b>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">{s.arrearsRecovered}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.openViolations > 10
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                        : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {s.openViolations} cases
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
