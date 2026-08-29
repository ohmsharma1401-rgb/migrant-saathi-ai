import { useState } from 'react'
import { Users, Search, Eye, Download } from 'lucide-react'

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
  { id: 'W-0001', name: 'Ramesh Kumar',   occupation: 'Mason',              sector: 'Construction', location: 'Ahmedabad', originState: 'Bihar',     skills: ['Mason', 'Carpentry'],        registered: '15 Jan 2024' },
  { id: 'W-0002', name: 'Suresh Yadav',   occupation: 'Weaver',             sector: 'Textiles',     location: 'Surat',     originState: 'UP',        skills: ['Weaving'],                   registered: '20 Jan 2024' },
  { id: 'W-0003', name: 'Arjun Singh',    occupation: 'Diamond Polisher',   sector: 'Diamond',      location: 'Surat',     originState: 'Rajasthan', skills: ['Polishing', 'Sorting'],      registered: '22 Jan 2024' },
  { id: 'W-0004', name: 'Mohammad Khan',  occupation: 'Electrician',        sector: 'Construction', location: 'Vadodara',  originState: 'MP',        skills: ['Electrical'],                registered: '28 Jan 2024' },
  { id: 'W-0005', name: 'Ravi Patel',     occupation: 'Machine Operator',   sector: 'Manufacturing',location: 'Rajkot',    originState: 'Gujarat',   skills: ['Machine Op.'],               registered: '5 Feb 2024'  },
  { id: 'W-0006', name: 'Santosh Kumar',  occupation: 'Plumber',            sector: 'Construction', location: 'Ahmedabad', originState: 'Bihar',     skills: ['Plumbing'],                  registered: '10 Feb 2024' },
  { id: 'W-0007', name: 'Pradeep Mishra', occupation: 'Carpenter',          sector: 'Construction', location: 'Surat',     originState: 'UP',        skills: ['Carpentry', 'Plastering'],   registered: '14 Feb 2024' },
  { id: 'W-0008', name: 'Anita Devi',     occupation: 'Embroidery Worker',  sector: 'Textiles',     location: 'Surat',     originState: 'Rajasthan', skills: ['Embroidery', 'Tailoring'],   registered: '18 Feb 2024' },
]

const DISTRICT_OPTIONS = ['All Districts', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar']
const SECTOR_OPTIONS   = ['All Sectors', 'Construction', 'Textiles', 'Diamond', 'Manufacturing']

const SECTOR_BADGE: Record<string, string> = {
  Construction: 'bg-blue-100 text-blue-800',
  Textiles:     'bg-purple-100 text-purple-800',
  Diamond:      'bg-amber-100 text-amber-800',
  Manufacturing:'bg-green-100 text-green-800',
}
// ─────────────────────────────────────────────────────────────────────────────

export default function WorkerDirectory() {
  const [search, setSearch]       = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [district, setDistrict]   = useState('All Districts')
  const [appliedDistrict, setAppliedDistrict] = useState('All Districts')
  const [sector, setSector]       = useState('All Sectors')
  const [appliedSector, setAppliedSector]     = useState('All Sectors')
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [currentPage]             = useState(1)

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
          skills: [c.occupation || 'Mason', 'Certified'],
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
  }

  const filtered = allWorkers.filter((w) => {
    const q = (appliedSearch || search).toLowerCase()
    const matchSearch =
      !q ||
      w.name.toLowerCase().includes(q) ||
      w.occupation.toLowerCase().includes(q) ||
      w.location.toLowerCase().includes(q) ||
      w.originState.toLowerCase().includes(q)
    const matchDistrict = appliedDistrict === 'All Districts' || w.location === appliedDistrict
    const matchSector   = appliedSector   === 'All Sectors'  || w.sector   === appliedSector
    return matchSearch && matchDistrict && matchSector
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Worker Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Search and browse registered migrant workers in Gujarat</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors">
          <Download className="h-4 w-4 text-gray-500" />
          Export CSV
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px] flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skill, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {DISTRICT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {SECTOR_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <button
            onClick={handleApplyFilter}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Apply Filters & Search
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{' '}
          <span className="font-semibold text-gray-700">12,847</span> workers
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Occupation</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Origin State</th>
                <th className="px-4 py-3 font-semibold">Skills</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((w, idx) => (
                <tr
                  key={w.id}
                  className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {w.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{w.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{w.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{w.occupation}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SECTOR_BADGE[w.sector] ?? 'bg-gray-100 text-gray-700'}`}>
                      {w.sector}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{w.location}</td>
                  <td className="px-4 py-3 text-gray-700">{w.originState}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {w.skills.map((sk) => (
                        <span key={sk} className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{w.registered}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedWorker(w)}
                      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">Page {currentPage} of 1,285</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition-colors">
              ← Previous
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  p === currentPage
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-600 hover:bg-white'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="px-2 text-xs text-gray-400">...</span>
            <button className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
