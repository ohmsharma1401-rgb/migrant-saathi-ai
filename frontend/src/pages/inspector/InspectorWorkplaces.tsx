import { useState } from 'react'
import {
  Building2,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react'

interface WorkplaceItem {
  id: string
  name: string
  siteAddress: string
  district: string
  sector: string
  workforceCount: number
  complianceScore: number
  lastInspected: string
  openComplaints: number
  riskLevel: 'Low' | 'Medium' | 'High'
}

const MONITORED_WORKPLACES: WorkplaceItem[] = [
  {
    id: 'wp-01',
    name: 'Shree Construction Ltd. - Waterfront Tower',
    siteAddress: 'Plot 42, Hazira Coastal Commercial Zone, Surat',
    district: 'Surat',
    sector: 'Construction',
    workforceCount: 420,
    complianceScore: 72,
    lastInspected: '14 Sep 2026',
    openComplaints: 2,
    riskLevel: 'High'
  },
  {
    id: 'wp-02',
    name: 'Surat Diamond Bourse Worksite - West Wing',
    siteAddress: 'DREAM City, Khajod, Surat',
    district: 'Surat',
    sector: 'Commercial Infra',
    workforceCount: 850,
    complianceScore: 68,
    lastInspected: '20 Sep 2026',
    openComplaints: 3,
    riskLevel: 'High'
  },
  {
    id: 'wp-03',
    name: 'L&T Heavy Engineering Complex',
    siteAddress: 'Hazira Manufacturing Hub, Surat',
    district: 'Surat',
    sector: 'Heavy Engineering',
    workforceCount: 1200,
    complianceScore: 94,
    lastInspected: '05 Aug 2026',
    openComplaints: 0,
    riskLevel: 'Low'
  },
  {
    id: 'wp-04',
    name: 'Pandesara Weaving Industrial Park',
    siteAddress: 'Sector 3, GIDC Pandesara, Surat',
    district: 'Surat',
    sector: 'Textiles & Dyeing',
    workforceCount: 640,
    complianceScore: 78,
    lastInspected: '18 Aug 2026',
    openComplaints: 1,
    riskLevel: 'Medium'
  },
  {
    id: 'wp-05',
    name: 'Metro Rail Phase 2 - Elevated Corridor Station 9',
    siteAddress: 'Ring Road Junction, Majura Gate, Surat',
    district: 'Surat',
    sector: 'Urban Transport',
    workforceCount: 310,
    complianceScore: 82,
    lastInspected: '25 Aug 2026',
    openComplaints: 1,
    riskLevel: 'Medium'
  },
  {
    id: 'wp-06',
    name: 'Essar Hazira Port Logistics Terminal',
    siteAddress: 'Jetty Area 4, Hazira Port, Surat',
    district: 'Surat',
    sector: 'Logistics & Shipping',
    workforceCount: 520,
    complianceScore: 89,
    lastInspected: '02 Sep 2026',
    openComplaints: 0,
    riskLevel: 'Low'
  }
]

export default function InspectorWorkplaces() {
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('All')

  const filtered = MONITORED_WORKPLACES.filter((wp) => {
    const matchesSector = sectorFilter === 'All' || wp.sector === sectorFilter
    const matchesSearch =
      search === '' ||
      wp.name.toLowerCase().includes(search.toLowerCase()) ||
      wp.siteAddress.toLowerCase().includes(search.toLowerCase()) ||
      wp.district.toLowerCase().includes(search.toLowerCase())
    return matchesSector && matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
              <Building2 className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
              Monitored Workplaces &amp; Construction Sites
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
            Registered establishments under inspection jurisdiction with compliance history and workforce metrics.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
          Surat Division: 6 Active Sites
        </span>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search establishment or site address..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white placeholder:text-slate-400"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="w-full sm:w-56 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#0C2D27] dark:text-white font-semibold"
        >
          <option value="All">All Industry Sectors</option>
          <option value="Construction">Construction</option>
          <option value="Commercial Infra">Commercial Infra</option>
          <option value="Heavy Engineering">Heavy Engineering</option>
          <option value="Textiles & Dyeing">Textiles &amp; Dyeing</option>
          <option value="Urban Transport">Urban Transport</option>
          <option value="Logistics & Shipping">Logistics &amp; Shipping</option>
        </select>
      </div>

      {/* ── Workplaces Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((wp) => (
          <div
            key={wp.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs hover:border-amber-400 transition-all space-y-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#15342B] text-slate-700 dark:text-emerald-300">
                  {wp.sector}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  wp.riskLevel === 'High'
                    ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                    : wp.riskLevel === 'Medium'
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {wp.riskLevel} Risk Profile
                </span>
              </div>

              <b className="text-sm sm:text-base font-extrabold text-[#0C2D27] dark:text-white block">
                {wp.name}
              </b>

              <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-[#CBDCE1]">
                <MapPin className="h-3.5 w-3.5 text-[#FF6B53] shrink-0 mt-0.5" />
                <span>{wp.siteAddress}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] text-center text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Workforce</span>
                <b className="font-extrabold text-[#0C2D27] dark:text-white">{wp.workforceCount}</b>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Score</span>
                <b className={`font-extrabold ${wp.complianceScore < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {wp.complianceScore}%
                </b>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] block">Active Grievances</span>
                <b className="font-extrabold text-amber-600 dark:text-amber-400">{wp.openComplaints}</b>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9DBBB2] pt-2 border-t border-slate-100 dark:border-[#1E483D]">
              <div className="flex items-center gap-1 text-[11px]">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Last Inspected: <b>{wp.lastInspected}</b></span>
              </div>

              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                Jurisdiction: Surat
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
