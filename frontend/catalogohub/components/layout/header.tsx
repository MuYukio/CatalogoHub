'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Gamepad2, Tv, Menu, X, LogIn, UserPlus } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

interface HeaderProps {
  activeTab: 'games' | 'animes'
  onTabChange: (tab: 'games' | 'animes') => void
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isGames = activeTab === 'games'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between"> {/* ← h-28 → h-20 */}

          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo />
            </Link>

            {/* Tabs desktop — pill switcher */}
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

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-border mx-1" />
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
          </div>

          {/* Mobile */}
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
            </div>
          </div>
        )}
      </div>
    </header>
  )
}