// types/index.ts
export interface User {
  id: number
  email: string
  createdAt: string
}

export interface Game {
  id: number
  name: string
  released: string
  backgroundImage: string
  rating: number
  platforms: string[]
  genres: string[]
  metacritic?: number
  playtime?: number
  
  isAdultContent: boolean;
  contentWarnings: string[];
  esrbRating?: string;
}

export interface Anime {
  malId: number
  title: string
  titleEnglish?: string // Tornar opcional
  titleJapanese?: string // Tornar opcional
  synopsis?: string // Tornar opcional
  imageUrl: string
  score: number | null
  type?: string // TV, Movie, OVA, etc
  episodes?: number // Pode ser null na API
  status?: string // Airing, Finished, etc
  genres: string[]
  year?: number
  season?: string
  studios?: string[]
  isAdultContent: boolean;
  contentWarnings: string[];
  ageRating?: string;
}

export interface Favorite {
  id: number
  userId: number
  externalId: string
  type: 'Game' | 'Anime'
  title: string
  imageUrl: string
  createdAt: string
  // Metadados adicionais para exibição
  metadata?: {
    rating?: number
    released?: string
    episodes?: number
  }
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}
export interface ApiResponse<T> {
  results: T[];
  pagination?: {
    currentPage: number;
    hasNextPage: boolean;
  };
}