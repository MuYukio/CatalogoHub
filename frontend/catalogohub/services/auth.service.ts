import { api } from '@/lib/api'
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const payload = { ...data, confirmPassword: data.password }
    const response = await api.post('/api/Auth/register', payload)
    return response.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/Auth/login', data)
    return response.data
  },

  getSession: async (): Promise<AuthResponse | null> => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const response = await api.get('/api/Auth/me')
      return response.data
    } catch {
      return null
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('token')
  },

  getUser: (): any | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  logout: (): void => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  },
}