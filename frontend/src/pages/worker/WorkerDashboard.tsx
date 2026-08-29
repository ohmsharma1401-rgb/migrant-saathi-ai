import { useTranslation } from '@/utils/translations'
import {
  Wrench,
  Heart,
  DollarSign,
  AlertTriangle,
  ClipboardList,
  Bot,
  ChevronRight,
  Circle,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LanguageSelector from '@/components/LanguageSelector'

const PROFILE_PCT = 70

const RECENT_ACTIVITY = [
  {
    id: 1,
    text: 'Welfare check completed — 3 potential matches found',
    time: '2 hours ago',
    dotColor: 'text-blue-500',
  },
  {
    id: 2,
    text: 'Grievance #GRV-2024-001 status: Under Review',
    time: '1 day ago',
    dotColor: 'text-yellow-500',
  },
  {
    id: 3,
    text: 'Wage check: Potential discrepancy detected',
    time: '2 days ago',
    dotColor: 'text-red-500',
  },
]

export default function WorkerDashboard() {
  const { t } = useTranslation()
  useAuthStore()
  const navigate = useNavigate()

  const workerName = 'Ramesh'
  const occupation = 'Mason'
  const location = 'Ahmedabad'

  const ACTION_CARDS = [
    {
      icon: Wrench,
      title: t('nav_skills'),
      desc: 'View and update your technical skills',
      to: '/worker/skills',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      badge: null,
    },
    {
      icon: Heart,
      title: t('nav_welfare'),
      desc: 'Discover government welfare schemes matched for you',
      to: '/worker/welfare',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconColor: 'text-purple-600',
      badge: '3 Potential Matches',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      icon: DollarSign,
      title: t('nav_wages'),
      desc: 'Compare your wages with reference minimum rates',
      to: '/worker/wages',
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-600',
      badge: null,
    },
    {
      icon: AlertTriangle,
      title: t('nav_report'),
      desc: 'Report workplace problems or unsafe conditions',
      to: '/worker/report',
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      badge: null,
    },
    {
      icon: ClipboardList,
      title: t('nav_grievances'),
      desc: 'Track your submitted complaints and their status',
      to: '/worker/grievances',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      badge: null,
    },
    {
      icon: Bot,
      title: t('nav_ai'),
      desc: 'Ask questions in your language. Get instant help.',
      to: '/worker/ai',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      iconColor: 'text-teal-600',
      badge: 'IBM Granite AI',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
  ]

  return (
    <div className="space-y-4 px-4 py-5 pb-6">
      {/* ── Greeting ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {workerName} 👋
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {occupation} · {location}
        </p>

        {/* Profile completion */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">
              Profile: {PROFILE_PCT}% complete
            </span>
            <Link
              to="/worker/profile"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Edit →
            </Link>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${PROFILE_PCT}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Language selection bar ────────────────────────── */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <span className="text-xs font-semibold text-gray-600">{t('select_language')}:</span>
        <LanguageSelector />
      </div>

      {/* ── Incomplete profile banner ─────────────────────── */}
      {PROFILE_PCT < 100 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            ⚠ Complete your profile to discover more welfare schemes.
          </p>
          <Link
            to="/worker/profile"
            className="shrink-0 text-sm font-semibold text-amber-900 hover:underline"
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {/* ── 6 Action cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {ACTION_CARDS.map(({ icon: Icon, title, desc, to, bg, border, iconColor, badge, badgeColor }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`flex flex-col items-start rounded-xl border ${border} ${bg} p-4 text-left transition-opacity active:opacity-75`}
          >
            <Icon className={`mb-3 h-8 w-8 ${iconColor}`} />
            <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
            <p className="mt-1 text-xs text-gray-500 leading-snug">{desc}</p>
            {badge && (
              <span className={`mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Recent Activity ───────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">Recent Activity</h2>
        <ul className="space-y-3">
          {RECENT_ACTIVITY.map(({ id, text, time, dotColor }) => (
            <li key={id} className="flex items-start gap-3">
              <Circle className={`mt-1 h-2.5 w-2.5 shrink-0 fill-current ${dotColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">{text}</p>
                <p className="mt-0.5 text-xs text-gray-400">{time}</p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
