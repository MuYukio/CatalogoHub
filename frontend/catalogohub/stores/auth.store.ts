import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

// estado global: guarda user/token em memória + localStorage + cookie

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setToken: (token: string) => void
  setUser: (user: User) => void
}

const setCookie = (name: string, value: string, days: number = 2) => {
  if (typeof window === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true })
        setCookie('token', token)
      },

      logout: () => {                                    
        set({ token: null, user: null, isAuthenticated: false })
        removeCookie('token')
      },

      setToken: (token: string) => {
        set({ token })
        setCookie('token', token)
      },

      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)