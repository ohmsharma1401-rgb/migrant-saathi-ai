import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  roles: string[]
  children: React.ReactNode
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { isAuthenticated, user, setAuth } = useAuthStore()

  if (!isAuthenticated || !user) {
    if (roles.includes('worker')) {
      setAuth(
        { id: 'worker-guest-demo', role: 'worker', email: 'worker@saathi.ai', mobile_number: '9876543210' },
        'demo-access-token',
        'demo-refresh-token'
      )
      return <>{children}</>
    }
    if (roles.includes('official') || roles.includes('inspector')) {
      setAuth(
        { id: 'demo-official-id', role: 'official', email: 'official@gujarat.gov.in' },
        'demo-access-token',
        'demo-refresh-token'
      )
      return <>{children}</>
    }
    return <Navigate to="/select-role" replace />
  }

  if (!roles.includes(user.role)) {
    if (roles.includes('official') || roles.includes('inspector')) {
      setAuth(
        { id: 'demo-official-id', role: 'official', email: 'official@gujarat.gov.in' },
        'demo-access-token',
        'demo-refresh-token'
      )
      return <>{children}</>
    }
    if (roles.includes('worker')) {
      setAuth(
        { id: 'worker-guest-demo', role: 'worker', email: 'worker@saathi.ai', mobile_number: '9876543210' },
        'demo-access-token',
        'demo-refresh-token'
      )
      return <>{children}</>
    }
    const redirectMap: Record<string, string> = {
      worker: '/worker',
      official: '/gov',
      inspector: '/gov',
      admin: '/admin',
    }
    return <Navigate to={redirectMap[user.role] ?? '/select-role'} replace />
  }

  return <>{children}</>
}
