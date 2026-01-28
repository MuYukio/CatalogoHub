// app/teste-jogos/page.tsx - VERSÃO FINAL CORRIGIDA
'use client'

import { useEffect, useState } from 'react'
import { gamesService } from '@/services/games.service'
import { Game } from '@/types'

export default function TesteJogosPage() {
  const [jogos, setJogos] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [tempoResposta, setTempoResposta] = useState<number>(0)
  const [query, setQuery] = useState('mario')

  const carregarJogos = async (busca: string = 'mario') => {
    try {
      setLoading(true)
      const inicio = Date.now()
      
      console.log('🎮 Iniciando busca de jogos...')
      const resposta = await gamesService.search({ query: busca })
      
      const fim = Date.now()
      const tempo = fim - inicio
      setTempoResposta(tempo)
      
      console.log(`⏱️ Tempo total: ${tempo}ms`)
      console.log('Jogos carregados:', resposta)
      
      setJogos(resposta.results || [])
      setError('')
    } catch (err: any) {
      console.error('Erro detalhado:', err)
      setError(`Erro: ${err.message}`)
      setJogos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarJogos()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      carregarJogos(query)
    }
  }

  // Função para formatar data
  const formatarData = (dataString: string) => {
    if (!dataString) return 'N/A'
    try {
      const data = new Date(dataString)
      return data.toLocaleDateString('pt-BR')
    } catch {
      return dataString
    }
  }

  if (loading) return (
    <div className="p-8">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Carregando jogos... (pode levar alguns segundos)</p>
        <p className="text-sm text-gray-500">Aguardando resposta do backend</p>
      </div>
    </div>
  )

  return (
    
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Jogos</h1>
      
      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jogos (ex: mario, zelda, halo)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      {/* Estatísticas */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded shadow">
            <p className="font-semibold">✅ Status</p>
            <p className="text-sm text-gray-600">Conectado</p>
          </div>
          <div className="p-3 bg-white rounded shadow">
            <p className="font-semibold">⏱️ Tempo</p>
            <p className="text-sm text-gray-600">{tempoResposta}ms</p>
          </div>
          <div className="p-3 bg-white rounded shadow">
            <p className="font-semibold">📊 Jogos</p>
            <p className="text-sm text-gray-600">{jogos.length} encontrados</p>
          </div>
          <div className="p-3 bg-white rounded shadow">
            <p className="font-semibold">🔍 Busca</p>
            <p className="text-sm text-gray-600 truncate">"{query}"</p>
          </div>
        </div>
      </div>
      
      {/* Grid de jogos */}
      {jogos.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Resultados ({jogos.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jogos.map((jogo) => (
              <div key={jogo.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white">
                
                {/* IMAGEM - AGORA COM backgroundImage (camelCase) */}
                <div className="h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-600">
                  {jogo.backgroundImage ? (
                    <img 
                      src={jogo.backgroundImage} 
                      alt={jogo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Se a imagem falhar, mostra placeholder
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-4xl">🎮</span>
                    </div>
                  )}
                </div>
                
                {/* Informações do jogo */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{jogo.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    {/* Data de lançamento */}
                    {jogo.released && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700">📅</span>
                        <span>{formatarData(jogo.released)}</span>
                      </div>
                    )}
                    
                    {/* Rating */}
                    {jogo.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">⭐</span>
                        <div className="flex items-center">
                          <span className="mr-1">{jogo.rating.toFixed(1)}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${(jogo.rating / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* GÊNEROS - AGORA É ARRAY DE STRINGS */}
                    {jogo.genres && jogo.genres.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-700 mt-1">🎭</span>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {jogo.genres.slice(0, 3).map((genero, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                            >
                              {genero}
                            </span>
                          ))}
                          {jogo.genres.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{jogo.genres.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* PLATAFORMAS - AGORA É ARRAY DE STRINGS */}
                  {jogo.platforms && jogo.platforms.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                        <span>🖥️</span>
                        <span>Plataformas ({jogo.platforms.length})</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {jogo.platforms.slice(0, 4).map((plataforma, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {plataforma}
                          </span>
                        ))}
                        {jogo.platforms.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{jogo.platforms.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* ID do jogo para debug */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">ID: {jogo.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8 p-8 bg-yellow-50 rounded-lg text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum jogo encontrado</h3>
          <p className="text-gray-600 mb-4">
            {query 
              ? `Não foram encontrados jogos para "${query}"`
              : 'Digite um termo de busca para encontrar jogos'
            }
          </p>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">Sugestões de busca:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['mario', 'zelda', 'pokemon', 'halo', 'fifa', 'minecraft', 'call of duty', 'fortnite'].map((sugestao) => (
                <button
                  key={sugestao}
                  onClick={() => {
                    setQuery(sugestao)
                    carregarJogos(sugestao)
                  }}
                  className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Botão para ver mais */}
      {jogos.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => carregarJogos(query)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔄 Recarregar Jogos
          </button>
        </div>
      )}
    </div>
  )
}