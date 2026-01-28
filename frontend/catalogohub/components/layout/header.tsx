// components/layout/header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { 
  Gamepad2, 
  Tv, 
  Sun, 
  Moon, 
  Menu, 
  X,
  LogIn,
  UserPlus
} from 'lucide-react'

interface HeaderProps {
  activeTab: 'games' | 'animes'
  onTabChange: (tab: 'games' | 'animes') => void
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo e Navegação Desktop */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative flex items-center">
                {/* Versão com imagem - ajuste o caminho conforme sua logo */}
                <div className="relative h-8 w-8 mr-2">
                 <Image
                  src="/public/catalagohubLogo.png"
                  alt="CatalogoHub"
                  width={160}
                  height={40}
                  className="h-8 w-auto dark:invert dark:brightness-200" // Ajuste para tema escuro
                  priority
                />
                </div>
                {/* Texto da logo */}
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CatalogoHub
                </span>
              </div>
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={activeTab === 'games' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('games')}
                className="gap-2"
              >
                <Gamepad2 size={16} />
                Jogos
              </Button>
              <Button
                variant={activeTab === 'animes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('animes')}
                className="gap-2"
              >
                <Tv size={16} />
                Animes
              </Button>
            </nav>
          </div>

          {/* Resto do código permanece igual... */}
          <div className="hidden md:flex items-center gap-2">
            {/* Toggle Tema */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Alternar tema"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Botões de Auth */}
            <Button variant="ghost" asChild>
              <Link href="/login" className="gap-2">
                <LogIn size={16} />
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/register" className="gap-2">
                <UserPlus size={16} />
                Registrar
              </Link>
            </Button>
          </div>

          {/* Menu Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 animate-in slide-in-from-top">
            <div className="flex flex-col gap-2">
              <Button
                variant={activeTab === 'games' ? 'default' : 'ghost'}
                onClick={() => {
                  onTabChange('games')
                  setMobileMenuOpen(false)
                }}
                className="justify-start gap-2"
              >
                <Gamepad2 size={16} />
                Jogos
              </Button>
              <Button
                variant={activeTab === 'animes' ? 'default' : 'ghost'}
                onClick={() => {
                  onTabChange('animes')
                  setMobileMenuOpen(false)
                }}
                className="justify-start gap-2"
              >
                <Tv size={16} />
                Animes
              </Button>
              
              <div className="h-px bg-border my-2" />
              
              <Button variant="ghost" asChild className="justify-start gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn size={16} />
                  Login
                </Link>
              </Button>
              <Button asChild className="justify-start gap-2">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus size={16} />
                  Registrar
                </Link>
              </Button>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Tema</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}