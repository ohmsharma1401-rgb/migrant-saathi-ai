import { useState, useEffect } from 'react'
import {
  Save,
  Check,
  Shield,
  Bell,
  Globe,
  Share2,
  FileText,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Zap,
  Key,
  Database,
  Lock,
  Search,
  Download,
  AlertCircle,
} from 'lucide-react'

// ─── Default System Settings Schema ──────────────────────────────────────────
interface SettingsState {
  // General
  registrationEnabled: boolean
  otpLoginRequired: boolean
  maintenanceMode: boolean
  aiRecommendations: boolean
  defaultState: string
  defaultDistrict: string

  // Security
  enforce2FA: boolean
  sessionTimeoutMinutes: number
  passwordPolicy: 'standard' | 'strong' | 'enterprise'
  aadhaarKycStrictMode: boolean
  ipWhitelisting: string

  // Notifications
  emergencyAlertEmail: boolean
  emergencyAlertSms: boolean
  dailyAuditDigest: boolean
  wageViolationAlerts: boolean
  smsGatewayProvider: string

  // Languages
  defaultLanguage: string
  enableVoiceDialectAI: boolean
  autoTranslateGrievances: boolean
  supportedLanguages: string[]

  // Integrations
  eshramApiKey: string
  eshramConnected: boolean
  bocwEndpoint: string
  bocwConnected: boolean
  pmjayApiKey: string
  pmjayConnected: boolean
  uidaiCertFile: string
  uidaiConnected: boolean
  digilockerClientId: string
  digilockerConnected: boolean
  webhookUrl: string
}

const DEFAULT_SETTINGS: SettingsState = {
  registrationEnabled: true,
  otpLoginRequired: true,
  maintenanceMode: false,
  aiRecommendations: true,
  defaultState: 'Gujarat',
  defaultDistrict: 'Surat',

  enforce2FA: true,
  sessionTimeoutMinutes: 30,
  passwordPolicy: 'strong',
  aadhaarKycStrictMode: true,
  ipWhitelisting: '10.240.0.0/16, 182.73.18.0/24',

  emergencyAlertEmail: true,
  emergencyAlertSms: true,
  dailyAuditDigest: true,
  wageViolationAlerts: true,
  smsGatewayProvider: 'NIC e-Gov SMS Gateway (Govt of India)',

  defaultLanguage: 'hi',
  enableVoiceDialectAI: true,
  autoTranslateGrievances: true,
  supportedLanguages: ['Hindi', 'Gujarati', 'English', 'Marathi', 'Odia'],

  eshramApiKey: 'ESHRAM_PROD_LIVE_9948271A',
  eshramConnected: true,
  bocwEndpoint: 'https://enirman.gujarat.gov.in/api/v2/verify',
  bocwConnected: true,
  pmjayApiKey: 'NHA_PMJAY_LIVE_8829104',
  pmjayConnected: true,
  uidaiCertFile: 'UIDAI_GOV_VAULT_CERT_2026.pem',
  uidaiConnected: true,
  digilockerClientId: 'DIGI_GOV_GJ_99182',
  digilockerConnected: true,
  webhookUrl: 'https://migrant-saathi.gujarat.gov.in/api/v1/webhooks',
}

