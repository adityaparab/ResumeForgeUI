import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '@/app/hooks'
import { toast } from '@/components/common/toast'
import { authApi } from '@/lib/api-client'
import type { LoginDto, RegisterDto } from '@/lib/schemas/auth.schema'
import { logout as logoutAction, setCredentials } from '@/stores/authSlice'

export function useLoginMutation() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (response) => {
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      )
      navigate('/')
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : /* v8 ignore next */ 'Login failed. Please check your credentials.'
      toast.error(message)
    },
  })
}

export function useRegisterMutation() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (response) => {
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      )
      toast.success('Account created successfully!')
      navigate('/')
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : /* v8 ignore next */ 'Registration failed. Please try again.'
      toast.error(message)
    },
  })
}

export function useLogoutMutation() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      dispatch(logoutAction())
      queryClient.clear()
      navigate('/login')
    },
  })
}
