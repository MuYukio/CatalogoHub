import { api } from '@/lib/api'
import { AuthResponse, LoginData, RegisterData } from '@/types'
export type{}


class AuthService {

    async login( data: LoginData): Promise<AuthResponse>{
        const response = await api.post<AuthResponse>('api/auth/login',data)
        return response.data
    }

    async register (data: RegisterData): Promise<AuthResponse>{

        const response = await api.post<AuthResponse>('api/auth/register',data)
        return response.data
    }

    async logout(): Promise<void>{
        return Promise.resolve()
    }

    async validateToken(): Promise<boolean>{

        try{
            await api.get('api/favorites')
            return true
        }
        catch{
            return false
        }

    }

}

export const authService = new AuthService()