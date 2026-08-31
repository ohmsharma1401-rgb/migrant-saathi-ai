import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Wrench,
  Landmark,
  DollarSign,
  AlertTriangle,
  Bot,
  BarChart2,
  LogIn,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Lock,
  Globe2,
} from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'

const STATS = [
  { value: '50,000+', label: 'Registered Migrant Workers' },
  { value: '₹2.4 Cr+', label: 'Fair Wages Ensured' },
  { value: '50+', label: 'Government Welfare Schemes' },
  { value: '3', label: 'Supported Languages' },
]

const FEATURES = [
  {
    icon: DollarSign,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    title: 'Minimum Wage Transparency',
    desc: 'Instantly check official minimum daily wage rates across Gujarat districts to ensure fair compensation.',
    route: '/login/worker',
    btnLabel: 'Check Wages',
  },
  {
    icon: Landmark,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    title: 'Welfare Scheme Finder',
    desc: 'Smart matching engine that identifies state and national welfare schemes you are eligible for.',
    route: '/login/worker',
    btnLabel: 'Explore Schemes',
  },
  {
    icon: Wrench,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    title: 'Skill Mapping & Identity',
    desc: 'Register your trade skills (Masonry, Carpentry, Plumbing) and build an official verifiable work profile.',
    route: '/login/worker',
    btnLabel: 'Map My Skills',
  },
  {
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    title: 'Safety & Grievance Reporting',
    desc: 'Report unsafe workplace conditions or wage default anonymously and track resolution in real time.',
    route: '/login/worker',
    btnLabel: 'Report Issue',
  },
  {
    icon: Bot,
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    title: 'Multilingual Assistant',
    desc: 'Ask questions in Hindi, Gujarati, or English. Get instant, plain-language guidance on labor rights.',
    route: '/login/worker',
    btnLabel: 'Talk to AI Assistant',
  },
  {
    icon: BarChart2,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    title: 'Government Enforcement Console',
    desc: 'Labour officers get real-time corridor analytics, wage violation alerts, and complaint dispatch tools.',
    route: '/login/official',
    btnLabel: 'Official Portal',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Simple Mobile Registration',
    desc: 'Sign in securely using your mobile number and OTP. No complicated paperwork required.',
  },
  {
    num: '02',
    title: 'Verify Wages & Benefits',
    desc: 'Instantly check if your current wage matches Gujarat reference rates and discover matched welfare schemes.',
  },
  {
    num: '03',
    title: 'Get Protected & Assisted',
    desc: 'Use the 24/7 AI Assistant or file direct grievances to Gujarat Labour Officers whenever needed.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-900/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block leading-none">
                Migrant Saathi AI
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider block mt-0.5">
                Gujarat Labour Welfare Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSelector />
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate('/login/worker')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900 transition-all shadow-2xs"
              >
                Worker Login
              </button>
              <button
                onClick={() => navigate('/login/official')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 transition-all shadow-sm"
              >
                Official Portal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-teal-50/60 via-slate-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                Gujarat Labour &amp; Employment Department Initiative
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Empowering Migrant Workers with <span className="text-teal-600 dark:text-teal-400">Fair Wages</span>, Safety &amp; Welfare
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A unified digital platform dedicated to protecting migrant workers across Gujarat. Verify minimum wages, access state welfare schemes, report workplace safety issues, and get instant multilingual assistance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigate('/select-role')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Access Worker Portal
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/login/official')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  Government Official Login
                </button>
              </div>

              {/* Quick Trust Indicators */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Free Service
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-teal-500" /> Hindi, Gujarati &amp; English
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-indigo-500" /> Safe &amp; Confidential
                </span>
              </div>
            </div>

            {/* Hero Right Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative Blur Background */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500 to-emerald-500 opacity-20 blur-xl dark:opacity-30" />
                
                <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm">
                        WS
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Registered Worker Portal</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ahmedabad Corridor · Gujarat</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active Profile
                    </span>
                  </div>

                  {/* Feature Status Cards inside Preview */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Mason Rate (Ahmedabad)</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">₹500 / Day ✓</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Landmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Matched Welfare Schemes</span>
                      </div>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400">3 Eligible</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Bot className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">AI Legal Support</span>
                      </div>
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400">24/7 Active</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/login/worker')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    Open Live Dashboard →
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Impact Stats Counter ── */}
      <section className="py-10 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label} className="p-4">
                <p className="text-2xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">{s.value}</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Services / Features ── */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Comprehensive Support System for Migrant Labourers
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Designed to bridge the gap between migrant workers, official labor regulations, and social welfare programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((f) => {
              const IconComponent = f.icon
              return (
                <div
                  key={f.title}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${f.color} mb-5`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(f.route)}
                    className="mt-6 flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    {f.btnLabel} →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How Migrant Saathi AI Protects You
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Getting help and verifying your rights takes less than 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-3xl font-black text-teal-600 dark:text-teal-400 block mb-3">{step.num}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Helpline & Assistance Banner ── */}
      <section className="py-12 bg-teal-600 dark:bg-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 mx-auto md:mx-0">
              <PhoneCall className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">24/7 Labour Emergency Support Helpline</h3>
              <p className="text-xs sm:text-sm text-teal-100 mt-0.5">Call 14434 for immediate Gujarat Labour Department assistance</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login/worker')}
            className="px-6 py-3 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-colors shadow-md shrink-0"
          >
            Connect With Saathi AI Assistant
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-teal-400" />
              <span className="text-white font-extrabold text-base">Migrant Saathi AI</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/login/worker')} className="hover:text-white transition-colors">Worker Portal</button>
              <button onClick={() => navigate('/login/official')} className="hover:text-white transition-colors">Official Login</button>
              <button onClick={() => navigate('/admin')} className="hover:text-white transition-colors">Admin Settings</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© {new Date().getFullYear()} Migrant Saathi AI · Gujarat Labour &amp; Employment Department</p>
            <p>Official Migrant Worker Support &amp; Minimum Wage Enforcement System</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
