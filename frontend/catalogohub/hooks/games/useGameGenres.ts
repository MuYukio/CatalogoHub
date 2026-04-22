import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';

export function useGameGenres() {
  return useQuery({
    queryKey: ['games', 'genres'],
    queryFn:  () => gamesService.getGenres(),
    staleTime: 24 * 60 * 60 * 1000, 
    gcTime:    48 * 60 * 60 * 1000,
  });
}