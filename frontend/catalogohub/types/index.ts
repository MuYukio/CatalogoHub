
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  allowAdultContent: boolean;
  createdAt?: string; 
}

export interface Game {
  id: number;
  name: string;
  released: string;
  backgroundImage: string;
  rating: number;
  platforms: string[];
  genres: string[];
  metacritic?: number;
  playtime?: number;
  isAdultContent: boolean;
  contentWarnings: string[];
  esrbRating?: string;
  description?: string;
}

export interface Anime {
  malId: number;
  title: string;
  titleEnglish?: string;
  titleJapanese?: string;
  synopsis?: string;
  imageUrl: string;
  score: number | null;
  type?: string;
  episodes?: number;
  status?: string;
  genres: string[];
  year?: number;
  season?: string;
  studios?: string[];
  isAdultContent: boolean;
  contentWarnings: string[];
  ageRating?: string;
}

export interface Favorite {
  id: number;
  userId: number;
  externalId: string;
  type: 'Game' | 'Anime';
  title: string;
  imageUrl: string;
  createdAt: string;
  metadata?: {
    rating?: number;
    released?: string;
    episodes?: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  allowAdultContent: boolean;
}

export interface AuthResponse {
  userId: number;
  token: string;
  name: string;
  email: string;
  age: number;
  allowAdultContent: boolean;
  expiresAt: string;
}

export interface ApiResponse<T> {
  results: T[];
  pagination?: {
    currentPage: number;
    hasNextPage: boolean;
  };
}