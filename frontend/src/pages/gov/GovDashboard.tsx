import { useMemo } from 'react'
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

// ─── DEMO DATA ──────────────────────────────────────────────────────────────
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

const AI_INSIGHTS = [
  {
    dot: 'bg-blue-500',
    type: 'OBSERVED',
    typeColor: 'text-blue-700 bg-blue-50',
    text: 'Construction sector workers in Ahmedabad and Surat represent 58% of the registered workforce this month.',
  },
  {
    dot: 'bg-amber-500',
    type: 'POTENTIAL TREND',
    typeColor: 'text-amber-700 bg-amber-50',
    text: 'Wage alerts in the diamond polishing sector (Surat) have increased by 23% compared to the previous month. Review recommended.',
  },
  {
    dot: 'bg-red-500',
    type: 'HIGH PRIORITY',
    typeColor: 'text-red-700 bg-red-50',
    text: '42 grievances are marked as high priority and await inspector assignment. Review recommended.',
  },
  {
    dot: 'bg-green-500',
    type: 'RECOMMENDATION',
    typeColor: 'text-green-700 bg-green-50',
    text: 'An estimated 34% of registered workers may have unclaimed welfare scheme matches. Outreach recommended.',
  },
]

const SECTOR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280']
// ─────────────────────────────────────────────────────────────────────────────

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

interface KpiCardProps {
  label: string
  value: string
  trend: string
  trendColor: string
  icon: React.ReactNode
  borderColor: string
  description?: string
}

