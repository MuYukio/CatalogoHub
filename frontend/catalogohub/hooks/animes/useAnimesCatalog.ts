import { useQuery } from '@tanstack/react-query';
import { animesService } from '@/services/animes.service';

export interface AnimesCatalogParams {
  page?: number;
  pageSize?: number;
  search?: string;
  genreIds?: string[]; 
  type?: string;
  status?: string;
  ordering?: string;
}

export function useAnimesCatalog(params: AnimesCatalogParams) {
  return useQuery({
    queryKey: ['animes', 'catalog', params],
    queryFn: () => animesService.getCatalog(params),
    staleTime: 5 * 60 * 1000,
    gcTime:    15 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}