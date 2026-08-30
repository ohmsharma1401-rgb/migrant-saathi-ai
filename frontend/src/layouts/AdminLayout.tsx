import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Users,
  FileText,
  DollarSign,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

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
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 flex h-screen flex-col border-r bg-white shadow-sm transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">Admin</span>
            </div>
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

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-6 shadow-sm">
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
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-all shadow-2xs"
            >
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              🏛️ Government Portal
            </button>
            <button className="rounded-full p-2 hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
              <span className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </span>
              <span className="text-sm font-medium text-foreground">
                {user?.email?.split('@')[0] ?? 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