function KpiCard({ label, value, trend, trendColor, icon, borderColor, description }: KpiCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor} p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs font-semibold ${trendColor}`}>{trend}</span>
      </div>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  )
}

const priorityBadge: Record<string, string> = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-yellow-100 text-yellow-800',
}

const statusBadge: Record<string, string> = {
  Open: 'bg-red-50 text-red-700 border border-red-200',
  'Under Review': 'bg-blue-50 text-blue-700 border border-blue-200',
  Resolved: 'bg-green-50 text-green-700 border border-green-200',
}

const categoryBadge: Record<string, string> = {
  Safety: 'bg-orange-50 text-orange-700',
  Wage: 'bg-red-50 text-red-700',
  Harassment: 'bg-purple-50 text-purple-700',
  Conditions: 'bg-yellow-50 text-yellow-700',
}

import api from '@/services/api'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/utils/translations'

export default function GovDashboard() {
  const { t } = useTranslation()
  const greeting = useMemo(() => getGreeting(), [])
  const dateStr = useMemo(() => formatDate(), [])

  const [loading, setLoading] = useState(false)
  const [liveOverview, setLiveOverview] = useState<{
    total_workers?: number
    total_welfare_matches?: number
    total_wage_alerts?: number
    total_grievances?: number
    high_priority_cases?: number
  }>({})
  const [liveInsights, setLiveInsights] = useState<Array<{ text: string; insight_type?: string; confidence?: string }>>([])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [ovRes, inRes] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/dashboard/insights'),
      ])
      if (ovRes.data) setLiveOverview(ovRes.data)
      if (inRes.data?.insights) setLiveInsights(inRes.data.insights)
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
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 space-y-6">
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
        <KpiCard
          label={t('gov_reg_workers')}
          value={liveOverview.total_workers ? liveOverview.total_workers.toLocaleString() : "12,847"}
          trend="↑ +234 this month"
          trendColor="text-emerald-700 font-bold"
          icon={<div className="p-2 rounded-xl bg-teal-50 text-teal-700"><Users className="h-4 w-4" /></div>}
          borderColor="border-l-teal-600"
          description="Registered migrant workers"
        />
        <KpiCard
          label={t('gov_welfare_coverage')}
          value={liveOverview.total_welfare_matches ? liveOverview.total_welfare_matches.toLocaleString() : "8,412"}
          trend="65.5% coverage"
          trendColor="text-teal-700 font-bold"
          icon={<div className="p-2 rounded-xl bg-purple-50 text-purple-700"><Heart className="h-4 w-4" /></div>}
          borderColor="border-l-purple-600"
        />
        <KpiCard
          label={t('gov_wage_alerts')}
          value={liveOverview.total_wage_alerts ? liveOverview.total_wage_alerts.toLocaleString() : "1,203"}
          trend="↑ +89 this week"
          trendColor="text-amber-700 font-bold"
          icon={<div className="p-2 rounded-xl bg-amber-50 text-amber-700"><AlertTriangle className="h-4 w-4" /></div>}
          borderColor="border-l-amber-600"
          description="Potential wage discrepancies"
        />
        <KpiCard
          label={t('gov_open_grievances')}
          value={liveOverview.total_grievances ? liveOverview.total_grievances.toLocaleString() : "347"}
          trend="42 high priority"
          trendColor="text-red-700 font-bold"
          icon={<div className="p-2 rounded-xl bg-red-50 text-red-700"><MessageSquare className="h-4 w-4" /></div>}
          borderColor="border-l-red-500"
        />
        <KpiCard
          label={t('gov_high_priority')}
          value={liveOverview.high_priority_cases ? liveOverview.high_priority_cases.toLocaleString() : "42"}
          trend="Needs immediate review"
          trendColor="text-red-800 font-bold"
          icon={<div className="p-2 rounded-xl bg-red-100 text-red-800"><ShieldAlert className="h-4 w-4" /></div>}
          borderColor="border-l-red-700"
        />
      </div>

      {/* Map + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map Placeholder — 60% */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-500" />
              Worker Distribution — Gujarat Districts
            </h2>
            <Link
              to="/gov/map"
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
            >
              View Full Map <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Styled map placeholder */}
          <div className="relative rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-[var(--rule)] h-56 flex items-center justify-center overflow-hidden">
            {/* Simple Gujarat silhouette as decorative SVG */}
            <svg viewBox="0 0 220 180" className="absolute inset-0 w-full h-full opacity-10" aria-hidden="true">
              <path
                d="M40 20 L60 15 L90 10 L120 18 L150 12 L175 25 L185 45 L180 70 L165 90 L170 115 L155 140 L135 160 L110 168 L90 155 L70 145 L55 125 L45 100 L30 80 L25 55 Z"
                fill="#3b82f6"
                stroke="#6366f1"
                strokeWidth="2"
              />
            </svg>
            <span className="text-sm text-gray-400 font-medium z-10">Gujarat State — Interactive Map</span>
          </div>

          {/* District pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {DISTRICT_DATA.map((d) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-100"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                {d.name}
                <span className="font-bold">{d.count.toLocaleString()}</span>
              </span>
            ))}
          </div>
        </div>

        {/* AI Insights — 40% */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border-l-4 border-l-indigo-500 border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              🤖 AI Insights
            </h2>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2.5 py-0.5 font-medium">
              Saathi AI Intelligence
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Auto-generated from labour data</p>

          <div className="space-y-3">
            {liveInsights.length > 0
              ? liveInsights.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 bg-indigo-500" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-indigo-700 bg-indigo-50">
                        {item.insight_type || 'OBSERVED'}
                      </span>
                      <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))
              : AI_INSIGHTS.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dot}`} />
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${item.typeColor}`}>
                        {item.type}
                      </span>
                      <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
          </div>

          <p className="mt-4 text-[10px] text-gray-400 leading-relaxed">
            ⚠ Insights are AI-generated summaries of observed data. Potential trends require official verification before action.
          </p>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Insights
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workers by Sector — Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Workers by Sector</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={SECTOR_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  dataKey="value"
                  strokeWidth={2}
                >
                  {SECTOR_DATA.map((_, index) => (
                    <Cell key={index} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), 'Workers']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {SECTOR_DATA.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SECTOR_COLORS[i] }}
                    />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grievances by Category — Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Grievances by Category</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={GRIEVANCE_DATA} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [value, 'Grievances']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Safety Alerts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            Recent Safety Alerts
          </h2>
          <Link
            to="/gov/grievances"
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
          >
            View All <TrendingUp className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium pr-4">ID</th>
                <th className="pb-3 font-medium pr-4">Category</th>
                <th className="pb-3 font-medium pr-4">Location</th>
                <th className="pb-3 font-medium pr-4">Priority</th>
                <th className="pb-3 font-medium pr-4">Status</th>
                <th className="pb-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_GRIEVANCES.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-700">{g.id}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryBadge[g.category] ?? 'bg-gray-100 text-gray-700'}`}>
                      {g.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    {g.location}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityBadge[g.priority] ?? 'bg-gray-100 text-gray-700'}`}>
                      {g.priority}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[g.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-xs text-gray-400">{g.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
          <Link
            to="/gov/grievances"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Grievances <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
