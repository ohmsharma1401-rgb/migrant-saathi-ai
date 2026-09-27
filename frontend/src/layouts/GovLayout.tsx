import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  BarChart2,
  Gift,
  MessageSquare,
  Users,
  HelpCircle,
  PhoneCall,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Settings,
  Globe,
  ChevronDown,
  Sun,
  Moon,
  MapPin,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  FileText,
  ArrowRightLeft,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import BrandLogo from '@/components/ui/BrandLogo'
import GlobalSearchModal from '@/components/ui/GlobalSearchModal'
import { useTranslation } from '@/utils/translations'

export default function GovLayout() {
  const { user, clearAuth, setAuth } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { t, lang, setLanguage } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/select-role')
  }

  function handleSwitchToInspector() {
    setAuth(
      { id: 'demo-inspector-id', role: 'inspector', email: 'inspector@gujarat.gov.in' },
      'demo-access-token',
      'demo-refresh-token'
    )
    navigate('/inspector')
  }

  const officialName = user?.email ? user.email.split('@')[0] : 'Ananya Rao'
  const initial = officialName.charAt(0).toUpperCase()

  const navItems = [
    { to: '/gov', label: t('nav_gov_overview'), icon: Home, end: true },
    { to: '/gov/map', label: 'Worker Map', icon: MapPin },
    { to: '/gov/analytics', label: t('nav_gov_analytics'), icon: BarChart2 },
    { to: '/gov/wages', label: 'Wage Monitoring', icon: TrendingDown },
    { to: '/gov/welfare', label: t('nav_gov_welfare'), icon: Gift },
    { to: '/gov/grievances', label: t('nav_gov_grievances'), icon: MessageSquare, badge: '8' },
    { to: '/gov/workers', label: t('nav_gov_workers'), icon: Users },
    { to: '/gov/inspectors', label: 'Inspector Management', icon: ShieldCheck, badge: '4' },
    { to: '/gov/reports', label: 'Policy & District Reports', icon: FileText },
    { to: '/gov/insights', label: 'AI Insights', icon: Sparkles },
    { to: '/gov/settings', label: t('nav_gov_settings'), icon: Settings },
    { to: '/gov/help', label: t('nav_gov_help'), icon: HelpCircle },
  ]

  function getPageTitle() {
    if (location.pathname === '/gov') return t('nav_gov_overview')
    if (location.pathname.includes('/map')) return 'Workforce Geographic Map'
    if (location.pathname.includes('/analytics')) return t('nav_gov_analytics')
    if (location.pathname.includes('/wages')) return 'Fair Wage Monitoring & Enforcement'
    if (location.pathname.includes('/welfare')) return t('nav_gov_welfare')
    if (location.pathname.includes('/grievances')) return t('nav_gov_grievances')
    if (location.pathname.includes('/workers')) return t('nav_gov_workers')
    if (location.pathname.includes('/inspectors')) return 'Field Inspector Management & Workload'
    if (location.pathname.includes('/reports')) return 'District Labour & Compliance Reports'
    if (location.pathname.includes('/insights')) return 'AI Risk Scoring & Predictive Insights'
    if (location.pathname.includes('/settings')) return t('nav_gov_settings')
    if (location.pathname.includes('/help')) return 'Inspector Field Help & Assistance'
    return 'Government Official Workspace'
  }

  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const GOV_NOTIFICATIONS = [
    { id: 1, title: 'Urgent Grievance Reported', desc: 'GRV-2026-089: Scaffolding collapse accident in Ahmedabad', time: '15m ago', unread: true },
    { id: 2, title: 'Company Employee Audit', desc: 'Shree Construction Ltd updated workforce roster (1,420 workers)', time: '2h ago', unread: true },
    { id: 3, title: 'Wage Violation Alert', desc: 'Surat District: 3 wage complaints filed under review', time: '5h ago', unread: false },
  ]

  return (
    <div className="flex min-h-screen bg-[#F6F7F2] text-[#0C2D27]">
      {/* ── Desktop Left Sidebar (Deep Forest Green #0C2D27) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0C2D27] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header Logo */}
          <div className="p-5 border-b border-emerald-950 flex items-center justify-between">
            <BrandLogo dark size="md" />
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-emerald-200/70 p-1 hover:bg-emerald-900/50 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Official Profile Card */}
          <div
            onClick={() => navigate('/gov/settings')}
            className="m-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-between cursor-pointer hover:bg-emerald-900/40 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-extrabold flex items-center justify-center text-xs shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <b className="text-xs font-bold text-white block truncate">{officialName}</b>
                <span className="text-[10px] text-emerald-200/70 block truncate">Labour Department</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-emerald-200/60 shrink-0" />
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-900/80 dark:bg-[#1A4237] text-white font-bold border-l-4 border-[#FF6B53]'
                      : 'text-emerald-100/70 dark:text-[#D1EAE3] hover:bg-emerald-950/40 dark:hover:bg-[#183D34] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#FF6B53]' : 'text-emerald-200/60 dark:text-[#A4CCC2]'}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    {badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FF6B53] text-white">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-emerald-950 space-y-2">
          {/* Switch to Inspector Console Button */}
          <button
            onClick={handleSwitchToInspector}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors font-semibold"
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Switch to Inspector Portal</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
          </button>

          <div className="p-3 rounded-2xl bg-emerald-950/60 dark:bg-[#122B24] border border-emerald-900/60 dark:border-[#1E483D] flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-900/80 flex items-center justify-center shrink-0">
              <PhoneCall className="h-4 w-4 text-[#C0E862]" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200/60 dark:text-[#A4CCC2] block">24x7 HELPLINE</span>
              <b className="text-xs font-bold text-white block">1800 11 2211</b>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-emerald-200/60 dark:text-[#A4CCC2] hover:text-white hover:bg-emerald-950/40 dark:hover:bg-[#183D34] transition-colors"
          >
            <span>Switch role / Sign out</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main Content Container ── */}
      <div className="flex flex-1 flex-col md:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[#F6F7F2] dark:bg-[#0C1E19] border-b border-slate-200/60 dark:border-[#1E3E36] px-4 sm:px-8 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-lg p-1.5 text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-200/60 dark:hover:bg-[#183D34]"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#52605D] dark:text-[#A3BDB5] block">
                {user?.role === 'inspector' ? 'FIELD INSPECTION & SAFETY CONSOLE' : 'GOVERNMENT OFFICIAL WORKSPACE'}
              </span>
              <h1 className="text-base font-bold text-[#0C2D27] dark:text-white leading-tight">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Search Input Pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#132E27] border border-slate-200/80 dark:border-[#265347] text-xs text-[#52605D] dark:text-[#CBDCE1] hover:border-slate-300 dark:hover:border-[#3B7364] shadow-2xs cursor-pointer transition-all"
            >
              <Search className="h-3.5 w-3.5 text-[#FF6B53]" />
              <span className="text-xs text-slate-400 dark:text-[#9DBBB2] w-32 md:w-44 text-left">Search anything...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 dark:text-[#9DBBB2] bg-slate-100 dark:bg-[#1C4037] rounded border dark:border-[#2E6356]">⌘K</kbd>
            </button>

            {/* Dark/Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white dark:bg-[#132E27] border border-slate-200/80 dark:border-[#265347] text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] transition-colors cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setProfileOpen(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#132E27] border border-slate-200/80 dark:border-[#265347] text-xs font-bold text-[#0C2D27] dark:text-white hover:bg-slate-100 dark:hover:bg-[#183D34] transition-colors cursor-pointer shadow-2xs"
                title="Switch Language"
              >
                <Globe className="h-3.5 w-3.5 text-[#FF6B53]" />
                <span>{lang === 'hi' ? 'हिंदी' : lang === 'gu' ? 'ગુજરાતી' : 'English'}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 dark:text-[#9DBBB2]" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#14312A] rounded-2xl border border-slate-200 dark:border-[#265347] shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                  <button
                    onClick={() => { setLanguage('en'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'en' ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white' : 'text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34]'}`}
                  >
                    English 🇬🇧
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'hi' ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white' : 'text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34]'}`}
                  >
                    हिंदी (Hindi) 🇮🇳
                  </button>
                  <button
                    onClick={() => { setLanguage('gu'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'gu' ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white' : 'text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34]'}`}
                  >
                    ગુજરાતી (Gujarati) 🇮🇳
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className="p-2 rounded-full bg-white dark:bg-[#132E27] border border-slate-200/80 dark:border-[#265347] text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B53] animate-pulse" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#14312A] rounded-3xl border border-slate-200 dark:border-[#265347] shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#244E43] pb-2">
                    <b className="text-xs font-bold text-[#0C2D27] dark:text-white">Official Alerts &amp; Logs</b>
                    <span className="text-[10px] font-bold text-[#FF6B53] bg-orange-50 dark:bg-[#3D2319] border border-transparent dark:border-[#6E3823] px-2 py-0.5 rounded-full">3 Alerts</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {GOV_NOTIFICATIONS.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#173830] border border-slate-100 dark:border-[#244E43] space-y-0.5 hover:bg-slate-100 dark:hover:bg-[#1E463D] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between text-xs">
                          <b className="text-[#0C2D27] dark:text-white font-bold">{n.title}</b>
                          <span className="text-[10px] text-slate-400 dark:text-[#9DBBB2]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#52605D] dark:text-[#CBDCE1]">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-[#244E43] text-center">
                    <button onClick={() => setNotifOpen(false)} className="text-[11px] font-bold text-[#FF6B53] hover:underline">
                      Close Alerts
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Circle with Dropdown */}
            <div className="relative">
              <div
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="h-8 w-8 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-extrabold flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-2xs"
              >
                {initial}
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#14312A] rounded-3xl border border-slate-200 dark:border-[#265347] shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#244E43] pb-3">
                    <div className="h-10 w-10 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-extrabold flex items-center justify-center text-sm shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <b className="text-xs font-bold text-[#0C2D27] dark:text-white block truncate">{officialName}</b>
                      <span className="text-[10px] text-[#52605D] dark:text-[#A3BDB5] block truncate">Gujarat Labour Department</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-bold">
                    <button
                      onClick={() => { navigate('/gov/settings'); setProfileOpen(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Settings className="h-4 w-4 text-[#FF6B53]" />
                      <span>System Preferences</span>
                    </button>
                    <button
                      onClick={() => { navigate('/gov/workers'); setProfileOpen(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Worker Registry</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#244E43]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#382025] flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Switch Role / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Page View */}
        <main className="flex-1 p-4 sm:p-8 bg-[#F6F7F2] dark:bg-[#0C1E19]">
          <Outlet />
        </main>
      </div>

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
