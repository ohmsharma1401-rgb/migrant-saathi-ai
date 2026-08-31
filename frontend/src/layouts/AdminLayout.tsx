import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Users,
  FileText,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Building2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import LanguageSelector from '@/components/LanguageSelector'

export default function AdminLayout() {
  const { user, clearAuth, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/select-role')
  }

  const navItems = [
    { to: '/admin', label: 'User Management', icon: Users, end: true },
    { to: '/admin/schemes', label: 'Scheme Management', icon: FileText },
    { to: '/admin/wages', label: 'Reference Wages', icon: DollarSign },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 z-40 flex h-screen flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2 truncate">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                Admin Console
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 transition-colors">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuth(
                  { id: 'demo-official-id', role: 'official', email: 'official@gujarat.gov.in' },
                  'demo-access-token',
                  'demo-refresh-token'
                )
                navigate('/gov')
              }}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 px-3 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 transition-all shadow-2xs"
            >
              <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Government Portal
            </button>

            <LanguageSelector />

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs">
              <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-extrabold shrink-0">
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                {user?.email?.split('@')[0] ?? 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
