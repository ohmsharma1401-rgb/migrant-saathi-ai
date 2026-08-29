import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  roles: string[]
  children: React.ReactNode
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/select-role" replace />
  }

  if (!roles.includes(user.role)) {
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
