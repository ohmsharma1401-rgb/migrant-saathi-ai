import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Filter,
  Download,
  Building2,
  Users,
  CheckCircle2,
  X,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Briefcase,
  Phone,
  MapPin,
  Eye,
  FileSpreadsheet,
  Check,
} from 'lucide-react'
import { useTranslation } from '@/utils/translations'

export interface WorkerRecord {
  id: string
  name: string
  occupation: string
  skillLevel: 'Skilled' | 'Semi-skilled' | 'Unskilled' | 'Highly Skilled'
  sector: 'Construction' | 'Textiles' | 'Diamond' | 'Manufacturing'
  district: string
  company: string
  dailyWage: number
  status: 'Verified' | 'Under Audit' | 'Pending'
  phone: string
  originState: string
  registeredDate: string
  aadhaarLast4: string
}

export interface RegisteredCompany {
  id: string
  code: string
  name: string
  district: string
  sector: 'Construction' | 'Textiles' | 'Diamond' | 'Manufacturing'
  registeredEmployees: number
  complianceScore: number
  safetyRating: string
  contactPerson: string
  address: string
  sampleWorkers: string[]
}

const INITIAL_WORKERS: WorkerRecord[] = [
  {
    id: 'MS-GJ-88219',
    name: 'Ramesh Kumar',
    occupation: 'Mason',
    skillLevel: 'Skilled',
    sector: 'Construction',
    district: 'Surat',
    company: 'Shree Construction Ltd.',
    dailyWage: 550,
    status: 'Verified',
    phone: '+91 98251 44102',
    originState: 'Bihar',
    registeredDate: '12 Jan 2024',
    aadhaarLast4: '4102',
  },
  {
    id: 'MS-GJ-77412',
    name: 'Mohd. Irfan',
    occupation: 'Weaver',
    skillLevel: 'Semi-skilled',
    sector: 'Textiles',
    district: 'Ahmedabad',
    company: 'Reliance Textile Unit',
    dailyWage: 420,
    status: 'Verified',
    phone: '+91 94280 77412',
    originState: 'Uttar Pradesh',
    registeredDate: '04 Mar 2024',
    aadhaarLast4: '7741',
  },
  {
    id: 'MS-GJ-66308',
    name: 'Sunita Devi',
    occupation: 'Industrial Fitter',
    skillLevel: 'Skilled',
    sector: 'Construction',
    district: 'Vadodara',
    company: 'L&T Project Site #4',
    dailyWage: 580,
    status: 'Verified',
    phone: '+91 99042 66308',
    originState: 'Jharkhand',
    registeredDate: '19 Feb 2024',
    aadhaarLast4: '6630',
  },
  {
    id: 'MS-GJ-55194',
    name: 'Ajay Munda',
    occupation: 'Lathe Operator',
    skillLevel: 'Skilled',
    sector: 'Manufacturing',
    district: 'Rajkot',
    company: 'Rajkot Auto Components Ltd.',
    dailyWage: 520,
    status: 'Pending',
    phone: '+91 98791 55194',
    originState: 'Odisha',
    registeredDate: '28 Apr 2024',
    aadhaarLast4: '5519',
  },
  {
    id: 'MS-GJ-44081',
    name: 'Rajesh Sharma',
    occupation: 'Diamond Polisher',
    skillLevel: 'Highly Skilled',
    sector: 'Diamond',
    district: 'Surat',
    company: 'Surat Diamond Craft Industries',
    dailyWage: 780,
    status: 'Under Audit',
    phone: '+91 97123 44081',
    originState: 'Rajasthan',
    registeredDate: '15 Nov 2023',
    aadhaarLast4: '4408',
  },
  {
    id: 'MS-GJ-33970',
    name: 'Kavita Patel',
    occupation: 'Site Supervisor',
    skillLevel: 'Highly Skilled',
    sector: 'Construction',
    district: 'Ahmedabad',
    company: 'Shree Construction Ltd.',
    dailyWage: 850,
    status: 'Verified',
    phone: '+91 98240 33970',
    originState: 'Madhya Pradesh',
    registeredDate: '02 Feb 2024',
    aadhaarLast4: '3397',
  },
  {
    id: 'MS-GJ-22859',
    name: 'Vikram Singh',
    occupation: 'Steel Fixer',
    skillLevel: 'Skilled',
    sector: 'Construction',
    district: 'Surat',
    company: 'Shree Construction Ltd.',
    dailyWage: 540,
    status: 'Verified',
    phone: '+91 94088 22859',
    originState: 'Bihar',
    registeredDate: '22 May 2024',
    aadhaarLast4: '2285',
  },
  {
    id: 'MS-GJ-11748',
    name: 'Pradeep Mishra',
    occupation: 'Welder',
    skillLevel: 'Skilled',
    sector: 'Manufacturing',
    district: 'Vadodara',
    company: 'L&T Project Site #4',
    dailyWage: 620,
    status: 'Under Audit',
    phone: '+91 99740 11748',
    originState: 'Uttar Pradesh',
    registeredDate: '10 Jun 2024',
    aadhaarLast4: '1174',
  },
  {
    id: 'MS-GJ-99637',
    name: 'Arjun Meena',
    occupation: 'Diamond Cutter',
    skillLevel: 'Highly Skilled',
    sector: 'Diamond',
    district: 'Surat',
    company: 'Surat Diamond Craft Industries',
    dailyWage: 750,
    status: 'Verified',
    phone: '+91 98254 99637',
    originState: 'Rajasthan',
    registeredDate: '08 Jan 2024',
    aadhaarLast4: '9963',
  },
  {
    id: 'MS-GJ-88526',
    name: 'Suresh Yadav',
    occupation: 'Heavy Vehicle Operator',
    skillLevel: 'Skilled',
    sector: 'Manufacturing',
    district: 'Kutch',
    company: 'Adani Logistics Port Unit',
    dailyWage: 680,
    status: 'Verified',
    phone: '+91 98795 88526',
    originState: 'Bihar',
    registeredDate: '17 Mar 2024',
    aadhaarLast4: '8852',
  },
  {
    id: 'MS-GJ-77415',
    name: 'Pankaj Kumar',
    occupation: 'Cargo Loader',
    skillLevel: 'Unskilled',
    sector: 'Manufacturing',
    district: 'Kutch',
    company: 'Adani Logistics Port Unit',
    dailyWage: 380,
    status: 'Pending',
    phone: '+91 94261 77415',
    originState: 'Jharkhand',
    registeredDate: '05 Jul 2024',
    aadhaarLast4: '7741',
  },
  {
    id: 'MS-GJ-66304',
    name: 'Dinesh Sahu',
    occupation: 'Plumber',
    skillLevel: 'Skilled',
    sector: 'Construction',
    district: 'Gandhinagar',
    company: 'Shree Construction Ltd.',
    dailyWage: 520,
    status: 'Verified',
    phone: '+91 99099 66304',
    originState: 'Chhattisgarh',
    registeredDate: '14 Apr 2024',
    aadhaarLast4: '6630',
  },
]

