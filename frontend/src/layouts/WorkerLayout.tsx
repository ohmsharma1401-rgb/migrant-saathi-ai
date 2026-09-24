import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Heart,
  Wrench,
  DollarSign,
  MessageSquare,
  Bot,
  User,
  AlertTriangle,
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
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import BrandLogo from '@/components/ui/BrandLogo'
import GlobalSearchModal from '@/components/ui/GlobalSearchModal'
import { useTranslation } from '@/utils/translations'

export default function WorkerLayout() {
  const { user, clearAuth } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { t, lang, setLanguage } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [avatarPic, setAvatarPic] = useState<string | null>(null)
  const [customName, setCustomName] = useState<string | null>(null)
  const [customLocation, setCustomLocation] = useState<string | null>(null)

  useEffect(() => {
    try {
      const pic = localStorage.getItem('saathi-worker-avatar')
      setAvatarPic(pic || null)
      const customStr = localStorage.getItem('saathi-custom-worker')
      if (customStr) {
        const c = JSON.parse(customStr)
        if (c.full_name) setCustomName(c.full_name)
        if (c.current_district) setCustomLocation(`${c.current_district}, Gujarat`)
      }
    } catch {
      // Fallback
    }
  }, [location.pathname])

  function handleLogout() {
    clearAuth()
    navigate('/select-role')
  }

  const workerName = customName || (user?.email ? user.email.split('@')[0] : 'Ramesh Kumar')
  const workerLoc = customLocation || 'Surat, Gujarat'
  const initial = workerName.charAt(0).toUpperCase()

  const navItems = [
    { to: '/worker', label: t('nav_dashboard'), icon: Home, end: true },
    { to: '/worker/welfare', label: t('nav_welfare'), icon: Heart },
    { to: '/worker/skills', label: t('nav_skills'), icon: Wrench },
    { to: '/worker/wages', label: t('nav_wages'), icon: DollarSign },
    { to: '/worker/ai', label: t('nav_ai'), icon: Bot },
    { to: '/worker/grievances', label: t('nav_grievances'), icon: AlertTriangle, badge: '1' },
    { to: '/worker/profile', label: t('nav_profile'), icon: User },
    { to: '/worker/report', label: t('nav_report'), icon: HelpCircle },
  ]

  // Map path to page title
  function getPageTitle() {
    if (location.pathname === '/worker') return t('nav_dashboard')
    if (location.pathname.includes('/welfare')) return t('nav_welfare')
    if (location.pathname.includes('/skills')) return t('nav_skills')
    if (location.pathname.includes('/wages')) return t('nav_wages')
    if (location.pathname.includes('/ai')) return t('nav_ai')
    if (location.pathname.includes('/grievances')) return t('nav_grievances')
    if (location.pathname.includes('/profile')) return t('nav_profile')
    return 'Worker Workspace'
  }

  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const NOTIFICATIONS = [
    { id: 1, title: 'Welfare Schemes Matched', desc: '3 new schemes are available for your profile', time: '10m ago', unread: true },
    { id: 2, title: 'Saathi Work ID Verified', desc: 'Your portable digital identity is active', time: '1h ago', unread: true },
    { id: 3, title: 'Wage Compliance Check', desc: 'Fair wage schedule updated for Surat district', time: '1d ago', unread: false },
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

          {/* User Profile Card */}
          <div
            onClick={() => navigate('/worker/profile')}
            className="m-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-between cursor-pointer hover:bg-emerald-900/40 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {avatarPic ? (
                <img
                  src={avatarPic}
                  alt={workerName}
                  className="h-9 w-9 rounded-full object-cover border border-emerald-700 shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-extrabold flex items-center justify-center text-xs shrink-0">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <b className="text-xs font-bold text-white block truncate">{workerName}</b>
                <span className="text-[10px] text-emerald-200/70 block truncate">{workerLoc}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-emerald-200/60 shrink-0" />
          </div>

          {/* Navigation items */}
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
                      ? 'bg-emerald-900/80 text-white font-bold border-l-4 border-[#FF6B53]'
                      : 'text-emerald-100/70 hover:bg-emerald-950/40 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#FF6B53]' : 'text-emerald-200/60'}`} />
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

        {/* Sidebar Footer: Helpline Card & Logout */}
        <div className="p-3 border-t border-emerald-950 space-y-2">
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-900/80 flex items-center justify-center shrink-0">
              <PhoneCall className="h-4 w-4 text-[#C0E862]" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200/60 block">24x7 HELPLINE</span>
              <b className="text-xs font-bold text-white block">1800 11 2211</b>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-emerald-200/60 hover:text-white hover:bg-emerald-950/40 transition-colors"
          >
            <span>Switch role / Sign out</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main Content Container ── */}
      <div className="flex flex-1 flex-col md:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[#F6F7F2] border-b border-slate-200/60 px-4 sm:px-8 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden rounded-lg p-1.5 text-[#0C2D27] hover:bg-slate-200/60"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#52605D] block">WORKER WORKSPACE</span>
              <h1 className="text-base font-bold text-[#0C2D27] leading-tight">{getPageTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Search Input Pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs text-[#52605D] hover:border-slate-300 shadow-2xs cursor-pointer transition-all"
            >
              <Search className="h-3.5 w-3.5 text-[#FF6B53]" />
              <span className="text-xs text-slate-400 w-32 md:w-44 text-left">Search anything...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-100 rounded border">⌘K</kbd>
            </button>

            {/* Dark/Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white border border-slate-200/80 text-[#0C2D27] hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-[#0C2D27] hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                title="Switch Language"
              >
                <Globe className="h-3.5 w-3.5 text-[#FF6B53]" />
                <span>{lang === 'hi' ? 'हिंदी' : lang === 'gu' ? 'ગુજરાતી' : 'English'}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                  <button
                    onClick={() => { setLanguage('en'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'en' ? 'bg-[#0C2D27] text-white' : 'text-[#0C2D27] hover:bg-slate-100'}`}
                  >
                    English 🇬🇧
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'hi' ? 'bg-[#0C2D27] text-white' : 'text-[#0C2D27] hover:bg-slate-100'}`}
                  >
                    हिंदी (Hindi) 🇮🇳
                  </button>
                  <button
                    onClick={() => { setLanguage('gu'); setLangOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${lang === 'gu' ? 'bg-[#0C2D27] text-white' : 'text-[#0C2D27] hover:bg-slate-100'}`}
                  >
                    ગુજરાતી (Gujarati) 🇮🇳
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className="p-2 rounded-full bg-white border border-slate-200/80 text-[#0C2D27] hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B53] animate-pulse" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <b className="text-xs font-bold text-[#0C2D27]">Notifications</b>
                    <span className="text-[10px] font-bold text-[#FF6B53] bg-orange-50 px-2 py-0.5 rounded-full">2 New</span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {NOTIFICATIONS.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5 hover:bg-slate-100 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between text-xs">
                          <b className="text-[#0C2D27] font-bold">{n.title}</b>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#52605D]">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100 text-center">
                    <button onClick={() => setNotifOpen(false)} className="text-[11px] font-bold text-[#FF6B53] hover:underline">
                      Close Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Circle with Profile Dropdown */}
            <div className="relative">
              <div
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="cursor-pointer"
              >
                {avatarPic ? (
                  <img
                    src={avatarPic}
                    alt={workerName}
                    className="h-9 w-9 rounded-full object-cover border-2 border-emerald-600 shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {initial}
                  </div>
                )}
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    {avatarPic ? (
                      <img src={avatarPic} alt={workerName} className="h-10 w-10 rounded-full object-cover border border-emerald-600" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#FFD8CC] text-[#0C2D27] font-extrabold flex items-center justify-center text-sm">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0">
                      <b className="text-xs font-bold text-[#0C2D27] block truncate">{workerName}</b>
                      <span className="text-[10px] text-[#52605D] block truncate">{workerLoc}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-bold">
                    <button
                      onClick={() => { navigate('/worker/profile'); setProfileOpen(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#0C2D27] hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4 text-[#FF6B53]" />
                      <span>My Profile &amp; Photo</span>
                    </button>
                    <button
                      onClick={() => { navigate('/worker/welfare'); setProfileOpen(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl text-[#0C2D27] hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Heart className="h-4 w-4 text-emerald-600" />
                      <span>My Welfare Schemes</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer"
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
        <main className="flex-1 p-4 sm:p-8 bg-[#F6F7F2]">
          <Outlet />
        </main>
      </div>

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
