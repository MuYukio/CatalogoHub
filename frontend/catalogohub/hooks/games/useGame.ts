import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';
import type { Game } from '@/types';

export function useGame(id: string | number) {
  return useQuery<Game>({
    queryKey: ['game', String(id)],
    queryFn: () => gamesService.getById(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}