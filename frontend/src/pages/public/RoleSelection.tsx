import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle2, Cpu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface RoleCardProps {
  emoji: string
  emojiLabel: string
  title: string
  subtitles: string[]
  description: string
  pills: string[]
  buttonLabel: string
  buttonColor: string
  buttonHover: string
  onClick: () => void
}

function RoleCard({
  emoji,
  emojiLabel,
  title,
  subtitles,
  description,
  pills,
  buttonLabel,
  buttonColor,
  buttonHover,
  onClick,
}: RoleCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '32px 28px',
        border: hovered ? '2px solid #3b82f6' : '2px solid #e2e8f0',
        boxShadow: hovered
          ? '0 12px 40px rgba(59,130,246,0.15)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        width: '100%',
        maxWidth: 420,
      }}
      aria-label={`Continue as ${title}`}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 34,
          marginBottom: 18,
        }}
        aria-label={emojiLabel}
      >
        {emoji}
      </div>

      {/* Title + subtitles */}
      <h2
        style={{
          fontWeight: 800,
          fontSize: 22,
          color: '#0f172a',
          marginBottom: 4,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {subtitles.map(s => (
        <p key={s} style={{ color: '#64748b', fontSize: 13, marginBottom: 2, fontWeight: 500 }}>
          {s}
        </p>
      ))}

      {/* Description */}
      <p
        style={{
          color: '#475569',
          fontSize: 14,
          lineHeight: 1.65,
          margin: '14px 0 18px',
        }}
      >
        {description}
      </p>

      {/* Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {pills.map(p => (
          <span
            key={p}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* CTA button */}
      <button
        style={{
          width: '100%',
          padding: '13px 0',
          borderRadius: 12,
          border: 'none',
          background: hovered ? buttonHover : buttonColor,
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'background 0.15s',
          letterSpacing: '0.1px',
        }}
        onClick={e => {
          e.stopPropagation()
          onClick()
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export default function RoleSelection() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
      }}
    >
      {/* ── Left Panel ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'none',
          flex: '0 0 380px',
          background: 'linear-gradient(160deg, #1e3a8a 0%, #312e81 55%, #1e1b4b 100%)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
        }}
        className="md-left-panel"
      >
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.18)',
                borderRadius: 12,
                padding: 10,
                display: 'flex',
              }}
            >
              <Shield size={26} color="#fff" />
            </div>
            <span
              style={{ color: '#fff', fontWeight: 800, fontSize: 19, letterSpacing: '-0.3px' }}
            >
              Migrant Saathi AI
            </span>
          </div>

          <h3
            style={{
              color: '#fff',
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.5px',
              marginBottom: 12,
            }}
          >
            Your Rights.
            <br />
            Your Welfare.
            <br />
            Your Voice.
          </h3>
          <p style={{ color: '#93c5fd', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
            The AI-powered platform protecting 6M+ migrant workers in Gujarat.
          </p>

          {/* Feature highlights */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              'Smart AI-powered Assistant',
              'Multilingual Support',
              'Privacy-First Design',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} color="#34d399" strokeWidth={2.5} />
                <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Engine badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(20,184,166,0.18)',
            border: '1px solid rgba(20,184,166,0.35)',
            borderRadius: 10,
            padding: '10px 16px',
            alignSelf: 'flex-start',
          }}
        >
          <Cpu size={16} color="#5eead4" />
          <span style={{ color: '#5eead4', fontSize: 13, fontWeight: 600 }}>
            Saathi AI Core
          </span>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            color: '#64748b',
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = '#94a3b8'
            el.style.color = '#1e293b'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = '#e2e8f0'
            el.style.color = '#64748b'
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 6,
              letterSpacing: '-0.5px',
            }}
          >
            Welcome to Migrant Saathi AI
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>Choose your role to continue</p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            width: '100%',
            maxWidth: 460,
            alignItems: 'center',
          }}
        >
          <RoleCard
            emoji="👷"
            emojiLabel="Migrant worker"
            title="Migrant Worker"
            subtitles={['प्रवासी मजदूर', 'સ્થળાંતર મજૂર']}
            description="Register or login with your email OTP. Discover welfare benefits, check wage fairness, and report issues."
            pills={['✉️ Email OTP Verification', '🏛 Welfare Schemes', '💰 Wage Check']}
            buttonLabel="Worker Login / Register →"
            buttonColor="#1d4ed8"
            buttonHover="#1e40af"
            onClick={() => navigate('/login/worker')}
          />

          <RoleCard
            emoji="🏛"
            emojiLabel="Government official"
            title="Government Official"
            subtitles={['Labour Officer / Inspector / Admin']}
            description="Login with your official credentials. Access analytics, worker statistics, welfare coverage, wage alerts, and AI insights."
            pills={['🔑 Official Login', '📊 Analytics Dashboard', '🗺 Worker Map', '🤖 AI Insights']}
            buttonLabel="Government Login →"
            buttonColor="#4f46e5"
            buttonHover="#4338ca"
            onClick={() => navigate('/login/official')}
          />
        </div>

        {/* Small footer note */}
        <p
          style={{
            marginTop: 36,
            color: '#94a3b8',
            fontSize: 12,
            textAlign: 'center',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          AI outputs use cautious language. Welfare eligibility requires official verification.
        </p>
      </div>

      {/* Inline style to show the left panel on md+ screens */}
      <style>{`
        @media (min-width: 768px) {
          .md-left-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}
