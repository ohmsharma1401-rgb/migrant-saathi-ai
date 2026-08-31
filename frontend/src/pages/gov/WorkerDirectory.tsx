import { useState } from 'react'
import { Users, Search, Eye, Download, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

// ─── DEMO DATA ──────────────────────────────────────────────────────────────
interface Worker {
  id: string
  name: string
  occupation: string
  sector: string
  location: string
  originState: string
  skills: string[]
  registered: string
}

const DEMO_WORKERS: Worker[] = [
  { id: 'W-0001', name: 'Ramesh Kumar',   occupation: 'Mason',              sector: 'Construction', location: 'Ahmedabad', originState: 'Bihar',     skills: ['Masonry', 'Carpentry'],        registered: '15 Jan 2024' },
  { id: 'W-0002', name: 'Suresh Yadav',   occupation: 'Weaver',             sector: 'Textiles',     location: 'Surat',     originState: 'Uttar Pradesh', skills: ['Textile Weaving'],            registered: '20 Jan 2024' },
  { id: 'W-0003', name: 'Arjun Singh',    occupation: 'Diamond Polisher',   sector: 'Diamond',      location: 'Surat',     originState: 'Rajasthan', skills: ['Polishing', 'Sorting'],      registered: '22 Jan 2024' },
  { id: 'W-0004', name: 'Mohammad Khan',  occupation: 'Electrician',        sector: 'Construction', location: 'Vadodara',  originState: 'Madhya Pradesh', skills: ['Electrical Wiring'],         registered: '28 Jan 2024' },
  { id: 'W-0005', name: 'Ravi Patel',     occupation: 'Machine Operator',   sector: 'Manufacturing',location: 'Rajkot',    originState: 'Gujarat',   skills: ['CNC Machine Op.'],           registered: '5 Feb 2024'  },
  { id: 'W-0006', name: 'Santosh Kumar',  occupation: 'Plumber',            sector: 'Construction', location: 'Ahmedabad', originState: 'Bihar',     skills: ['Plumbing & Sanitation'],     registered: '10 Feb 2024' },
  { id: 'W-0007', name: 'Pradeep Mishra', occupation: 'Carpenter',          sector: 'Construction', location: 'Surat',     originState: 'Uttar Pradesh', skills: ['Carpentry & Shuttering'],  registered: '14 Feb 2024' },
  { id: 'W-0008', name: 'Anita Devi',     occupation: 'Embroidery Worker',  sector: 'Textiles',     location: 'Surat',     originState: 'Rajasthan', skills: ['Embroidery', 'Tailoring'],   registered: '18 Feb 2024' },
  { id: 'W-0009', name: 'Vikram Sahni',   occupation: 'Welder',             sector: 'Manufacturing',location: 'Vadodara',  originState: 'Jharkhand', skills: ['Arc & TIG Welding'],       registered: '24 Feb 2024' },
  { id: 'W-0010', name: 'Sunil Paswan',   occupation: 'Mason',              sector: 'Construction', location: 'Ahmedabad', originState: 'Bihar',     skills: ['Masonry Work'],              registered: '01 Mar 2024' },
  { id: 'W-0011', name: 'Dinesh Mahato',  occupation: 'Crane Operator',     sector: 'Construction', location: 'Rajkot',    originState: 'Odisha',    skills: ['Heavy Equipment'],           registered: '10 Mar 2024' },
  { id: 'W-0012', name: 'Gopal Verma',    occupation: 'Textile Spinner',    sector: 'Textiles',     location: 'Surat',     originState: 'West Bengal', skills: ['Textile Spinning'],         registered: '18 Mar 2024' },
]

const DISTRICT_OPTIONS = ['All Districts', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar']
const SECTOR_OPTIONS   = ['All Sectors', 'Construction', 'Textiles', 'Diamond', 'Manufacturing']

const SECTOR_BADGE: Record<string, string> = {
  Construction: 'bg-blue-100 text-blue-800',
  Textiles:     'bg-purple-100 text-purple-800',
  Diamond:      'bg-amber-100 text-amber-800',
  Manufacturing:'bg-teal-100 text-teal-800',
}

export default function WorkerDirectory() {
  const [search, setSearch]                   = useState('')
  const [appliedSearch, setAppliedSearch]     = useState('')
  const [district, setDistrict]               = useState('All Districts')
  const [appliedDistrict, setAppliedDistrict] = useState('All Districts')
  const [sector, setSector]                   = useState('All Sectors')
  const [appliedSector, setAppliedSector]     = useState('All Sectors')
  const [selectedWorker, setSelectedWorker]   = useState<Worker | null>(null)
  
  // Dynamic Pagination State
  const [currentPage, setCurrentPage]         = useState(1)
  const itemsPerPage = 5

  // Read newly registered worker from localStorage
  const getWorkersList = (): Worker[] => {
    try {
      const customStr = localStorage.getItem('saathi-custom-worker')
      if (customStr) {
        const c = JSON.parse(customStr)
        const customWorker: Worker = {
          id: c.id || 'W-9999',
          name: c.full_name || 'Registered Worker',
          occupation: c.occupation || 'Mason',
          sector: c.sector || 'Construction',
          location: c.current_district || 'Ahmedabad',
          originState: c.origin_state || 'Bihar',
          skills: Array.isArray(c.skills) ? c.skills : [c.occupation || 'Mason'],
          registered: 'Just Now (Live)',
        }
        return [customWorker, ...DEMO_WORKERS]
      }
    } catch {
      // Fallback
    }
    return DEMO_WORKERS
  }

  const allWorkers = getWorkersList()

  const handleApplyFilter = () => {
    setAppliedSearch(search)
    setAppliedDistrict(district)
    setAppliedSector(sector)
    setCurrentPage(1) // Reset to page 1 on filter
  }

  const handleResetFilters = () => {
    setSearch('')
    setAppliedSearch('')
    setDistrict('All Districts')
    setAppliedDistrict('All Districts')
    setSector('All Sectors')
    setAppliedSector('All Sectors')
    setCurrentPage(1)
  }

  const filtered = allWorkers.filter((w) => {
    const q = (appliedSearch || search).toLowerCase().trim()
    const matchSearch =
      !q ||
      w.name.toLowerCase().includes(q) ||
      w.occupation.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q) ||
      w.originState.toLowerCase().includes(q) ||
      w.skills.some((s) => s.toLowerCase().includes(q))

    const matchDistrict = appliedDistrict === 'All Districts' || w.location === appliedDistrict
    const matchSector   = appliedSector   === 'All Sectors'  || w.sector   === appliedSector
    return matchSearch && matchDistrict && matchSector
  })

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const paginatedWorkers = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Occupation', 'Sector', 'Location', 'Origin State', 'Skills', 'Registered']
    const rows = filtered.map((w) => [
      w.id,
      `"${w.name}"`,
      `"${w.occupation}"`,
      `"${w.sector}"`,
      `"${w.location}"`,
      `"${w.originState}"`,
      `"${w.skills.join(', ')}"`,
      `"${w.registered}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `migrant_workers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              <Users className="h-6 w-6" />
            </div>
            Worker Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and manage registered migrant workers across Gujarat corridors.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
        >
          <Download className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          Export Directory (CSV)
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 sm:p-5 transition-colors">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px] flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Search Query</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, skill, occupation, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter() }}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">Work District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {DISTRICT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {SECTOR_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <button
            onClick={handleApplyFilter}
            className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs"
          >
            Apply Filters &amp; Search
          </button>

          {(appliedSearch || appliedDistrict !== 'All Districts' || appliedSector !== 'All Sectors') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800 font-bold">{filtered.length}</strong> matched workers (Page {safeCurrentPage} of {totalPages})
          </span>
          <span className="text-[11px] text-teal-700 font-medium">
            ⚡ Live Database Synchronization Active
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-600 border-b border-slate-200 bg-slate-100/60">
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Occupation</th>
                <th className="px-4 py-3.5">Sector</th>
                <th className="px-4 py-3.5">Work Location</th>
                <th className="px-4 py-3.5">Origin State</th>
                <th className="px-4 py-3.5">Skills</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedWorkers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-base font-bold text-slate-800">No workers matched your criteria</p>
                      <p className="text-xs text-slate-400">Try adjusting your search query, sector, or district filters.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-teal-100"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedWorkers.map((w, idx) => (
                  <tr
                    key={w.id}
                    className={`hover:bg-teal-50/30 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{w.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{w.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{w.occupation}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${SECTOR_BADGE[w.sector] ?? 'bg-slate-100 text-slate-700'}`}>
                        {w.sector}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{w.location}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{w.originState}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {w.skills.map((sk) => (
                          <span key={sk} className="text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {w.registered.includes('Live') ? (
                        <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                          {w.registered}
                        </span>
                      ) : (
                        w.registered
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedWorker(w)}
                        className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50">
          <p className="text-xs font-medium text-slate-500">
            Page <strong className="text-slate-800">{safeCurrentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  p === safeCurrentPage
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Worker Profile Detail Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  {selectedWorker.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedWorker.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedWorker.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium block">Primary Occupation</span>
                <span className="font-bold text-slate-800">{selectedWorker.occupation}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Sector</span>
                <span className="font-bold text-slate-800">{selectedWorker.sector}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Work Location</span>
                <span className="font-bold text-slate-800">{selectedWorker.location}, Gujarat</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Origin State</span>
                <span className="font-bold text-slate-800">{selectedWorker.originState}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Registered Skills &amp; Certifications</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedWorker.skills.map((sk) => (
                  <span key={sk} className="text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedWorker(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
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
