import { useState } from 'react'
import { Map, Info } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── DEMO DATA ──────────────────────────────────────────────────────────────
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
    radius: 25,
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
    topSector: 'Government / Services',
    rank: 5,
  },
]

const SECTOR_BADGE: Record<string, string> = {
  Construction: 'bg-blue-100 text-blue-800',
  Textiles: 'bg-purple-100 text-purple-800',
  Diamond: 'bg-amber-100 text-amber-800',
  Manufacturing: 'bg-green-100 text-green-800',
  'Diamond & Textiles': 'bg-amber-100 text-amber-800',
  'Government / Services': 'bg-gray-100 text-gray-700',
}
// ─────────────────────────────────────────────────────────────────────────────

export default function WorkerMap() {
  const [district, setDistrict] = useState('All Districts')
  const [sector, setSector] = useState('All')

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Map className="h-6 w-6 text-indigo-600" />
          Worker Distribution Map
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Geographic distribution of registered migrant workers across Gujarat
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {GUJARAT_DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Apply Filters
        </button>
      </div>

      {/* Map + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div style={{ minHeight: 500, height: 500 }}>
            <MapContainer
              center={[22.2587, 71.1924]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {WORKER_LOCATIONS.map((loc) => (
                <CircleMarker
                  key={loc.city}
                  center={loc.coords}
                  radius={loc.radius}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">{loc.city}</p>
                      <p className="text-gray-600 mt-1">
                        <span className="font-semibold">{loc.workers.toLocaleString()}</span> registered workers
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Top sector: {loc.topSector}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          {/* Legend below map */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Circle size guide:</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 border border-blue-600 opacity-60" />
                Small = &lt; 1,000 workers
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-400 border border-blue-600 opacity-60" />
                Medium = 1,000–2,000 workers
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-400 border border-blue-600 opacity-60" />
                Large = &gt; 2,000 workers
              </div>
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              ⚠ DEMO DATA — positions are approximate district centers
            </p>
          </div>
        </div>

        {/* Side Panel — 1/3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm">Top Districts by Workers</h2>
          <div className="space-y-3">
            {WORKER_LOCATIONS.map((loc) => (
              <div
                key={loc.city}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {loc.rank}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{loc.city}</p>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        SECTOR_BADGE[loc.topSector] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {loc.topSector}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{loc.workers.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">workers</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-2">Total Registered</p>
            <p className="text-2xl font-bold text-indigo-700">
              {WORKER_LOCATIONS.reduce((s, l) => s + l.workers, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">across Gujarat (DEMO)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
