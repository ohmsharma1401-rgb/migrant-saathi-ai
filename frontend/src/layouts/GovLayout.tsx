import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Users,
  Heart,
  DollarSign,
  MessageSquare,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  ShieldCheck,
  Settings,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/utils/translations'
import LanguageSelector from '@/components/LanguageSelector'

export default function GovLayout() {
  const { t } = useTranslation()
  const { user, clearAuth, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/select-role')
  }

  const navItems = [
    { to: '/gov', label: t('nav_dashboard'), icon: LayoutDashboard, end: true },
    { to: '/gov/map', label: t('nav_map'), icon: Map },
    { to: '/gov/workers', label: t('nav_workers'), icon: Users },
    { to: '/gov/welfare', label: t('nav_welfare'), icon: Heart },
    { to: '/gov/wages', label: t('nav_wages'), icon: DollarSign },
    { to: '/gov/grievances', label: 'Inspections & Grievances', icon: MessageSquare },
    { to: '/gov/insights', label: t('nav_insights'), icon: BrainCircuit },
    { to: '/admin', label: 'Admin Console', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 z-40 flex h-screen flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-8 w-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                Gov Enforcement
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 transition-colors">
          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setCollapsed((c) => !c)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuth(
                  { id: 'demo-inspector-id', role: 'inspector', email: 'inspector@gujarat.gov.in' },
                  'demo-access-token',
                  'demo-refresh-token'
                )
                navigate('/gov/grievances')
              }}
              className="hidden lg:flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-all shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Inspections Panel
            </button>

            <button
              onClick={() => {
                setAuth(
                  { id: 'demo-admin-id', role: 'admin', email: 'admin@saathi.ai' },
                  'demo-access-token',
                  'demo-refresh-token'
                )
                navigate('/admin')
              }}
              className="hidden lg:flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 px-3 py-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 transition-all shadow-2xs"
            >
              <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Admin Console
            </button>

            <LanguageSelector />

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs">
              <span className="h-6 w-6 rounded-lg bg-teal-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                {user?.email?.[0]?.toUpperCase() ?? 'G'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                {user?.email?.split('@')[0] ?? 'Official'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
