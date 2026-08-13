import { useQuery } from '@tanstack/react-query';
import { gamesService } from '@/services/games.service';

export function useGamesApiStatus() {
  return useQuery({
    queryKey: ['games', 'status'],
    queryFn: () => gamesService.getApiStatus(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // reavalia sozinho a cada 60s
    retry: false,
  });
}