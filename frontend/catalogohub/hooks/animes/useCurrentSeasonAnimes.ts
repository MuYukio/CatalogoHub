import { useQuery } from '@tanstack/react-query';
import { animesService } from '@/services/animes.service';

export function useCurrentSeasonAnimes(limit: number = 20) {
  return useQuery({
    queryKey: ['animes', 'season', 'current', limit],
    queryFn: () => animesService.getCurrentSeasonAnimes(limit),
    staleTime: 10 * 60 * 1000, 
    gcTime: 30 * 60 * 1000,
  });
}