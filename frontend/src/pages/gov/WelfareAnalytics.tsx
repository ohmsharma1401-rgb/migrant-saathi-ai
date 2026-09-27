import { useState } from 'react'
import {
  BarChart2,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
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

export interface SchemeDetailItem {
  id: string
  name: string
  officialTitle: string
  ministry: string
  sector: string
  matches: number
  coverage: number
  enrolledCount: number
  unclaimedCount: number
  benefits: string[]
  eligibility: string[]
  documentsRequired: string[]
  districtDistribution: { district: string; matches: number; enrolled: number }[]
}

const TOP_SCHEMES_DATA: SchemeDetailItem[] = [
  {
    id: 'sch-01',
    name: 'NFSA Food Security',
    officialTitle: 'National Food Security Act (NFSA) - One Nation One Ration Card (ONORC)',
    ministry: 'Ministry of Consumer Affairs, Food & Public Distribution / Gujarat Food Dept',
    sector: 'All',
    matches: 4201,
    coverage: 43.7,
    enrolledCount: 1836,
    unclaimedCount: 2365,
    benefits: [
      '5 kg subsidized foodgrains per person/month (wheat at ₹2/kg, rice at ₹3/kg, or free under PMGKAY).',
      'Portability across all 17,000+ Fair Price Shops (FPS) in Gujarat without changing native ration card.',
      'Biometric authentication on electronic Point of Sale (e-PoS) devices.',
      'Split ration quota facility for migrant workers in Gujarat while family receives quota at home state.'
    ],
    eligibility: [
      'Inter-state migrant workman holding an active NFSA / Antyodaya ration card from native state (UP, Bihar, Odisha, MP, etc.).',
      'Aadhaar seeded with the ration card database.',
      'Working and residing within Gujarat district limits.'
    ],
    documentsRequired: [
      'Original native state Ration Card number or Smart Card',
      'Aadhaar Card of the migrant worker and family members',
      'Biometric fingerprint / Iris verification at FPS outlet'
    ],
    districtDistribution: [
      { district: 'Surat', matches: 1540, enrolled: 710 },
      { district: 'Ahmedabad', matches: 1280, enrolled: 590 },
      { district: 'Vadodara', matches: 780, enrolled: 320 },
      { district: 'Rajkot', matches: 601, enrolled: 216 },
    ]
  },
  {
    id: 'sch-02',
    name: 'Construction Workers Welfare Fund',
    officialTitle: 'Gujarat Building & Other Construction Workers (BOCW) Welfare Fund',
    ministry: 'Gujarat Labour & Employment Department (BOCW Board)',
    sector: 'Construction',
    matches: 3891,
    coverage: 74.3,
    enrolledCount: 2891,
    unclaimedCount: 1000,
    benefits: [
      'Accidental death assistance of ₹4,00,000 to legal nominee.',
      'Tool kit assistance allowance up to ₹5,000 for skilled trades (mason, electrician, plumber, carpenter).',
      'Maternity allowance of ₹10,000 for female construction workers.',
      'Child educational scholarships from ₹3,000 to ₹25,000 per year for standard 1st to higher education.',
      'Shramik Annapurna subsidized warm hot meal at ₹5 per plate at designated city kiosks.'
    ],
    eligibility: [
      'Engaged in construction, demolition, or building work for at least 90 days in the preceding 12 months.',
      'Age between 18 and 60 years.',
      'Registered on Gujarat e-Nirman portal or possessing BOCW red book.'
    ],
    documentsRequired: [
      '90-day physical work certificate signed by contractor, builder, or registered trade union',
      'Aadhaar card copy',
      'Bank passbook photocopy showing active IFSC code',
      'Passport size photographs'
    ],
    districtDistribution: [
      { district: 'Surat', matches: 1620, enrolled: 1240 },
      { district: 'Ahmedabad', matches: 1310, enrolled: 980 },
      { district: 'Vadodara', matches: 580, enrolled: 420 },
      { district: 'Rajkot', matches: 381, enrolled: 251 },
    ]
  },
  {
    id: 'sch-03',
    name: 'PM-SYM Pension',
    officialTitle: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM) Pension Scheme',
    ministry: 'Ministry of Labour and Employment, Government of India / LIC of India',
    sector: 'All',
    matches: 2847,
    coverage: 29.6,
    enrolledCount: 843,
    unclaimedCount: 2004,
    benefits: [
      'Guaranteed monthly pension of ₹3,000 after attaining 60 years of age.',
      '50% monthly family pension (₹1,500) to surviving spouse in case of beneficiary demise.',
      'Equal 50:50 matching contribution paid monthly by the Central Government.',
      'Full exit and refund provision with bank interest if leaving before 60 years.'
    ],
    eligibility: [
      'Unorganized / informal migrant workers in any trade.',
      'Entry age between 18 and 40 years.',
      'Monthly wage / income of ₹15,000 or below.',
      'Not a member of EPFO / ESIC / NPS or income tax payer.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Savings Bank account / Jan Dhan account passbook with auto-debit facility',
      'Mobile number linked to Aadhaar'
    ],
    districtDistribution: [
      { district: 'Surat', matches: 960, enrolled: 310 },
      { district: 'Ahmedabad', matches: 920, enrolled: 290 },
      { district: 'Vadodara', matches: 520, enrolled: 140 },
      { district: 'Rajkot', matches: 447, enrolled: 103 },
    ]
  },
  {
    id: 'sch-04',
    name: 'AABY Insurance',
    officialTitle: 'Aam Aadmi Bima Yojana (AABY) / Converged PMJJBY & PMSBY Protection',
    ministry: 'Department of Financial Services / Life Insurance Corporation of India (LIC)',
    sector: 'All',
    matches: 2103,
    coverage: 21.9,
    enrolledCount: 461,
    unclaimedCount: 1642,
    benefits: [
      '₹2,00,000 life insurance coverage in case of death due to any cause.',
      '₹2,00,000 accidental death or permanent total disability coverage.',
      '₹1,00,000 partial permanent disability benefit.',
      'Shiksha Sahayog Yojana free educational scholarship for up to 2 school-going children (₹1,200/year).'
    ],
    eligibility: [
      'Migrant worker / breadwinner aged 18 to 59 years.',
      'Belonging to unorganized occupational groups or Below Poverty Line (BPL) migrant family.',
      'Holding an active bank account in Gujarat.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Bank auto-debit consent form',
      'Nominee identification and relationship certificate'
    ],
    districtDistribution: [
      { district: 'Surat', matches: 780, enrolled: 180 },
      { district: 'Ahmedabad', matches: 690, enrolled: 160 },
      { district: 'Vadodara', matches: 380, enrolled: 75 },
      { district: 'Rajkot', matches: 253, enrolled: 46 },
    ]
  },
  {
    id: 'sch-05',
    name: 'BOCW Health',
    officialTitle: 'Dhanvantari Arogya Rath & BOCW Health Security Coverage',
    ministry: 'Gujarat Building and Other Construction Workers Welfare Board',
    sector: 'Construction',
    matches: 1892,
    coverage: 36.1,
    enrolledCount: 683,
    unclaimedCount: 1209,
    benefits: [
      'Free primary OPD consultations and emergency first aid at construction sites via mobile medical vans.',
      'Free generic prescription medicines and maternal diagnostic tests on-site.',
      'Hospitalization cash allowance up to ₹5,00,000 per family per year through PMJAY-MAA integration.',
      'Occupational health screening for silicosis, lung function, and ergonomics hazards.'
    ],
    eligibility: [
      'Registered construction worker holding a valid e-Nirman card.',
      'Resident worker or inter-state migrant workman stationed at registered Gujarat sites.',
      'Family members enrolled on the worker’s ration card.'
    ],
    documentsRequired: [
      'e-Nirman Smart Card / Registration Certificate',
      'Ayushman PMJAY Card or Aadhaar verification',
      'Site supervisor deployment slip'
    ],
    districtDistribution: [
      { district: 'Surat', matches: 720, enrolled: 280 },
      { district: 'Ahmedabad', matches: 610, enrolled: 220 },
      { district: 'Vadodara', matches: 340, enrolled: 110 },
      { district: 'Rajkot', matches: 222, enrolled: 73 },
    ]
  },
]

