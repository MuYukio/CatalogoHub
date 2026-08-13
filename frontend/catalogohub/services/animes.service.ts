  import { api } from '@/lib/api'
  import { Anime, CatalogResponse, Genre } from '@/types'

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
        return { results: [], hasNextPage: false, totalCount: 0 }
      }
    }

    async getCatalog(params: {
      page?: number
      pageSize?: number
      search?: string
      genreIds?: string[] 
      type?: string
      status?: string
      ordering?: string
    }): Promise<CatalogResponse<Anime>> {
      const query = new URLSearchParams()
      if (params.page)    query.set('page',     String(params.page))
      if (params.pageSize)query.set('pageSize', String(params.pageSize))
      if (params.search)  query.set('search',   params.search)
      if (params.genreIds?.length) query.set('genreIds', params.genreIds.join(','))
      if (params.type)    query.set('type',     params.type)
      if (params.status)  query.set('status',   params.status)
      if (params.ordering)query.set('ordering', params.ordering)
      const response = await api.get(`/api/Animes/catalog?${query.toString()}`)
      return response.data
    }

    async getByMalId(malId: number): Promise<Anime> {
      const response = await api.get(`/api/animes/${malId}`)
      return response.data
    }

    async getRecommendations(limit: number = 5): Promise<Anime[]> {
      const response = await api.get(`/api/animes/recent`, { params: { limit } })
      return response.data
    }

    async getPopular(limit: number = 20): Promise<Anime[]> {
      const response = await api.get(`/api/animes/popular?limit=${limit}`)
      return response.data
    }

    async getAnimeDetails(malId: number): Promise<Anime> {
      const response = await api.get(`/api/animes/${malId}`)
      return response.data
    }

    async getCurrentSeasonAnimes(limit: number = 20): Promise<Anime[]> {
      const response = await api.get(`/api/animes/season/current?limit=${limit}`)
      return response.data
    }
    
    async getGenres(): Promise<Genre[]> {
    const response = await api.get('/api/Animes/genres');
    return response.data;
  }
  }

  export const animesService = new AnimeService()