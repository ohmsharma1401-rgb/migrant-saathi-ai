import { useState } from 'react'
import { Search, Plus, Filter, Download, MoreHorizontal, Building2, Users, ChevronRight, FileText, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@/utils/translations'

const WORKER_REGISTRY = [
  { id: '#GR-24841', issue: 'Unpaid wages', worker: 'Ramesh Kumar', district: 'Surat', company: 'Shree Construction Ltd.', priority: 'High', priorityBg: 'bg-red-50 text-red-700 border-red-200' },
  { id: '#GR-24836', issue: 'Unsafe workplace', worker: 'Mohd. Irfan', district: 'Ahmedabad', company: 'Reliance Textile Unit', priority: 'High', priorityBg: 'bg-red-50 text-red-700 border-red-200' },
  { id: '#GR-24819', issue: 'Scheme access', worker: 'Sunita Devi', district: 'Vadodara', company: 'L&T Project Site #4', priority: 'Medium', priorityBg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: '#GR-24804', issue: 'ID verification', worker: 'Ajay Munda', district: 'Rajkot', company: 'Rajkot Auto Components', priority: 'Normal', priorityBg: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: '#GR-24792', issue: 'Overtime pay theft', worker: 'Rajesh Sharma', district: 'Surat', company: 'Surat Diamond Craft', priority: 'High', priorityBg: 'bg-red-50 text-red-700 border-red-200' },
  { id: '#GR-24785', issue: 'BOCW registration', worker: 'Kavita Patel', district: 'Ahmedabad', company: 'Shree Construction Ltd.', priority: 'Normal', priorityBg: 'bg-sky-50 text-sky-700 border-sky-200' },
]

interface RegisteredCompany {
  id: string
  code: string
  name: string
  district: string
  sector: string
  registeredEmployees: number
  complianceScore: number
  safetyRating: string
  contactPerson: string
  address: string
  sampleWorkers: string[]
}

const REGISTERED_COMPANIES: RegisteredCompany[] = [
  {
    id: 'c1',
    code: 'CMP-GJ-0481',
    name: 'Shree Construction Ltd.',
    district: 'Surat',
    sector: 'Construction',
    registeredEmployees: 1420,
    complianceScore: 98,
    safetyRating: 'A+ Verified',
    contactPerson: 'Rajesh Shah (HR Head)',
    address: 'Plot 42, GIDC Industrial Estate, Hazira, Surat',
    sampleWorkers: ['Ramesh Kumar (Mason)', 'Kavita Patel (Supervisor)', 'Vikram Singh (Steel Fixer)'],
  },
  {
    id: 'c2',
    code: 'CMP-GJ-0112',
    name: 'Reliance Textile & Fabrics Unit',
    district: 'Ahmedabad',
    sector: 'Textiles',
    registeredEmployees: 1180,
    complianceScore: 95,
    safetyRating: 'A Verified',
    contactPerson: 'Viren Patel (Operations Director)',
    address: 'Naroda GIDC Phase 3, Ahmedabad',
    sampleWorkers: ['Mohd. Irfan (Weaver)', 'Sunita Devi (Spinner)', 'Animesh Roy (Dyer)'],
  },
  {
    id: 'c3',
    code: 'CMP-GJ-0923',
    name: 'L&T Infrastructure Project Site #4',
    district: 'Vadodara',
    sector: 'Construction',
    registeredEmployees: 950,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    contactPerson: 'Sanjay Verma (Site Manager)',
    address: 'Makarpura Industrial Zone, Vadodara',
    sampleWorkers: ['Sunita Devi (Fitter)', 'Pradeep Mishra (Operator)', 'Dinesh Sahu (Welder)'],
  },
  {
    id: 'c4',
    code: 'CMP-GJ-0544',
    name: 'Surat Diamond Craft Industries',
    district: 'Surat',
    sector: 'Diamond',
    registeredEmployees: 840,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    contactPerson: 'Ketan Dholakia (Owner)',
    address: 'Katargam Diamond Hub, Surat',
    sampleWorkers: ['Rajesh Sharma (Polisher)', 'Mahesh Solanki (Cutter)', 'Arjun Meena (Packer)'],
  },
  {
    id: 'c5',
    code: 'CMP-GJ-0782',
    name: 'Adani Logistics & Manufacturing Port Unit',
    district: 'Kutch',
    sector: 'Manufacturing',
    registeredEmployees: 760,
    complianceScore: 99,
    safetyRating: 'A+ Verified',
    contactPerson: 'Anil Mehta (EHS Manager)',
    address: 'Mundra Port SEZ Sector 2, Kutch',
    sampleWorkers: ['Suresh Yadav (Rig Driver)', 'Pankaj Kumar (Loader)', 'Devendra Paul (Technician)'],
  },
  {
    id: 'c6',
    code: 'CMP-GJ-0319',
    name: 'Rajkot Auto Components Ltd.',
    district: 'Rajkot',
    sector: 'Manufacturing',
    registeredEmployees: 520,
    complianceScore: 91,
    safetyRating: 'A Verified',
    contactPerson: 'Pravin Randeria (GM)',
    address: 'Metoda GIDC Industrial Area, Rajkot',
    sampleWorkers: ['Ajay Munda (Lathe Operator)', 'Birendra Sah (Toolroom Assistant)'],
  },
]

export default function WorkerDirectory() {
  const { t, lang } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'workers' | 'companies'>('companies')
  const [selectedCompany, setSelectedCompany] = useState<RegisteredCompany | null>(null)

  function getSectorName(sec: string) {
    if (lang === 'hi') {
      if (sec === 'Construction') return 'निर्माण'
      if (sec === 'Textiles') return 'कपड़ा'
      if (sec === 'Diamond') return 'हीरा'
      if (sec === 'Manufacturing') return 'विनिर्माण'
      return sec
    }
    if (lang === 'gu') {
      if (sec === 'Construction') return 'બાંધકામ'
      if (sec === 'Textiles') return 'ટેક્સટાઇલ'
      if (sec === 'Diamond') return 'હીરા'
      if (sec === 'Manufacturing') return 'મેન્યુફેક્ચરિંગ'
      return sec
    }
    return sec
  }

  function getIssueText(issue: string) {
    if (lang === 'hi') {
      if (issue === 'Unpaid wages') return 'अवैतनिक मजदूरी'
      if (issue === 'Unsafe workplace') return 'असुरक्षित कार्यस्थल'
      if (issue === 'Scheme access') return 'योजना पहुंच'
      if (issue === 'ID verification') return 'आईडी सत्यापन'
      if (issue === 'Overtime pay theft') return 'ओवरटाइम वेतन चोरी'
      if (issue === 'BOCW registration') return 'BOCW पंजीकरण'
      return issue
    }
    if (lang === 'gu') {
      if (issue === 'Unpaid wages') return 'અણચૂકવાયેલ વેતન'
      if (issue === 'Unsafe workplace') return 'અસુરક્ષિત કાર્યસ્થળ'
      if (issue === 'Scheme access') return 'યોજના સુવિધા'
      if (issue === 'ID verification') return 'આઇડી ચકાસણી'
      if (issue === 'Overtime pay theft') return 'ઓવરટાઇમ વેતન ચોરી'
      if (issue === 'BOCW registration') return 'BOCW નોંધણી'
      return issue
    }
    return issue
  }

  function getPriorityText(pri: string) {
    if (lang === 'hi') {
      if (pri === 'High') return 'उच्च'
      if (pri === 'Medium') return 'मध्यम'
      if (pri === 'Normal') return 'सामान्य'
      return pri
    }
    if (lang === 'gu') {
      if (pri === 'High') return 'ઉચ્ચ'
      if (pri === 'Medium') return 'મધ્યમ'
      if (pri === 'Normal') return 'સામાન્ય'
      return pri
    }
    return pri
  }

  function getRatingText(rating: string) {
    if (lang === 'hi') {
      if (rating.includes('Verified')) return rating.replace('Verified', 'सत्यापित')
      if (rating.includes('Monitored')) return rating.replace('Monitored', 'निगरानी में')
      return rating
    }
    if (lang === 'gu') {
      if (rating.includes('Verified')) return rating.replace('Verified', 'ચકાસાયેલ')
      if (rating.includes('Monitored')) return rating.replace('Monitored', 'મોનિટર થયેલ')
      return rating
    }
    return rating
  }

  const filteredWorkers = WORKER_REGISTRY.filter(
    (row) =>
      row.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCompanies = REGISTERED_COMPANIES.filter(
    (comp) =>
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.sector.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRegisteredMigrants = REGISTERED_COMPANIES.reduce((sum, c) => sum + c.registeredEmployees, 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
            <span className="w-4 h-[2px] bg-[#FF6B53]" />
            GOVERNMENT WORKFORCE &amp; COMPANY REPOSITORY
          </div>
          <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight">
            {t('nav_gov_workers')}
          </h1>
          <p className="text-xs sm:text-sm text-[#52605D] mt-0.5 font-normal">
            {lang === 'hi'
              ? 'गुजरात भर में पंजीकृत कंपनियों, कुल कर्मचारियों की संख्या और डिजिटल श्रमिक पहचान का ऑडिट करें।'
              : lang === 'gu'
              ? 'ગુજરાતમાં નોંધાયેલ કંપનીઓ, કુલ શ્રમિકોની સંખ્યા અને ડિજિટલ શ્રમિક આઇડીનું ઓડિટ કરો.'
              : 'Audit registered companies, total employee counts, and portable worker identities across Gujarat.'}
          </p>
        </div>

        <button
          onClick={() => alert('Opening Employer Company / Worker Registration Dialog...')}
          className="figma-btn-coral py-3 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{lang === 'hi' ? 'नियोक्ता / श्रमिक पंजीकृत करें' : lang === 'gu' ? 'માલિક / શ્રમિક નોંધો' : 'Register Employer / Worker'}</span>
        </button>
      </div>

      {/* ── Mode Switcher & Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#52605D] uppercase block">
            {lang === 'hi' ? 'पंजीकृत उद्यम' : lang === 'gu' ? 'નોંધાયેલ સાહસો' : 'REGISTERED ENTERPRISES'}
          </span>
          <b className="text-2xl font-black text-[#0C2D27]">
            {REGISTERED_COMPANIES.length} {lang === 'hi' ? 'कंपनियां' : lang === 'gu' ? 'કંપનીઓ' : 'Companies'}
          </b>
        </div>
        <div className="p-4 rounded-3xl bg-[#0C2D27] text-white shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#C0E862] uppercase block">
            {lang === 'hi' ? 'कुल पंजीकृत कर्मचारी' : lang === 'gu' ? 'કુલ નોંધાયેલ શ્રમિકો' : 'TOTAL REGISTERED EMPLOYEES'}
          </span>
          <b className="text-2xl font-black text-white">
            {totalRegisteredMigrants.toLocaleString()} {lang === 'hi' ? 'श्रमिक' : lang === 'gu' ? 'શ્રમિકો' : 'Workers'}
          </b>
        </div>
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">
            {lang === 'hi' ? 'औसत मजदूरी अनुपालन' : lang === 'gu' ? 'સરેરાશ વેતન પાલન' : 'AVERAGE WAGE COMPLIANCE'}
          </span>
          <b className="text-2xl font-black text-emerald-950">
            95.3% {lang === 'hi' ? 'उत्तीर्ण' : lang === 'gu' ? 'પાસ' : 'Passed'}
          </b>
        </div>
      </div>

      {/* ── Search & Filter Control Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'companies'
                ? (lang === 'hi' ? 'कंपनी का नाम, जिला, क्षेत्र द्वारा खोजें...' : lang === 'gu' ? 'કંપનીનું નામ, જિલ્લો, ક્ષેત્ર વડે શોધો...' : 'Search company name, GIDC district, sector...')
                : (lang === 'hi' ? 'श्रमिक का नाम, कंपनी, साथी आईडी द्वारा खोजें...' : lang === 'gu' ? 'શ્રમિકનું નામ, કંપની, સાથી આઇડી વડે શોધો...' : 'Search worker name, company, Saathi ID...')
            }
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white border border-slate-200 text-[#0C2D27] placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B53]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-[#0C2D27] hover:bg-slate-50 transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>{lang === 'hi' ? 'फ़िल्टर' : lang === 'gu' ? 'ફિલ્ટર્સ' : 'Filters'}</span>
          </button>
          <button className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-[#0C2D27] hover:bg-slate-50 transition-colors cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            <span>{lang === 'hi' ? 'CSV निर्यात' : lang === 'gu' ? 'CSV નિકાસ' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Data Table Card ── */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs space-y-6">
        {/* Table View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('companies')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'companies'
                  ? 'border-[#FF6B53] text-[#FF6B53]'
                  : 'border-transparent text-[#52605D] hover:text-[#0C2D27]'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>
                {lang === 'hi' ? 'कंपनी कर्मचारी विवरण' : lang === 'gu' ? 'કંપની શ્રમિક વિગતો' : 'Company Employee Breakdown'} ({filteredCompanies.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'workers'
                  ? 'border-[#FF6B53] text-[#FF6B53]'
                  : 'border-transparent text-[#52605D] hover:text-[#0C2D27]'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>
                {lang === 'hi' ? 'श्रमिक केस निर्देशिका' : lang === 'gu' ? 'શ્રમિક કેસ ડિરેક્ટરી' : 'Worker Case Directory'} ({filteredWorkers.length})
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {lang === 'hi' ? 'सत्यापित सरकारी पोर्टल रिकॉर्ड · लाइव सिंक' : lang === 'gu' ? 'ચકાસાયેલ સરકારી પોર્ટલ રેકોર્ડ્સ · લાઇવ સિંક' : 'Verified Govt Portal Records · Live Sync'}
          </span>
        </div>

        {/* Tab 1: Company Employee Registry */}
        {activeTab === 'companies' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-[#52605D] font-bold">
                  <th className="py-3 px-4">{lang === 'hi' ? 'कंपनी कोड' : lang === 'gu' ? 'કંપની કોડ' : 'COMPANY CODE'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'कंपनी का नाम' : lang === 'gu' ? 'કંપનીનું નામ' : 'COMPANY NAME'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'क्षेत्र' : lang === 'gu' ? 'ક્ષેત્ર' : 'SECTOR'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'जिला' : lang === 'gu' ? 'જિલ્લો' : 'DISTRICT'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'hi' ? 'पंजीकृत कर्मचारी' : lang === 'gu' ? 'નોંધાયેલ શ્રમિકો' : 'REGISTERED EMPLOYEES'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'अनुपालन स्कोर' : lang === 'gu' ? 'પાલન સ્કોર' : 'COMPLIANCE SCORE'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'hi' ? 'कार्रवाई' : lang === 'gu' ? 'કાર્યવાહી' : 'ACTION'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#0C2D27]">{comp.code}</td>
                    <td className="py-4 px-4">
                      <b className="font-bold text-[#0C2D27] block">{comp.name}</b>
                      <span className="text-[10px] text-slate-400 font-normal">{comp.contactPerson}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#0C2D27] text-[10px] font-bold">
                        {getSectorName(comp.sector)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#52605D]">{comp.district}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-[#0C2D27] text-white font-extrabold text-xs inline-block">
                        {comp.registeredEmployees.toLocaleString()} {lang === 'hi' ? 'श्रमिक' : lang === 'gu' ? 'શ્રમિકો' : 'Workers'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {comp.complianceScore}% ({getRatingText(comp.safetyRating)})
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedCompany(comp)}
                        className="figma-btn-coral py-1.5 px-3 text-[11px] font-bold cursor-pointer"
                      >
                        {lang === 'hi' ? 'रोस्टर निरीक्षण करें' : lang === 'gu' ? 'રોસ્ટર ચકાસો' : 'Inspect Roster'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Worker Case Directory */}
        {activeTab === 'workers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-[#52605D] font-bold">
                  <th className="py-3 px-4">{lang === 'hi' ? 'केस आईडी' : lang === 'gu' ? 'કેસ આઇડી' : 'CASE ID'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'श्रमिक' : lang === 'gu' ? 'શ્રમિક' : 'WORKER'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'नियोक्ता कंपनी' : lang === 'gu' ? 'માલિક કંપની' : 'EMPLOYER COMPANY'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'समस्या / रिकॉर्ड' : lang === 'gu' ? 'સમસ્યા / રેકોર્ડ' : 'ISSUE / RECORD'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'जिला' : lang === 'gu' ? 'જિલ્લો' : 'DISTRICT'}</th>
                  <th className="py-3 px-4">{lang === 'hi' ? 'स्थिति' : lang === 'gu' ? 'સ્થિતિ' : 'STATUS'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'hi' ? 'कार्रवाई' : lang === 'gu' ? 'કાર્યવાહી' : 'ACTION'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredWorkers.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0C2D27]">{row.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#0C2D27]">{row.worker}</td>
                    <td className="py-3.5 px-4 text-[#0C2D27] font-medium">{row.company}</td>
                    <td className="py-3.5 px-4 text-[#52605D]">{getIssueText(row.issue)}</td>
                    <td className="py-3.5 px-4 text-[#52605D]">{row.district}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.priorityBg}`}>
                        {getPriorityText(row.priority)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      <button className="p-1 hover:text-[#0C2D27] rounded cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Company Employee Roster Inspection Modal ── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF6B53] uppercase block">
                  {selectedCompany.code} · {lang === 'hi' ? 'कर्मचारी रोस्टर निरीक्षण' : lang === 'gu' ? 'શ્રમિક રોસ્ટર ચકાસણી' : 'EMPLOYEE ROSTER INSPECTION'}
                </span>
                <h3 className="text-xl font-bold text-[#0C2D27] leading-snug">
                  {selectedCompany.name}
                </h3>
                <p className="text-xs text-[#52605D]">{selectedCompany.address}</p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-full text-slate-400 hover:text-[#0C2D27] hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0C2D27] text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">
                    {lang === 'hi' ? 'पंजीकृत प्रवासी श्रमिक' : lang === 'gu' ? 'નોંધાયેલ સ્થળાંતરિત શ્રમિકો' : 'REGISTERED MIGRANT WORKERS'}
                  </span>
                  <b className="text-2xl font-black text-white">
                    {selectedCompany.registeredEmployees.toLocaleString()} {lang === 'hi' ? 'कर्मचारी' : lang === 'gu' ? 'શ્રમિકો' : 'Employees'}
                  </b>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">
                    {lang === 'hi' ? 'ऑडिट रेटिंग' : lang === 'gu' ? 'ઓડિટ રેટિંગ' : 'AUDIT RATING'}
                  </span>
                  <b className="text-sm font-bold text-[#C0E862]">{getRatingText(selectedCompany.safetyRating)}</b>
                </div>
              </div>

              {/* Sample Workers Breakdown */}
              <div className="space-y-2">
                <b className="text-xs font-bold text-[#0C2D27] block">
                  {lang === 'hi' ? 'पंजीकृत मुख्य कर्मचारी व श्रमिक:' : lang === 'gu' ? 'નોંધાયેલ શ્રમિકો અને સ્ટાફ:' : 'Registered Key Staff & Workers:'}
                </b>
                <div className="space-y-2">
                  {selectedCompany.sampleWorkers.map((w, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-semibold text-[#0C2D27]">
                      <span>👤 {w}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        {lang === 'hi' ? 'सत्यापित आईडी' : lang === 'gu' ? 'ચકાસાયેલ આઇડી' : 'Verified ID'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCompany(null)}
                className="figma-btn-coral py-2.5 px-6 text-xs font-bold cursor-pointer"
              >
                {lang === 'hi' ? 'निरीक्षण पूर्ण' : lang === 'gu' ? 'ચકાસણી પૂર્ણ' : 'Done Inspecting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
