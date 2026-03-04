import Link from 'next/link'
import { Gamepad2, Tv, Heart, Github, Mail, Twitter, Facebook, Home, BookOpen, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 mt-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                <span className="font-bold text-white text-lg">C</span>
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CatalogoHub
                </span>
                <p className="text-xs text-muted-foreground -mt-0.5">Jogos & Animes</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seu catálogo favorito para descobrir e organizar animes e jogos.
            </p>
            <div className="flex gap-2">
              {[
                { href: 'https://twitter.com', icon: <Twitter size={16} />, label: 'Twitter' },
                { href: 'https://github.com/MuYukio/CatalogoHub', icon: <Github size={16} />, label: 'GitHub' },
                { href: 'https://facebook.com', icon: <Facebook size={16} />, label: 'Facebook' },
              ].map(s => (
                <Button key={s.label} variant="outline" size="icon"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:scale-105 transition-all"
                  asChild
                >
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    {s.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Navegação
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home', icon: <Home size={14} /> },
                { href: '/catalog', label: 'Catálogo', icon: <BookOpen size={14} /> },
                { href: '/favorites', label: 'Favoritos', icon: <Heart size={14} /> },
                { href: '/profile', label: 'Perfil', icon: <User size={14} /> },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <span className="opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Categorias
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/games', label: 'Jogos Populares', icon: <Gamepad2 size={14} /> },
                { href: '/animes', label: 'Animes da Temporada', icon: <Tv size={14} /> },
                { href: '/trending', label: 'Em Alta', icon: <Sparkles size={14} /> },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <span className="opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Contato
            </h3>
            <ul className="space-y-3 mb-4">
              <li>
                <a href="mailto:muyukiom@gmail.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Mail size={14} className="opacity-60 group-hover:opacity-100" />
                  muyukiom@gmail.com
                </a>
              </li>
              <li>
                <a href="https://github.com/MuYukio/CatalogoHub" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Github size={14} className="opacity-60 group-hover:opacity-100" />
                  GitHub
                </a>
              </li>
            </ul>
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/10">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Precisa de ajuda? Respondemos em até 24h. 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {currentYear} <span className="font-semibold text-foreground">CatalogoHub</span>. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Feito com <Heart size={12} className="text-red-500 fill-red-500" /> para a comunidade
          </p>
        </div>
      </div>
    </footer>
  )
}