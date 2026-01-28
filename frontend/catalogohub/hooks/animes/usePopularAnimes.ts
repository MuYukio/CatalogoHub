// hooks/animes/usePopularAnimes.ts
import { useQuery } from '@tanstack/react-query';
import { animesService } from '@/services/animes.service';

export function usePopularAnimes(limit: number = 20) {
  return useQuery({
    queryKey: ['animes', 'popular', limit],
    queryFn: () => animesService.getPopular(limit),
    staleTime: 5 * 60 * 1000,
  });
}