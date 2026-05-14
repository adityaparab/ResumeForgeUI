import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser, selectIsAuthenticated } from '@/stores/authSlice'

export function useAuth() {
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  return {
    user,
    isAuthenticated,
  }
}
