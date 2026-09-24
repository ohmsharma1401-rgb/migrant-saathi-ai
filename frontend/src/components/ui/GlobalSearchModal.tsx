import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  ArrowRight,
  FileText,
  Users,
  Building2,
  Heart,
  Settings,
  AlertTriangle,
  Home,
  BarChart2,
  DollarSign,
  Bot,
  HelpCircle,
} from 'lucide-react'

interface SearchItem {
  id: string
  title: string
  subtitle: string
  category: 'Pages' | 'Workers' | 'Companies' | 'Schemes' | 'Grievances'
  url: string
  icon: any
}

const SEARCH_ITEMS: SearchItem[] = [
  // Pages
  { id: 'p1', title: 'Workforce Pulse & Analytics', subtitle: 'View coverage by sector & scheme distribution', category: 'Pages', url: '/gov/analytics', icon: BarChart2 },
  { id: 'p2', title: 'Scheme Delivery Management', subtitle: 'Manage active welfare schemes & eligibility', category: 'Pages', url: '/gov/welfare', icon: Heart },
  { id: 'p3', title: 'Grievance Inspections', subtitle: 'Review reported safety issues & proof photos', category: 'Pages', url: '/gov/grievances', icon: AlertTriangle },
  { id: 'p4', title: 'Worker Registry & Companies', subtitle: 'Audit registered workforce rosters & companies', category: 'Pages', url: '/gov/workers', icon: Users },
  { id: 'p5', title: 'System Settings & Integrations', subtitle: 'Configure e-Shram, BOCW, PM-JAY, UIDAI APIs', category: 'Pages', url: '/gov/settings', icon: Settings },
  { id: 'p6', title: 'Worker Home Dashboard', subtitle: 'Digital Saathi ID & matched benefits', category: 'Pages', url: '/worker', icon: Home },
  { id: 'p7', title: 'Fair Wage Calculator', subtitle: 'Check minimum wage standards by district', category: 'Pages', url: '/worker/wages', icon: DollarSign },
  { id: 'p8', title: 'Ask Saathi AI Assistant', subtitle: 'Voice & text AI support in regional languages', category: 'Pages', url: '/worker/ai', icon: Bot },

  // Workers
  { id: 'w1', title: 'Ramesh Kumar', subtitle: 'Mason · Surat District · BOCW ID Registered', category: 'Workers', url: '/gov/workers', icon: Users },
  { id: 'w2', title: 'Mohd. Irfan', subtitle: 'Weaver · Ahmedabad District · Reliance Unit', category: 'Workers', url: '/gov/workers', icon: Users },
  { id: 'w3', title: 'Sunita Devi', subtitle: 'Spinner · Vadodara District · L&T Project', category: 'Workers', url: '/gov/workers', icon: Users },
  { id: 'w4', title: 'Ajay Munda', subtitle: 'Operator · Rajkot District · Auto Components', category: 'Workers', url: '/gov/workers', icon: Users },

  // Companies
  { id: 'c1', title: 'Shree Construction Ltd.', subtitle: '1,420 Registered Employees · Hazira, Surat', category: 'Companies', url: '/gov/workers', icon: Building2 },
  { id: 'c2', title: 'Reliance Textile & Fabrics Unit', subtitle: '1,180 Registered Employees · Naroda, Ahmedabad', category: 'Companies', url: '/gov/workers', icon: Building2 },
  { id: 'c3', title: 'L&T Infrastructure Site #4', subtitle: '950 Registered Employees · Makarpura, Vadodara', category: 'Companies', url: '/gov/workers', icon: Building2 },
  { id: 'c4', title: 'Surat Diamond Craft Association', subtitle: '840 Registered Employees · Varachha, Surat', category: 'Companies', url: '/gov/workers', icon: Building2 },

  // Schemes
  { id: 's1', title: 'Pradhan Mantri Shram Yogi Maandhan (PM-SYM)', subtitle: '₹3,000 monthly pension after age 60', category: 'Schemes', url: '/worker/welfare', icon: Heart },
  { id: 's2', title: 'Ayushman Bharat (PM-JAY Health Cover)', subtitle: '₹5 Lakh annual cashless hospitalisation', category: 'Schemes', url: '/worker/welfare', icon: Heart },
  { id: 's3', title: 'BOCW Welfare Fund (Gujarat e-Nirman)', subtitle: 'Tools, maternity, and education stipends', category: 'Schemes', url: '/worker/welfare', icon: Heart },
  { id: 's4', title: 'e-Shram National Database (UAN Card)', subtitle: '₹2 Lakh accidental insurance cover', category: 'Schemes', url: '/worker/welfare', icon: Heart },

  // Grievances
  { id: 'g1', title: 'GRV-2026-089 Scaffolding Collapse', subtitle: 'Hazard report with attached photo proof', category: 'Grievances', url: '/gov/grievances', icon: AlertTriangle },
  { id: 'g2', title: '#GR-24841 Unpaid Wage Violation', subtitle: '6 weeks salary delay under review', category: 'Grievances', url: '/gov/grievances', icon: AlertTriangle },
]

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = query.trim() === ''
    ? SEARCH_ITEMS
    : SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )

  function handleSelect(url: string) {
    onClose()
    navigate(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 space-y-0">
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="h-5 w-5 text-[#FF6B53] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workers, companies, schemes, grievances, settings..."
            className="w-full bg-transparent text-sm font-bold text-[#0C2D27] placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-1">
              <p className="text-xs font-bold text-[#0C2D27]">No matching records found for "{query}"</p>
              <p className="text-[11px]">Try searching for "Ramesh", "Shree", "BOCW", "Wage", or "Settings"</p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-[#0C2D27] flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#FF6B53]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <b className="text-xs font-bold text-[#0C2D27] truncate">{item.title}</b>
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 text-[9px] font-bold">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate">{item.subtitle}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                </div>
              )
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-5">
          <span>Search index includes live worker directory, government portals &amp; schemes</span>
          <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 font-mono text-[9px]">ESC</kbd> to exit</span>
        </div>

      </div>
    </div>
  )
}
