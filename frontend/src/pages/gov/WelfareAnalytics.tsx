import { BarChart2, Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/utils/translations'

// ─── Demo data ─────────────────────────────────────────────────────────────────
const SECTOR_COVERAGE = [
  { sector: 'Construction', pct: 74 },
  { sector: 'Textiles',     pct: 61 },
  { sector: 'Diamond',      pct: 55 },
  { sector: 'Manufacturing',pct: 48 },
  { sector: 'Agriculture',  pct: 39 },
  { sector: 'Domestic',     pct: 31 },
]

const SCHEME_CATEGORIES = [
  { name: 'Insurance',  value: 2103 },
  { name: 'Food',       value: 4201 },
  { name: 'Health',     value: 1892 },
  { name: 'Pension',    value: 2847 },
  { name: 'Housing',    value: 1369 },
]

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

const TOP_SCHEMES = [
  { name: 'NFSA Food Security',                  sector: 'All',          matches: 4201, coverage: 43.7 },
  { name: 'Construction Workers Welfare Fund',   sector: 'Construction', matches: 3891, coverage: 74.3 },
  { name: 'PM-SYM Pension',                      sector: 'All',          matches: 2847, coverage: 29.6 },
  { name: 'AABY Insurance',                      sector: 'All',          matches: 2103, coverage: 21.9 },
  { name: 'BOCW Health',                         sector: 'Construction', matches: 1892, coverage: 36.1 },
]

export default function WelfareAnalytics() {
  const { t, lang } = useTranslation()

  function getSchemeName(name: string) {
    if (lang === 'hi') {
      if (name.includes('NFSA')) return 'एनएफएसए खाद्य सुरक्षा'
      if (name.includes('Construction Workers')) return 'निर्माण श्रमिक कल्याण कोष'
      if (name.includes('PM-SYM')) return 'पीएम-एसवाईएम पेंशन'
      if (name.includes('AABY')) return 'एएबीवाई बीमा'
      if (name.includes('BOCW Health')) return 'BOCW स्वास्थ्य योजना'
    }
    if (lang === 'gu') {
      if (name.includes('NFSA')) return 'NFSA અન્ન સુરક્ષા'
      if (name.includes('Construction Workers')) return 'બાંધકામ શ્રમિક કલ્યાણ ફંડ'
      if (name.includes('PM-SYM')) return 'PM-SYM પેન્શન'
      if (name.includes('AABY')) return 'AABY વીમો'
      if (name.includes('BOCW Health')) return 'BOCW આરોગ્ય યોજના'
    }
    return name
  }

  function getSectorName(sec: string) {
    if (lang === 'hi') {
      if (sec === 'Construction') return 'निर्माण'
      if (sec === 'All') return 'सभी'
      return sec
    }
    if (lang === 'gu') {
      if (sec === 'Construction') return 'બાંધકામ'
      if (sec === 'All') return 'તમામ'
      return sec
    }
    return sec
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <span>{t('nav_gov_analytics')}</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {lang === 'hi' ? 'पंजीकृत कार्यबल में योजना पात्रता और कवरेज का अवलोकन' : lang === 'gu' ? 'નોંધાયેલ શ્રમિકોમાં યોજના પાત્રતા અને કવરેજની વિગતો' : 'Scheme eligibility and coverage overview across the registered workforce'}
        </p>
      </div>

      {/* ── Summary cards ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={lang === 'hi' ? 'कुल सक्रिय योजनाएं' : lang === 'gu' ? 'કુલ સક્રિય યોજનાઓ' : 'Total Schemes Active'}
          value="24"
          icon={CheckCircle}
        />
        <StatCard
          label={lang === 'hi' ? 'संभावित मिलान उत्पन्न' : lang === 'gu' ? 'સંભવિત મેચ' : 'Potential Matches Generated'}
          value="8,412"
          icon={TrendingUp}
          trend="up"
          change={12}
        />
        <StatCard
          label={lang === 'hi' ? '≥1 योजना वाले श्रमिक' : lang === 'gu' ? '≥૧ યોજના વાળા શ્રમિકો' : 'Workers with ≥1 Match'}
          value="6,234"
          icon={Users}
          trend="up"
          change={8}
        />
        <StatCard
          label={lang === 'hi' ? 'अनदावा अवसर' : lang === 'gu' ? 'અનક્લેઇમ તકો' : 'Unclaimed Opportunities'}
          value="4,389"
          icon={AlertTriangle}
          iconClassName="bg-amber-50"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart — coverage by sector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-800">
              {lang === 'hi' ? 'क्षेत्र द्वारा कल्याण कवरेज' : lang === 'gu' ? 'ક્ષેત્ર મુજબ કલ્યાણ કવરેજ' : 'Welfare Coverage by Sector'}
            </CardTitle>
            <p className="text-xs text-gray-400">
              {lang === 'hi' ? 'कम से कम एक योजना वाले श्रमिकों का %' : lang === 'gu' ? 'ઓછામાં ઓછી એક યોજના વાળા શ્રમિકોના %' : '% of workers with at least one potential scheme match'}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={SECTOR_COVERAGE}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="sector"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, 'Coverage']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="pct" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart — scheme category distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-800">
              {lang === 'hi' ? 'योजना श्रेणी वितरण' : lang === 'gu' ? 'યોજના કેટેગરી વિતરણ' : 'Scheme Category Distribution'}
            </CardTitle>
            <p className="text-xs text-gray-400">{lang === 'hi' ? 'कल्याण श्रेणी के अनुसार संभावित मिलान' : lang === 'gu' ? 'કેટેગરી મુજબ સંભવિત મેચ' : 'Potential matches by welfare category'}</p>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={SCHEME_CATEGORIES}
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={2}
                >
                  {SCHEME_CATEGORIES.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString(), 'Matches']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Top schemes table ────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-800">
            {lang === 'hi' ? 'संभावित मिलान द्वारा शीर्ष योजनाएं' : lang === 'gu' ? 'સંભવિત મેચ મુજબ ટોચની યોજનાઓ' : 'Top Schemes by Potential Matches'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium pr-4">{lang === 'hi' ? 'योजना का नाम' : lang === 'gu' ? 'યોજનાનું નામ' : 'Scheme Name'}</th>
                  <th className="pb-3 font-medium pr-4">{lang === 'hi' ? 'क्षेत्र' : lang === 'gu' ? 'ક્ષેત્ર' : 'Sector'}</th>
                  <th className="pb-3 font-medium pr-4 text-right">{lang === 'hi' ? 'पात्र संख्या' : lang === 'gu' ? 'પાત્ર સંખ્યા' : 'Eligible Count'}</th>
                  <th className="pb-3 font-medium pr-4 text-right">{lang === 'hi' ? 'कवरेज %' : lang === 'gu' ? 'કવરેજ %' : 'Coverage %'}</th>
                  <th className="pb-3 font-medium text-right">{lang === 'hi' ? 'कार्रवाई' : lang === 'gu' ? 'કાર્યવાહી' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TOP_SCHEMES.map((s) => (
                  <tr key={s.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-800 text-sm">{getSchemeName(s.name)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={s.sector === 'Construction' ? 'default' : 'secondary'} className="text-xs">
                        {getSectorName(s.sector)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-right text-gray-700 font-semibold">
                      {s.matches.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(s.coverage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-10 text-right">
                          {s.coverage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer">
                        {lang === 'hi' ? 'विवरण देखें' : lang === 'gu' ? 'વિગતો જુઓ' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 font-medium">
        ⚠ {lang === 'hi' ? 'डेमो डेटा: दिखाई गई सभी योजना पात्रता केवल सांकेतिक है।' : lang === 'gu' ? 'ડેમો ડેટા: દર્શાવેલ તમામ પાત્રતા માત્ર સાંકેતિક છે.' : 'DEMO DATA: All scheme eligibility shown is indicative only.'}
      </div>
    </div>
  )
}
