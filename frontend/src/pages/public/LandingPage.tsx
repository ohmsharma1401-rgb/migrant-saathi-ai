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
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    title: 'Minimum Wage Transparency',
    desc: 'Instantly check official minimum daily wage rates across Gujarat districts to ensure fair compensation.',
    route: '/login/worker',
    btnLabel: 'Check Wages',
  },
  {
    icon: Landmark,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    title: 'Welfare Scheme Finder',
    desc: 'Smart matching engine that identifies state and national welfare schemes you are eligible for.',
    route: '/login/worker',
    btnLabel: 'Explore Schemes',
  },
  {
    icon: Wrench,
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    title: 'Skill Mapping & Profile',
    desc: 'Register your trade skills (Masonry, Carpentry, Plumbing) and build an official verifiable work profile.',
    route: '/login/worker',
    btnLabel: 'Map My Skills',
  },
  {
    icon: AlertTriangle,
    color: 'text-red-700 bg-red-50 border-red-200',
    title: 'Safety & Grievance Reporting',
    desc: 'Report unsafe workplace conditions or wage default anonymously and track resolution in real time.',
    route: '/login/worker',
    btnLabel: 'Report Issue',
  },
  {
    icon: Bot,
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    title: 'Multilingual Saathi Assistant',
    desc: 'Ask questions in Hindi, Gujarati, or English. Get instant, plain-language guidance on labor rights.',
    route: '/login/worker',
    btnLabel: 'Talk to Saathi',
  },
  {
    icon: BarChart2,
    color: 'text-slate-700 bg-slate-100 border-slate-200',
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] transition-colors">
      {/* ── Navbar ── */}
      <header className="border-b-2 border-[var(--rule)] bg-[var(--surface)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="shrink-0">
              <rect width="36" height="36" rx="4" fill="#111111"/>
              <path d="M8 27c7 0 6-10 13-10s3 5 7-9" stroke="#F5671A" strokeWidth="3.5" strokeLinecap="round" fill="none" strokeDasharray="1 6"/>
              <circle cx="28" cy="8" r="3.5" fill="#F5671A"/>
            </svg>
            <div>
              <span className="font-extrabold text-lg text-[var(--ink)] block leading-tight">
                Migrant Saathi
              </span>
              <span className="text-[10px] text-[#F5671A] font-bold uppercase tracking-wide block">
                Gujarat Labour Welfare
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={() => navigate('/select-role')}
              className="saathi-btn-outline text-xs px-4 py-2 min-h-[40px]"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          {/* Hero Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[var(--ink)] tracking-tight leading-[1.04]">
              Your work. <br />
              Your rights. <br />
              <span className="text-[#F5671A]">Your support.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--muted)] max-w-xl leading-relaxed font-medium">
              A simple digital companion for migrant workers to discover welfare benefits, understand wages, build skills and get help when they need it.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/select-role')}
                className="saathi-btn-or text-base sm:text-lg min-h-[54px] px-7"
              >
                Get Started →
              </button>
              <button
                onClick={() => navigate('/login/official')}
                className="saathi-btn-outline text-base sm:text-lg min-h-[54px] px-7"
              >
                Official Sign In
              </button>
            </div>

            <p className="text-sm text-[var(--muted)] font-medium pt-1">
              Works in English, हिन्दी and ગુજરાતી. Sign up with your email.
            </p>
          </div>

          {/* Hero Right Graphic Banner */}
          <div className="lg:col-span-5">
            <div className="saathi-card-phone p-6 border-2 border-[var(--rule)] bg-[#F5671A] text-[#111111] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
                <span className="font-extrabold text-sm uppercase tracking-wider">🇮🇳 Gujarat Labour Portal</span>
                <span className="saathi-badge-teal bg-[#111111] text-white border-[#111111] text-[10px]">100% Free</span>
              </div>
              <h2 className="text-2xl font-extrabold leading-tight">
                Built for the 6 million+ interstate migrant workers in Gujarat.
              </h2>
              <div className="p-4 rounded-md bg-[#111111] text-white border-2 border-[#111111] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#F5671A]">
                  <span>Mason Rate (Surat)</span>
                  <span>₹520 / Day ✓</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#AAA8A2]">
                  <span>Welfare Matches</span>
                  <span className="text-white">4 Schemes</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/select-role')}
                className="w-full py-3 rounded-md bg-[#111111] text-[#F5671A] font-extrabold text-sm hover:bg-[#222222] transition-colors border-2 border-[#111111]"
              >
                Launch App Demo →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Black Strip Banner ── */}
      <div className="border-y-2 border-[var(--rule)] bg-[var(--ink)] text-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-sm font-semibold">
          Built for the 6 million+ interstate migrant workers who keep Gujarat's cities running.
        </div>
      </div>

      {/* ── Interactive App Demos Section ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            A companion, not a form
          </h2>
          <p className="text-base text-[var(--muted)] mt-2 max-w-xl font-medium">
            Every screen has one clear next step. Try the features below.
          </p>
        </div>

        {/* 3 Phone Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Home */}
          <div className="saathi-card-phone p-5 flex flex-col justify-between min-h-[620px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[var(--rule)] pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-[var(--ink)]">Migrant Saathi</h3>
                  <p className="text-xs text-[var(--muted)]">Your work. Your rights. Your support.</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-[var(--ink)] text-[var(--bg)] font-bold flex items-center justify-center text-xs">
                  R
                </div>
              </div>

              <div className="saathi-card-top-orange">
                <small className="text-[var(--muted)] font-bold text-xs uppercase block">Saathi profile</small>
                <b className="text-lg font-extrabold text-[var(--ink)] block">Ramesh Kumar</b>
                <small className="text-xs text-[var(--muted)] block">Mason · Surat</small>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#F5671A]">
                  <span>Profile complete</span>
                  <span>100%</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/login/worker')}
                className="w-full saathi-btn-or py-3 text-sm flex items-center justify-between text-left"
              >
                <div>
                  <b className="block text-sm">Ask Saathi AI</b>
                  <small className="text-xs opacity-90 block">Ask by typing or speaking</small>
                </div>
                <span>→</span>
              </button>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs py-1.5 border-b border-[var(--hair)]">
                  <span className="text-[var(--muted)] font-medium">Skills registered</span>
                  <b className="font-bold text-[var(--ink)]">3</b>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-[var(--hair)]">
                  <span className="text-[var(--muted)] font-medium">Schemes matched</span>
                  <b className="font-bold text-[var(--ink)]">4</b>
                </div>
                <div className="flex justify-between text-xs py-1.5">
                  <span className="text-[var(--muted)] font-medium">Daily wage</span>
                  <b className="font-bold text-[#F5671A]">₹520 · fair</b>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[var(--rule)] text-center font-bold text-xs">
              Home Screen Preview
            </div>
          </div>

          {/* Card 2: Ask Saathi Chat */}
          <div className="saathi-card-phone p-5 flex flex-col justify-between min-h-[620px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[var(--rule)] pb-3">
                <div className="w-9 h-9 rounded-md bg-[#F5671A] text-[#111111] font-bold flex items-center justify-center text-sm border-2 border-[#111111]">
                  S
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--ink)]">Ask Saathi</h3>
                  <p className="text-xs text-[var(--muted)]">English, हिन्दी or ગુજરાતી</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-md bg-[var(--ink)] text-[var(--bg)] ml-auto max-w-[85%] font-medium">
                  Is my wage fair?
                </div>
                <div className="p-3 rounded-md bg-[var(--surface)] border-2 border-[var(--rule)] text-[var(--ink)] max-w-[90%] space-y-2 font-medium">
                  <p>You told me you earn ₹420 a day as a mason in Surat. The reference rate is ₹490, so you may be getting ₹70 less than reference.</p>
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    <button onClick={() => navigate('/login/worker')} className="saathi-badge-or text-[10px]">Report wage issue</button>
                    <button onClick={() => navigate('/login/worker')} className="saathi-badge-slate text-[10px]">Learn my rights</button>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-[var(--ink)] text-[var(--bg)] ml-auto max-w-[85%] font-medium">
                  Am I eligible for any schemes?
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[var(--rule)] text-center font-bold text-xs">
              Ask Saathi AI Preview
            </div>
          </div>

          {/* Card 3: Wage Check */}
          <div className="saathi-card-phone p-5 flex flex-col justify-between min-h-[620px]">
            <div className="space-y-4">
              <div className="border-b-2 border-[var(--rule)] pb-3">
                <h3 className="font-extrabold text-base text-[var(--ink)]">Check my wage</h3>
                <p className="text-xs text-[var(--muted)]">Gujarat Reference Schedule</p>
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase text-[var(--muted)]">Your daily wage</div>
                <div className="text-4xl font-extrabold text-[#F5671A]">₹420</div>
                
                <div className="space-y-2 pt-2">
                  <div className="text-xs">
                    <div className="flex justify-between font-semibold text-[var(--muted)] mb-1">
                      <span>You reported</span>
                      <b className="text-[var(--ink)]">₹420</b>
                    </div>
                    <div className="h-4 border-2 border-[var(--rule)] rounded-xs overflow-hidden">
                      <div className="h-full bg-[#F5671A] w-[75%]" />
                    </div>
                  </div>

                  <div className="text-xs">
                    <div className="flex justify-between font-semibold text-[var(--muted)] mb-1">
                      <span>Reference wage</span>
                      <b className="text-[var(--ink)]">₹490</b>
                    </div>
                    <div className="h-4 border-2 border-[var(--rule)] rounded-xs overflow-hidden">
                      <div className="h-full bg-[var(--ink)] w-[100%]" />
                    </div>
                  </div>
                </div>

                <div className="p-3 border-2 border-[var(--rule)] border-l-8 border-l-[#F5671A] rounded-md bg-[var(--surface)] text-xs space-y-1">
                  <b className="text-sm font-extrabold text-[var(--ink)] block">₹70 less per day</b>
                  <p className="text-[var(--muted)] leading-relaxed font-medium">Your reported wage is below the reference rate for masonry in Surat.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[var(--rule)] text-center font-bold text-xs">
              Wage Check Preview
            </div>
          </div>

        </div>
      </main>

      {/* ── Helpline Banner ── */}
      <section className="border-t-2 border-[var(--rule)] bg-[#F5671A] text-[#111111] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold">24/7 Labour Support Helpline: 14434</h3>
            <p className="text-sm font-semibold mt-0.5">Gujarat Labour &amp; Employment Department Assistance</p>
          </div>
          <button
            onClick={() => navigate('/select-role')}
            className="px-6 py-3.5 rounded-md bg-white text-[#111111] border-2 border-[#111111] font-extrabold text-sm hover:bg-slate-100 active:translate-y-0.5 transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            Access Migrant Saathi →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-[var(--rule)] bg-[var(--surface)] text-[var(--ink)] py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-sm">Migrant Saathi AI</p>
            <p className="text-[var(--muted)] mt-0.5">Gujarat Labour &amp; Employment Department Digital Initiative</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 font-bold text-xs">
            <button onClick={() => navigate('/login/worker')} className="hover:underline">Worker Portal</button>
            <button onClick={() => navigate('/login/official')} className="hover:underline">Official Sign In</button>
            <button onClick={() => navigate('/admin')} className="hover:underline">Admin Console</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
