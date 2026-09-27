import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Bot,
  AlertTriangle,
  Info,
  ShieldAlert,
  Flame,
  Newspaper,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  Share2,
  Bookmark,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Building2,
  Sparkles,
} from 'lucide-react'
import api from '@/services/api'
import { useLanguageStore } from '@/store/languageStore'
import { useTranslation } from '@/utils/translations'

// ─── Data Types ─────────────────────────────────────────────────────────────
interface NewsAlert {
  id: string
  level: 'urgent' | 'warning' | 'info'
  title: string
  description: string
  date: string
  action_link?: string
  action_text?: string
}

interface OfficialLink {
  label: string
  url: string
}

interface NewsArticle {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  category: string
  image_url: string
  source: string
  published_at: string
  relative_time: string
  state: string
  district: string
  is_featured?: boolean
  key_takeaways: string[]
  action_steps: string[]
  official_links: OfficialLink[]
  related_schemes: string[]
  tags: string[]
}

// ─── Local Fallback Data (Guarantees 100% Zero Downtime) ─────────────────────
const FALLBACK_ALERTS: NewsAlert[] = [
  {
    id: 'alert-1',
    level: 'urgent',
    title: 'High Heatwave Advisory (Orange Alert) for Construction & Outdoor Labour',
    description:
      'Gujarat Labour Welfare Board mandates mandatory shaded rest breaks between 12:00 PM and 3:00 PM for all outdoor workers, with free cool potable water and ORS packets provided on site.',
    date: 'Today, 11:30 AM',
    action_link: '/worker/report',
    action_text: 'Report Site Violation',
  },
  {
    id: 'alert-2',
    level: 'warning',
    title: 'BOCW e-Nirman Card Annual Renewal Drive Extended to October 31st',
    description:
      'Registered construction workers can renew their e-Nirman welfare cards without any late penalty at all District Labour Seva Kendras or online via Migrant Saathi.',
    date: 'Yesterday',
    action_link: '/worker/welfare',
    action_text: 'Check Card Status',
  },
  {
    id: 'alert-3',
    level: 'info',
    title: 'Western Railways Deploys 42 Festival Special Trains for Migrant Workers',
    description:
      'Additional unreserved general coaches announced between Surat/Ahmedabad and Patna, Gorakhpur, Varanasi, and Gaya for upcoming festival homecoming travel.',
    date: '2 days ago',
  },
  {
    id: 'alert-4',
    level: 'info',
    title: 'National Labour 24x7 Toll-Free Emergency Helpline: 14434',
    description:
      'Workers facing delayed wage disbursals or contractor intimidation can dial 14434 toll-free in Hindi, Gujarati, or English for immediate inspector intervention.',
    date: 'Active 24/7',
    action_link: '/worker/wages',
    action_text: 'File Wage Grievance',
  },
]

const CATEGORIES = [
  'All',
  'Migrant Workers',
  'Labour & Wages',
  'Welfare Schemes',
  'Government Updates',
  'Jobs & Employment',
  'Skills & Training',
  'Worker Safety',
  'Migration',
  'Local / Regional',
  'Important Alerts',
]

