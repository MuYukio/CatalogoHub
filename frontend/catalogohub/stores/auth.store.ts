import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User{
    id:number
    email: string
    createdAt: string
}

interface AuthState{
    user: User | null
    isAuthenticated: boolean
    login: (token: string, user:User) => void
    logout: () => void 
    setToken: (token:string) => void
    token: string | null 
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
        set({ token: null, user: null, isAuthenticated: false })
      },
      setToken: (token: string) => set({ token }),
    }),
    {
      name: 'auth-storage',
    }
  )
)