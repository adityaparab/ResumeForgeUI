import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function PublicRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
