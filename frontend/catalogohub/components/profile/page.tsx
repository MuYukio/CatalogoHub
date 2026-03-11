'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth.store'
import { favoritesService } from '@/services/favorites.service'
import { authService } from '@/services/auth.service'
import type { Favorite } from '@/types'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  User, Gamepad2, Tv, Heart, LogOut, Download,
  Star, Calendar, Shield, ChevronRight, Loader2,
  AlertCircle, BookOpen
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'Game' | 'Anime'>('all')
  const [error, setError] = useState<string | null>(null)

  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    setIsLoadingFavorites(true)
    favoritesService.getAll()
      .then(setFavorites)
      .catch(() => setError('Erro ao carregar favoritos.'))
      .finally(() => setIsLoadingFavorites(false))
  }, [isAuthenticated])

  const handleLogout = () => {
    authService.logout()
    logout()
    router.push('/')
  }

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true)
    try {
      const blob = await favoritesService.generatePdf()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'meus-favoritos.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Erro ao gerar PDF.')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const filteredFavorites = favorites.filter(f =>
    activeTab === 'all' ? true : f.type === activeTab
  )

  const gamesCount = favorites.filter(f => f.type === 'Game').length
  const animesCount = favorites.filter(f => f.type === 'Anime').length

  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? '?'

  if (!hydrated) return null 
  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab="games" onTabChange={() => {}} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/*  Card de perfil  */}
        <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden mb-8 shadow-sm">
          {/* Banner gradiente */}
          <div className="h-28 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 opacity-90" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative z-10 h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-background flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{avatarLetter}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-400 dark:border-red-900 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut size={15} />
                Sair
              </Button>
            </div>

            {/* Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {user.age && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      {user.age} anos
                    </span>
                  )}
                  {user.allowAdultContent && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                      <Shield size={12} />
                      Conteúdo adulto ativo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  Estatísticas  */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: favorites.length, icon: <Heart size={18} />, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/40' },
            { label: 'Jogos', value: gamesCount, icon: <Gamepad2 size={18} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
            { label: 'Animes', value: animesCount, icon: <Tv size={18} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4 flex flex-col items-center gap-2 shadow-sm">
              <div className={cn('p-2 rounded-lg', stat.bg, stat.color)}>
                {stat.icon}
              </div>
              <span className="text-2xl font-bold">{isLoadingFavorites ? '—' : stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/*  Favoritos  */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
          {/* Header da seção */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <div className="flex items-center gap-2">
             
              <h2 className="font-semibold text-lg">Meus Favoritos</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || favorites.length === 0}
              className="gap-2 text-sm"
            >
              {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Exportar PDF
            </Button>
          </div>

          {/* Tabs filtro */}
          <div className="flex gap-1 px-6 pt-4 pb-2">
            {([
              { key: 'all', label: 'Todos', count: favorites.length },
              { key: 'Game', label: 'Jogos', count: gamesCount },
              { key: 'Anime', label: 'Animes', count: animesCount },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5 flex items-center',
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.key ? 'bg-white/20' : 'bg-muted-foreground/20'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="px-6 pb-6">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm py-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {isLoadingFavorites ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-muted-foreground" />
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="text-5xl opacity-20">
                  {activeTab === 'Game' ? '🎮' : activeTab === 'Anime' ? '📺' : '⭐'}
                </div>
                <p className="text-muted-foreground text-sm">Nenhum favorito ainda.</p>
                <Button size="sm" variant="outline" asChild className="gap-2">
                  <Link href="/">
                    <BookOpen size={14} />
                    Explorar catálogo
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {filteredFavorites.map(fav => (
                  <div
                    key={fav.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background hover:bg-muted/40 transition-colors group"
                  >
                    {/* Imagem */}
                    <div className="relative h-14 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {fav.imageUrl ? (
                        <Image
                          src={fav.imageUrl}
                          alt={fav.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          {fav.type === 'Game' ? <Gamepad2 size={16} /> : <Tv size={16} />}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{fav.title}</p>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        fav.type === 'Game'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      )}>
                        {fav.type === 'Game' ? 'Jogo' : 'Anime'}
                      </span>
                    </div>

                    <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}