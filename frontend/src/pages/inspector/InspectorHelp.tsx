import {
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Scale,
  BookOpen,
  Building2,
  ExternalLink
} from 'lucide-react'

export default function InspectorHelp() {
  const EMERGENCY_CONTACTS = [
    { title: 'State Labour Commissioner Control Room', number: '079-2325-1100', available: '24x7 Emergency Line' },
    { title: 'District Joint Labour Commissioner (Surat)', number: '0261-265-4421', available: 'Mon-Sat 09:00 - 18:00' },
    { title: 'District Magistrate Flying Squad / Police Liaison', number: '112 / 0261-247-3311', available: '24x7 Law Enforcement' },
    { title: 'Free Legal Services Authority (DLSA Surat)', number: '15100', available: 'Worker Legal Representation' },
  ]

  const STATUTORY_POWERS = [
    {
      act: 'Inter-State Migrant Workmen Act, 1979 (Section 20)',
      powers: 'Power to enter any premises at all reasonable times, inspect wage registers, examine any migrant workman, and seize documents where default or illegal withholding is suspected.'
    },
    {
      act: 'Minimum Wages Act, 1948 (Section 19 & 20)',
      powers: 'Authority to demand instant rectification and submit claims before the Authority under Section 20 for recovery of wage arrears with statutory compensation up to 10 times the amount.'
    },
    {
      act: 'Building and Other Construction Workers (BOCW) Act, 1996 (Section 43)',
      powers: 'Power to prohibit unsafe scaffoldings, declare hazardous conditions, and issue Stop-Work Orders until life-safety apparatus and PPE compliance is verified.'
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* ── Top Header ── */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
            <HelpCircle className="h-5 w-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#0C2D27] dark:text-white">
            Enforcement SOPs &amp; Field Inspector Helpline
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#9DBBB2] mt-1">
          Statutory guidelines, protocol checklists, and emergency support channels for Labour Enforcement Officers.
        </p>
      </div>

      {/* ── Emergency Numbers Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EMERGENCY_CONTACTS.map((c, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <PhoneCall className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#9DBBB2] uppercase block">
                {c.available}
              </span>
              <b className="text-xs font-bold text-[#0C2D27] dark:text-white block truncate">
                {c.title}
              </b>
              <b className="text-sm font-black text-amber-600 dark:text-amber-400 block mt-0.5">
                {c.number}
              </b>
            </div>
          </div>
        ))}
      </div>

      {/* ── Statutory Powers & Legal Clauses ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-amber-500" />
          <h2 className="text-base font-extrabold text-[#0C2D27] dark:text-white">
            Statutory Inspector Powers &amp; Legal Authorities
          </h2>
        </div>

        <div className="space-y-3">
          {STATUTORY_POWERS.map((sp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122A23] border border-slate-200/60 dark:border-[#1F4C3F] space-y-1.5"
            >
              <b className="text-xs font-black text-[#0C2D27] dark:text-white block">
                {sp.act}
              </b>
              <p className="text-xs text-slate-600 dark:text-[#CBDCE1] leading-relaxed">
                {sp.powers}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Standard Operating Procedure (SOP) ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0D241E] border border-slate-200/80 dark:border-[#1F4C3F] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <h2 className="text-base font-extrabold text-[#0C2D27] dark:text-white">
            Standard Operating Procedure (SOP) for On-Site Field Visits
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">1</span>
            <div>
              <b className="text-[#0C2D27] dark:text-white block font-bold">Unannounced Arrival &amp; Identification</b>
              <p className="text-slate-500 dark:text-[#9DBBB2]">Present digital inspector badge and notice of inspection to the principal employer or site supervisor before entering work areas.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">2</span>
            <div>
              <b className="text-[#0C2D27] dark:text-white block font-bold">Confidential Worker Depositions</b>
              <p className="text-slate-500 dark:text-[#9DBBB2]">Interview complainant workmen away from employer intimidation. Record statements and obtain signature or thumbprint verification.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">3</span>
            <div>
              <b className="text-[#0C2D27] dark:text-white block font-bold">Examine Form XVII Wage Registers</b>
              <p className="text-slate-500 dark:text-[#9DBBB2]">Cross-reference muster rolls with bank transfer statements or cash payment vouchers to detect wage theft or illegal deductions.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">4</span>
            <div>
              <b className="text-[#0C2D27] dark:text-white block font-bold">Geotagged Photographic Documentation</b>
              <p className="text-slate-500 dark:text-[#9DBBB2]">Upload evidence photos of missing safety equipment, inadequate drinking water facilities, or unshielded fall hazards into the Saathi Evidence Vault.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">5</span>
            <div>
              <b className="text-[#0C2D27] dark:text-white block font-bold">Service of Form-IV Statutory Rectification Notice</b>
              <p className="text-slate-500 dark:text-[#9DBBB2]">If violations exist, generate the statutory notice immediately giving 7 calendar days for compliance before prosecution is initiated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
