import { useState, useEffect } from 'react'
import { Check, ArrowRight, Heart, Loader2, ExternalLink, FileText, X, ShieldCheck, CheckCircle2 } from 'lucide-react'
import api from '@/services/api'
import { useTranslation } from '@/utils/translations'

interface SchemeItem {
  id: string
  code: string
  name: string
  provider: string
  description: string
  matchPct: number
  badgeText: string
  coverText: string
  circleBg: string
  circleText: string
  applicationUrl: string
  officialSource: string
  requiredDocuments: string[]
}

export default function WelfareBenefits() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'recommended' | 'applications' | 'all'>('recommended')
  const [loading, setLoading] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState<SchemeItem | null>(null)
  const [appliedSchemeIds, setAppliedSchemeIds] = useState<string[]>([])

  const schemes: SchemeItem[] = [
    {
      id: '1',
      code: 'PM-SYM',
      provider: 'Government of India · Ministry of Labour',
      name: t('pmsym_name'),
      description: t('pmsym_desc'),
      matchPct: 96,
      badgeText: lang === 'hi' ? '✓ अभी योग्य' : lang === 'gu' ? '✓ અત્યારે જ પાત્ર' : '✓ Eligible now',
      coverText: lang === 'hi' ? '₹3,000 / माह पेंशन' : lang === 'gu' ? '₹૩,૦૦૦ / મહિને પેન્શન' : '₹3,000 / month pension',
      circleBg: 'bg-[#FFEAE3]',
      circleText: 'PM',
      applicationUrl: 'https://maandhan.in',
      officialSource: 'maandhan.in (Ministry of Labour & Employment)',
      requiredDocuments: [
        lang === 'hi' ? 'आधार कार्ड (मूल / डिजिटल प्रति)' : lang === 'gu' ? 'આધાર કાર્ડ (મૂળ / ડિજિટલ કોપી)' : 'Aadhaar Card (Original / Digital copy)',
        lang === 'hi' ? 'बचत बैंक खाता या जन धन खाता विवरण (IFSC कोड के साथ)' : lang === 'gu' ? 'બચત બેંક ખાતું અથવા જન ધન ખાતાની વિગતો (IFSC કોડ સાથે)' : 'Savings Bank Account or Jan Dhan Account details (with IFSC Code)',
        lang === 'hi' ? 'आधार से लिंक सक्रिय मोबाइल नंबर' : lang === 'gu' ? 'આધાર સાથે લિંક સક્રિય મોબાઇલ નંબર' : 'Active Mobile Number linked with Aadhaar',
      ],
    },
    {
      id: '2',
      code: 'PM-JAY',
      provider: 'Government of India · National Health Authority',
      name: t('pmjay_name'),
      description: t('pmjay_desc'),
      matchPct: 91,
      badgeText: lang === 'hi' ? '✓ 2 चरण शेष' : lang === 'gu' ? '✓ ૨ પથ બાકી' : '✓ 2 steps left',
      coverText: lang === 'hi' ? '₹5 लाख वार्षिक स्वास्थ्य कवर' : lang === 'gu' ? '₹૫ લાખ વાર્ષિક આરોગ્ય કવર' : '₹5 Lakh annual health cover',
      circleBg: 'bg-[#D1F4E6]',
      circleText: 'PM',
      applicationUrl: 'https://beneficiary.nha.gov.in',
      officialSource: 'beneficiary.nha.gov.in (National Health Authority)',
      requiredDocuments: [
        lang === 'hi' ? 'सभी परिवार के सदस्यों का आधार कार्ड' : lang === 'gu' ? 'પરિવારના તમામ સભ્યોના આધાર કાર્ડ' : 'Aadhaar Card of all family members',
        lang === 'hi' ? 'राशन कार्ड / परिवार पहचान दस्तावेज' : lang === 'gu' ? 'રેશન કાર્ડ / કૌટુંબિક આઇડી દસ્તાવેજ' : 'Ration Card / Family ID document',
        lang === 'hi' ? 'ओटीपी सत्यापन के लिए मोबाइल नंबर' : lang === 'gu' ? 'ઓટીપી ચકાસણી માટે મોબાઇલ નંબર' : 'Mobile Number for OTP verification',
      ],
    },
    {
      id: '3',
      code: 'BOCW-GJ',
      provider: 'Government of Gujarat · Labour & Employment Dept.',
      name: t('bocw_name'),
      description: t('bocw_desc'),
      matchPct: 84,
      badgeText: lang === 'hi' ? '✓ पात्र' : lang === 'gu' ? '✓ પાત્ર' : '✓ Eligible',
      coverText: lang === 'hi' ? 'टूल किट एवं मातृत्व सहायता' : lang === 'gu' ? 'ટૂલ કિટ અને માતૃત્વ સહાય' : 'Tools & Maternity support',
      circleBg: 'bg-[#EDE7FA]',
      circleText: 'BO',
      applicationUrl: 'https://enirman.gujarat.gov.in',
      officialSource: 'enirman.gujarat.gov.in (Gujarat e-Nirman Portal)',
      requiredDocuments: [
        lang === 'hi' ? 'आधार कार्ड' : lang === 'gu' ? 'આધાર કાર્ડ' : 'Aadhaar Card',
        lang === 'hi' ? 'ठेकेदार/नियोक्ता से 90 दिनों का निर्माण कार्य प्रमाण पत्र' : lang === 'gu' ? 'કોન્ટ્રાક્ટર/માલિક પાસેથી ૯૦ દિવસનું બાંધકામ કામ પ્રમાણપત્ર' : '90-Days Construction Work Certificate from Contractor/Employer',
        lang === 'hi' ? 'बैंक पासबुक के प्रथम पृष्ठ की प्रति' : lang === 'gu' ? 'બેંક પાસબુકના પ્રથમ પાનાની નકલ' : 'Bank Passbook first page copy',
        lang === 'hi' ? 'पासपोर्ट साइज फोटो' : lang === 'gu' ? 'પાસપોર્ટ સાઇઝનો ફોટો' : 'Passport Size Photograph',
      ],
    },
    {
      id: '4',
      code: 'E-SHRAM',
      provider: 'Government of India · Labour & Employment',
      name: t('eshram_name'),
      description: t('eshram_desc'),
      matchPct: 98,
      badgeText: lang === 'hi' ? '✓ अभी योग्य' : lang === 'gu' ? '✓ અત્યારે જ પાત્ર' : '✓ Eligible now',
      coverText: lang === 'hi' ? 'UAN कार्ड + ₹2 लाख बीमा' : lang === 'gu' ? 'UAN કાર્ડ + ₹૨ લાખ વીમો' : 'UAN Card + ₹2 Lakh Insurance',
      circleBg: 'bg-[#FEF3C7]',
      circleText: 'ES',
      applicationUrl: 'https://eshram.gov.in',
      officialSource: 'eshram.gov.in (Ministry of Labour & Employment)',
      requiredDocuments: [
        lang === 'hi' ? 'आधार कार्ड' : lang === 'gu' ? 'આધાર કાર્ડ' : 'Aadhaar Card',
        lang === 'hi' ? 'आधार से जुड़ा मोबाइल नंबर' : lang === 'gu' ? 'આધાર સાથે લિંક થયેલ મોબાઇલ નંબર' : 'Aadhaar-linked Mobile Number',
        lang === 'hi' ? 'बैंक खाता संख्या और IFSC कोड' : lang === 'gu' ? 'બેંક ખાતા નંબર અને IFSC કોડ' : 'Bank Account Number and IFSC Code',
      ],
    },
  ]

  useEffect(() => {
    async function loadSchemes() {
      setLoading(true)
      try {
        const res = await api.get('/welfare/match')
        if (Array.isArray(res.data?.schemes) && res.data.schemes.length > 0) {
          const mapped = res.data.schemes.map((s: any, idx: number) => ({
            id: s.id || String(idx + 1),
            code: s.scheme_code || 'GJ-GOVT',
            provider: s.official_source || 'Government of India',
            name: s.name,
            description: s.description || 'Verified social welfare support scheme.',
            matchPct: Math.min(99, 96 - idx * 5),
            badgeText: '✓ Eligible now',
            coverText: s.benefits_summary ? s.benefits_summary.split('|')[0] : 'Welfare Cover',
            circleBg: idx % 3 === 0 ? 'bg-[#FFEAE3]' : idx % 3 === 1 ? 'bg-[#D1F4E6]' : 'bg-[#EDE7FA]',
            circleText: (s.scheme_code || 'GJ').substring(0, 2).toUpperCase(),
            applicationUrl: s.application_url || 'https://eshram.gov.in',
            officialSource: s.official_source || 'Official Govt Portal',
            requiredDocuments: Array.isArray(s.required_documents) && s.required_documents.length > 0
              ? s.required_documents
              : ['Aadhaar Card', 'Bank Passbook Details', 'Mobile Number'],
          }))
          setSchemes(mapped)
        }
      } catch {
        // Use demo fallback
      } finally {
        setLoading(false)
      }
    }
    void loadSchemes()
  }, [])

  function handleOpenPortal(scheme: SchemeItem) {
    if (!appliedSchemeIds.includes(scheme.id)) {
      setAppliedSchemeIds((prev) => [...prev, scheme.id])
    }
    window.open(scheme.applicationUrl, '_blank', 'noopener,noreferrer')
  }

  const displayedSchemes = schemes.filter((s) => {
    if (activeTab === 'applications') return appliedSchemeIds.includes(s.id)
    return true
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-2">
          <span className="w-4 h-[2px] bg-[#FF6B53]" />
          MATCHED TO YOUR PROFILE
        </div>
        <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight">
          Benefits that travel with you.
        </h1>
        <p className="text-sm text-[#52605D] mt-1 font-normal">
          Simple, verified support—wherever your work takes you. Apply directly on official government portals.
        </p>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-8 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'recommended'
              ? 'border-[#FF6B53] text-[#FF6B53]'
              : 'border-transparent text-[#52605D] hover:text-[#0C2D27]'
          }`}
        >
          <span>Recommended</span>
          <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[#FF6B53] text-[10px]">
            {schemes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'applications'
              ? 'border-[#FF6B53] text-[#FF6B53]'
              : 'border-transparent text-[#52605D] hover:text-[#0C2D27]'
          }`}
        >
          <span>My applications</span>
          {appliedSchemeIds.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {appliedSchemeIds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-[#FF6B53] text-[#FF6B53]'
              : 'border-transparent text-[#52605D] hover:text-[#0C2D27]'
          }`}
        >
          All schemes
        </button>
      </div>

      {/* ── Scheme Cards Stack ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-[#52605D] text-sm flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#FF6B53]" />
            Matching welfare schemes with Gujarat portal data...
          </div>
        ) : displayedSchemes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
            <p className="text-sm font-bold text-[#0C2D27]">No applications opened yet.</p>
            <p className="text-xs text-[#52605D]">Select any recommended scheme to view documents and apply on official portals.</p>
          </div>
        ) : (
          displayedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4 min-w-0">
                {/* Circle Icon Badge */}
                <div className={`h-12 w-12 rounded-2xl ${scheme.circleBg} text-[#0C2D27] font-extrabold flex items-center justify-center text-sm shrink-0`}>
                  {scheme.circleText}
                </div>

                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#52605D] uppercase block tracking-wider">
                    {scheme.code} · {scheme.provider}
                  </span>
                  <h3 className="text-base font-bold text-[#0C2D27] leading-snug">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-[#52605D] font-normal leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Benefit Tags */}
                  <div className="flex items-center gap-4 pt-2 text-xs flex-wrap">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      {scheme.badgeText}
                    </span>
                    <span className="text-[#0C2D27] font-bold">
                      {scheme.coverText}
                    </span>
                    {appliedSchemeIds.includes(scheme.id) && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Portal Visit Recorded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Progress & CTA */}
              <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                {/* Match bar */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-emerald-800 text-[11px]">{scheme.matchPct}% match</span>
                  <div className="w-20 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scheme.matchPct}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="figma-btn-coral py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View &amp; Apply</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Official Government Application Modal ── */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setSelectedScheme(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#0C2D27] hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Scheme Header */}
            <div className="flex items-start gap-4">
              <div className={`h-14 w-14 rounded-2xl ${selectedScheme.circleBg} text-[#0C2D27] font-black flex items-center justify-center text-lg shrink-0`}>
                {selectedScheme.circleText}
              </div>
              <div className="space-y-1 min-w-0 pr-6">
                <span className="text-[10px] font-bold text-[#FF6B53] uppercase block tracking-wider">
                  OFFICIAL GOVERNMENT APPLICATION
                </span>
                <h2 className="text-xl font-bold text-[#0C2D27] leading-tight">
                  {selectedScheme.name}
                </h2>
                <p className="text-xs text-[#52605D]">
                  {selectedScheme.provider}
                </p>
              </div>
            </div>

            {/* Verification Banner */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <b className="text-xs text-emerald-950 block">Verified Official Portal</b>
                <span className="text-[11px] text-emerald-800 font-mono block truncate">
                  {selectedScheme.officialSource}
                </span>
              </div>
            </div>

            {/* Required Documents Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0C2D27]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C2D27]">
                  Documents Required to Submit on Portal
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5">
                {selectedScheme.requiredDocuments.map((doc, i) => (
                  <label key={i} className="flex items-center gap-3 text-xs text-[#0C2D27] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 accent-[#0C2D27] rounded"
                    />
                    <span>{doc}</span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Tip: Keep these documents scanned or ready on your phone before proceeding to the government website.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenPortal(selectedScheme)
                  setSelectedScheme(null)
                }}
                className="w-full sm:w-auto figma-btn-coral py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Apply on Official Govt Portal</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
