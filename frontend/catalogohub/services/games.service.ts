import { api } from '@/lib/api'
import { Game, CatalogResponse, Genre } from '@/types'

export interface GameSearchResponse {
  results: Game[]
  hasNextPage: boolean
  totalCount?: number
}

export interface GamesSearchParams {
  query: string
  page?: number
  limit?: number
}

class GameService {
  async search({ query, page = 1, limit = 20 }: GamesSearchParams): Promise<GameSearchResponse> {
    try {
      const response = await api.get('/api/games/search', {
        params: { query, page, limit },
        timeout: 15000
      })
      const data = response.data
      if (Array.isArray(data)) {
        return {
          results: data,
          hasNextPage: data.length === limit,
          totalCount: data.length
        }
      }
      return {
        results: data.results || data.Results || [],
        hasNextPage: data.hasNextPage || data.hasnextpage || false,
        totalCount: data.totalCount || data.totalcount || (data.results ? data.results.length : 0)
      }
    } catch (error) {
      console.error('Error searching games:', error)
      return { results: [], hasNextPage: false, totalCount: 0 }
    }
  }

  async getCatalog(params: {
    page?: number
    pageSize?: number
    search?: string
    genres?: string[]
    platform?: string
    ordering?: string
    includeAdult?: boolean
  }): Promise<CatalogResponse<Game>> {
    const query = new URLSearchParams()
    if (params.page)         query.set('page',        String(params.page))
    if (params.pageSize)     query.set('pageSize',     String(params.pageSize))
    if (params.search)       query.set('search',       params.search)
    if (params.genres)        query.set('genres',        params.genres.join(','))
    if (params.platform)     query.set('platform',     params.platform)
    if (params.ordering)     query.set('ordering',     params.ordering)
    if (params.includeAdult) query.set('includeAdult', String(params.includeAdult))
    const response = await api.get(`/api/Games/catalog?${query.toString()}`)
    return response.data
  }

  async getById(id: number): Promise<Game> {
    const response = await api.get(`/api/games/${id}`)
    return response.data
  }

  async getRecentGames(limit: number = 5, includeAdult: boolean = false): Promise<Game[]> {
    try {
      const response = await api.get(`/api/games/recent?limit=${limit}&includeAdult=${includeAdult}`)
      return response.data
    } catch (error) {
      console.error('Error fetching games:', error)
      throw error
    }
  }
  
  async getGenres(): Promise<Genre[]> {
  const response = await api.get('/api/Games/genres');
  return response.data;
}
async getApiStatus(): Promise<{ available: boolean; checkedAt: string }> {
  const response = await api.get('/api/Games/status')
  return response.data
}
}

export const gamesService = new GameService()