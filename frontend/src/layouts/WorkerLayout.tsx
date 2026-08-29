import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Heart,
  DollarSign,
  MessageSquare,
  User,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/utils/translations'
import LanguageSelector from '@/components/LanguageSelector'

export default function WorkerLayout() {
  const { t } = useTranslation()
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    clearAuth()
    navigate('/select-role')
  }

  const navItems = [
    { to: '/worker', label: t('nav_dashboard'), icon: LayoutDashboard, end: true },
    { to: '/worker/welfare', label: t('nav_welfare'), icon: Heart },
    { to: '/worker/wages', label: t('nav_wages'), icon: DollarSign },
    { to: '/worker/grievances', label: t('nav_grievances'), icon: MessageSquare },
    { to: '/worker/profile', label: t('nav_profile'), icon: User },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm">
        <span className="text-base font-bold text-indigo-700 flex items-center gap-2">
          🛡️ {t('app_title')}
        </span>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('nav_logout')}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 animate-fade-in">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
