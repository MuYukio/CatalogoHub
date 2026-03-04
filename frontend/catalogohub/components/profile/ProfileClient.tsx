'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'

export default function ProfileClient() {
  const { user, token, logout, isAuthenticated, setUser } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !token) {
        router.push('/login')
        return
      }

      if (token && !user) {
        try {
          const session = await authService.getSession()
          if (session) {
            setUser({
              id: session.userId,
              name: session.name,
              email: session.email,
              age: session.age,
              allowAdultContent: session.allowAdultContent,
            })
          } else {
            logout()
            router.push('/login')
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error)
          logout()
          router.push('/login')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [isAuthenticated, token, user, router, logout, setUser])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Nome
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">
              {user.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              E-mail
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">
              {user.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Idade
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">
              {user.age}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Conteúdo adulto
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">
              {user.allowAdultContent ? 'Permitido' : 'Não permitido'}
            </p>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push('/profile/edit')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Editar perfil
          </button>
          <button
            onClick={() => {
              authService.logout()
              logout()
              router.push('/')
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}