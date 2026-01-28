import { api } from '@/lib/api'
import { Game } from '@/types'

export interface GameSearchResponse {
  results: Game[]
  pagination: {
    currentPage: number
    hasNextPage: boolean
    totalItems?: number
  }
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

      // A API retorna um array diretamente
      const gamesArray = response.data

      if (!Array.isArray(gamesArray)) {
        return {
          results: [],
          pagination: { currentPage: page, hasNextPage: false }
        }
      }

      return {
        results: gamesArray,
        pagination: {
          currentPage: page,
          hasNextPage: gamesArray.length === limit
        }
      }
    } catch (error) {
      // Em produção, enviar para serviço de monitoramento (Sentry, etc.)
      return {
        results: [],
        pagination: { currentPage: page, hasNextPage: false }
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