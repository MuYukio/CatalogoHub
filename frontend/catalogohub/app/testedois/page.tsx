
'use client'

import { useEffect, useState } from 'react'
import { animesService } from '@/services/animes.service'

export default function TesteAnimesPage() {
  const [animes, setAnimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function carregarAnimes() {
      try {
        setLoading(true)
        const resposta = await animesService.search({ query: 'madoka' })
        console.log('Animes carregados:', resposta)
        setAnimes(resposta.results || [])
      } catch (err: any) {
        setError(err.message)
        console.error('Erro:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarAnimes()
  }, [])

  if (loading) return <div className="p-8">Carregando animes...</div>
  if (error) return <div className="p-8 text-red-500">Erro: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Animes ({animes.length})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animes.slice(0, 5).map((anime: any) => (
          <div key={anime.malId || anime.id} className="border p-4 rounded-lg">
            <h3 className="font-bold text-lg">{anime.title}</h3>
            <p className="text-gray-600">Episódios: {anime.episodes || 'N/A'}</p>
            <p className="text-gray-600">Score: {anime.score || anime.rating || 'N/A'}</p>
            {anime.imageUrl && (
              <img 
                src={anime.imageUrl} 
                alt={anime.title}
                className="mt-2 w-full h-40 object-cover rounded"
              />
            )}
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(anime, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}