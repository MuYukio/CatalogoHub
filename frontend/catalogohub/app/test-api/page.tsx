// app/teste-completo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Gamepad2, 
  Tv, 
  Star, 
  Heart, 
  Search, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Footer from '@/components/layout/Footer'

export default function TesteCompletoPage() {
  const [activeTab, setActiveTab] = useState<'games' | 'animes'>('games')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Função para simular carregamento
  const simularCarregamento = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  // Alternar tema (simulação)
  const alternarTema = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark')
  }

  // Efeito para mostrar estado inicial
  useEffect(() => {
    console.log('✅ Página de teste carregada')
    console.log('🎨 Tema atual:', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Navbar */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              🧪 Teste Completo - CatalogoHub
            </h1>
            <p className="text-lg text-muted-foreground">
              Verificando todos os componentes e estilizações
            </p>
          </div>

          {/* Grid de Testes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Teste 1: Botões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" />
                  Teste de Botões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Primário</Button>
                    <Button variant="secondary">Secundário</Button>
                    <Button variant="destructive">Destrutivo</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Pequeno</Button>
                    <Button size="lg">Grande</Button>
                    <Button disabled>Desabilitado</Button>
                    <Button className="gap-2">
                      <Star size={16} />
                      Com Ícone
                    </Button>
                  </div>

                  {loading ? (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </Button>
                  ) : (
                    <Button onClick={simularCarregamento}>
                      Simular Carregamento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teste 2: Inputs e Formulários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="text-blue-500" />
                  Teste de Inputs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Campo de Texto
                    </label>
                    <Input placeholder="Digite algo..." />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Campo com Ícone
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input className="pl-10" placeholder="Buscar..." />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tab Ativo (via Navbar)
                    </label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium">
                        {activeTab === 'games' ? (
                          <span className="flex items-center gap-2 text-blue-600">
                            <Gamepad2 size={16} />
                            Modo Jogos
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-purple-600">
                            <Tv size={16} />
                            Modo Animes
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clique no navbar para alternar
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teste 3: Cards e Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="text-red-500" />
                  Cards de Exemplo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Jogo Exemplo</h4>
                      <p className="text-sm text-muted-foreground">
                        The Legend of Zelda
                      </p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">4.8/5</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">Anime Exemplo</h4>
                      <p className="text-sm text-muted-foreground">
                        Attack on Titan
                      </p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">9.0/10</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Teste 4: Cores e Temas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="text-orange-500" />
                  Teste de Tema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Tema Atual: {theme}</p>
                    <Button onClick={alternarTema} variant="outline">
                      Alternar para {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-8 bg-primary rounded"></div>
                    <div className="h-8 bg-secondary rounded"></div>
                    <div className="h-8 bg-destructive rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>

                  <div className="p-3 bg-card border rounded">
                    <p className="text-card-foreground">
                      Este texto usa a cor card-foreground
                    </p>
                  </div>

                  <div className="p-3 bg-muted rounded">
                    <p className="text-muted-foreground">
                      Este texto usa a cor muted-foreground
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Verificação */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>✅ Verificação de Funcionalidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span>Navbar funcionando</span>
                  <CheckCircle className="text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span>Botões estilizados</span>
                  <CheckCircle className="text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span>Inputs funcionais</span>
                  <CheckCircle className="text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span>Cores do tema aplicadas</span>
                  <CheckCircle className="text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <div className="bg-muted/50 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">📋 O que testar:</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Clique nos botões "Jogos" e "Animes" no navbar</li>
              <li>Teste todos os tipos de botões (primário, secundário, etc.)</li>
              <li>Digite algo nos campos de input</li>
              <li>Clique em "Simular Carregamento" para ver estado de loading</li>
              <li>Use o botão "Alternar Tema" para mudar entre claro/escuro</li>
              <li>Redimensione a tela para testar responsividade</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer Simples */}
      <Footer/>
    </div>
  )
}