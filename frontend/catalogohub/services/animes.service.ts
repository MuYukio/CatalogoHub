  import { api } from '@/lib/api'
  import { Anime } from '@/types'

  export interface AnimeSearchResponse {
    results: Anime[]
    hasNextPage: boolean
    totalCount?: number
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
        const data = response.data
        return {
          results: data.results || data.Results || data.data || [],
          hasNextPage: data.hasNextPage || data.hasnextpage || data.pagination?.hasNextPage || false,
          totalCount: data.totalCount || data.totalcount || data.pagination?.totalItems || (data.results ? data.results.length : 0)
        }
      } catch (error) {
         console.error('Error searching animes:', error)
      return {
        results: [],
        hasNextPage: false,
        totalCount: 0
      }
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
    async getCurrentSeasonAnimes(limit: number = 20): Promise<Anime[]> {
      const response = await api.get(`/api/animes/season/current?limit=${limit}`);
      return response.data;
    }

  }

  export const animesService = new AnimeService()