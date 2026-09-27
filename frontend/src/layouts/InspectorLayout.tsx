import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  ClipboardCheck,
  Calendar,
  FolderOpen,
  Camera,
  FileCheck2,
  Building2,
  HelpCircle,
  PhoneCall,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Globe,
  ChevronDown,
  Sun,
  Moon,
  Shield,
  Activity,
  BadgeAlert,
  ArrowRightLeft
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import BrandLogo from '@/components/ui/BrandLogo'
import GlobalSearchModal from '@/components/ui/GlobalSearchModal'
import { useTranslation } from '@/utils/translations'

export default function InspectorLayout() {
  const { user, clearAuth, setAuth } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { lang, setLanguage } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [onFieldDuty, setOnFieldDuty] = useState(true)

  function handleLogout() {
    clearAuth()
    navigate('/select-role')
  }

  function handleSwitchToGov() {
    setAuth(
      { id: 'demo-official-id', role: 'official', email: 'official@gujarat.gov.in' },
      'demo-access-token',
      'demo-refresh-token'
    )
    navigate('/gov')
  }

  const inspectorName = user?.email ? user.email.split('@')[0] : 'Rajendra Solanki'
  const badgeId = 'INS-GJ-0418'
  const initial = inspectorName.charAt(0).toUpperCase()

  const navItems = [
    { to: '/inspector', label: 'Field Dashboard', icon: ClipboardCheck, end: true },
    { to: '/inspector/roster', label: "Daily Inspection Roster", icon: Calendar, badge: '4' },
    { to: '/inspector/cases', label: 'Assigned Cases', icon: FolderOpen, badge: '7' },
    { to: '/inspector/evidence', label: 'Field Evidence Vault', icon: Camera },
    { to: '/inspector/reports', label: 'Violation Reports & Notices', icon: FileCheck2 },
    { to: '/inspector/workplaces', label: 'Workplaces & Sites', icon: Building2 },
    { to: '/inspector/help', label: 'SOP & Inspector Helpline', icon: HelpCircle },
  ]

  function getPageTitle() {
    if (location.pathname === '/inspector' || location.pathname === '/inspector/') return 'Field Operations & Inspection Command'
    if (location.pathname.includes('/roster')) return "Today's Inspection Schedule & Routes"
    if (location.pathname.includes('/cases')) return 'Assigned Worker Grievances & Cases'
    if (location.pathname.includes('/evidence')) return 'Field Photo & Evidence Repository'
    if (location.pathname.includes('/reports')) return 'Inspection Reports & Violation Notices'
    if (location.pathname.includes('/workplaces')) return 'Monitored Workplaces & Construction Sites'
    if (location.pathname.includes('/help')) return 'Enforcement SOPs & Emergency Contacts'
    return 'Labour Inspector Workspace'
  }

  const FIELD_NOTIFICATIONS = [
    { id: 1, title: 'Dispatch Alert: Hazira Waterfront', desc: 'Case GJ-2026-0891 assigned. On-site inspection due today at 09:30 AM.', time: '10m ago', urgent: true },
    { id: 2, title: 'Official Instructions', desc: 'Joint Director requested escalation review on Diamond Bourse case.', time: '1h ago', urgent: false },
    { id: 3, title: 'Evidence Auto-Synced', desc: '3 site geotagged photos uploaded to Gujarat Labour Portal.', time: '3h ago', urgent: false },
  ]

  return (
    <div className="flex min-h-screen bg-[#F6F7F2] dark:bg-[#081613] text-[#0C2D27] dark:text-[#E2F1ED] transition-colors">
      {/* ── Left Sidebar (Deep Field Forest Green #081B16) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#081B16] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#15342C] shadow-2xl`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header Logo */}
          <div className="p-4 border-b border-[#15342C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandLogo dark size="md" />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-emerald-200/70 p-1 hover:bg-emerald-900/50 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Inspector Badge Card */}
          <div className="m-3 p-3.5 rounded-2xl bg-[#0D2620] border border-[#1A453A] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase">
                <Shield className="h-3 w-3 text-amber-400" />
                <span>Field Inspector</span>
              </div>
              <button
                onClick={() => setOnFieldDuty(!onFieldDuty)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                  onFieldDuty
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                }`}
                title="Toggle Duty Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${onFieldDuty ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                {onFieldDuty ? 'On Duty' : 'Standby'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-[#FF6B53] text-[#0C2D27] font-black flex items-center justify-center text-sm shadow-md shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <b className="text-xs font-bold text-white block truncate">{inspectorName}</b>
                <span className="text-[10px] font-mono text-emerald-300/80 block truncate font-semibold">
                  Badge: {badgeId}
                </span>
                <span className="text-[10px] text-emerald-200/60 block truncate">Surat &amp; South Gujarat Division</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-1 pb-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300/50">
                Inspection &amp; Verification Ops
              </span>
            </div>
            {navItems.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#153D32] text-white font-bold border-l-4 border-amber-400 shadow-sm'
                      : 'text-emerald-100/70 hover:bg-[#0E2C24] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-emerald-300/60'}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    {badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          badge === '4' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-[#FF6B53] text-white'
                        }`}
                      >
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
        <div className="p-3 border-t border-[#15342C] space-y-2">
          {/* Switch to Gov Official Switcher */}
          <button
            onClick={handleSwitchToGov}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors font-semibold"
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Switch to Gov Portal</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
          </button>

          <div className="p-2.5 rounded-xl bg-[#0D2620] border border-[#1A453A] flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-900/80 flex items-center justify-center shrink-0">
              <PhoneCall className="h-3.5 w-3.5 text-[#C0E862]" />
            </div>
            <div className="min-w-0">
              <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-200/60 block truncate">
                CONTROL ROOM DISPATCH
              </span>
              <b className="text-xs font-bold text-white block">079-2325-1100</b>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-emerald-200/60 hover:text-white hover:bg-[#0E2C24] transition-colors"
          >
            <span>Sign Out</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main Content Container ── */}
      <div className="flex flex-1 flex-col md:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[#F6F7F2] dark:bg-[#0A1814] border-b border-slate-200/70 dark:border-[#16382F] px-4 sm:px-8 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-lg p-1.5 text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-200/60 dark:hover:bg-[#183D34]"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  FIELD ENFORCEMENT &amp; INSPECTION DESK
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-100 dark:bg-[#13332B] text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-[#1E5245]">
                  {badgeId}
                </span>
              </div>
              <h1 className="text-base font-bold text-[#0C2D27] dark:text-white leading-tight">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative">
            {/* Search Input Pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs text-[#52605D] dark:text-[#CBDCE1] hover:border-slate-300 dark:hover:border-[#2F6B5A] shadow-2xs cursor-pointer transition-all"
            >
              <Search className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-slate-400 dark:text-[#9DBBB2] w-28 md:w-36 text-left">Search case or worker...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 dark:text-[#9DBBB2] bg-slate-100 dark:bg-[#1A3D33] rounded border dark:border-[#27594B]">⌘K</kbd>
            </button>

            {/* Dark/Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] transition-colors cursor-pointer shadow-2xs"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-xs font-bold text-[#0C2D27] dark:text-white hover:bg-slate-100 dark:hover:bg-[#183D34] transition-colors cursor-pointer shadow-2xs"
                title="Switch Language"
              >
                <Globe className="h-3.5 w-3.5 text-amber-500" />
                <span>{lang === 'hi' ? 'हिंदी' : lang === 'gu' ? 'ગુજરાતી' : 'English'}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 dark:text-[#9DBBB2]" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#122A23] rounded-2xl border border-slate-200 dark:border-[#1F4C3F] shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                  <button
                    onClick={() => { setLanguage('en'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'en' ? 'bg-[#081B16] text-white' : 'text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#1A3D33]'}`}
                  >
                    English 🇬🇧
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'hi' ? 'bg-[#081B16] text-white' : 'text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#1A3D33]'}`}
                  >
                    हिंदी (Hindi) 🇮🇳
                  </button>
                  <button
                    onClick={() => { setLanguage('gu'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'gu' ? 'bg-[#081B16] text-white' : 'text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#1A3D33]'}`}
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
                className="p-2 rounded-full bg-white dark:bg-[#122A23] border border-slate-200/80 dark:border-[#1F4C3F] text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-amber-500" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#122A23] rounded-3xl border border-slate-200 dark:border-[#1F4C3F] shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E483D] pb-2">
                    <b className="text-xs font-bold text-[#0C2D27] dark:text-white">Field Dispatch Alerts</b>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-full">3 Messages</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {FIELD_NOTIFICATIONS.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#18382F] border border-slate-100 dark:border-[#1F4C3F] space-y-0.5 hover:bg-slate-100 dark:hover:bg-[#1F483D] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between text-xs">
                          <b className="text-[#0C2D27] dark:text-white font-bold flex items-center gap-1">
                            {n.urgent && <BadgeAlert className="h-3.5 w-3.5 text-amber-500" />}
                            {n.title}
                          </b>
                          <span className="text-[10px] text-slate-400 dark:text-[#9DBBB2]">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#52605D] dark:text-[#CBDCE1]">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-[#1E483D] text-center">
                    <button onClick={() => setNotifOpen(false)} className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                      Close Alerts
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar with dropdown */}
            <div className="relative">
              <div
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-[#FF6B53] text-[#0C2D27] font-extrabold flex items-center justify-center text-xs shrink-0 cursor-pointer shadow-2xs border border-amber-300/40"
              >
                {initial}
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#122A23] rounded-3xl border border-slate-200 dark:border-[#1F4C3F] shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#1E483D] pb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-[#FF6B53] text-[#0C2D27] font-extrabold flex items-center justify-center text-sm shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <b className="text-xs font-bold text-[#0C2D27] dark:text-white block truncate">{inspectorName}</b>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block truncate font-bold">
                        {badgeId}
                      </span>
                      <span className="text-[10px] text-[#52605D] dark:text-[#A3BDB5] block truncate">Labour Enforcement Officer</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-bold">
                    <button
                      onClick={handleSwitchToGov}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
                      <span>Switch to Gov Official</span>
                    </button>
                    <button
                      onClick={() => { navigate('/inspector/roster'); setProfileOpen(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#0C2D27] dark:text-[#CBDCE1] hover:bg-slate-100 dark:hover:bg-[#183D34] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <span>Today's Roster</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#1E483D]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#382025] flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Page View */}
        <main className="flex-1 p-4 sm:p-8 bg-[#F6F7F2] dark:bg-[#081613]">
          <Outlet />
        </main>
      </div>

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
