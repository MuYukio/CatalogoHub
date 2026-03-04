// components/ui/theme-toggle.tsx - VERSÃO FINAL
'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled className="h-12 w-12 rounded-xl">
        <div className="h-6 w-6 bg-muted rounded-full" />
      </Button>
    )
  }

  return (
    <Button 
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-12 w-12 rounded-xl border-2 relative overflow-hidden hover:border-primary transition-all"
      aria-label="Alternar tema"
    >
      {/* Sol - sempre visível, mas controlado por opacity e transform */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
        theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
      }`}>
        <Sun className="h-6 w-6 text-amber-500" />
      </div>
      
      {/* Lua - sempre visível, mas controlado por opacity e transform */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
        theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
      }`}>
        <Moon className="h-6 w-6 text-blue-400" />
      </div>
      
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}