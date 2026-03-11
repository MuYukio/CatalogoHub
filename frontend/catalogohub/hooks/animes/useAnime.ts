
import { useQuery } from '@tanstack/react-query';
import { animesService } from '@/services/animes.service';
import type { Anime } from '@/types';

export function useAnime(id: string | number) {
  return useQuery<Anime>({
    queryKey: ['anime', String(id)],
    queryFn: () => animesService.getByMalId(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}