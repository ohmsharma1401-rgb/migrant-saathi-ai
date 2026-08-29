import { useState } from 'react'
import { BrainCircuit, ChevronDown, ChevronUp, RefreshCw, CheckCircle, Sparkles } from 'lucide-react'
import LanguageSelector from '@/components/LanguageSelector'
import { useTranslation } from '@/utils/translations'

// ─── DEMO DATA ──────────────────────────────────────────────────────────────

interface Insight {
  id: string
  section: 'observed' | 'trend' | 'recommendation'
  text: string
  detail: string
  dataPoints: string
}

const INSIGHTS: Insight[] = [
  // OBSERVED
  {
    id: 'obs-1',
    section: 'observed',
    text: '12,847 migrant workers are currently registered in Gujarat. Construction sector workers represent the largest group (40.7%).',
    detail:
      'Workers are distributed across 6 major districts, with Ahmedabad (4,231) and Surat (3,892) accounting for the highest concentrations. Registration growth was +234 workers this month compared to the prior month.',
    dataPoints: '12,847 worker profiles',
  },
  {
    id: 'obs-2',
    section: 'observed',
    text: 'Surat and Ahmedabad districts have the highest concentrations of registered migrant workers, together comprising 62.6% of the registered base.',
    detail:
      'Ahmedabad: 4,231 workers (32.9%). Surat: 3,892 workers (30.3%). Vadodara: 2,104 (16.4%). Remaining districts account for the balance.',
    dataPoints: '6 district records · 12,847 workers',
  },
  {
    id: 'obs-3',
    section: 'observed',
    text: 'Welfare scheme match coverage stands at 65.5% of registered workers, with 8,412 workers matched to at least one eligible scheme.',
    detail:
      'The remaining 34.5% (4,435 workers) have not yet been matched. The most common matched schemes are PM-JAY, e-Shram, and PMAY-G. Matching gaps are highest in rural sub-districts.',
    dataPoints: '8,412 matched workers · 347 active schemes',
  },
  // POTENTIAL TRENDS
  {
    id: 'trend-1',
    section: 'trend',
    text: 'Wage discrepancy alerts in the diamond polishing sector (Surat) appear to have increased compared to the previous period. Review recommended before drawing conclusions.',
    detail:
      'Alert count in the diamond sector rose from approximately 89 to 109 over the comparison period, a potential 22.5% increase. These are system-generated alerts based on reported wages versus reference rates and require field verification.',
    dataPoints: '1,203 total wage alerts · 109 in diamond sector',
  },
  {
    id: 'trend-2',
    section: 'trend',
    text: 'Safety-related grievances in construction sites (Ahmedabad) may show an upward pattern. Field verification recommended.',
    detail:
      'Safety grievances in Ahmedabad increased from 31 to 43 over the observed window. The construction sector accounts for 72% of safety-category grievances nationally. This is a pattern, not a confirmed trend — please verify before escalating.',
    dataPoints: '89 safety grievances · 43 in Ahmedabad construction',
  },
  {
    id: 'trend-3',
    section: 'trend',
    text: 'Workers from Bihar and Uttar Pradesh origin states represent the largest migrant source groups. This pattern may have implications for inter-state coordination.',
    detail:
      'Bihar-origin workers: ~28% of registered base. UP-origin workers: ~34%. Combined, these two states represent over 60% of the migrant workforce. Cross-state welfare portability and registration awareness may be relevant considerations.',
    dataPoints: '12,847 workers · origin state field data',
  },
  // RECOMMENDATIONS
  {
    id: 'rec-1',
    section: 'recommendation',
    text: 'Approximately 34% of registered workers may have unclaimed welfare scheme opportunities. Targeted outreach in high-density districts may improve coverage.',
    detail:
      'An estimated 4,435 workers have no matched welfare scheme. Prioritising Surat and Ahmedabad for outreach could reach ~2,700 of these workers. Multilingual materials in Hindi and Gujarati are recommended.',
    dataPoints: '4,435 unmatched workers · scheme eligibility data',
  },
  {
    id: 'rec-2',
    section: 'recommendation',
    text: 'Assigning additional inspectors to the Surat diamond sector may help address the volume of wage-related grievances.',
    detail:
      'Surat currently has the highest concentration of wage alerts relative to inspector headcount. Directing 2–3 additional inspectors to the diamond polishing sub-sector for a targeted audit period is suggested.',
    dataPoints: '109 wage alerts · Surat district inspector ratio',
  },
  {
    id: 'rec-3',
    section: 'recommendation',
    text: 'Multilingual outreach materials in Hindi and Gujarati may improve worker registration rates in rural districts.',
    detail:
      'Districts like Kutch and Banaskantha show lower registration density relative to estimated migrant worker populations. Language-appropriate materials distributed via employer notice boards and labour contractors may close this gap.',
    dataPoints: 'Registration density by district · language survey data',
  },
]
// ─────────────────────────────────────────────────────────────────────────────

