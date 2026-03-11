'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnime } from '@/hooks/animes/useAnime';
import { useAuthStore } from '@/stores/auth.store';
import { favoritesService } from '@/services/favorites.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DetailPage, type DetailData } from '@/components/detail/DetailPage';
import { Favorite } from '@/types';

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: anime, isLoading, isError } = useAnime(id);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getAll(),
    enabled: isAuthenticated,
  });

  const isFavorited = favorites.some(
    f => f.type === 'Anime' && String(f.externalId) === String(id)
  );

  const existingFavorite = favorites.find(
    f => f.type === 'Anime' && String(f.externalId) === String(id)
  );

  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useMutation<Favorite | void>({
    mutationFn: () =>
      isFavorited && existingFavorite
        ? favoritesService.delete(existingFavorite.id)
        : favoritesService.create({
            externalId: String(id),
            type: 'Anime',
            title: anime?.title ?? '',
            imageUrl: anime?.imageUrl ?? '',
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando anime...</p>
        </div>
      </div>
    );
  }

  if (isError || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-foreground font-semibold">Anime não encontrado</p>
          <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
        </div>
      </div>
    );
  }

  const detailData: DetailData = {
    id: anime.malId,             
    title: anime.title,
    imageUrl: anime.imageUrl,
    backgroundImage: anime.imageUrl, 
    description: anime.synopsis,   
    score: anime.score ?? undefined,
    year: anime.year,
    genres: anime.genres,            
    isAdultContent: anime.isAdultContent,
    episodes: anime.episodes,
    status: anime.status,
    studio: anime.studios?.[0],     
    season: anime.season,
  };

  return (
    <DetailPage
      data={detailData}
      type="anime"
      isFavorited={isFavorited}
      onToggleFavorite={isAuthenticated ? () => toggleFavorite() : undefined}
      isTogglingFavorite={isTogglingFavorite}
    />
  );
}