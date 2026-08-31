import { useState } from 'react'
import {
  Settings,
  Globe,
  Bell,
  ShieldCheck,
  Database,
  Save,
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const AUDIT_EVENTS = [
  { id: 1,  actor: 'admin@saathi.ai',          action: 'USER_CREATED',         target: 'official@gujarat.gov.in', ts: '2024-05-20 09:14:22' },
  { id: 2,  actor: 'official@gujarat.gov.in',  action: 'LOGIN_SUCCESS',        target: '—',                       ts: '2024-05-20 08:55:01' },
  { id: 3,  actor: 'admin@saathi.ai',          action: 'SCHEME_UPDATED',       target: 'BOCW-WF',                 ts: '2024-05-19 17:32:44' },
  { id: 4,  actor: 'inspector@gujarat.gov.in', action: 'GRIEVANCE_ASSIGNED',   target: 'GRV-2024-089',            ts: '2024-05-19 15:10:09' },
  { id: 5,  actor: 'admin@saathi.ai',          action: 'SETTINGS_SAVED',       target: 'API_SETTINGS',            ts: '2024-05-19 11:04:53' },
  { id: 6,  actor: '9876543210',               action: 'PROFILE_UPDATED',      target: 'worker:U004',             ts: '2024-05-18 19:22:37' },
  { id: 7,  actor: 'admin@saathi.ai',          action: 'USER_DEACTIVATED',     target: 'ankit.official@guj.gov.in',ts: '2024-05-18 14:05:11' },
  { id: 8,  actor: 'official@gujarat.gov.in',  action: 'REPORT_EXPORTED',      target: 'WelfareAnalytics',        ts: '2024-05-17 10:48:29' },
  { id: 9,  actor: 'admin@saathi.ai',          action: 'SCHEME_CREATED',       target: 'BOCW-HEALTH',             ts: '2024-05-16 16:33:00' },
  { id: 10, actor: 'inspector@gujarat.gov.in', action: 'LOGIN_SUCCESS',        target: '—',                       ts: '2024-05-16 09:00:47' },
]

const ACTION_STYLE: Record<string, string> = {
  LOGIN_SUCCESS:      'bg-green-100 text-green-800',
  USER_CREATED:       'bg-blue-100 text-blue-800',
  USER_DEACTIVATED:   'bg-red-100 text-red-800',
  SCHEME_CREATED:     'bg-indigo-100 text-indigo-800',
  SCHEME_UPDATED:     'bg-purple-100 text-purple-800',
  SETTINGS_SAVED:     'bg-gray-100 text-gray-700',
  GRIEVANCE_ASSIGNED: 'bg-amber-100 text-amber-800',
  PROFILE_UPDATED:    'bg-teal-100 text-teal-800',
  REPORT_EXPORTED:    'bg-orange-100 text-orange-800',
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-teal-600' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`}
        />
      </span>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  )
}

export default function SystemSettings() {
  // Masked API credentials state
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••')
  const [showKey, setShowKey] = useState(false)
  const [modelId, setModelId] = useState('saathi-nlp-v2-instruct')
  const [projectId, setProjectId] = useState('proj_saathi_ai_••••')
  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('ok')

  const [otpMockMode, setOtpMockMode] = useState(true)
  const [otpExpiry, setOtpExpiry] = useState('300')

  const [appName, setAppName] = useState('Migrant Saathi AI')
  const [debugMode, setDebugMode] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function testConnection() {
    setConnStatus('testing')
    await new Promise((r) => setTimeout(r, 1200))
    setConnStatus('ok')
  }

  async function handleSaveAll() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 900))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-teal-600" />
          System Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure platform-wide security and integration credentials</p>
      </div>

      {/* ── 1. API Settings (Masked Credentials) ─────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4 text-teal-600" />
            AI Service Core Integration Configuration
          </CardTitle>
          <CardDescription>Secure AI endpoint API connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Connection Status:</span>
            {connStatus === 'ok' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
              </span>
            )}
            {connStatus === 'testing' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing Connection…
              </span>
            )}
          </div>

          {/* Masked API Key Input with Eye Toggle */}
          <div>
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">API Key (Encrypted &amp; Masked)</Label>
            <div className="relative flex items-center">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••"
                className="pr-10 dark:bg-slate-950 dark:border-slate-800"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title={showKey ? 'Hide Secret Key' : 'Show Secret Key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Model Identifier</Label>
            <Input
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="dark:bg-slate-950 dark:border-slate-800"
              placeholder="saathi-nlp-v2"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Project Workspace ID</Label>
            <Input
              type="password"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="dark:bg-slate-950 dark:border-slate-800"
              placeholder="proj_••••"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={connStatus === 'testing'}
          >
            {connStatus === 'testing' && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Test Secure Connection
          </Button>
        </CardContent>
      </Card>

      {/* ── 2. OTP Settings ─────────────────────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal-600" />
            OTP Authentication Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            checked={otpMockMode}
            onChange={setOtpMockMode}
            label="Mock OTP Mode (use '123456' for testing)"
          />
          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">OTP Expiry (seconds)</Label>
            <Input
              type="number"
              min={60}
              max={900}
              value={otpExpiry}
              onChange={(e) => setOtpExpiry(e.target.value)}
              className="max-w-40 dark:bg-slate-950 dark:border-slate-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 3. App Settings ─────────────────────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-teal-600" />
            Application General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">App Portal Title</Label>
            <Input value={appName} onChange={(e) => setAppName(e.target.value)} className="max-w-80 dark:bg-slate-950 dark:border-slate-800" />
          </div>
          <Toggle
            checked={debugMode}
            onChange={setDebugMode}
            label="Debug Logging Mode"
          />
        </CardContent>
      </Card>

      {/* ── 4. Integrations Status ───────────────────────────── */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-teal-600" />
            External Service Integrations
          </CardTitle>
          <CardDescription>Status of connected government APIs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'AI Language Service',      status: 'connected', endpoint: 'secure.cloud.ai.service' },
            { name: 'e-Shram Portal API',        status: 'connected', endpoint: 'api.eshram.gov.in'      },
            { name: 'UIDAI Aadhaar Verification', status: 'pending',   endpoint: 'stage1.uidai.gov.in'    },
          ].map(({ name, status, endpoint }) => (
            <div key={name} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{name}</p>
                <p className="text-xs font-mono text-gray-400">{endpoint}</p>
              </div>
              <Badge variant={status === 'connected' ? 'success' : 'warning'}>{status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>


      {/* ── 6. Audit Log ────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            Audit Log
          </CardTitle>
          <CardDescription>Last 10 system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-400">
                  <th className="pb-2 font-medium pr-4">#</th>
                  <th className="pb-2 font-medium pr-4">Actor</th>
                  <th className="pb-2 font-medium pr-4">Action</th>
                  <th className="pb-2 font-medium pr-4">Target</th>
                  <th className="pb-2 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {AUDIT_EVENTS.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 pr-4 text-gray-400">{ev.id}</td>
                    <td className="py-2.5 pr-4 font-mono text-gray-600 max-w-[160px] truncate">{ev.actor}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${ACTION_STYLE[ev.action] ?? 'bg-gray-100 text-gray-700'}`}>
                        {ev.action}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 font-mono max-w-[140px] truncate">{ev.target}</td>
                    <td className="py-2.5 text-right text-gray-400 whitespace-nowrap">{ev.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Save all ────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            All settings saved
          </span>
        )}
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
            : <><Save className="mr-2 h-4 w-4" /> Save All Settings</>
          }
        </Button>
      </div>
    </div>
  )
}
