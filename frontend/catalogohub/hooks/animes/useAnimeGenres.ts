import { useQuery } from '@tanstack/react-query';
import { animesService } from '@/services/animes.service';

export function useAnimeGenres() {
  return useQuery({
    queryKey: ['animes', 'genres'],
    queryFn:  () => animesService.getGenres(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime:    48 * 60 * 60 * 1000,
  });
}