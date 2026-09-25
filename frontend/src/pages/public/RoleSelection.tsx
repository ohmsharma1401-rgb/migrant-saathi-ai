import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ShieldCheck, ClipboardList, Settings, ArrowRight, CheckCircle2, ChevronRight, Sun, Moon } from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'
import BrandLogo from '@/components/ui/BrandLogo'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

export default function RoleSelection() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const { setAuth } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<'worker' | 'gov' | 'inspector' | 'admin'>('worker')

  function handleContinue() {
    if (selectedRole === 'worker') {
      navigate('/login/worker')
    } else if (selectedRole === 'admin') {
      setAuth(
        { id: 'demo-admin-id', role: 'admin', email: 'admin@gujarat.gov.in' },
        'demo-access-token',
        'demo-refresh-token'
      )
      navigate('/admin')
    } else if (selectedRole === 'inspector') {
      setAuth(
        { id: 'demo-inspector-id', role: 'inspector', email: 'inspector@gujarat.gov.in' },
        'demo-access-token',
        'demo-refresh-token'
      )
      navigate('/gov')
    } else {
      navigate('/login/official')
    }
  }

  const ROLES = [
    {
      id: 'worker' as const,
      title: 'Worker',
      subtitle: 'Access your benefits & work identity',
      icon: User,
      target: '/login/worker',
    },
    {
      id: 'gov' as const,
      title: 'Government',
      subtitle: 'Manage worker welfare delivery',
      icon: ShieldCheck,
      target: '/login/official',
    },
    {
      id: 'inspector' as const,
      title: 'Inspector',
      subtitle: 'Plan and record field visits',
      icon: ClipboardList,
      target: '/login/official',
    },
    {
      id: 'admin' as const,
      title: 'Administrator',
      subtitle: 'Manage the Saathi platform',
      icon: Settings,
      target: '/admin',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F7F2] text-[#0C2D27]">
      {/* ── Left Hero Panel (Deep Forest Green #0C2D27) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] bg-[#0C2D27] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-emerald-950/40 pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full border border-emerald-950/30 pointer-events-none -ml-40 -mb-40" />

        <div className="relative z-10 space-y-8">
          {/* Brand Logo */}
          <BrandLogo dark size="lg" />

          {/* Eyebrow & Hero Title */}
          <div className="space-y-4 pt-2 max-w-sm xl:max-w-md">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53]">
              <span className="w-4 h-[2px] bg-[#FF6B53]" />
              ONE IDENTITY. EVERY OPPORTUNITY.
            </div>
            <h1 className="text-4xl xl:text-5xl font-normal leading-[1.15] text-white tracking-tight">
              Your work builds the nation.<br />
              <span className="text-[#C0E862] font-medium">We stand with you.</span>
            </h1>

            {/* Sabka Saath Sabka Vikas Sentence */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-white space-y-1 backdrop-blur-xs">
              <b className="text-sm font-bold text-[#C0E862] block leading-snug">
                सबका साथ, सबका विकास — Sabka Saath, Sabka Vikas.
              </b>
              <p className="text-xs text-emerald-100/80 font-normal leading-relaxed">
                A trusted companion for every migrant worker—wherever work takes you.
              </p>
            </div>
          </div>
        </div>

        {/* ── Figma Coral Arc Worker Image Container Anchored at Bottom Right ── */}
        <div className="absolute bottom-0 right-0 w-[340px] xl:w-[420px] h-[300px] xl:h-[360px] z-10">
          {/* Outer Accent Ring */}
          <div className="absolute inset-0 rounded-tl-[11rem] bg-[#FF8C78] opacity-70 -translate-x-2 -translate-y-2 pointer-events-none" />
          
          {/* Main Coral Container */}
          <div className="relative w-full h-full rounded-tl-[10rem] bg-[#FF6B53] p-2 shadow-2xl flex items-end overflow-hidden border-t-2 border-l-2 border-orange-300/40">
            <img
              src="/sabka_saath_hero.jpg"
              alt="Sabka Saath Sabka Vikas"
              className="w-full h-full object-cover object-top rounded-tl-[9.5rem]"
            />

            {/* Floating Verified Badge */}
            <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl text-[#0C2D27] text-xs font-extrabold shadow-xl flex items-center gap-2.5 border border-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>सबका साथ, सबका विकास</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-20 grid grid-cols-3 gap-4 pt-6 border-t border-emerald-900/60 max-w-[55%]">
          <div>
            <b className="text-xl xl:text-2xl font-bold text-white block">12.4L</b>
            <span className="text-[11px] text-emerald-200/60 font-medium leading-tight block">workers connected</span>
          </div>
          <div>
            <b className="text-xl xl:text-2xl font-bold text-white block">28</b>
            <span className="text-[11px] text-emerald-200/60 font-medium leading-tight block">states &amp; territories</span>
          </div>
          <div>
            <b className="text-xl xl:text-2xl font-bold text-white block">11</b>
            <span className="text-[11px] text-emerald-200/60 font-medium leading-tight block">languages supported</span>
          </div>
        </div>
      </div>

      {/* ── Right Content Panel ── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white dark:bg-[#0E2622] relative">
        {/* Top Header Row with Language Selector & Theme Toggle */}
        <div className="flex items-center justify-end gap-3 w-full mb-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-emerald-950/60 border border-slate-200 dark:border-emerald-800 text-[#0C2D27] dark:text-white hover:bg-slate-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>
          <LanguageSelector />
        </div>

        {/* Center Role Options Container */}
        <div className="max-w-md mx-auto w-full space-y-6 my-auto">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0C2D27]/70 dark:text-emerald-300 mb-2">
              <span className="w-4 h-[2px] bg-[#FF6B53]" />
              WELCOME TO YOUR SAATHI
            </div>
            <h2 className="text-3xl font-normal text-[#0C2D27] dark:text-white tracking-tight">
              How would you like to continue?
            </h2>
            <p className="text-sm text-[#52605D] dark:text-slate-300 mt-1 font-normal">
              Choose your role to see your personal workspace.
            </p>
          </div>

          {/* Role Options Stack */}
          <div className="space-y-3 pt-2">
            {ROLES.map(({ id, title, subtitle, icon: Icon }) => {
              const isSelected = selectedRole === id
              return (
                <div
                  key={id}
                  onClick={() => setSelectedRole(id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#0C2D27] dark:border-[#FF6B53] bg-[#E8F8F2]/60 dark:bg-[#1A443B] shadow-md'
                      : 'border-slate-100 dark:border-emerald-900/80 hover:border-slate-200 dark:hover:border-emerald-700 bg-white dark:bg-[#112A25]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-[#0C2D27] dark:bg-[#FF6B53] text-white dark:text-white border-[#0C2D27] dark:border-[#FF6B53]'
                          : 'bg-slate-50 dark:bg-emerald-950 text-[#0C2D27] dark:text-emerald-200 border-slate-200 dark:border-emerald-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <b className="text-sm font-bold text-[#0C2D27] dark:text-white block leading-snug">{title}</b>
                      <span className="text-xs text-[#52605D] dark:text-slate-300 font-normal block leading-tight">{subtitle}</span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-[#0C2D27] dark:border-[#FF6B53] bg-[#0C2D27] dark:bg-[#FF6B53]'
                        : 'border-slate-300 dark:border-emerald-700'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Continue CTA Button */}
          <button
            onClick={handleContinue}
            className="w-full figma-btn-coral py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-4"
          >
            <span>Continue securely</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* New to Migrant Saathi */}
          <div className="text-center pt-2">
            <span className="text-xs text-[#52605D] dark:text-slate-300">New to Migrant Saathi? </span>
            <button
              onClick={() => navigate('/login/worker')}
              className="text-xs font-bold text-[#0C2D27] dark:text-[#FF6B53] hover:underline"
            >
              Create your worker profile
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="text-center pt-6 text-[11px] text-[#52605D]/70 dark:text-slate-400 font-medium">
          Migrant Saathi Digital Initiative · Gujarat Labour &amp; Employment Board
        </div>
      </div>
    </div>
  )
}
