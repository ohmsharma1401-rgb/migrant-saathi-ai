import { useState } from 'react'
import { Map, Info, Filter, Layers } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
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
  Construction: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300',
  Textiles: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300',
  Diamond: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
  Manufacturing: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
  'Diamond & Textiles': 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
  'Services & Infrastructure': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
}

export default function WorkerMap() {
  const { t } = useTranslation()
  const [district, setDistrict] = useState('All Districts')
  const [sector, setSector] = useState('All')
  const [appliedDistrict, setAppliedDistrict] = useState('All Districts')
  const [appliedSector, setAppliedSector] = useState('All')

  const handleApplyFilter = () => {
    setAppliedDistrict(district)
    setAppliedSector(sector)
  }

  const filteredLocations = WORKER_LOCATIONS.filter((loc) => {
    const matchDistrict = appliedDistrict === 'All Districts' || loc.city === appliedDistrict
    const matchSector = appliedSector === 'All' || loc.topSector.includes(appliedSector)
    return matchDistrict && matchSector
  })

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 pb-10">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Map className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            {t('nav_map')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Geographic corridor distribution of registered migrant workers across Gujarat
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-3 items-end transition-colors">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {GUJARAT_DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApplyFilter}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Apply Filters
        </button>
      </div>

      {/* ── Map + Side Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Responsive Map Container (350px on mobile, 500px on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
          <div className="w-full h-[350px] sm:h-[500px] relative z-10">
            <MapContainer
              center={[22.2587, 71.1924]}
              zoom={7}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLocations.map((loc) => (
                <CircleMarker
                  key={loc.city}
                  center={loc.coords}
                  radius={loc.radius}
                  pathOptions={{
                    color: '#0d9488',
                    fillColor: '#14b8a6',
                    fillOpacity: 0.75,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <p className="font-extrabold text-slate-900">{loc.city}</p>
                      <p className="text-teal-700 font-bold mt-0.5">
                        {loc.workers.toLocaleString()} registered workers
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Top sector: {loc.topSector}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          {/* Map Guide Legend */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Circle scale indicator:</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-teal-500 border border-teal-700 opacity-70" />
                Small = &lt; 1,000
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-teal-500 border border-teal-700 opacity-70" />
                Medium = 1,000–2,000
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-teal-500 border border-teal-700 opacity-70" />
                Large = &gt; 2,000
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Top Districts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 p-5 transition-colors flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white mb-4 text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Top Worker Hubs by District
            </h2>
            <div className="space-y-2.5">
              {WORKER_LOCATIONS.map((loc) => (
                <div
                  key={loc.city}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0">
                      #{loc.rank}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{loc.city}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${SECTOR_BADGE[loc.topSector]}`}>
                        {loc.topSector}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{loc.workers.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">workers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Registered Migration Volume</p>
            <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
              {WORKER_LOCATIONS.reduce((s, l) => s + l.workers, 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Active across Gujarat Corridor</p>
          </div>
        </div>

      </div>
    </div>
  )
}