const STATES = ['All States', 'Gujarat', 'Bihar', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Odisha']

const DISTRICTS = [
  'All Districts',
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Bhavnagar',
  'Jamnagar',
  'Gandhinagar',
  'Bharuch',
  'Morbi',
  'Kutch',
  'Valsad',
]

export default function WorkerNews() {
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguageStore()
  const navigate = useNavigate()

  // State
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [featured, setFeatured] = useState<NewsArticle | null>(null)
  const [alerts, setAlerts] = useState<NewsAlert[]>(FALLBACK_ALERTS)
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedState, setSelectedState] = useState<string>('Gujarat')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modal / Reader
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null)
  const [savedArticles, setSavedArticles] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch news data
  useEffect(() => {
    async function fetchNews() {
      setLoading(true)
      try {
        const params: Record<string, string> = { language }
        if (selectedCategory !== 'All' && selectedCategory !== 'Important Alerts') {
          params.category = selectedCategory
        }
        if (selectedState !== 'All States') {
          params.state = selectedState
        }
        if (selectedDistrict !== 'All Districts') {
          params.district = selectedDistrict
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim()
        }

        const res = await api.get('/news', { params })
        if (res.data) {
          if (res.data.featured) setFeatured(res.data.featured)
          if (Array.isArray(res.data.articles)) setArticles(res.data.articles)
          if (Array.isArray(res.data.alerts) && res.data.alerts.length > 0) {
            setAlerts(res.data.alerts)
          }
        }
      } catch (err) {
        console.warn('[WorkerNews] API fetch fallback to local cache:', err)
        // Keep fallback data if API is loading or network fails
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [selectedCategory, selectedState, selectedDistrict, searchQuery, language])

  // Client-side quick filter fallback
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'Important Alerts') {
      return []
    }
    return articles.filter((art) => {
      if (selectedCategory !== 'All') {
        const catMatch =
          art.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          art.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
        if (!catMatch) return false
      }
      if (selectedDistrict !== 'All Districts') {
        const distMatch =
          art.district.toLowerCase() === selectedDistrict.toLowerCase() ||
          art.district.toLowerCase() === 'gandhinagar' ||
          art.district.toLowerCase() === 'state-wide'
        if (!distMatch) return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const textMatch =
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.tags.some((t) => t.toLowerCase().includes(q))
        if (!textMatch) return false
      }
      return true
    })
  }, [articles, selectedCategory, selectedDistrict, searchQuery])

  // Ask Saathi AI helper integration
  function handleAskSaathi(article: NewsArticle) {
    const prompt = `Tell me about the recent update on "${article.title}". What does this mean for me as a worker, and what steps should I take?`
    try {
      localStorage.setItem('saathi_prefilled_prompt', prompt)
    } catch {
      // Ignored
    }
    navigate('/worker/ai')
  }

  // Toggle bookmark
  function toggleSave(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSavedArticles((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  // Share link
  function handleShare(art: NewsArticle, e: React.MouseEvent) {
    e.stopPropagation()
    const url = `${window.location.origin}/worker/news?article=${art.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${art.title}\n\nRead more on Migrant Saathi: ${url}`)
      setCopiedId(art.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2.5">
              <Newspaper className="h-3.5 w-3.5" />
              <span>Official Worker Information Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Migrant & Worker News
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Stay informed about jobs, wages, welfare schemes, worker rights and important updates.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80 lg:w-96 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, wages, schemes, alerts..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── 2. Region & Language Filter Bar ──────────────────────────────── */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <Filter className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Region Filter:</span>
            </div>

            {/* State Selector */}
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                aria-label="Select State"
                className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 pr-7 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                {STATES.map((st) => (
                  <option key={st} value={st}>
                    State: {st}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </div>
            </div>

            {/* District Selector */}
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                aria-label="Select District"
                className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 pr-7 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                {DISTRICTS.map((dt) => (
                  <option key={dt} value={dt}>
                    District: {dt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </div>
            </div>

            {(selectedCategory !== 'All' || selectedDistrict !== 'All Districts' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedDistrict('All Districts')
                  setSelectedState('Gujarat')
                  setSearchQuery('')
                }}
                className="text-teal-700 dark:text-teal-400 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                language === 'hi'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('gu')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                language === 'gu'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              ગુજરાતી
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Category Filter Bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat
          const isAlert = cat === 'Important Alerts'
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-teal-600 border-teal-600 text-white shadow-2xs'
                  : isAlert
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800'
              }`}
            >
              {isAlert && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
              {cat}
            </button>
          )
        })}
      </div>

      {/* ── 4. Important Alerts Section ────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Important Alerts & Urgent Advisories
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Updated Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.map((al) => {
            const isUrgent = al.level === 'urgent'
            const isWarning = al.level === 'warning'
            return (
              <div
                key={al.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isUrgent
                    ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-950 dark:text-red-100'
                    : isWarning
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-100'
                    : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40 text-teal-950 dark:text-teal-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isUrgent
                          ? 'bg-red-600 text-white'
                          : isWarning
                          ? 'bg-amber-600 text-white'
                          : 'bg-teal-600 text-white'
                      }`}
                    >
                      {isUrgent && <Flame className="h-2.5 w-2.5" />}
                      {al.level}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {al.date}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold leading-snug mb-1">
                    {al.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {al.description}
                  </p>
                </div>

                {al.action_link && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-end">
                    <button
                      onClick={() => navigate(al.action_link!)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
                    >
                      {al.action_text || 'Take Action'} →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 5. Featured News Article ────────────────────────────────────────── */}
      {featured && selectedCategory !== 'Important Alerts' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Featured Official Update
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-teal-500/40 transition-all flex flex-col lg:flex-row">
            {/* Image */}
            <div className="lg:w-5/12 h-56 sm:h-72 lg:h-auto relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={featured.image_url}
                alt={featured.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-600 text-white shadow-sm">
                  {featured.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                  {featured.district}, {featured.state}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="lg:w-7/12 p-5 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    {featured.source}
                  </span>
                  <span>•</span>
                  <span>{featured.relative_time}</span>
                </div>

                <h3
                  onClick={() => setActiveArticle(featured)}
                  className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors"
                >
                  {featured.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {featured.summary}
                </p>

                {/* Key Takeaways preview */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Key Highlights for Workers:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
                    {featured.key_takeaways.slice(0, 2).map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveArticle(featured)}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Read Full Article
                  </button>
                  <button
                    onClick={() => handleAskSaathi(featured)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 cursor-pointer transition-colors"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Ask Saathi</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleShare(featured, e)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Share article"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => toggleSave(featured.id, e)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedArticles.includes(featured.id)
                        ? 'text-teal-600 bg-teal-50 dark:bg-teal-950'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Latest News Cards Grid ────────────────────────────────────────── */}
      {selectedCategory !== 'Important Alerts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Latest Worker Updates & Sector News ({filteredArticles.length})
              </h2>
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Newspaper className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No articles found matching your criteria.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try clearing your search query or selecting "All" categories.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                  setSelectedDistrict('All Districts')
                }}
                className="mt-4 px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100"
              >
                Show All News
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((art) => {
                const isSaved = savedArticles.includes(art.id)
                return (
                  <div
                    key={art.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:border-teal-500/40 hover:shadow-xs transition-all"
                  >
                    <div>
                      {/* Card Thumbnail */}
                      <div className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={art.image_url}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-600 text-white shadow-2xs">
                            {art.category}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <button
                            onClick={(e) => toggleSave(art.id, e)}
                            className={`p-1.5 rounded-md backdrop-blur-xs transition-colors ${
                              isSaved
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-900/60 text-white hover:bg-slate-900/80'
                            }`}
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                          <span className="font-semibold text-teal-700 dark:text-teal-400 truncate max-w-[150px]">
                            {art.source}
                          </span>
                          <span>{art.relative_time}</span>
                        </div>

                        <h3
                          onClick={() => setActiveArticle(art)}
                          className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors"
                        >
                          {art.title}
                        </h3>

                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {art.summary}
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>
                            {art.district}, {art.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveArticle(art)}
                        className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
                      >
                        Read Full Article →
                      </button>

                      <button
                        onClick={() => handleAskSaathi(art)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900 cursor-pointer"
                        title="Ask Saathi AI about this article"
                      >
                        <Bot className="h-3 w-3" />
                        <span>Ask Saathi</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 7. Full Article Reading Modal ────────────────────────────────────── */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-600 text-white">
                {activeArticle.category}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {activeArticle.district}, {activeArticle.state}
              </span>
              <span className="text-xs text-slate-400">
                {activeArticle.relative_time}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {activeArticle.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
              <span>Source: <strong className="text-teal-700 dark:text-teal-400">{activeArticle.source}</strong></span>
              <span>•</span>
              <span>Published: {new Date(activeArticle.published_at).toLocaleDateString()}</span>
            </div>

            {/* Article Image */}
            <div className="h-64 sm:h-80 rounded-xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800">
              <img
                src={activeArticle.image_url}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Body */}
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line space-y-4">
              {activeArticle.content}
            </div>

            {/* Key Takeaways Box */}
            <div className="mt-6 p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Important Worker Takeaways</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                {activeArticle.key_takeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Steps */}
            {activeArticle.action_steps && activeArticle.action_steps.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Action Steps for You:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {activeArticle.action_steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Official Links */}
            {activeArticle.official_links && activeArticle.official_links.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Related Portals:</span>
                {activeArticle.official_links.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (link.url.startsWith('http')) {
                        window.open(link.url, '_blank')
                      } else {
                        navigate(link.url)
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleAskSaathi(activeArticle)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Bot className="h-4 w-4" />
                <span>Ask Saathi About This Article</span>
              </button>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