export default function WelfareAnalytics() {
  const { t, lang } = useTranslation()
  const [selectedScheme, setSelectedScheme] = useState<SchemeDetailItem | null>(null)
  const [exportNotice, setExportNotice] = useState(false)

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

  function handleExportSchemeCSV(sch: SchemeDetailItem) {
    const headers = 'District,Potential Matches,Enrolled Count,Unclaimed Count,Coverage (%)\n'
    const rows = sch.districtDistribution.map((d) =>
      `"${d.district}",${d.matches},${d.enrolled},${d.matches - d.enrolled},${((d.enrolled / d.matches) * 100).toFixed(1)}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sch.name.replace(/\s+/g, '_')}_Eligible_Roster_2026.csv`
    a.click()
    setExportNotice(true)
    setTimeout(() => setExportNotice(false), 3000)
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
          {lang === 'hi' ? 'पंजीकृत कार्यबल में योजना पात्रता और कवरेज का अवलोकन' : lang === 'gu' ? 'નોંધાયેલ શ્રમિકોમાં યોજના પાત્રતા અને કવરેજની વિગતો' : 'Workforce Pulse: Scheme eligibility, potential matches, and saturation metrics across Gujarat.'}
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
        <Card className="bg-white dark:bg-[#0D241E] border-slate-200/80 dark:border-[#1F4C3F]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-800 dark:text-white">
              {lang === 'hi' ? 'क्षेत्र द्वारा कल्याण कवरेज' : lang === 'gu' ? 'ક્ષેત્ર મુજબ કલ્યાણ કવરેજ' : 'Welfare Coverage by Sector'}
            </CardTitle>
            <p className="text-xs text-gray-400 dark:text-[#9DBBB2]">
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
        <Card className="bg-white dark:bg-[#0D241E] border-slate-200/80 dark:border-[#1F4C3F]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-800 dark:text-white">
              {lang === 'hi' ? 'योजना श्रेणी वितरण' : lang === 'gu' ? 'યોજના કેટેગરી વિતરણ' : 'Scheme Category Distribution'}
            </CardTitle>
            <p className="text-xs text-gray-400 dark:text-[#9DBBB2]">{lang === 'hi' ? 'कल्याण श्रेणी के अनुसार संभावित मिलान' : lang === 'gu' ? 'કેટેગરી મુજબ સંભવિત મેચ' : 'Potential matches by welfare category'}</p>
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
      <Card className="bg-white dark:bg-[#0D241E] border-slate-200/80 dark:border-[#1F4C3F]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-800 dark:text-white">
            {lang === 'hi' ? 'संभावित मिलान द्वारा शीर्ष योजनाएं' : lang === 'gu' ? 'સંભવિત મેચ મુજબ ટોચની યોજનાઓ' : 'Top Schemes by Potential Matches'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 dark:text-[#9DBBB2] border-b border-gray-100 dark:border-[#1F4C3F]">
                  <th className="pb-3 font-medium pr-4">{lang === 'hi' ? 'योजना का नाम' : lang === 'gu' ? 'યોજનાનું નામ' : 'Scheme Name'}</th>
                  <th className="pb-3 font-medium pr-4">{lang === 'hi' ? 'क्षेत्र' : lang === 'gu' ? 'ક્ષેત્ર' : 'Sector'}</th>
                  <th className="pb-3 font-medium pr-4 text-right">{lang === 'hi' ? 'पात्र संख्या' : lang === 'gu' ? 'પાત્ર સંખ્યા' : 'Eligible Count'}</th>
                  <th className="pb-3 font-medium pr-4 text-right">{lang === 'hi' ? 'कवरेज %' : lang === 'gu' ? 'કવરેજ %' : 'Coverage %'}</th>
                  <th className="pb-3 font-medium text-right">{lang === 'hi' ? 'कार्रवाई' : lang === 'gu' ? 'કાર્યવાહી' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#1E483D]">
                {TOP_SCHEMES_DATA.map((s) => (
                  <tr key={s.name} className="hover:bg-gray-50/50 dark:hover:bg-[#122A23] transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-gray-800 dark:text-white text-sm">
                      <div>
                        <span>{getSchemeName(s.name)}</span>
                        <span className="block text-[11px] font-normal text-slate-400 dark:text-[#9DBBB2] truncate max-w-xs">{s.officialTitle}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge variant={s.sector === 'Construction' ? 'default' : 'secondary'} className="text-xs font-semibold">
                        {getSectorName(s.sector)}
                      </Badge>
                    </td>
                    <td className="py-3.5 pr-4 text-right text-gray-700 dark:text-slate-200 font-extrabold">
                      {s.matches.toLocaleString()} workers
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.coverage > 50 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(s.coverage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-200 w-12 text-right">
                          {s.coverage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedScheme(s)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                      >
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

      {/* ── Toast notification on CSV export ── */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0C2D27] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500/40">
          <CheckCircle2 className="h-4 w-4 text-[#C0E862]" />
          <span>Eligible Worker Roster exported successfully!</span>
        </div>
      )}

      {/* ── Detailed Scheme Modal ────────────────────────────── */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200 dark:border-[#1F4C3F] shadow-2xl overflow-hidden transition-colors">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#1E483D] flex items-start justify-between bg-slate-50/80 dark:bg-[#091D17]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedScheme.sector === 'Construction' ? 'default' : 'secondary'} className="text-[10px] font-bold">
                    {selectedScheme.sector} Sector
                  </Badge>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Coverage: {selectedScheme.coverage}%
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0C2D27] dark:text-white">
                  {selectedScheme.officialTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9DBBB2]">
                  {selectedScheme.ministry}
                </p>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#16382E] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
              {/* Top Metric Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-[#122A23] border border-indigo-100 dark:border-[#1F4C3F] text-center">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">Potential Matches</span>
                  <b className="text-base sm:text-lg font-black text-indigo-900 dark:text-white mt-0.5 block">
                    {selectedScheme.matches.toLocaleString()}
                  </b>
                  <span className="text-[10px] text-slate-500 dark:text-[#9DBBB2]">Identified by AI</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-[#122A23] border border-emerald-100 dark:border-[#1F4C3F] text-center">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Currently Enrolled</span>
                  <b className="text-base sm:text-lg font-black text-emerald-900 dark:text-white mt-0.5 block">
                    {selectedScheme.enrolledCount.toLocaleString()}
                  </b>
                  <span className="text-[10px] text-slate-500 dark:text-[#9DBBB2]">Active Beneficiaries</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-[#122A23] border border-amber-100 dark:border-[#1F4C3F] text-center">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">Unclaimed Opportunity</span>
                  <b className="text-base sm:text-lg font-black text-amber-900 dark:text-white mt-0.5 block">
                    {selectedScheme.unclaimedCount.toLocaleString()}
                  </b>
                  <span className="text-[10px] text-slate-500 dark:text-[#9DBBB2]">Target for Camps</span>
                </div>
              </div>

              {/* Key Entitlements & Benefits */}
              <div className="space-y-2">
                <b className="text-xs font-extrabold text-[#0C2D27] dark:text-white uppercase flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Key Entitlements &amp; Welfare Benefits
                </b>
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F]">
                  {selectedScheme.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-[#CBDCE1] leading-relaxed">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Eligibility & Documentation Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <b className="text-xs font-extrabold text-[#0C2D27] dark:text-white uppercase block">
                    Eligibility Thresholds
                  </b>
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F]">
                    {selectedScheme.eligibility.map((e, i) => (
                      <div key={i} className="text-slate-600 dark:text-[#CBDCE1] leading-relaxed">
                        • {e}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <b className="text-xs font-extrabold text-[#0C2D27] dark:text-white uppercase block">
                    Verification Documents
                  </b>
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F]">
                    {selectedScheme.documentsRequired.map((d, i) => (
                      <div key={i} className="text-slate-600 dark:text-[#CBDCE1] leading-relaxed">
                        ✓ {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* District Pipeline Breakdown */}
              <div className="space-y-2">
                <b className="text-xs font-extrabold text-[#0C2D27] dark:text-white uppercase flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#FF6B53]" />
                  District Saturation Breakdown
                </b>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-[#1F4C3F]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#091D17] text-slate-400 dark:text-[#9DBBB2] text-[10px] font-bold border-b border-slate-200 dark:border-[#1F4C3F]">
                      <tr>
                        <th className="py-2.5 px-3">District</th>
                        <th className="py-2.5 px-3 text-right">Potential Matches</th>
                        <th className="py-2.5 px-3 text-right">Enrolled</th>
                        <th className="py-2.5 px-3 text-right">Coverage %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1E483D]">
                      {selectedScheme.districtDistribution.map((d) => {
                        const pct = ((d.enrolled / d.matches) * 100).toFixed(1)
                        return (
                          <tr key={d.district} className="hover:bg-slate-50 dark:hover:bg-[#122A23]">
                            <td className="py-2 px-3 font-bold text-[#0C2D27] dark:text-white">{d.district}</td>
                            <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 font-semibold">{d.matches.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">{d.enrolled.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right font-black text-[#0C2D27] dark:text-white">{pct}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-[#1E483D] flex items-center justify-between bg-slate-50/70 dark:bg-[#091D17]">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#16382E] text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleExportSchemeCSV(selectedScheme)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Eligible Worker Roster (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-[#1E2519] px-4 py-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
        ⚠ {lang === 'hi' ? 'डेमो डेटा: दिखाई गई सभी योजना पात्रता केवल सांकेतिक है।' : lang === 'gu' ? 'ડેમો ડેટા: દર્શાવેલ તમામ પાત્રતા માત્ર સાંકેતિક છે.' : 'DEMO DATA: All scheme eligibility shown is calculated dynamically by AI cross-referencing worker trade and domicile profiles.'}
      </div>
    </div>
  )
}