interface AuditLogEntry {
  id: string
  timestamp: string
  official: string
  action: string
  ip: string
  status: 'SUCCESS' | 'WARNING' | 'FAILED'
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'LOG-8819', timestamp: '2026-09-25 00:41:12', official: 'Ananya Rao (Inspector)', action: 'System preferences saved (2FA Enforced)', ip: '10.240.12.45', status: 'SUCCESS' },
  { id: 'LOG-8818', timestamp: '2026-09-24 18:22:05', official: 'Ramesh Patel (District Admin)', action: 'Tested e-Shram API Integration (Ping: 42ms)', ip: '10.240.12.11', status: 'SUCCESS' },
  { id: 'LOG-8817', timestamp: '2026-09-24 16:04:30', official: 'Ananya Rao (Inspector)', action: 'Updated BOCW Welfare Endpoint URL', ip: '10.240.12.45', status: 'SUCCESS' },
  { id: 'LOG-8816', timestamp: '2026-09-24 14:15:22', official: 'System Daemon', action: 'Automated UIDAI Certificate Vault Re-sync', ip: '127.0.0.1', status: 'SUCCESS' },
  { id: 'LOG-8815', timestamp: '2026-09-24 11:30:00', official: 'Official Admin', action: 'Exported Company Roster CSV (1,420 records)', ip: '182.73.18.99', status: 'SUCCESS' },
]

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'General' | 'Security' | 'Notifications' | 'Languages' | 'Integrations' | 'Audit log'>('General')
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS)
  const [auditQuery, setAuditQuery] = useState('')
  const [saved, setSaved] = useState(false)
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saathi-system-settings')
      if (stored) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }))
      }
    } catch {
      // Fallback
    }
  }, [])

  function handleSave() {
    try {
      localStorage.setItem('saathi-system-settings', JSON.stringify(settings))
    } catch {
      // Fallback
    }

    // Add entry to audit log
    const newLog: AuditLogEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      official: 'Ananya Rao (Inspector)',
      action: `Updated settings for section: ${activeTab}`,
      ip: '10.240.12.45',
      status: 'SUCCESS',
    }
    setAuditLogs((prev) => [newLog, ...prev])

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleTestApi(name: string) {
    setTestingIntegration(name)
    setTestSuccess(null)
    setTimeout(() => {
      setTestingIntegration(null)
      setTestSuccess(`${name} connection verified! (HTTP 200 OK · 48ms latency)`)
      setTimeout(() => setTestSuccess(null), 4000)
    }, 1200)
  }

  const TABS: Array<{ id: typeof activeTab; label: string; icon: any }> = [
    { id: 'General', label: 'General', icon: Sliders },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Languages', label: 'Languages', icon: Globe },
    { id: 'Integrations', label: 'Integrations', icon: Share2 },
    { id: 'Audit log', label: 'Audit log', icon: FileText },
  ]

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.official.toLowerCase().includes(auditQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(auditQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(auditQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ── Header ── */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#52605D] block">
          ADMINISTRATOR &amp; GOVERNMENT WORKSPACE
        </span>
        <h1 className="text-3xl font-normal text-[#0C2D27] tracking-tight mt-1">
          System settings &amp; Integrations
        </h1>
        <p className="text-xs sm:text-sm text-[#52605D] mt-0.5 font-normal">
          Manage government portal security, API integrations (e-Shram, BOCW, PM-JAY, UIDAI), notifications, and audit records.
        </p>
      </div>

      {/* ── Settings Container ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Left Sub-Nav Pills */}
        <div className="space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#0C2D27] text-white shadow-2xs'
                    : 'text-[#52605D] hover:text-[#0C2D27] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#FF6B53]' : 'text-[#52605D]'}`} />
                  <span>{label}</span>
                </div>
                {id === 'Integrations' && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white">
                    5 Active
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-3 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-8">
          
          {/* ──────────────── 1. GENERAL TAB ──────────────── */}
          {activeTab === 'General' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#0C2D27]">General platform settings</h2>
                <p className="text-xs text-[#52605D] mt-0.5">Core operations for worker onboarding and platform availability.</p>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Worker registration enabled</b>
                    <span className="text-xs text-[#52605D] block">Allow new workers to create portable digital identities.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, registrationEnabled: !s.registrationEnabled }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.registrationEnabled ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.registrationEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">OTP login for field teams</b>
                    <span className="text-xs text-[#52605D] block">Require secure OTP verification on new mobile devices.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, otpLoginRequired: !s.otpLoginRequired }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.otpLoginRequired ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.otpLoginRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Scheduled maintenance mode</b>
                    <span className="text-xs text-[#52605D] block">Display planned downtime notification to public users.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-amber-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">AI skill recommendations</b>
                    <span className="text-xs text-[#52605D] block">Surface explainable skill and job matches for registered workers.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, aiRecommendations: !s.aiRecommendations }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.aiRecommendations ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.aiRecommendations ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#0C2D27] block mb-1">Default Operating State</label>
                    <input
                      type="text"
                      value={settings.defaultState}
                      onChange={(e) => setSettings((s) => ({ ...s, defaultState: e.target.value }))}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0C2D27]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0C2D27] block mb-1">Primary District Hub</label>
                    <input
                      type="text"
                      value={settings.defaultDistrict}
                      onChange={(e) => setSettings((s) => ({ ...s, defaultDistrict: e.target.value }))}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0C2D27]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 2. SECURITY TAB ──────────────── */}
          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#0C2D27]">Security &amp; Authentication Control</h2>
                <p className="text-xs text-[#52605D] mt-0.5">Enforce government data protection and access rules.</p>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Enforce 2-Factor Authentication (2FA)</b>
                    <span className="text-xs text-[#52605D] block">Mandatory TOTP or SMS OTP for all official accounts.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, enforce2FA: !s.enforce2FA }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.enforce2FA ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.enforce2FA ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Strict Aadhaar e-KYC Vault Sync</b>
                    <span className="text-xs text-[#52605D] block">Require encrypted UIDAI token matching for official records.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, aadhaarKycStrictMode: !s.aadhaarKycStrictMode }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.aadhaarKycStrictMode ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.aadhaarKycStrictMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#0C2D27] block mb-1">Session Inactivity Timeout</label>
                    <select
                      value={settings.sessionTimeoutMinutes}
                      onChange={(e) => setSettings((s) => ({ ...s, sessionTimeoutMinutes: Number(e.target.value) }))}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0C2D27] bg-white"
                    >
                      <option value={15}>15 Minutes (High Security)</option>
                      <option value={30}>30 Minutes (Recommended)</option>
                      <option value={60}>1 Hour</option>
                      <option value={480}>8 Hours (Shift Duration)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0C2D27] block mb-1">Password Policy Requirement</label>
                    <select
                      value={settings.passwordPolicy}
                      onChange={(e) => setSettings((s) => ({ ...s, passwordPolicy: e.target.value as any }))}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0C2D27] bg-white"
                    >
                      <option value="standard">Standard (8+ Chars)</option>
                      <option value="strong">Strong (Numbers + Symbols + 10 Chars)</option>
                      <option value="enterprise">Government Enterprise (12 Chars + Quarterly Reset)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <label className="text-xs font-bold text-[#0C2D27] block mb-1">Whitelisted IP Subnets (Government Network)</label>
                  <input
                    type="text"
                    value={settings.ipWhitelisting}
                    onChange={(e) => setSettings((s) => ({ ...s, ipWhitelisting: e.target.value }))}
                    placeholder="Comma-separated IP CIDR ranges..."
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 font-mono text-slate-700 focus:outline-none focus:border-[#0C2D27]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Inspectors accessing from outside these ranges will trigger 2FA step-up.</span>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 3. NOTIFICATIONS TAB ──────────────── */}
          {activeTab === 'Notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#0C2D27]">Alerts &amp; Dispatch Rules</h2>
                <p className="text-xs text-[#52605D] mt-0.5">Configure SMS gateway, emergency incident dispatch, and daily digests.</p>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                <div className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Emergency Casualty Email Alerts</b>
                    <span className="text-xs text-[#52605D] block">Send instant email alerts to District Magistrate upon accident report.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, emergencyAlertEmail: !s.emergencyAlertEmail }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.emergencyAlertEmail ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.emergencyAlertEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Emergency SMS Push to Duty Inspector</b>
                    <span className="text-xs text-[#52605D] block">Dispatch real-time SMS to field inspectors for high-severity cases.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, emergencyAlertSms: !s.emergencyAlertSms }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.emergencyAlertSms ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.emergencyAlertSms ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Wage Violation Alert Threshold</b>
                    <span className="text-xs text-[#52605D] block">Notify Labour Officer when wage reports fall &gt;15% below minimum wage.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, wageViolationAlerts: !s.wageViolationAlerts }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.wageViolationAlerts ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.wageViolationAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6">
                  <label className="text-xs font-bold text-[#0C2D27] block mb-1">Official SMS Gateway Provider</label>
                  <input
                    type="text"
                    value={settings.smsGatewayProvider}
                    onChange={(e) => setSettings((s) => ({ ...s, smsGatewayProvider: e.target.value }))}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0C2D27]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 4. LANGUAGES TAB ──────────────── */}
          {activeTab === 'Languages' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#0C2D27]">Language &amp; Dialect Preferences</h2>
                <p className="text-xs text-[#52605D] mt-0.5">Multilingual options for migrant worker accessibility and AI voice support.</p>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                <div className="pt-4 first:pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#0C2D27] block mb-1">Default Portal Interface Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => setSettings((s) => ({ ...s, defaultLanguage: e.target.value }))}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0C2D27] bg-white"
                    >
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="gu">Gujarati (ગુજરાતી)</option>
                      <option value="en">English</option>
                      <option value="mr">Marathi (मराठी)</option>
                      <option value="or">Odia (ଓଡ଼ିଆ)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Enable Voice Dialect AI (Bhojpuri/Kutchi)</b>
                    <span className="text-xs text-[#52605D] block">Allow voice query processing in non-standard regional dialects.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, enableVoiceDialectAI: !s.enableVoiceDialectAI }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.enableVoiceDialectAI ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.enableVoiceDialectAI ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <b className="text-xs font-bold text-[#0C2D27] block">Auto-Translate Grievance Statements</b>
                    <span className="text-xs text-[#52605D] block">Automatically translate voice grievances to English &amp; Gujarati for inspectors.</span>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, autoTranslateGrievances: !s.autoTranslateGrievances }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.autoTranslateGrievances ? 'bg-[#0C2D27]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.autoTranslateGrievances ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── 5. INTEGRATIONS TAB ──────────────── */}
          {activeTab === 'Integrations' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-bold text-[#0C2D27]">Government API Integrations &amp; Gateways</h2>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> All 5 Core APIS Operational
                  </span>
                </div>
                <p className="text-xs text-[#52605D] mt-0.5">Live connections with Central &amp; State government portals for automated identity &amp; benefit verification.</p>
              </div>

              {testSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{testSuccess}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                
                {/* 1. e-Shram API */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                        ES
                      </div>
                      <div>
                        <b className="text-xs font-bold text-[#0C2D27] block">e-Shram National Database API</b>
                        <span className="text-[11px] text-slate-500 font-mono block">eshram.gov.in · Ministry of Labour</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                      </span>
                      <button
                        onClick={() => handleTestApi('e-Shram API')}
                        disabled={testingIntegration === 'e-Shram API'}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        {testingIntegration === 'e-Shram API' ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#FF6B53]" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span>Test API Ping</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">PRODUCTION API KEY</span>
                      <div className="relative">
                        <input
                          type="password"
                          value={settings.eshramApiKey}
                          onChange={(e) => setSettings((s) => ({ ...s, eshramApiKey: e.target.value }))}
                          className="w-full h-8 px-2.5 pr-8 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                        />
                        <Key className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">DAILY VERIFICATION QUOTA</span>
                      <div className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs font-mono">
                        <span>45,000 / 100,000 requests</span>
                        <span className="text-emerald-700 font-bold">45% used</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Gujarat BOCW e-Nirman Gateway */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-xs shrink-0">
                        BOCW
                      </div>
                      <div>
                        <b className="text-xs font-bold text-[#0C2D27] block">Gujarat BOCW Welfare Board (e-Nirman Portal)</b>
                        <span className="text-[11px] text-slate-500 font-mono block">enirman.gujarat.gov.in · Labour &amp; Employment Dept</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                      </span>
                      <button
                        onClick={() => handleTestApi('BOCW e-Nirman Gateway')}
                        disabled={testingIntegration === 'BOCW e-Nirman Gateway'}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        {testingIntegration === 'BOCW e-Nirman Gateway' ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#FF6B53]" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span>Test API Ping</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">GATEWAY ENDPOINT URL</span>
                    <input
                      type="text"
                      value={settings.bocwEndpoint}
                      onChange={(e) => setSettings((s) => ({ ...s, bocwEndpoint: e.target.value }))}
                      className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* 3. PM-JAY NHA API */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center text-xs shrink-0">
                        PMJAY
                      </div>
                      <div>
                        <b className="text-xs font-bold text-[#0C2D27] block">Ayushman Bharat PM-JAY NHA API</b>
                        <span className="text-[11px] text-slate-500 font-mono block">beneficiary.nha.gov.in · National Health Authority</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                      </span>
                      <button
                        onClick={() => handleTestApi('PM-JAY NHA Gateway')}
                        disabled={testingIntegration === 'PM-JAY NHA Gateway'}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        {testingIntegration === 'PM-JAY NHA Gateway' ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#FF6B53]" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span>Test API Ping</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-0.5">NHA BENEFICIARY API KEY</span>
                    <input
                      type="password"
                      value={settings.pmjayApiKey}
                      onChange={(e) => setSettings((s) => ({ ...s, pmjayApiKey: e.target.value }))}
                      className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* 4. UIDAI Aadhaar Vault & DigiLocker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <b className="text-xs font-bold text-[#0C2D27]">UIDAI Aadhaar Vault Sync</b>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">Active</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block">{settings.uidaiCertFile}</span>
                    <button
                      onClick={() => handleTestApi('UIDAI Vault Certificate')}
                      className="w-full py-1.5 rounded-xl bg-white border border-slate-200 text-[#0C2D27] text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      Verify SSL Certificate
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <b className="text-xs font-bold text-[#0C2D27]">DigiLocker OAuth Gateway</b>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">Active</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block">ID: {settings.digilockerClientId}</span>
                    <button
                      onClick={() => handleTestApi('DigiLocker OAuth')}
                      className="w-full py-1.5 rounded-xl bg-white border border-slate-200 text-[#0C2D27] text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      Test OAuth Exchange
                    </button>
                  </div>
                </div>

                {/* 5. Real-Time Webhook Callback URL */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <b className="text-xs font-bold text-[#0C2D27] block">Government Department Webhook Callback URL</b>
                  <input
                    type="text"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings((s) => ({ ...s, webhookUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-slate-200 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 block">Receives real-time JSON payloads when new casualty grievances or wage violations are filed.</span>
                </div>

              </div>
            </div>
          )}

          {/* ──────────────── 6. AUDIT LOG TAB ──────────────── */}
          {activeTab === 'Audit log' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-[#0C2D27]">System Security Audit Trail</h2>
                    <p className="text-xs text-[#52605D] mt-0.5">Immutable record of government inspector actions and settings changes.</p>
                  </div>
                  <button
                    onClick={() => alert('Exporting Official Audit Log CSV...')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[#0C2D27] hover:bg-slate-100 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search logs by official name, action, or ID..."
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0C2D27]"
                />
              </div>

              {/* Audit Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[#52605D] font-bold">
                    <tr>
                      <th className="p-3">LOG ID</th>
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">OFFICIAL</th>
                      <th className="p-3">ACTION PERFORMED</th>
                      <th className="p-3">IP ADDRESS</th>
                      <th className="p-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-[#0C2D27]">{log.id}</td>
                        <td className="p-3 text-slate-500">{log.timestamp}</td>
                        <td className="p-3 font-sans font-bold text-[#0C2D27]">{log.official}</td>
                        <td className="p-3 font-sans text-slate-700">{log.action}</td>
                        <td className="p-3 text-slate-500">{log.ip}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-sans">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Footer Save Button Bar ── */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            {saved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Settings &amp; integrations saved successfully!</span>
              </span>
            )}
            <button
              onClick={handleSave}
              className="figma-btn-coral py-3 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:brightness-105 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save settings</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