interface InsightCardProps {
  insight: Insight
}

const sectionMeta = {
  observed: {
    label: 'OBSERVED',
    badgeBg: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    headerBg: 'bg-green-50',
  },
  trend: {
    label: 'POTENTIAL TREND',
    badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
    headerBg: 'bg-amber-50',
  },
  recommendation: {
    label: 'RECOMMENDATION',
    badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    headerBg: 'bg-blue-50',
  },
}

function InsightCard({ insight }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const meta = sectionMeta[insight.section]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${meta.dot}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.badgeBg}`}>
              {meta.label}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed font-medium">{insight.text}</p>

        {expanded && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed">{insight.detail}</p>
          </div>
        )}
      </div>
      <div className="px-5 pb-4 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          Based on: <span className="font-medium text-gray-500">{insight.dataPoints}</span>
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition-colors"
        >
          {expanded ? (
            <>Less detail <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>More detail <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      </div>
    </div>
  )
}

interface ToastState {
  visible: boolean
  message: string
}

export default function AIInsights() {
  const { t } = useTranslation()
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '' })

  const observed = INSIGHTS.filter((i) => i.section === 'observed')
  const trends = INSIGHTS.filter((i) => i.section === 'trend')
  const recommendations = INSIGHTS.filter((i) => i.section === 'recommendation')

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setToast({ visible: true, message: 'Insights refreshed successfully.' })
      setTimeout(() => setToast({ visible: false, message: '' }), 3500)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            {t('nav_insights')}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1 font-medium">
              <Sparkles className="h-3 w-3" />
              Powered by IBM Granite · IBM watsonx.ai
            </span>
          </div>
        </div>

        {/* Language selector & controls */}
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSelector />
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
            <option>Gujarat</option>
            <option>Maharashtra</option>
            <option>All States</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
            <option>All Sectors</option>
            <option>Construction</option>
            <option>Textiles</option>
            <option>Diamond</option>
            <option>Manufacturing</option>
          </select>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <span className="text-lg leading-none mt-0.5">🤖</span>
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Disclaimer:</span> Insights are AI-generated summaries of aggregated, anonymized data. Potential trends require official verification. The AI does not make legal conclusions or accusations.
        </p>
      </div>

      {/* Section 1: Workforce Overview */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">📊 Workforce Overview</h2>
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">
            {observed.length} insights
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {observed.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      {/* Section 2: Potential Issues */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">⚠ Potential Issues</h2>
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">
            {trends.length} insights
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {trends.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      {/* Section 3: Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">💡 Recommendations</h2>
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">
            {recommendations.length} insights
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {recommendations.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      {/* Generate New Insights */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-colors"
        >
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate New Insights
            </>
          )}
        </button>
      </div>

      {/* Data Quality Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Quality &amp; Coverage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-gray-700">Last Updated</span>
            <span>Today at 9:00 AM</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-gray-700">Coverage</span>
            <span>12,847 workers · 347 grievances · 1,203 wage alerts</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-gray-700">Privacy Note</span>
            <span>All personal data is aggregated and anonymized for AI analysis</span>
          </div>
        </div>
      </div>
    </div>
  )
}
