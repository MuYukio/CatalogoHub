import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';

export interface GamesCatalogParams {
  page?: number;
  pageSize?: number;
  search?: string;
  genres?: string[];
  platform?: string;
  ordering?: string;
  includeAdult?: boolean;
}

export function useGamesCatalog(params: GamesCatalogParams) {
  return useQuery({
    queryKey: ['games', 'catalog', params],
    queryFn: () => gamesService.getCatalog(params),
    staleTime: 5 * 60 * 1000,
    gcTime:    15 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}