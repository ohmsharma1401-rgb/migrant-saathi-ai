import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Wrench,
  Landmark,
  DollarSign,
  AlertTriangle,
  Bot,
  BarChart2,
  LogIn,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'

const stats = [
  { value: '6M+', label: 'Migrant Workers in Gujarat' },
  { value: '50+', label: 'Government Welfare Schemes' },
  { value: '3', label: 'Languages Supported' },
  { value: '24/7', label: 'AI Assistance' },
]

const features = [
  {
    icon: Wrench,
    color: '#3b82f6',
    bg: '#eff6ff',
    title: 'Skill Mapping',
    desc: 'Map your skills and work history. Get recognized for your expertise.',
    route: '/worker/skills',
    btnLabel: 'Map Skills →',
    role: 'worker',
  },
  {
    icon: Landmark,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    title: 'Welfare Discovery',
    desc: 'AI identifies government schemes you qualify for — check your eligibility instantly.',
    route: '/worker/welfare',
    btnLabel: 'Check My Eligibility →',
    role: 'worker',
  },
  {
    icon: DollarSign,
    color: '#10b981',
    bg: '#ecfdf5',
    title: 'Wage Fairness',
    desc: 'Compare your wages with Gujarat official reference data. Check wage rates instantly.',
    route: '/worker/wages',
    btnLabel: 'Check Wage Rate →',
    role: 'worker',
  },
  {
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: '#fffbeb',
    title: 'Safety Reporting',
    desc: 'Report workplace safety issues and track your complaints in real time.',
    route: '/worker/report',
    btnLabel: 'Report Safety Issue →',
    role: 'worker',
  },
  {
    icon: Bot,
    color: '#06b6d4',
    bg: '#ecfeff',
    title: 'AI Assistant',
    desc: 'Ask questions in Hindi, Gujarati, or English. Get instant, grounded answers.',
    route: '/worker/ai',
    btnLabel: 'Ask AI Assistant →',
    role: 'worker',
  },
  {
    icon: BarChart2,
    color: '#6366f1',
    bg: '#eef2ff',
    title: 'Official Dashboard',
    desc: 'Government officials get AI-powered analytics and insights across the workforce.',
    route: '/gov',
    btnLabel: 'Government Portal →',
    role: 'official',
  },
]

const techBadges = [
  { label: 'React', color: '#61dafb', text: '#0f172a' },
  { label: 'FastAPI', color: '#009688', text: '#fff' },
  { label: 'PostgreSQL', color: '#336791', text: '#fff' },
  { label: 'IBM watsonx.ai', color: '#be95ff', text: '#0f172a' },
  { label: 'IBM Granite', color: '#a56eff', text: '#0f172a' },
  { label: 'pgvector', color: '#4f46e5', text: '#fff' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return (
    <div style={{ fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif' }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 40%, #0f172a 100%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Nav */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: '7px 8px',
                display: 'flex',
              }}
            >
              <Shield size={22} color="#fff" />
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>
              Migrant Saathi AI
            </span>
          </div>
          <button
            onClick={() => navigate('/select-role')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8,
              color: '#fff',
              padding: '8px 18px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)')}
          >
            <LogIn size={15} />
            Login
          </button>
        </nav>

        {/* Hero content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px 24px 80px',
          }}
        >
          {/* Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(139,92,246,0.25)',
              border: '1px solid rgba(167,139,250,0.4)',
              borderRadius: 999,
              padding: '5px 14px',
              color: '#c4b5fd',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 28,
            }}
          >
            <Bot size={14} /> Powered by IBM watsonx.ai
          </div>

          <h1
            style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.75rem)',
              lineHeight: 1.12,
              letterSpacing: '-1px',
              maxWidth: 780,
              margin: '0 auto 20px',
            }}
          >
            Smart Migrant Labour
            <br />
            <span style={{ color: '#a5b4fc' }}>Welfare Platform</span>
          </h1>

          <p style={{ color: '#bfdbfe', fontSize: 18, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Powered by IBM watsonx.ai · Protecting{' '}
            <strong style={{ color: '#fff' }}>6 Million+</strong> Migrant Workers in Gujarat
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            <button
              onClick={() => {
                setAuth(
                  { id: 'worker-demo-123', role: 'worker', email: 'worker@saathi.ai', mobile_number: '9876543210' },
                  'demo-access-token',
                  'demo-refresh-token'
                )
                navigate('/worker')
              }}
              style={{
                background: '#fff',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: 12,
                padding: '15px 32px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)' }}
            >
              👷 I'm a Worker
            </button>
            <button
              onClick={() => {
                setAuth(
                  { id: 'demo-official-id', role: 'official', email: 'official@gujarat.gov.in' },
                  'demo-access-token',
                  'demo-refresh-token'
                )
                navigate('/gov')
              }}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: 12,
                padding: '15px 32px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#fff'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              🏛 Government Portal
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['🤖 IBM Granite AI', '🔒 Secure & Private', '🌍 Available in 3 Languages'].map(b => (
              <span
                key={b}
                style={{
                  color: '#94a3b8',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
            textAlign: 'center',
          }}
        >
          {stats.map(s => (
            <div key={s.value}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#1e40af', lineHeight: 1 }}>{s.value}</div>
              <div style={{ marginTop: 8, color: '#64748b', fontSize: 15 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 32,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 8,
            }}
          >
            Everything a migrant worker needs
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 48, fontSize: 16 }}>
            One platform. Every welfare service. Powered by AI.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: 24,
            }}
          >
            {features.map(f => {
              const Icon = f.icon
              const handleCardClick = () => {
                if (f.role === 'official') {
                  setAuth(
                    { id: 'demo-official-id', role: 'official', email: 'official@gujarat.gov.in' },
                    'demo-access-token',
                    'demo-refresh-token'
                  )
                } else {
                  setAuth(
                    { id: 'worker-demo-123', role: 'worker', email: 'worker@saathi.ai', mobile_number: '9876543210' },
                    'demo-access-token',
                    'demo-refresh-token'
                  )
                }
                navigate(f.route)
              }

              return (
                <div
                  key={f.title}
                  onClick={handleCardClick}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '28px 26px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(-3px)'
                    el.style.boxShadow = '0 6px 28px rgba(0,0,0,0.11)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)'
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: f.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Icon size={22} color={f.color} />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCardClick}
                    style={{
                      marginTop: 20,
                      background: f.bg,
                      color: f.color,
                      border: `1px solid ${f.color}40`,
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {f.btnLabel}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Technology ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)',
          padding: '72px 24px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Powered by Industry-Leading Technology
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: 40, fontSize: 15 }}>
          Built on enterprise-grade infrastructure for scale and reliability
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
          {techBadges.map(b => (
            <span
              key={b.label}
              style={{
                background: b.color,
                color: b.text,
                borderRadius: 999,
                padding: '8px 20px',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.2px',
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: '#0f172a',
          padding: '48px 40px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={20} color="#60a5fa" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Migrant Saathi AI</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>
            Your Rights. Your Welfare. Your Voice.
          </p>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 16 }}>
            © {new Date().getFullYear()} Migrant Saathi AI. IBM watsonx.ai powered.
          </p>
        </div>
        <div
          style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 12,
            padding: '16px 20px',
            maxWidth: 400,
          }}
        >
          <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
            ⚠ Important Disclaimer
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7 }}>
            AI outputs use cautious language. Welfare eligibility is shown as "Potentially Eligible"
            and requires official verification. This platform does not constitute legal or financial
            advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
