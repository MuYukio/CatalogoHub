// hooks/games/useGames.ts
import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';

// Hook para detalhes do jogo
export function useGame(id: number) {
  return useQuery({
    queryKey: ['games', 'detail', id],
    queryFn: () => gamesService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}