import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Heart,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import api from '@/services/api'
import { useTranslation } from '@/utils/translations'
import AnomalyRiskPanel from '@/components/ui/AnomalyRiskPanel'

const SECTOR_DATA = [
  { name: 'Construction', value: 5234 },
  { name: 'Textiles', value: 3891 },
  { name: 'Diamond', value: 2104 },
  { name: 'Manufacturing', value: 1045 },
  { name: 'Others', value: 573 },
]

const GRIEVANCE_DATA = [
  { name: 'Wage', count: 145 },
  { name: 'Safety', count: 89 },
  { name: 'Conditions', count: 56 },
  { name: 'Harassment', count: 34 },
  { name: 'Other', count: 23 },
]

const DISTRICT_DATA = [
  { name: 'Ahmedabad', count: 4231 },
  { name: 'Surat', count: 3892 },
  { name: 'Vadodara', count: 2104 },
  { name: 'Rajkot', count: 1201 },
  { name: 'Gandhinagar', count: 891 },
  { name: 'Other', count: 528 },
]

const RECENT_GRIEVANCES = [
  { id: 'GRV-2024-089', category: 'Safety', location: 'Ahmedabad', priority: 'High', status: 'Open', time: '2h ago' },
  { id: 'GRV-2024-088', category: 'Wage', location: 'Surat', priority: 'High', status: 'Under Review', time: '5h ago' },
  { id: 'GRV-2024-087', category: 'Safety', location: 'Vadodara', priority: 'Critical', status: 'Open', time: '8h ago' },
  { id: 'GRV-2024-086', category: 'Harassment', location: 'Ahmedabad', priority: 'High', status: 'Open', time: '1d ago' },
]

const SECTOR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280']

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function GovDashboard() {
  const { t } = useTranslation()
  const greeting = useMemo(() => getGreeting(), [])
  const dateStr = useMemo(() => formatDate(), [])

  const [loading, setLoading] = useState(false)
  const [liveOverview, setLiveOverview] = useState<any>({})

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const ovRes = await api.get('/dashboard/overview')
      if (ovRes.data) setLiveOverview(ovRes.data)
    } catch {
      // Demo fallbacks active
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="saathi-badge-teal text-[11px] font-bold uppercase tracking-wider">
              🏛️ Gujarat Labour &amp; Employment Department · Portal Operations Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {greeting}, {t('gov_greeting')} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl px-3.5 py-2 transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('gov_refresh')}
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('gov_live_connected')}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-teal-600 p-5 flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-medium">Registered Workers</span>
          <b className="text-2xl font-bold text-gray-900">{liveOverview.total_workers ? liveOverview.total_workers.toLocaleString() : "12,847"}</b>
          <span className="text-xs font-bold text-emerald-700">↑ +234 this month</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-600 p-5 flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-medium">Welfare Matches</span>
          <b className="text-2xl font-bold text-gray-900">{liveOverview.total_welfare_matches ? liveOverview.total_welfare_matches.toLocaleString() : "8,412"}</b>
          <span className="text-xs font-bold text-purple-700">65.5% coverage</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-600 p-5 flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-medium">Wage Discrepancies</span>
          <b className="text-2xl font-bold text-gray-900">{liveOverview.total_wage_alerts ? liveOverview.total_wage_alerts.toLocaleString() : "1,203"}</b>
          <span className="text-xs font-bold text-amber-700">↑ +89 this week</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 p-5 flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-medium">Open Grievances</span>
          <b className="text-2xl font-bold text-gray-900">{liveOverview.total_grievances ? liveOverview.total_grievances.toLocaleString() : "347"}</b>
          <span className="text-xs font-bold text-red-700">42 high priority</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-700 p-5 flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-medium">High Priority</span>
          <b className="text-2xl font-bold text-gray-900">{liveOverview.high_priority_cases ? liveOverview.high_priority_cases.toLocaleString() : "42"}</b>
          <span className="text-xs font-bold text-red-800">Requires review</span>
        </div>
      </div>

      {/* Feature 3 & 4: Anomaly Detection & Predictive Risk Scoring Panel */}
      <AnomalyRiskPanel />

      {/* Sector Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Workers by Sector</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={SECTOR_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {SECTOR_DATA.map((_, index) => (
                  <Cell key={index} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Grievances by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={GRIEVANCE_DATA}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0C2D27" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
