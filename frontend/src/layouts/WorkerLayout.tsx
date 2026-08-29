import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Heart,
  DollarSign,
  MessageSquare,
  User,
  Wrench,
  AlertTriangle,
  Bot,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/utils/translations'
import LanguageSelector from '@/components/LanguageSelector'

export default function WorkerLayout() {
  const { t } = useTranslation()
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/select-role')
  }

  const navItems = [
    { to: '/worker', label: t('nav_dashboard'), icon: LayoutDashboard, end: true },
    { to: '/worker/profile', label: t('nav_profile'), icon: User },
    { to: '/worker/skills', label: t('nav_skills'), icon: Wrench },
    { to: '/worker/wages', label: t('nav_wages'), icon: DollarSign },
    { to: '/worker/welfare', label: t('nav_welfare'), icon: Heart },
    { to: '/worker/report', label: t('nav_report'), icon: AlertTriangle },
    { to: '/worker/grievances', label: t('nav_grievances'), icon: MessageSquare },
    { to: '/worker/ai', label: t('nav_ai'), icon: Bot },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* ─── Left Sidebar Navigation ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl md:shadow-none`}
      >
        <div>
          {/* Logo / Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-bold shadow-md shadow-teal-900/40">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  {t('app_title')}
                </span>
                <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase mt-1 block">
                  Worker Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </div>
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-300 border-l-4 border-teal-400 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'W'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {user?.email || 'Registered Worker'}
                </p>
                <p className="text-[10px] text-teal-400 font-medium truncate">Worker Account</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-1 flex-col md:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 hidden sm:block">
              Gujarat Migrant Worker Support Portal
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t('nav_logout')}
            </button>
          </div>
        </header>

        {/* Page View */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
