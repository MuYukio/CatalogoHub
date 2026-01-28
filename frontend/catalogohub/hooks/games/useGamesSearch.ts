// hooks/games/useGamesSearch.ts
import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';

export function useGamesSearch(
  query: string, 
  page: number = 1, 
  limit: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['gamesSearch', query, page, limit],
    queryFn: () => gamesService.search({ query, page, limit }),
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}