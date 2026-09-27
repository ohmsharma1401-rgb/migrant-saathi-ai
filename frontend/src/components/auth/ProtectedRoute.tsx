import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  roles: string[]
  children: React.ReactNode
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { isAuthenticated, user, setAuth } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    if (roles.includes('worker')) {
      setAuth(
        { id: 'worker-guest-demo', role: 'worker', email: 'worker@saathi.ai', mobile_number: '9876543210' },
        'demo-access-token',
        'demo-refresh-token'
      )
      return <>{children}</>
    }
    if (roles.includes('inspector') && (location.pathname.startsWith('/inspector') || !roles.includes('official'))) {
      setAuth(
        { id: 'demo-inspector-id', role: 'inspector', email: 'inspector@gujarat.gov.in' },
        'demo-access-token',
        'demo-refresh-token'
      )
      return <>{children}</>
    }
    if (roles.includes('official')) {
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
    if (roles.includes('inspector') && location.pathname.startsWith('/inspector')) {
      setAuth(
        { id: 'demo-inspector-id', role: 'inspector', email: 'inspector@gujarat.gov.in' },
        'demo-access-token',
        'demo-refresh-token'
      )
      return <>{children}</>
    }
    if (roles.includes('official') && location.pathname.startsWith('/gov')) {
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
      inspector: '/inspector',
      admin: '/admin',
    }
    return <Navigate to={redirectMap[user.role] ?? '/select-role'} replace />
  }

  return <>{children}</>
}
