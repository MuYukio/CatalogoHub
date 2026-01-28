// components/layout/Footer.tsx
import Link from 'next/link'
import { 
  Gamepad2, 
  Tv, 
  Heart, 
  Github, 
  Mail, 
  Twitter,
  Facebook
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="font-bold text-white">C</span>
              </div>
              <span className="font-bold text-xl">CatalogoHub</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Seu catálogo favorito para descobrir e organizar animes e jogos. 
              Encontre suas próximas aventuras!
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Twitter size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <Github size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <Facebook size={18} />
              </Button>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/catalog" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link 
                  href="/favorites" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Favoritos
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/games" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Gamepad2 size={14} />
                  Jogos Populares
                </Link>
              </li>
              <li>
                <Link 
                  href="/animes" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Tv size={14} />
                  Animes Populares
                </Link>
              </li>
              <li>
                <Link 
                  href="/trending" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Heart size={14} />
                  Em Alta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:contato@catalogohub.com" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Mail size={14} />
                  muyukiom@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/MuYukio/CatalogoHub" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Github size={14} />
                  GitHub
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Precisa de ajuda? Entre em contato!
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CatalogoHub. Todos os direitos reservados.
            <br />
            Desenvolvido com ❤️ para a comunidade de animes e jogos.
          </p>
        </div>
      </div>
    </footer>
  )
}