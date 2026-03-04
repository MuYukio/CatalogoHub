'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useLogin } from '@/hooks/shared/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, Eye, EyeOff, Gamepad2, Tv, Sparkles, ArrowLeft } from 'lucide-react'
import { BackHomeButton } from '../ui/back-home-button'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const loginMutation = useLogin()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push('/profile')
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'E-mail ou senha incorretos')
      },
    })
  }

  return (
    <div className="min-h-screen flex bg-background">

      {/* visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex-col items-center justify-center p-12">
        {/* Fundo animado */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ícones flutuantes */}
        <div className="absolute top-20 left-16 opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <Gamepad2 size={48} className="text-white" />
        </div>
        <div className="absolute bottom-24 right-20 opacity-20 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>
          <Tv size={40} className="text-white" />
        </div>
        <div className="absolute top-1/3 right-12 opacity-15 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '4s' }}>
          <Sparkles size={32} className="text-white" />
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 text-center text-white max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-3xl font-bold text-white">Catalogo</span>
              <span className="text-3xl font-black text-white/80">Hub</span>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Bem-vindo de<br />volta!
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Sua coleção de jogos e animes favoritos está esperando por você.
          </p>

          {/* Estatísticas decorativas */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '500K+', label: 'Jogos' },
              { value: '20K+', label: 'Animes' },
              { value: '100K+', label: 'Usuários' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 ">
        <div className="w-full max-w-md ">
          <BackHomeButton />
          {/* Header mobile  */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
              Catalogo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black">Hub</span>
            </span>
          </div>

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Entrar na conta</h1>
            <p className="text-muted-foreground">
              Não tem conta?{' '}
              <Link href="/register" className="text-blue-600 hover:text-purple-600 font-semibold transition-colors">
                Cadastre-se grátis
              </Link>
            </p>
          </div>

          {/* Erro global */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className={`h-12 rounded-xl border-2 transition-colors focus:border-blue-500 ${
                  errors.email ? 'border-red-400 focus:border-red-500' : 'border-border'
                }`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-purple-600 transition-colors font-medium"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`h-12 rounded-xl border-2 pr-12 transition-colors focus:border-blue-500 ${
                    errors.password ? 'border-red-400 focus:border-red-500' : 'border-border'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botão submit */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 mt-2"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">ou continue com</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-2 font-medium hover:bg-muted/50 transition-all"
              disabled
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-2 font-medium hover:bg-muted/50 transition-all"
              disabled
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Ao entrar, você concorda com nossos{' '}
            <Link href="/terms" className="underline hover:text-foreground transition-colors">
              Termos de Serviço
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}