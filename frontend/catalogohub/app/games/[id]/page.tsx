'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/hooks/games/useGame';
import { useAuthStore } from '@/stores/auth.store';
import { favoritesService } from '@/services/favorites.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DetailPage, type DetailData } from '@/components/detail/DetailPage';
import { Favorite } from '@/types';

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: game, isLoading, isError } = useGame(id);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getAll(),
    enabled: isAuthenticated,
  });

  const isFavorited = favorites.some(
    f => f.type === 'Game' && String(f.externalId) === String(id)
  );

  const existingFavorite = favorites.find(
    f => f.type === 'Game' && String(f.externalId) === String(id)
  );

  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useMutation<Favorite | void>({
    mutationFn: () =>
      isFavorited && existingFavorite
        ? favoritesService.delete(existingFavorite.id)          
        : favoritesService.create({                             
            externalId: String(id),
            type: 'Game',
            title: game?.name ?? '',
            imageUrl: game?.backgroundImage ?? '',
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-foreground font-semibold">Jogo não encontrado</p>
          <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
        </div>
      </div>
    );
  }

  const detailData: DetailData = {
    id: game.id,
    title: game.name,
    backgroundImage: game.backgroundImage,
    imageUrl: game.backgroundImage,  
    rating: game.rating,
    year: game.released?.substring(0, 4),
    genres: game.genres,             
    platforms: game.platforms,       
    isAdultContent: game.isAdultContent,
    playtime: game.playtime,
     description: game.description,
  };

  return (
    <DetailPage
      data={detailData}
      type="game"
      isFavorited={isFavorited}
      onToggleFavorite={isAuthenticated ? () => toggleFavorite() : undefined}
      isTogglingFavorite={isTogglingFavorite}
    />
  );
}