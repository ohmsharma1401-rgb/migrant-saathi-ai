import { useState } from 'react'
import { Map, Info, Filter, Layers, Building2, Users, ShieldCheck, ChevronRight, Search } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import LanguageSelector from '@/components/LanguageSelector'
import { useTranslation } from '@/utils/translations'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const GUJARAT_DISTRICTS = [
  'All Districts', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
  'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Mehsana', 'Bharuch', 'Kheda',
  'Kutch', 'Amreli', 'Banaskantha', 'Patan', 'Surendranagar', 'Morbi', 'Navsari',
]

const SECTORS = ['All', 'Construction', 'Textiles', 'Diamond', 'Manufacturing']

export interface CompanyData {
  id: string
  name: string
  code: string
  district: string
  coords: [number, number]
  sector: string
  registeredEmployees: number
  complianceScore: number
  safetyRating: string
  address: string
  contactPerson: string
}

const REGISTERED_COMPANIES: CompanyData[] = [
  {
    id: 'c1',
    name: 'Shree Construction Ltd.',
    code: 'CMP-GJ-0481',
    district: 'Surat',
    coords: [21.1702, 72.8311],
    sector: 'Construction',
    registeredEmployees: 1420,
    complianceScore: 98,
    safetyRating: 'A+ Verified',
    address: 'Plot 42, GIDC Industrial Estate, Hazira, Surat',
    contactPerson: 'Rajesh Shah (HR Head)',
  },
  {
    id: 'c2',
    name: 'Reliance Textile & Fabrics Unit',
    code: 'CMP-GJ-0112',
    district: 'Ahmedabad',
    coords: [23.0225, 72.5714],
    sector: 'Textiles',
    registeredEmployees: 1180,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Naroda GIDC Phase 3, Ahmedabad',
    contactPerson: 'Viren Patel (Operations Director)',
  },
  {
    id: 'c3',
    name: 'L&T Infrastructure Project Site #4',
    code: 'CMP-GJ-0923',
    district: 'Vadodara',
    coords: [22.3072, 73.1812],
    sector: 'Construction',
    registeredEmployees: 950,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'Makarpura Industrial Zone, Vadodara',
    contactPerson: 'Sanjay Verma (Site Manager)',
  },
  {
    id: 'c4',
    name: 'Surat Diamond Craft Industries',
    code: 'CMP-GJ-0544',
    district: 'Surat',
    coords: [21.2000, 72.8400],
    sector: 'Diamond',
    registeredEmployees: 840,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    address: 'Katargam Diamond Hub, Surat',
    contactPerson: 'Ketan Dholakia (Owner)',
  },
  {
    id: 'c5',
    name: 'Adani Logistics & Manufacturing Port Unit',
    code: 'CMP-GJ-0782',
    district: 'Kutch',
    coords: [22.8251, 69.7028],
    sector: 'Manufacturing',
    registeredEmployees: 760,
    complianceScore: 99,
    safetyRating: 'A+ Verified',
    address: 'Mundra Port SEZ Sector 2, Kutch',
    contactPerson: 'Anil Mehta (EHS Manager)',
  },
  {
    id: 'c6',
    name: 'Rajkot Auto Components Ltd.',
    code: 'CMP-GJ-0319',
    district: 'Rajkot',
    coords: [22.3039, 70.8022],
    sector: 'Manufacturing',
    registeredEmployees: 520,
    complianceScore: 91,
    safetyRating: 'A Verified',
    address: 'Metoda GIDC Industrial Area, Rajkot',
    contactPerson: 'Pravin Randeria (GM)',
  },
]

const WORKER_LOCATIONS = [
  {
    city: 'Ahmedabad',
    coords: [23.0225, 72.5714] as [number, number],
    workers: 4231,
    radius: 24,
    topSector: 'Construction',
    rank: 1,
  },
  {
    city: 'Surat',
    coords: [21.1702, 72.8311] as [number, number],
    workers: 3892,
    radius: 22,
    topSector: 'Diamond & Textiles',
    rank: 2,
  },
  {
    city: 'Vadodara',
    coords: [22.3072, 73.1812] as [number, number],
    workers: 2104,
    radius: 18,
    topSector: 'Manufacturing',
    rank: 3,
  },
  {
    city: 'Rajkot',
    coords: [22.3039, 70.8022] as [number, number],
    workers: 1201,
    radius: 14,
    topSector: 'Construction',
    rank: 4,
  },
  {
    city: 'Gandhinagar',
    coords: [23.2156, 72.6369] as [number, number],
    workers: 891,
    radius: 12,
    topSector: 'Services & Infrastructure',
    rank: 5,
  },
]

