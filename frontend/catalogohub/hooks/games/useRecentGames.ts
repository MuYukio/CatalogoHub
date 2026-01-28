// hooks/games/useRecentGames.ts
import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';

export function useRecentGames(limit: number = 5, includeAdult: boolean = false) {
  return useQuery({
    queryKey: ['games', 'recent', limit, includeAdult],
    queryFn: () => gamesService.getRecentGames(limit, includeAdult),
    staleTime: 5 * 60 * 1000,
  });
}