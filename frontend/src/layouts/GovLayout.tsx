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
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  ShieldCheck,
  Settings,
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
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 flex h-screen flex-col border-r bg-white shadow-sm transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!collapsed && (
            <span className="text-sm font-bold text-primary truncate">{t('app_name')}</span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto rounded-md p-1 hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-6 shadow-sm">
          <button
            className="rounded-md p-1 hover:bg-muted md:hidden"
            onClick={() => setCollapsed((c) => !c)}
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
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
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              🔍 Inspections Panel
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
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 transition-all shadow-2xs"
            >
              <Settings className="h-4 w-4 text-indigo-600" />
              ⚙️ Admin Console
            </button>
            <LanguageSelector />
            <button className="rounded-full p-2 hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {user?.email?.[0]?.toUpperCase() ?? 'G'}
              </span>
              <span className="text-sm font-medium text-foreground">
                {user?.email?.split('@')[0] ?? 'Official'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
