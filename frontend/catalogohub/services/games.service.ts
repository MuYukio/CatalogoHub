import { api } from '@/lib/api'
import { Game } from '@/types'

export interface GameSearchResponse {
  results: Game[]
  hasNextPage: boolean
  totalCount?:number
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
      return {
        results: [],
        hasNextPage: false,
        totalCount: 0
    }
  }
}

  async getById(id: number): Promise<Game> {
    const response = await api.get(`/api/games/${id}`)
    return response.data
  }

   async getRecentGames(limit: number = 5, includeAdult: boolean = false): Promise<Game[]> {
    console.log(`Fetching recent games: limit=${limit}, includeAdult=${includeAdult}`);
    try {
      const response = await api.get(`/api/games/recent?limit=${limit}&includeAdult=${includeAdult}`);
      console.log('Games API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching games:', error.response?.data || error.message);
      throw error;
    }
  }

}

export const gamesService = new GameService()