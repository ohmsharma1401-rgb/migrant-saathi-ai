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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 shadow-xs ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 bg-slate-900 text-white">
          {!collapsed && (
            <div className="flex items-center gap-2 truncate">
              <div className="h-8 w-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-extrabold text-white block tracking-tight truncate">
                  Admin Console
                </span>
                <span className="text-[10px] text-teal-300 font-medium block truncate">
                  Migrant Saathi AI
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
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

        <div className="border-t border-slate-200 p-3 space-y-2 bg-slate-50/50">
          {!collapsed && (
            <div className="px-2 py-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.email || 'System Admin'}
              </p>
              <p className="text-[10px] text-teal-700 font-semibold truncate">
                Super Administrator
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              <Building2 className="h-3.5 w-3.5 text-slate-600" />
              System Administration & Compliance
            </span>
          </div>

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
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-all shadow-2xs"
            >
              <Building2 className="h-3.5 w-3.5 text-teal-700" />
              Government Portal
            </button>

            <LanguageSelector />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