const INITIAL_COMPANIES: RegisteredCompany[] = [
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

  // State
  const [workersList, setWorkersList] = useState<WorkerRecord[]>(INITIAL_WORKERS)
  const [companiesList, setCompaniesList] = useState<RegisteredCompany[]>(INITIAL_COMPANIES)
  const [activeTab, setActiveTab] = useState<'workers' | 'companies'>('workers')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter States
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filterDistrict, setFilterDistrict] = useState<string>('All')
  const [filterSector, setFilterSector] = useState<string>('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')

  // Modals & Feedback
  const [selectedCompany, setSelectedCompany] = useState<RegisteredCompany | null>(null)
  const [selectedWorker, setSelectedWorker] = useState<WorkerRecord | null>(null)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Registration Form State
  const [regType, setRegType] = useState<'worker' | 'company'>('worker')
  const [newWorker, setNewWorker] = useState({
    name: '',
    occupation: 'Mason',
    skillLevel: 'Skilled' as const,
    sector: 'Construction' as const,
    district: 'Surat',
    company: 'Shree Construction Ltd.',
    dailyWage: 500,
    phone: '',
    originState: 'Bihar',
  })
  const [newCompany, setNewCompany] = useState({
    name: '',
    code: '',
    district: 'Surat',
    sector: 'Construction' as const,
    registeredEmployees: 100,
    contactPerson: '',
    address: '',
  })

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filterDistrict !== 'All') count++
    if (filterSector !== 'All') count++
    if (filterStatus !== 'All') count++
    return count
  }, [filterDistrict, filterSector, filterStatus])

  function clearAllFilters() {
    setFilterDistrict('All')
    setFilterSector('All')
    setFilterStatus('All')
    setSearchQuery('')
  }

  // Filtered Workers
  const filteredWorkers = useMemo(() => {
    return workersList.filter((w) => {
      // Search matching
      const matchesSearch =
        !searchQuery.trim() ||
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.originState.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter matching
      const matchesDistrict = filterDistrict === 'All' || w.district === filterDistrict
      const matchesSector = filterSector === 'All' || w.sector === filterSector
      const matchesStatus = filterStatus === 'All' || w.status === filterStatus

      return matchesSearch && matchesDistrict && matchesSector && matchesStatus
    })
  }, [workersList, searchQuery, filterDistrict, filterSector, filterStatus])

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((comp) => {
      // Search matching
      const matchesSearch =
        !searchQuery.trim() ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter matching
      const matchesDistrict = filterDistrict === 'All' || comp.district === filterDistrict
      const matchesSector = filterSector === 'All' || comp.sector === filterSector

      return matchesSearch && matchesDistrict && matchesSector
    })
  }, [companiesList, searchQuery, filterDistrict, filterSector])

  // CSV Export Handler
  function handleExportCSV() {
    if (activeTab === 'workers') {
      if (filteredWorkers.length === 0) {
        showToast('No worker records to export with current filters.')
        return
      }

      const headers = [
        'Worker ID',
        'Full Name',
        'Occupation',
        'Skill Level',
        'Sector',
        'District',
        'Current Employer',
        'Daily Wage (INR)',
        'Verification Status',
        'Phone Number',
        'Origin State',
        'Registration Date',
      ]

      const rows = filteredWorkers.map((w) => [
        `"${w.id}"`,
        `"${w.name}"`,
        `"${w.occupation}"`,
        `"${w.skillLevel}"`,
        `"${w.sector}"`,
        `"${w.district}"`,
        `"${w.company.replace(/"/g, '""')}"`,
        w.dailyWage,
        `"${w.status}"`,
        `"${w.phone}"`,
        `"${w.originState}"`,
        `"${w.registeredDate}"`,
      ])

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
      downloadFile(csvContent, `gujarat_migrant_workers_registry_${new Date().toISOString().slice(0, 10)}.csv`)
      showToast(`Exported ${filteredWorkers.length} worker records to CSV successfully.`)
    } else {
      if (filteredCompanies.length === 0) {
        showToast('No company records to export with current filters.')
        return
      }

      const headers = [
        'Company Code',
        'Company Name',
        'District',
        'Sector',
        'Registered Employees',
        'Compliance Score (%)',
        'Safety Rating',
        'Contact Person',
        'Address',
      ]

      const rows = filteredCompanies.map((c) => [
        `"${c.code}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.district}"`,
        `"${c.sector}"`,
        c.registeredEmployees,
        c.complianceScore,
        `"${c.safetyRating}"`,
        `"${c.contactPerson.replace(/"/g, '""')}"`,
        `"${c.address.replace(/"/g, '""')}"`,
      ])

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
      downloadFile(csvContent, `gujarat_registered_enterprises_${new Date().toISOString().slice(0, 10)}.csv`)
      showToast(`Exported ${filteredCompanies.length} enterprise records to CSV successfully.`)
    }
  }

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Handle Register Form Submission
  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (regType === 'worker') {
      if (!newWorker.name.trim()) return
      const createdWorker: WorkerRecord = {
        id: `MS-GJ-${Math.floor(10000 + Math.random() * 90000)}`,
        name: newWorker.name.trim(),
        occupation: newWorker.occupation,
        skillLevel: newWorker.skillLevel,
        sector: newWorker.sector,
        district: newWorker.district,
        company: newWorker.company,
        dailyWage: Number(newWorker.dailyWage) || 500,
        status: 'Verified',
        phone: newWorker.phone || '+91 98000 00000',
        originState: newWorker.originState,
        registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        aadhaarLast4: String(Math.floor(1000 + Math.random() * 9000)),
      }
      setWorkersList([createdWorker, ...workersList])
      setRegisterModalOpen(false)
      setActiveTab('workers')
      showToast(`Worker ${createdWorker.name} (${createdWorker.id}) registered successfully!`)
      setNewWorker({
        name: '',
        occupation: 'Mason',
        skillLevel: 'Skilled',
        sector: 'Construction',
        district: 'Surat',
        company: 'Shree Construction Ltd.',
        dailyWage: 500,
        phone: '',
        originState: 'Bihar',
      })
    } else {
      if (!newCompany.name.trim()) return
      const createdCompany: RegisteredCompany = {
        id: `c-${Date.now()}`,
        code: newCompany.code.trim().toUpperCase() || `CMP-GJ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newCompany.name.trim(),
        district: newCompany.district,
        sector: newCompany.sector,
        registeredEmployees: Number(newCompany.registeredEmployees) || 50,
        complianceScore: 95,
        safetyRating: 'A Verified',
        contactPerson: newCompany.contactPerson || 'Official In-Charge',
        address: newCompany.address || `${newCompany.district} GIDC Industrial Zone, Gujarat`,
        sampleWorkers: ['Initial Roster Worker 1', 'Initial Roster Worker 2'],
      }
      setCompaniesList([createdCompany, ...companiesList])
      setRegisterModalOpen(false)
      setActiveTab('companies')
      showToast(`Enterprise ${createdCompany.name} (${createdCompany.code}) enrolled successfully!`)
      setNewCompany({
        name: '',
        code: '',
        district: 'Surat',
        sector: 'Construction',
        registeredEmployees: 100,
        contactPerson: '',
        address: '',
      })
    }
  }

  const totalRegisteredMigrants = useMemo(
    () => companiesList.reduce((sum, c) => sum + c.registeredEmployees, 0),
    [companiesList]
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-[#0C2D27] dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-[#0C2D27] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-600 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#C0E862]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
            <span className="w-4 h-[2px] bg-[#FF6B53]" />
            GOVERNMENT WORKFORCE &amp; COMPANY REPOSITORY
          </div>
          <h1 className="text-3xl font-extrabold text-[#0C2D27] dark:text-white tracking-tight">
            {t('nav_gov_workers')}
          </h1>
          <p className="text-xs sm:text-sm text-[#52605D] dark:text-[#A3BDB5] mt-0.5 font-normal">
            {lang === 'hi'
              ? 'गुजरात भर में पंजीकृत कंपनियों, कुल कर्मचारियों की संख्या और डिजिटल श्रमिक पहचान का ऑडिट करें।'
              : lang === 'gu'
              ? 'ગુજરાતમાં નોંધાયેલ કંપનીઓ, કુલ શ્રમિકોની સંખ્યા અને ડિજિટલ શ્રમિક આઇડીનું ઓડિટ કરો.'
              : 'Audit registered companies, total employee counts, and portable worker identities across Gujarat.'}
          </p>
        </div>

        <button
          onClick={() => setRegisterModalOpen(true)}
          className="figma-btn-coral py-3 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>{lang === 'hi' ? 'नियोक्ता / श्रमिक पंजीकृत करें' : lang === 'gu' ? 'માલિક / શ્રમિક નોંધો' : 'Register Employer / Worker'}</span>
        </button>
      </div>

      {/* ── Overview Statistics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#14312A] border border-slate-200/80 dark:border-[#244E43] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#52605D] dark:text-[#A3BDB5] uppercase block">
            {lang === 'hi' ? 'पंजीकृत उद्यम' : lang === 'gu' ? 'નોંધાયેલ સાહસો' : 'REGISTERED ENTERPRISES'}
          </span>
          <b className="text-2xl font-black text-[#0C2D27] dark:text-white">
            {companiesList.length} {lang === 'hi' ? 'कंपनियां' : lang === 'gu' ? 'કંપનીઓ' : 'Companies'}
          </b>
        </div>
        <div className="p-4 rounded-3xl bg-[#0C2D27] dark:bg-[#081613] text-white border border-emerald-950 dark:border-[#1E483D] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-[#C0E862] uppercase block">
            {lang === 'hi' ? 'कुल पंजीकृत कर्मचारी' : lang === 'gu' ? 'કુલ નોંધાયેલ શ્રમિકો' : 'TOTAL REGISTERED EMPLOYEES'}
          </span>
          <b className="text-2xl font-black text-white">
            {totalRegisteredMigrants.toLocaleString()} {lang === 'hi' ? 'श्रमिक' : lang === 'gu' ? 'શ્રમિકો' : 'Workers'}
          </b>
        </div>
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-[#133D30] border border-emerald-200 dark:border-[#23654F] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-[#6EE7B7] uppercase block">
            {lang === 'hi' ? 'सत्यापित श्रमिक रिकॉर्ड' : lang === 'gu' ? 'ચકાસાયેલ શ્રમિક રેકોર્ડ્સ' : 'VERIFIED WORKER PROFILES'}
          </span>
          <b className="text-2xl font-black text-emerald-950 dark:text-white">
            {workersList.length} {lang === 'hi' ? 'सक्रिय रिकॉर्ड' : lang === 'gu' ? 'સક્રિય રેકોર્ડ્સ' : 'Active Profiles'}
          </b>
        </div>
      </div>

      {/* ── Search & Filter Control Bar ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-[#A8C7BE]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'workers'
                  ? (lang === 'hi' ? 'श्रमिक का नाम, आईडी, पेशा, जिला, कंपनी खोजें...' : lang === 'gu' ? 'શ્રમિકનું નામ, આઇડી, વ્યવસાય, જિલ્લો શોધો...' : 'Search worker name, Saathi ID, trade, district, employer...')
                  : (lang === 'hi' ? 'कंपनी का नाम, कोड, जिला, क्षेत्र द्वारा खोजें...' : lang === 'gu' ? 'કંપનીનું નામ, કોડ, જિલ્લો, ક્ષેત્ર વડે શોધો...' : 'Search company name, code, GIDC district, sector...')
              }
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white dark:bg-[#14312A] border border-slate-200 dark:border-[#244E43] text-[#0C2D27] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9DBBB2] focus:outline-none focus:border-[#FF6B53] dark:focus:border-[#FF6B53]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                showFilterPanel || activeFiltersCount > 0
                  ? 'bg-[#FF6B53] text-white border-[#FF6B53] shadow-md'
                  : 'bg-white dark:bg-[#14312A] border-slate-200 dark:border-[#244E43] text-[#0C2D27] dark:text-white hover:bg-slate-50 dark:hover:bg-[#183D34]'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{lang === 'hi' ? 'फ़िल्टर' : lang === 'gu' ? 'ફિલ્ટર્સ' : 'Filters'}</span>
              {activeFiltersCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-white text-[#FF6B53] font-black text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#14312A] border border-slate-200 dark:border-[#244E43] text-xs font-bold text-[#0C2D27] dark:text-white hover:bg-slate-50 dark:hover:bg-[#183D34] transition-colors cursor-pointer shadow-2xs"
              title="Download currently filtered records as CSV"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-[#4ADE80]" />
              <span>{lang === 'hi' ? 'CSV निर्यात' : lang === 'gu' ? 'CSV નિકાસ' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* ── Collapsible Active Filter Panel ── */}
        {showFilterPanel && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#14312A] border border-slate-200 dark:border-[#244E43] shadow-md space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E4238] pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#FF6B53]" />
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white">Filter Directory Records</b>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-xs text-[#FF6B53] hover:underline font-bold cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* District Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-[#CBDCE1] mb-1">District:</label>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                >
                  <option value="All">All Districts (Gujarat)</option>
                  <option value="Surat">Surat</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Rajkot">Rajkot</option>
                  <option value="Kutch">Kutch</option>
                  <option value="Gandhinagar">Gandhinagar</option>
                </select>
              </div>

              {/* Sector Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-[#CBDCE1] mb-1">Sector:</label>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                >
                  <option value="All">All Sectors</option>
                  <option value="Construction">Construction</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>

              {/* Status Filter (Workers tab) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-[#CBDCE1] mb-1">
                  Verification Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Verified">Verified Only</option>
                  <option value="Under Audit">Under Audit</option>
                  <option value="Pending">Pending Verification</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Data Table Card ── */}
      <div className="rounded-3xl bg-white dark:bg-[#14312A] border border-slate-200/80 dark:border-[#244E43] p-5 sm:p-6 shadow-2xs space-y-6">
        {/* Table View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E4238] pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab('workers')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'workers'
                  ? 'border-[#FF6B53] text-[#FF6B53]'
                  : 'border-transparent text-[#52605D] dark:text-[#A3BDB5] hover:text-[#0C2D27] dark:hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>
                {lang === 'hi' ? 'श्रमिक निर्देशिका' : lang === 'gu' ? 'શ્રમિક ડિરેક્ટરી' : 'Worker Directory'} ({filteredWorkers.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'companies'
                  ? 'border-[#FF6B53] text-[#FF6B53]'
                  : 'border-transparent text-[#52605D] dark:text-[#A3BDB5] hover:text-[#0C2D27] dark:hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>
                {lang === 'hi' ? 'पंजीकृत कंपनियां' : lang === 'gu' ? 'નોંધાયેલ કંપનીઓ' : 'Registered Enterprises'} ({filteredCompanies.length})
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-400 dark:text-[#A3BDB5] font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {lang === 'hi' ? 'सत्यापित सरकारी पोर्टल रिकॉर्ड · लाइव सिंक' : lang === 'gu' ? 'ચકાસાયેલ સરકારી પોર્ટલ રેકોર્ડ્સ · લાઇવ સિંક' : 'Verified Govt Portal Records · Live Sync'}
          </span>
        </div>

        {/* Tab 1: Worker Case & Profile Directory */}
        {activeTab === 'workers' && (
          <div className="overflow-x-auto">
            {filteredWorkers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="h-10 w-10 text-slate-300 dark:text-[#2E6356] mx-auto" />
                <b className="text-sm font-bold text-[#0C2D27] dark:text-white block">No workers match the current criteria</b>
                <p className="text-xs text-slate-400 dark:text-[#A3BDB5]">Try clearing search or filters to see all registered migrant workers.</p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-xl bg-[#0C2D27] dark:bg-[#1A4237] text-white text-xs font-bold cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1E4238] text-[10px] uppercase tracking-wider text-[#52605D] dark:text-[#CBDCE1] font-bold bg-slate-50/50 dark:bg-[#1A3F37]">
                    <th className="py-3 px-4">{lang === 'hi' ? 'श्रमिक आईडी' : lang === 'gu' ? 'શ્રમિક આઇડી' : 'WORKER ID'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'नाम एवं संपर्क' : lang === 'gu' ? 'નામ અને સંપર્ક' : 'WORKER NAME'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'पेशा एवं कौशल' : lang === 'gu' ? 'વ્યવસાય અને કૌશલ્ય' : 'TRADE / SKILL'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'जिला / राज्य' : lang === 'gu' ? 'જિલ્લો / રાજ્ય' : 'DISTRICT & STATE'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'नियोक्ता कंपनी' : lang === 'gu' ? 'માલિક કંપની' : 'EMPLOYER COMPANY'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'दैनिक वेतन' : lang === 'gu' ? 'દૈનિક વેતન' : 'DAILY WAGE'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'सत्यापन स्थिति' : lang === 'gu' ? 'ચકાસણી સ્થિતિ' : 'STATUS'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'hi' ? 'कार्रवाई' : lang === 'gu' ? 'કાર્યવાહી' : 'ACTION'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E4238] font-medium">
                  {filteredWorkers.map((worker) => (
                    <tr
                      key={worker.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1E463D] transition-colors"
                    >
                      {/* Worker ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0C2D27] dark:text-white">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1C4037] border border-slate-200 dark:border-[#2E6356]">
                          {worker.id}
                        </span>
                      </td>

                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <b className="font-bold text-[#0C2D27] dark:text-white block">{worker.name}</b>
                        <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5] font-normal">{worker.phone}</span>
                      </td>

                      {/* Occupation & Skill Level */}
                      <td className="py-3.5 px-4">
                        <b className="text-[#0C2D27] dark:text-white block">{worker.occupation}</b>
                        <span className="text-[10px] font-bold text-teal-700 dark:text-[#5EEAD4] block">
                          {worker.skillLevel} · {worker.sector}
                        </span>
                      </td>

                      {/* District & Origin State */}
                      <td className="py-3.5 px-4">
                        <b className="text-[#0C2D27] dark:text-white block">{worker.district}</b>
                        <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5]">Origin: {worker.originState}</span>
                      </td>

                      {/* Employer */}
                      <td className="py-3.5 px-4 text-[#0C2D27] dark:text-[#CBDCE1] font-medium">
                        {worker.company}
                      </td>

                      {/* Daily Wage */}
                      <td className="py-3.5 px-4">
                        <b className="text-[#0C2D27] dark:text-white font-bold">₹{worker.dailyWage}</b>
                        <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5] block">/ day</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            worker.status === 'Verified'
                              ? 'bg-emerald-50 dark:bg-[#133D30] text-emerald-700 dark:text-[#6EE7B7] border-emerald-200 dark:border-[#23654F]'
                              : worker.status === 'Under Audit'
                              ? 'bg-amber-50 dark:bg-[#3D3216] text-amber-700 dark:text-[#FCD34D] border-amber-200 dark:border-[#695320]'
                              : 'bg-blue-50 dark:bg-[#17324D] text-blue-700 dark:text-[#93C5FD] border-blue-200 dark:border-[#265582]'
                          }`}
                        >
                          {worker.status === 'Verified' ? '✓ ' : '• '}
                          {worker.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedWorker(worker)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1C4037] hover:bg-[#FF6B53] hover:text-white text-[11px] font-bold text-[#0C2D27] dark:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Registered Companies Registry */}
        {activeTab === 'companies' && (
          <div className="overflow-x-auto">
            {filteredCompanies.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Building2 className="h-10 w-10 text-slate-300 dark:text-[#2E6356] mx-auto" />
                <b className="text-sm font-bold text-[#0C2D27] dark:text-white block">No enterprises match the current filters</b>
                <p className="text-xs text-slate-400 dark:text-[#A3BDB5]">Try clearing search or filters to see all registered companies.</p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-xl bg-[#0C2D27] dark:bg-[#1A4237] text-white text-xs font-bold cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1E4238] text-[10px] uppercase tracking-wider text-[#52605D] dark:text-[#CBDCE1] font-bold bg-slate-50/50 dark:bg-[#1A3F37]">
                    <th className="py-3 px-4">{lang === 'hi' ? 'कंपनी कोड' : lang === 'gu' ? 'કંપની કોડ' : 'COMPANY CODE'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'कंपनी का नाम' : lang === 'gu' ? 'કંપનીનું નામ' : 'COMPANY NAME'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'क्षेत्र' : lang === 'gu' ? 'ક્ષેત્ર' : 'SECTOR'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'जिला' : lang === 'gu' ? 'જિલ્લો' : 'DISTRICT'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'hi' ? 'पंजीकृत कर्मचारी' : lang === 'gu' ? 'નોંધાયેલ શ્રમિકો' : 'REGISTERED EMPLOYEES'}</th>
                    <th className="py-3 px-4">{lang === 'hi' ? 'अनुपालन स्कोर' : lang === 'gu' ? 'પાલન સ્કોર' : 'COMPLIANCE SCORE'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'hi' ? 'कार्रवाई' : lang === 'gu' ? 'કાર્યવાહી' : 'ACTION'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E4238] font-medium">
                  {filteredCompanies.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50/70 dark:hover:bg-[#1E463D] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-[#0C2D27] dark:text-white">{comp.code}</td>
                      <td className="py-4 px-4">
                        <b className="font-bold text-[#0C2D27] dark:text-white block">{comp.name}</b>
                        <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5] font-normal">{comp.contactPerson}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1C4037] text-[#0C2D27] dark:text-white text-[10px] font-bold">
                          {comp.sector}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#52605D] dark:text-[#CBDCE1]">{comp.district}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-[#0C2D27] dark:bg-[#1A4237] text-white font-extrabold text-xs inline-block">
                          {comp.registeredEmployees.toLocaleString()} {lang === 'hi' ? 'श्रमिक' : lang === 'gu' ? 'શ્રમિકો' : 'Workers'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-emerald-700 dark:text-[#4ADE80] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#4ADE80]" />
                          {comp.complianceScore}% ({comp.safetyRating})
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
            )}
          </div>
        )}
      </div>

      {/* ── Worker Profile Modal ── */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#14312A] rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-[#244E43]">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E4238] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF6B53] uppercase block">
                  {selectedWorker.id} · PORTABLE DIGITAL WORKER IDENTITY
                </span>
                <h3 className="text-xl font-bold text-[#0C2D27] dark:text-white leading-snug">
                  {selectedWorker.name}
                </h3>
                <p className="text-xs text-[#52605D] dark:text-[#A3BDB5]">
                  {selectedWorker.occupation} ({selectedWorker.skillLevel}) · {selectedWorker.district}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-[#0C2D27] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#183D34] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#173830] border border-slate-100 dark:border-[#244E43] space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5] font-bold uppercase block">Current Employer</span>
                <b className="text-[#0C2D27] dark:text-white block">{selectedWorker.company}</b>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#173830] border border-slate-100 dark:border-[#244E43] space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5] font-bold uppercase block">Daily Wage Rate</span>
                <b className="text-[#0C2D27] dark:text-white text-sm block font-black">₹{selectedWorker.dailyWage} / day</b>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#173830] border border-slate-100 dark:border-[#244E43] space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5] font-bold uppercase block">Origin Domicile</span>
                <b className="text-[#0C2D27] dark:text-white block">{selectedWorker.originState}</b>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#173830] border border-slate-100 dark:border-[#244E43] space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-[#A3BDB5] font-bold uppercase block">Contact Phone</span>
                <b className="text-[#0C2D27] dark:text-white block">{selectedWorker.phone}</b>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0C2D27] dark:bg-[#081613] text-white flex items-center justify-between border border-emerald-950 dark:border-[#1E483D]">
              <div>
                <span className="text-[10px] text-[#C0E862] font-bold uppercase block">PORTABLE IDENTITY STATUS</span>
                <b className="text-xs text-white">e-Shram &amp; Aadhaar (•••• {selectedWorker.aadhaarLast4})</b>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#C0E862] text-[#0C2D27]">
                {selectedWorker.status}
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedWorker(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#244E43] text-xs font-bold text-[#0C2D27] dark:text-white hover:bg-slate-50 dark:hover:bg-[#183D34] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`Audit certificate for ${selectedWorker.name} verified and stamped.`)
                  setSelectedWorker(null)
                }}
                className="figma-btn-coral py-2.5 px-5 text-xs font-bold cursor-pointer"
              >
                Issue Verification Stamp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Company Employee Roster Inspection Modal ── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#14312A] rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-[#244E43]">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E4238] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF6B53] uppercase block">
                  {selectedCompany.code} · EMPLOYEE ROSTER INSPECTION
                </span>
                <h3 className="text-xl font-bold text-[#0C2D27] dark:text-white leading-snug">
                  {selectedCompany.name}
                </h3>
                <p className="text-xs text-[#52605D] dark:text-[#A3BDB5]">{selectedCompany.address}</p>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-full text-slate-400 hover:text-[#0C2D27] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#183D34] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0C2D27] dark:bg-[#081613] text-white flex items-center justify-between border border-emerald-950 dark:border-[#1E483D]">
                <div>
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">
                    REGISTERED MIGRANT WORKERS
                  </span>
                  <b className="text-2xl font-black text-white">
                    {selectedCompany.registeredEmployees.toLocaleString()} Employees
                  </b>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">
                    AUDIT RATING
                  </span>
                  <b className="text-sm font-bold text-[#C0E862]">{selectedCompany.safetyRating}</b>
                </div>
              </div>

              {/* Sample Workers Breakdown */}
              <div className="space-y-2">
                <b className="text-xs font-bold text-[#0C2D27] dark:text-white block">
                  Registered Key Staff &amp; Workers:
                </b>
                <div className="space-y-2">
                  {selectedCompany.sampleWorkers.map((w, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#173830] border border-slate-200 dark:border-[#244E43] flex items-center justify-between text-xs font-semibold text-[#0C2D27] dark:text-white"
                    >
                      <span>👤 {w}</span>
                      <span className="text-emerald-700 dark:text-[#4ADE80] font-bold bg-emerald-100 dark:bg-[#133D30] px-2 py-0.5 rounded text-[10px]">
                        Verified ID
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
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Register Employer / Worker Dialog Modal ── */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#14312A] rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-[#244E43]">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E4238] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF6B53] uppercase block">
                  GOVERNMENT OF GUJARAT · LABOUR DIRECTORY
                </span>
                <h3 className="text-xl font-bold text-[#0C2D27] dark:text-white">
                  {regType === 'worker' ? 'Register New Migrant Worker' : 'Enroll Enterprise / Employer'}
                </h3>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-[#0C2D27] dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Type selector toggle */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-[#173830] p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRegType('worker')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  regType === 'worker'
                    ? 'bg-white dark:bg-[#1E4D40] text-[#0C2D27] dark:text-white shadow-xs'
                    : 'text-[#52605D] dark:text-[#A3BDB5]'
                }`}
              >
                👤 Migrant Worker
              </button>
              <button
                type="button"
                onClick={() => setRegType('company')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  regType === 'company'
                    ? 'bg-white dark:bg-[#1E4D40] text-[#0C2D27] dark:text-white shadow-xs'
                    : 'text-[#52605D] dark:text-[#A3BDB5]'
                }`}
              >
                🏢 Employer Enterprise
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-medium">
              {regType === 'worker' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Worker Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newWorker.name}
                        onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                        placeholder="e.g. Balram Sahu"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Occupation / Trade *</label>
                      <input
                        type="text"
                        required
                        value={newWorker.occupation}
                        onChange={(e) => setNewWorker({ ...newWorker, occupation: e.target.value })}
                        placeholder="e.g. Electrician"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Skill Level</label>
                      <select
                        value={newWorker.skillLevel}
                        onChange={(e) => setNewWorker({ ...newWorker, skillLevel: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      >
                        <option value="Skilled">Skilled</option>
                        <option value="Semi-skilled">Semi-skilled</option>
                        <option value="Unskilled">Unskilled</option>
                        <option value="Highly Skilled">Highly Skilled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">GIDC District *</label>
                      <select
                        value={newWorker.district}
                        onChange={(e) => setNewWorker({ ...newWorker, district: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      >
                        <option value="Surat">Surat</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Vadodara">Vadodara</option>
                        <option value="Rajkot">Rajkot</option>
                        <option value="Kutch">Kutch</option>
                        <option value="Gandhinagar">Gandhinagar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Sector</label>
                      <select
                        value={newWorker.sector}
                        onChange={(e) => setNewWorker({ ...newWorker, sector: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      >
                        <option value="Construction">Construction</option>
                        <option value="Textiles">Textiles</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Manufacturing">Manufacturing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Daily Wage (INR)</label>
                      <input
                        type="number"
                        value={newWorker.dailyWage}
                        onChange={(e) => setNewWorker({ ...newWorker, dailyWage: Number(e.target.value) })}
                        placeholder="550"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Origin Domicile State</label>
                      <input
                        type="text"
                        value={newWorker.originState}
                        onChange={(e) => setNewWorker({ ...newWorker, originState: e.target.value })}
                        placeholder="e.g. Bihar"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Employer Company</label>
                      <input
                        type="text"
                        value={newWorker.company}
                        onChange={(e) => setNewWorker({ ...newWorker, company: e.target.value })}
                        placeholder="e.g. Shree Construction Ltd."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Company / Enterprise Name *</label>
                      <input
                        type="text"
                        required
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                        placeholder="e.g. Torrent Power Industrial Site"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Sector *</label>
                        <select
                          value={newCompany.sector}
                          onChange={(e) => setNewCompany({ ...newCompany, sector: e.target.value as any })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                        >
                          <option value="Construction">Construction</option>
                          <option value="Textiles">Textiles</option>
                          <option value="Diamond">Diamond</option>
                          <option value="Manufacturing">Manufacturing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">District *</label>
                        <select
                          value={newCompany.district}
                          onChange={(e) => setNewCompany({ ...newCompany, district: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                        >
                          <option value="Surat">Surat</option>
                          <option value="Ahmedabad">Ahmedabad</option>
                          <option value="Vadodara">Vadodara</option>
                          <option value="Rajkot">Rajkot</option>
                          <option value="Kutch">Kutch</option>
                          <option value="Gandhinagar">Gandhinagar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Total Migrant Employees</label>
                        <input
                          type="number"
                          value={newCompany.registeredEmployees}
                          onChange={(e) => setNewCompany({ ...newCompany, registeredEmployees: Number(e.target.value) })}
                          placeholder="250"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Contact Person / HR</label>
                        <input
                          type="text"
                          value={newCompany.contactPerson}
                          onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })}
                          placeholder="e.g. Hitesh Parekh"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-[#CBDCE1] font-bold mb-1">Facility Address</label>
                      <input
                        type="text"
                        value={newCompany.address}
                        onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                        placeholder="Plot 10, GIDC Phase 2..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2E6356] bg-slate-50 dark:bg-[#173830] text-[#0C2D27] dark:text-white focus:outline-none focus:border-[#FF6B53]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-[#1E4238] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#244E43] text-xs font-bold text-[#0C2D27] dark:text-white hover:bg-slate-50 dark:hover:bg-[#183D34] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="figma-btn-coral py-2.5 px-6 text-xs font-bold cursor-pointer"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
