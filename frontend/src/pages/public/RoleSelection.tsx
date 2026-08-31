import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle2, Cpu, Sparkles, UserCheck, Landmark } from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'

interface RoleCardProps {
  icon: typeof UserCheck
  iconBg: string
  iconColor: string
  title: string
  subtitles: string[]
  description: string
  pills: string[]
  buttonLabel: string
  btnGradient: string
  onClick: () => void
}

function RoleCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitles,
  description,
  pills,
  buttonLabel,
  btnGradient,
  onClick,
}: RoleCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border transition-all duration-300 cursor-pointer relative overflow-hidden ${
        hovered
          ? 'border-teal-500/80 dark:border-teal-400/80 shadow-xl shadow-teal-500/10 dark:shadow-teal-400/10 -translate-y-1 bg-white dark:bg-slate-900'
          : 'border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm'
      }`}
    >
      {/* Decorative subtle ambient glow */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl transition-opacity duration-300 pointer-events-none ${hovered ? 'opacity-30' : 'opacity-0'} ${btnGradient}`} />

      {/* Header icon */}
      <div className="flex items-start justify-between mb-5">
        <div className={`h-14 w-14 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shadow-xs`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex flex-col text-right">
          {subtitles.map((s, idx) => (
            <span key={idx} className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
        {title}
      </h2>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
        {description}
      </p>

      {/* Feature tags */}
      <div className="flex flex-wrap gap-1.5 my-5">
        {pills.map((p) => (
          <span
            key={p}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${btnGradient} hover:brightness-110 active:scale-[0.99]`}
      >
        <span>{buttonLabel}</span>
      </button>
    </div>
  )
}

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ── Left Hero Panel (md+ screens) ── */}
      <div className="hidden md:flex md:w-[420px] lg:w-[460px] bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 p-10 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Background decorative grid glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block">
                Migrant Saathi AI
              </span>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
                Labour Welfare Ecosystem
              </span>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-4 pt-4">
            <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
              Your Rights.<br />
              <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Your Welfare.
              </span><br />
              Your Protection.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Connecting 6M+ migrant workers in Gujarat to fair minimum wages, state welfare schemes, and 24/7 legal grievance support.
            </p>
          </div>

          {/* Key value propositions */}
          <div className="space-y-3 pt-2">
            {[
              'Multilingual Voice & NLP Assistant',
              'Instant District Minimum Wage Verification',
              'BOCW & PM-SYM Welfare Scheme Finder',
              'Confidential Workplace Safety Reporting',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Engine badge */}
        <div className="relative z-10 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-sm">
            <Cpu className="h-4 w-4 text-teal-400" />
            <span>Saathi Intelligence Core</span>
          </div>
        </div>
      </div>

      {/* ── Right Content Panel ── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative min-h-screen md:min-h-0">
        {/* Top Header Row with Back Button & Language/Theme Selector */}
        <div className="flex items-center justify-between gap-4 w-full mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <LanguageSelector />
        </div>

        {/* Center Cards Container */}
        <div className="max-w-xl mx-auto w-full space-y-6 my-auto py-4">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900">
              <Sparkles className="h-3.5 w-3.5" /> Select Portal Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome to Migrant Saathi AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select your user role to access your dedicated portal
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Worker Role Card */}
            <RoleCard
              icon={UserCheck}
              iconBg="bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-900"
              iconColor="text-teal-600 dark:text-teal-400"
              title="Migrant Worker Portal"
              subtitles={['प्रवासी मजदूर', 'સ્થળાંતર મજૂર']}
              description="Login with your mobile OTP. Check minimum daily wages in your district, explore eligible welfare schemes, and report workplace issues."
              pills={['📱 Mobile OTP Sign In', '🏛 Welfare Schemes', '💰 Wage Check', '🤖 AI Bot']}
              buttonLabel="Access Worker Portal →"
              btnGradient="bg-gradient-to-r from-teal-600 to-emerald-600"
              onClick={() => navigate('/login/worker')}
            />

            {/* Official Role Card */}
            <RoleCard
              icon={Landmark}
              iconBg="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900"
              iconColor="text-indigo-600 dark:text-indigo-400"
              title="Government Official & Enforcement"
              subtitles={['Labour Officers / Inspectors / Admin']}
              description="Sign in with official credentials. Access real-time corridor analytics, worker registrations map, inspection dispatch, and AI risk reports."
              pills={['🔑 Official Auth', '📊 Analytics Console', '🗺 Geographic Map', '📋 Grievances']}
              buttonLabel="Access Official Portal →"
              btnGradient="bg-gradient-to-r from-indigo-600 to-purple-600"
              onClick={() => navigate('/login/official')}
            />
          </div>
        </div>

        {/* Footer info note */}
        <div className="text-center pt-8">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
            Migrant Saathi AI is an initiative of the Gujarat Labour &amp; Employment Department. All welfare scheme recommendations are subject to official verification.
          </p>
        </div>
      </div>
    </div>
  )
}
