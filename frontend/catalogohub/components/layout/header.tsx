'use client'

import { useState, useEffect } from 'react'  
import Link from 'next/link'
import { useRouter } from 'next/navigation'   
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Gamepad2, Tv, Menu, X, LogIn, UserPlus, User, LogOut, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'  
import { authService } from '@/services/auth.service'

interface HeaderProps {
  activeTab: 'games' | 'animes'
  onTabChange: (tab: 'games' | 'animes') => void
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const isGames = activeTab === 'games'


  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? '?'

  const handleLogout = () => {
    authService.logout()  
    logout()             
    setUserMenuOpen(false)
    router.push('/')
  }

  const AuthButtons = () => {
    if (!hydrated) {
      return <div className="w-40 h-10" />
    }

    if (isAuthenticated && user) {

      return (
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors"
          >
            {/* Avatar com inicial do nome */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">{avatarLetter}</span>
            </div>
            <span className="text-sm font-semibold max-w-24 truncate">{user.name}</span>
            <ChevronDown
              size={14}
              className={cn(
                'text-muted-foreground transition-transform duration-200',
                userMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <>

              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/50 bg-background shadow-lg z-50 overflow-hidden">
      
                <div className="px-4 py-3 border-b border-border/40">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                  >
                    <User size={15} />
                    Meu Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut size={15} />
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )
    }
    return (
      <>
        <Button
          variant="outline"
          asChild
          className="gap-2 h-10 px-4 rounded-xl border-2 hover:border-primary transition-all text-sm"
        >
          <Link href="/login">
            <LogIn size={16} />
            <span className="font-semibold">Login</span>
          </Link>
        </Button>
        <Button
          asChild
          className="gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 text-sm"
        >
          <Link href="/register">
            <UserPlus size={16} />
            <span className="font-semibold">Registrar</span>
          </Link>
        </Button>
      </>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-center bg-muted/60 rounded-xl p-1 gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('games')}
                className={cn(
                  'gap-2 px-5 h-10 text-sm font-semibold rounded-lg transition-all duration-200',
                  isGames
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Gamepad2 size={17} />
                Jogos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('animes')}
                className={cn(
                  'gap-2 px-5 h-10 text-sm font-semibold rounded-lg transition-all duration-200',
                  !isGames
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Tv size={17} />
                Animes
              </Button>
            </nav>
          </div>

          {/* Desktop: ThemeToggle + botões de auth */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-border mx-1" />
            <AuthButtons />
          </div>

          {/* Mobile: apenas ThemeToggle + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 rounded-xl border-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 py-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 p-1 bg-muted/60 rounded-xl">
                <Button
                  variant="ghost"
                  onClick={() => { onTabChange('games'); setMobileMenuOpen(false) }}
                  className={cn(
                    'flex-1 gap-2 h-11 rounded-lg font-semibold transition-all',
                    isGames ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-muted-foreground'
                  )}
                >
                  <Gamepad2 size={18} /> Jogos
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { onTabChange('animes'); setMobileMenuOpen(false) }}
                  className={cn(
                    'flex-1 gap-2 h-11 rounded-lg font-semibold transition-all',
                    !isGames ? 'bg-purple-600 text-white hover:bg-purple-700' : 'text-muted-foreground'
                  )}
                >
                  <Tv size={18} /> Animes
                </Button>
              </div>

              <div className="h-px bg-border my-1" />

              {/* Mobile: também verifica autenticação */}
              {hydrated && isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{avatarLetter}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="justify-start gap-3 h-11 rounded-xl">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <User size={17} /> Meu Perfil
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="justify-start gap-3 h-11 rounded-xl text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    <LogOut size={17} /> Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild className="justify-start gap-3 h-11 rounded-xl">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn size={17} /> Login
                    </Link>
                  </Button>
                  <Button asChild className="justify-start gap-3 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <UserPlus size={17} /> Registrar
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}