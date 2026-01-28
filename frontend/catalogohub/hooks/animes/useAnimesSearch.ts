// hooks/animes/useAnimesSearch.ts
import { useQuery } from '@tanstack/react-query';
import { animesService } from '@/services/animes.service';

export function useAnimesSearch(
  query: string, 
  page: number = 1, 
  limit: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['animesSearch', query, page, limit],
    queryFn: () => animesService.search({ query, page, limit }),
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}