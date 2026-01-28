import { api } from '@/lib/api'
import { Favorite } from '@/types'


export interface CreateFavorite {
    externalId: string
    type: 'Game' | 'Anime'
    title: string
    imageUrl: string
}

export interface FavoriteByTypeParams{
    type: 'Game' | 'Anime'
}

class FavoritesService {

    async getAll(): Promise<Favorite[]>{
        const response = await api.get<Favorite[]>('api/favorites')
        return response.data
    }

    async getByType({ type }: FavoriteByTypeParams): Promise<Favorite[]> {
        const response = await api.get<Favorite[]>(`/api/favorites/type/${type}`)
        return response.data
    }

    async create(favorite: CreateFavorite): Promise<Favorite>{
        const response = await api.post<Favorite>('api/favorites',favorite)
        return response.data
    }

    async delete(id: number ): Promise<void>{
        await api.delete(`/api/favorite/${id}`)
    }

    async generatePdf(): Promise<Blob>{
        const response = await api.get('/api/favorites/pdf',{
            responseType:'blob'
        })
        return response.data
    }
}

export const favoritesService = new FavoritesService()