const SECTOR_BADGE: Record<string, string> = {
  Construction: 'bg-blue-100 text-blue-800',
  Textiles: 'bg-purple-100 text-purple-800',
  Diamond: 'bg-amber-100 text-amber-800',
  Manufacturing: 'bg-emerald-100 text-emerald-800',
  'Diamond & Textiles': 'bg-amber-100 text-amber-800',
  'Services & Infrastructure': 'bg-slate-100 text-slate-700',
}

export default function WorkerMap() {
  const { t } = useTranslation()
  const [district, setDistrict] = useState('All Districts')
  const [sector, setSector] = useState('All')
  const [appliedDistrict, setAppliedDistrict] = useState('All Districts')
  const [appliedSector, setAppliedSector] = useState('All')
  const [viewMode, setViewMode] = useState<'districts' | 'companies'>('companies')
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null)
  const [searchCompany, setSearchCompany] = useState('')

  const handleApplyFilter = () => {
    setAppliedDistrict(district)
    setAppliedSector(sector)
  }

  const filteredLocations = WORKER_LOCATIONS.filter((loc) => {
    const matchDistrict = appliedDistrict === 'All Districts' || loc.city === appliedDistrict
    const matchSector = appliedSector === 'All' || loc.topSector.includes(appliedSector)
    return matchDistrict && matchSector
  })

  const filteredCompanies = REGISTERED_COMPANIES.filter((comp) => {
    const matchDistrict = appliedDistrict === 'All Districts' || comp.district === appliedDistrict
    const matchSector = appliedSector === 'All' || comp.sector === appliedSector
    const matchSearch = !searchCompany || comp.name.toLowerCase().includes(searchCompany.toLowerCase()) || comp.code.toLowerCase().includes(searchCompany.toLowerCase())
    return matchDistrict && matchSector && matchSearch
  })

  const totalCompanyWorkers = REGISTERED_COMPANIES.reduce((sum, c) => sum + c.registeredEmployees, 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
            <span className="w-4 h-[2px] bg-[#FF6B53]" />
            EMPLOYER &amp; WORKFORCE GEOGRAPHIC MAP
          </div>
          <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight flex items-center gap-2">
            <Map className="h-7 w-7 text-[#0C2D27]" />
            Company &amp; District Workforce Map
          </h1>
          <p className="text-xs sm:text-sm text-[#52605D] mt-0.5">
            Real-time registered migrant employee data mapped across employer companies &amp; industrial hubs in Gujarat.
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* ── View Mode Switcher & Filter Control Bar ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100">
            <button
              onClick={() => setViewMode('companies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'companies'
                  ? 'bg-[#0C2D27] text-white shadow-xs'
                  : 'text-[#52605D] hover:text-[#0C2D27]'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Registered Companies View ({REGISTERED_COMPANIES.length})</span>
            </button>
            <button
              onClick={() => setViewMode('districts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'districts'
                  ? 'bg-[#0C2D27] text-white shadow-xs'
                  : 'text-[#52605D] hover:text-[#0C2D27]'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>District Hubs View</span>
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              placeholder="Search company name..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-[#0C2D27] focus:outline-none focus:border-[#FF6B53]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-bold text-[#0C2D27]">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0C2D27] bg-white focus:outline-none focus:border-[#FF6B53]"
            >
              {GUJARAT_DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-bold text-[#0C2D27]">Industry Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0C2D27] bg-white focus:outline-none focus:border-[#FF6B53]"
            >
              {SECTORS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleApplyFilter}
            className="figma-btn-coral py-2 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Map + Company Breakdown Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaflet Map */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-3 shadow-2xs flex flex-col">
          <div className="w-full h-[400px] sm:h-[520px] rounded-2xl overflow-hidden relative">
            <MapContainer
              center={[22.2587, 71.1924]}
              zoom={7}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render Company Markers or District Circle Markers based on viewMode */}
              {viewMode === 'companies'
                ? filteredCompanies.map((comp) => (
                    <CircleMarker
                      key={comp.id}
                      center={comp.coords}
                      radius={16 + Math.round(comp.registeredEmployees / 150)}
                      pathOptions={{
                        color: '#0C2D27',
                        fillColor: '#FF6B53',
                        fillOpacity: 0.85,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="p-2 space-y-1.5 min-w-[200px]">
                          <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
                            {comp.code} · {comp.sector}
                          </span>
                          <b className="text-sm font-bold text-[#0C2D27] block leading-tight">
                            {comp.name}
                          </b>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-semibold">Registered Employees:</span>
                            <b className="text-[#0C2D27] font-extrabold">{comp.registeredEmployees.toLocaleString()}</b>
                          </div>
                          <p className="text-[11px] text-slate-500">{comp.address}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              ✓ {comp.complianceScore}% Compliant
                            </span>
                            <button
                              onClick={() => setSelectedCompany(comp)}
                              className="text-[11px] font-bold text-[#FF6B53] hover:underline"
                            >
                              Details →
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))
                : filteredLocations.map((loc) => (
                    <CircleMarker
                      key={loc.city}
                      center={loc.coords}
                      radius={loc.radius}
                      pathOptions={{
                        color: '#0C2D27',
                        fillColor: '#C0E862',
                        fillOpacity: 0.75,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="text-xs p-1 space-y-1">
                          <b className="font-extrabold text-[#0C2D27] block">{loc.city} District Hub</b>
                          <p className="text-[#0C2D27] font-bold">
                            {loc.workers.toLocaleString()} registered migrant workers
                          </p>
                          <p className="text-slate-500 text-[11px]">Top sector: {loc.topSector}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
            </MapContainer>
          </div>

          {/* Map Guide Legend */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl mt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#0C2D27] font-bold">
              <Info className="h-4 w-4 text-[#FF6B53]" />
              <span>{viewMode === 'companies' ? 'Company markers scale by registered employee size' : 'District markers scale by total worker volume'}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#FF6B53]" /> Employer Site
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#C0E862]" /> District Hub
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Registered Companies Employee Leaderboard */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-[#0C2D27] text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#FF6B53]" />
                Company Employee Roster Data
              </h2>
              <span className="text-[10px] font-bold text-[#52605D] bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredCompanies.length} Companies
              </span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {filteredCompanies.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompany(comp)}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#0C2D27] transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <b className="text-xs font-bold text-[#0C2D27] group-hover:text-[#FF6B53] transition-colors block">
                        {comp.name}
                      </b>
                      <span className="text-[10px] text-[#52605D] block">
                        {comp.district} · {comp.sector}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <b className="text-xs font-black text-[#0C2D27] block">
                        {comp.registeredEmployees.toLocaleString()}
                      </b>
                      <span className="text-[9px] text-[#52605D] block">employees</span>
                    </div>
                  </div>

                  {/* Progress Bar for company relative workforce size */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#0C2D27] rounded-full"
                        style={{ width: `${Math.min(100, (comp.registeredEmployees / 1500) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                      <span>Compliance: {comp.complianceScore}%</span>
                      <span>Rating: {comp.safetyRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 bg-[#F6F7F2] p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6B53] block">GOVERNMENT REPOSITORY DATA</span>
            <b className="text-xl font-extrabold text-[#0C2D27] block">
              {totalCompanyWorkers.toLocaleString()} Registered Employees
            </b>
            <span className="text-xs text-[#52605D] block">Monitored across Gujarat industrial enterprises</span>
          </div>
        </div>

      </div>

      {/* ── Company Detail Modal ── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF6B53] uppercase block">
                  {selectedCompany.code} · REGISTERED EMPLOYER
                </span>
                <h3 className="text-lg font-bold text-[#0C2D27] leading-snug">
                  {selectedCompany.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-full text-slate-400 hover:text-[#0C2D27] hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#F6F7F2] border border-slate-200">
                  <span className="text-[10px] text-[#52605D] block font-semibold">Registered Employees</span>
                  <b className="text-lg font-extrabold text-[#0C2D27]">{selectedCompany.registeredEmployees.toLocaleString()}</b>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 block font-semibold">Wage Compliance</span>
                  <b className="text-lg font-extrabold text-emerald-950">{selectedCompany.complianceScore}% Passed</b>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Industry Sector:</span>
                  <b className="text-[#0C2D27]">{selectedCompany.sector}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">District Location:</span>
                  <b className="text-[#0C2D27]">{selectedCompany.district}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Safety &amp; Labour Audit:</span>
                  <b className="text-emerald-700">{selectedCompany.safetyRating}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Contact Person:</span>
                  <b className="text-[#0C2D27]">{selectedCompany.contactPerson}</b>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">Physical Site Address:</span>
                  <span className="text-[#0C2D27] font-medium block">{selectedCompany.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCompany(null)}
                className="figma-btn-coral py-2.5 px-6 text-xs font-bold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
