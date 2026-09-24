import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Gift,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Check,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/utils/translations'

export default function WorkerDashboard() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [workerDetails, setWorkerDetails] = useState({
    name: user?.email ? user.email.split('@')[0] : 'Ramesh Kumar',
    occupation: 'Mason',
    sector: 'Construction',
    location: 'Surat, Gujarat',
    district: 'Surat',
    avatarPic: null as string | null,
  })

  useEffect(() => {
    try {
      const pic = localStorage.getItem('saathi-worker-avatar')
      const customStr = localStorage.getItem('saathi-custom-worker')
      let avatarPic = pic || null
      let name = user?.email ? user.email.split('@')[0] : 'Ramesh Kumar'
      let occupation = 'Mason'
      let sector = 'Construction'
      let district = 'Surat'

      if (customStr) {
        const c = JSON.parse(customStr)
        if (c.full_name) name = c.full_name
        if (c.occupation) occupation = c.occupation
        if (c.sector) sector = c.sector
        if (c.current_district) district = c.current_district
        if (c.profile_pic) avatarPic = c.profile_pic
      }

      setWorkerDetails({
        name,
        occupation,
        sector,
        location: `${district}, Gujarat`,
        district,
        avatarPic,
      })
    } catch {
      // Fallback
    }
  }, [user])

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* ── 1. Hero Dark Green Card (#0C2D27) with Floating Digital ID Card ── */}
      <div className="rounded-[2.5rem] bg-[#0C2D27] text-white p-6 sm:p-10 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
        {/* Background Subtle Arc Line */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-emerald-950/50 pointer-events-none -mr-32 -mt-32" />

        <div className="space-y-6 max-w-lg z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#C0E862]">
            <span className="w-4 h-[2px] bg-[#C0E862]" />
            सोमवार · 24 जून
          </div>

          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight leading-tight text-white">
            Namaste, {workerDetails.name}.
          </h1>

          <p className="text-sm text-emerald-100/70 font-normal leading-relaxed">
            Your journey is moving forward. Here&apos;s what needs your attention today.
          </p>

          {/* Ask Saathi Pill Button */}
          <div
            onClick={() => navigate('/worker/ai')}
            className="inline-flex items-center gap-3 p-3 px-4 rounded-2xl bg-emerald-900/60 border border-emerald-800/80 hover:bg-emerald-900 transition-colors cursor-pointer text-xs font-medium text-white"
          >
            <div className="p-1.5 rounded-xl bg-[#C0E862] text-[#0C2D27]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200/70 block leading-tight font-semibold">Have a question?</span>
              <b className="text-xs text-white block">Ask Saathi in your language →</b>
            </div>
          </div>
        </div>

        {/* Floating Saathi Work ID Card */}
        <div className="z-10 w-full max-w-xs sm:max-w-sm shrink-0">
          <div className="rounded-3xl bg-[#08221E] border border-emerald-800/60 p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B53]" />
                <span className="text-xs font-bold tracking-tight">Migrant Saathi</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-[#C0E862] border border-emerald-800 text-[10px] font-bold uppercase">
                <Check className="h-3 w-3" /> VERIFIED
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <img
                src={workerDetails.avatarPic || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80"}
                alt="Profile"
                className="w-12 h-12 rounded-xl object-cover border border-emerald-700 shadow-xs"
              />
              <div>
                <span className="text-[9px] font-bold text-emerald-200/60 uppercase block tracking-wider">SAATHI WORK ID</span>
                <b className="text-sm font-bold text-white block">{workerDetails.name}</b>
                <span className="text-xs text-emerald-200/70 block font-medium">{workerDetails.sector} · {workerDetails.occupation}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-900/80 flex items-center justify-between text-[11px] text-emerald-200/60 font-mono">
              <span>MS-GJ-2024-084271</span>
              <QrCode className="h-5 w-5 text-emerald-200" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. "Your Next Best Step" Progress Banner (#FFFDF0) ── */}
      <div className="rounded-2xl bg-[#FFFDF0] border border-amber-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-800 shrink-0">
            <Sparkles className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <b className="text-sm font-bold text-[#0C2D27] block">Your next best step</b>
            <span className="text-xs text-[#52605D] font-normal block">
              Complete your skill profile to unlock better-paying jobs nearby.
            </span>
          </div>
        </div>

        {/* Progress Bar & CTA */}
        <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-between">
          <div className="flex items-center gap-3 w-40">
            <div className="h-2 flex-1 rounded-full bg-amber-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
            </div>
            <span className="text-xs font-bold text-amber-900">68%</span>
          </div>

          <button
            onClick={() => navigate('/worker/skills')}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── 3. "Made for your journey" 3 Pastel Feature Cards ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#0C2D27] tracking-tight">Made for your journey</h2>
          <p className="text-xs text-[#52605D] mt-0.5">Everything you need, in one trusted place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Pastel Card 1: Benefits For You (Soft Peach #FFF0EB) */}
          <div
            onClick={() => navigate('/worker/welfare')}
            className="rounded-3xl bg-[#FFF0EB] border border-orange-100 p-6 flex flex-col justify-between space-y-6 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-white/80 w-fit text-[#FF6B53] shadow-2xs">
                <Gift className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6B53] block">BENEFITS FOR YOU</span>
              <div>
                <h3 className="text-lg font-bold text-[#0C2D27] group-hover:text-[#FF6B53] transition-colors leading-snug">
                  3 schemes match your profile
                </h3>
                <p className="text-xs text-[#52605D] mt-1 font-normal">
                  ₹5,000 annual health cover is waiting.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#FF6B53] flex items-center gap-1 pt-2">
              View matches →
            </span>
          </div>

          {/* Pastel Card 2: Fair Wage Check (Soft Mint #E8F8F2) */}
          <div
            onClick={() => navigate('/worker/wages')}
            className="rounded-3xl bg-[#E8F8F2] border border-emerald-100 p-6 flex flex-col justify-between space-y-6 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-white/80 w-fit text-emerald-700 shadow-2xs">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">FAIR WAGE CHECK</span>
              <div>
                <h3 className="text-lg font-bold text-[#0C2D27] group-hover:text-emerald-700 transition-colors leading-snug">
                  You should earn ₹780/day
                </h3>
                <p className="text-xs text-[#52605D] mt-1 font-normal">
                  Based on your skills and location.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-2">
              Check your rate →
            </span>
          </div>

          {/* Pastel Card 3: Your Request (Soft Lavender #F0ECFC) */}
          <div
            onClick={() => navigate('/worker/grievances')}
            className="rounded-3xl bg-[#F0ECFC] border border-purple-100 p-6 flex flex-col justify-between space-y-6 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
          >
            {/* Ribbon Badge */}
            <div className="absolute top-4 right-[-35px] bg-purple-700 text-white text-[9px] font-extrabold uppercase tracking-widest py-1 px-8 rotate-45 shadow-2xs">
              IN REVIEW
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-white/80 w-fit text-purple-700 shadow-2xs">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-700 block">YOUR REQUEST</span>
              <div>
                <h3 className="text-lg font-bold text-[#0C2D27] group-hover:text-purple-700 transition-colors leading-snug">
                  Wage complaint is in review
                </h3>
                <p className="text-xs text-[#52605D] mt-1 font-normal">
                  Updated today at 10:42 AM
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-purple-700 flex items-center gap-1 pt-2">
              Track status →
            </span>
          </div>

        </div>
      </div>

    </div>
  )
}
