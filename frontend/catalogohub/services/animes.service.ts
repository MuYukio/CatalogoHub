import { api } from '@/lib/api'
import { Anime } from '@/types'

export interface AnimeSearchResponse {
  results: Anime[]
  pagination: {
    currentPage: number
    hasNextPage: boolean
    totalItems?: number
  }
}

export interface AnimesSearchParams {
  query: string
  page?: number
  limit?: number
}

class AnimeService {
  async search({ query, page = 1, limit = 20 }: AnimesSearchParams): Promise<AnimeSearchResponse> {
    try {
      const response = await api.get('/api/animes/search', {
        params: { query, page, limit }
      })

      // Verifica estrutura da resposta
      if (!response.data?.results) {
        return {
          results: [],
          pagination: { currentPage: page, hasNextPage: false }
        }
      }

      return {
        results: response.data.results,
        pagination: response.data.pagination || {
          currentPage: page,
          hasNextPage: response.data.results.length === limit
        }
      }
    } catch (error) {
      // Em produção, você pode querer relançar ou tratar diferente
      throw error // React Query vai capturar no hook
    }
  }

  async getByMalId(malId: number): Promise<Anime> {
    const response = await api.get(`/api/animes/${malId}`)
    return response.data
  }

  async getRecommendations(limit: number = 5): Promise<Anime[]>{
    const response = await api.get(`/api/animes/recent`,{
      params : { limit }
    })
    return response.data
  }

  async getPopular(limit: number = 20): Promise<Anime[]> {
    const response = await api.get(`/api/animes/popular?limit=${limit}`);
    return response.data;
  }

   async getAnimeDetails(malId: number): Promise<Anime> {
    const response = await api.get(`/api/animes/${malId}`);
    return response.data;
  }

}

export const animesService = new AnimeService()