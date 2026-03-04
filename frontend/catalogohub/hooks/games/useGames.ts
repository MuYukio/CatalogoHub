
import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';

export function useGame(id: number) {
  return useQuery({
    queryKey: ['games', 'detail', id],
    queryFn: () => gamesService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}