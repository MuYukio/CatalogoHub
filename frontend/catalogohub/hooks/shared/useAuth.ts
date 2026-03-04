import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { LoginRequest, RegisterRequest } from '@/types'

export function useLogin() {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      const user = {
        id: response.userId,
        name: response.name,
        email: response.email,
        age: response.age,
        allowAdultContent: response.allowAdultContent,
      }
      login(response.token, user)
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      const user = {
        id: response.userId,
        name: response.name,
        email: response.email,
        age: response.age,
        allowAdultContent: response.allowAdultContent,
      }
      login(response.token, user)
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return () => {
    authService.logout()
    logout()
    queryClient.clear()
    window.location.href = '/login'
  }
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await authService.getSession()
      if (!response) return null
      return {
        id: response.userId,
        name: response.name,
        email: response.email,
        age: response.age,
        allowAdultContent: response.allowAdultContent,
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useAuth() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const { data: session, isLoading } = useSession()
  useEffect(() => {
    if (!user && session && !isLoading) {
      setUser(session)
    }
  }, [user, session, isLoading, setUser])

  return {
    user: user || session,
    isAuthenticated: !!(user || session),
    isLoading,
  }
}