// hooks/animes/useAnimes.ts
import { useQuery } from '@tanstack/react-query';
import { animesService } from '@/services/animes.service';

// Hook para recomendações
export function useAnimeRecommendations(limit: number = 5) {
  return useQuery({
    queryKey: ['animes', 'recommendations', limit],
    queryFn: () => animesService.getRecommendations(limit),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para detalhes do anime
export function useAnime(malId: number) {
  return useQuery({
    queryKey: ['animes', 'detail', malId],
    queryFn: () => animesService.getAnimeDetails(malId),
    enabled: !!malId,
    staleTime: 5 * 60 * 1000,
  });
}