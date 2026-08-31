import { useState, useEffect } from 'react'
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
  Bell,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LanguageSelector from '@/components/LanguageSelector'

const PROFILE_PCT = 100

export default function WorkerDashboard() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Single Notification State
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const hasNotified = sessionStorage.getItem('has_shown_login_notification')
    if (!hasNotified) {
      setShowNotification(true)
      sessionStorage.setItem('has_shown_login_notification', 'true')
    }
  }, [])

  const [workerDetails, setWorkerDetails] = useState({
    name: user?.email ? user.email.split('@')[0] : 'Registered Worker',
    occupation: 'Mason (Construction)',
    location: 'Ahmedabad, Gujarat',
    skills: ['Masonry Work', 'Safety & First Aid'],
  })

  useEffect(() => {
    try {
      const customStr = localStorage.getItem('saathi-custom-worker')
      if (customStr) {
        const c = JSON.parse(customStr)
        setWorkerDetails({
          name: c.full_name || 'Registered Worker',
          occupation: c.occupation || 'Mason (Construction)',
          location: `${c.current_district || 'Ahmedabad'}, Gujarat`,
          skills: Array.isArray(c.skills) && c.skills.length > 0 ? c.skills : ['Masonry Work', 'Safety & First Aid'],
        })
      }
    } catch {
      // Fallback
    }
  }, [])

  const ACTION_CARDS = [
    {
      icon: Wrench,
      title: t('nav_skills'),
      desc: t('skills_subtitle'),
      to: '/worker/skills',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: null,
    },
    {
      icon: Heart,
      title: t('nav_welfare'),
      desc: t('welfare_subtitle'),
      to: '/worker/welfare',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
      badge: t('kpi_welfare_matches'),
      badgeColor: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    },
    {
      icon: DollarSign,
      title: t('nav_wages'),
      desc: t('wage_subtitle'),
      to: '/worker/wages',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-900',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badge: null,
    },
    {
      icon: AlertTriangle,
      title: t('nav_report'),
      desc: t('safety_subtitle'),
      to: '/worker/report',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-200 dark:border-red-900',
      iconColor: 'text-red-600 dark:text-red-400',
      badge: null,
    },
    {
      icon: ClipboardList,
      title: t('nav_grievances'),
      desc: t('grievances_subtitle'),
      to: '/worker/grievances',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: null,
    },
    {
      icon: Bot,
      title: t('nav_ai'),
      desc: t('ai_subtitle'),
      to: '/worker/ai',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-900',
      iconColor: 'text-teal-600 dark:text-teal-400',
      badge: 'Saathi AI Engine',
      badgeColor: 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
    },
  ]

  const RECENT_ACTIVITY = [
    {
      id: 1,
      text: 'Welfare check completed — 3 potential matches found',
      time: '2 hours ago',
      dotColor: 'text-teal-500',
    },
    {
      id: 2,
      text: 'Skills profile verified & stored on Gujarat Portal',
      time: 'Just now',
      dotColor: 'text-emerald-500',
    },
    {
      id: 3,
      text: 'Wage check: Reference rate verified for Gujarat corridor',
      time: '1 day ago',
      dotColor: 'text-teal-600',
    },
  ]

  return (
    <div className="space-y-4 px-2 sm:px-4 py-3 sm:py-5 pb-6">
      
      {/* ── Single Login Notification Banner ── */}
      {showNotification && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-900/20 border border-teal-500 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Welcome Back to Migrant Saathi!</p>
              <p className="text-[11px] sm:text-xs text-teal-100">
                Logged in successfully. Your Gujarat Labour portal session is active and secure.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors shrink-0"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Greeting & Profile Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {t('worker_greeting')}, {workerDetails.name} 👋
            </h1>
            <p className="mt-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
              {workerDetails.occupation} · {workerDetails.location}
            </p>
          </div>
          <Link
            to="/worker/profile"
            className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900 transition-all"
          >
            {t('edit_profile')}
          </Link>
        </div>

        {/* Registered Skills Badges */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            🛠️ {t('registered_skills')}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {workerDetails.skills.map((sk) => (
              <span
                key={sk}
                className="text-xs font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-xl"
              >
                ✓ {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Profile completion */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t('profile_verification')}: {PROFILE_PCT}% Complete
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className="h-full rounded-full bg-teal-600 dark:bg-teal-500 transition-all"
              style={{ width: `${PROFILE_PCT}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Language selection bar ── */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs transition-colors">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('select_language')}:</span>
        <LanguageSelector />
      </div>

      {/* ── 6 Action Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACTION_CARDS.map(({ icon: Icon, title, desc, to, bg, border, iconColor, badge, badgeColor }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`flex flex-col items-start rounded-xl border ${border} ${bg} p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
          >
            <Icon className={`mb-3 h-7 w-7 ${iconColor}`} />
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">{desc}</p>
            {badge && (
              <span className={`mt-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors">
        <h2 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">{t('recent_activity')}</h2>
        <ul className="space-y-3">
          {RECENT_ACTIVITY.map(({ id, text, time, dotColor }) => (
            <li key={id} className="flex items-start gap-3">
              <Circle className={`mt-1 h-2.5 w-2.5 shrink-0 fill-current ${dotColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-snug">{text}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{time}</p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
