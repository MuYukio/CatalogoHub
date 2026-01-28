// components/catalog/CatalogCard.tsx
import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Users, AlertCircle } from 'lucide-react';
import type { Game, Anime } from '@/types';

// MUDE para plural: 'games' | 'animes'
interface CatalogCardProps {
  item: Game | Anime;
  type: 'games' | 'animes';
  viewMode?: 'grid' | 'list';
}

export function CatalogCard({ item, type, viewMode = 'grid' }: CatalogCardProps) {
  const [imgError, setImgError] = useState(false);
  
  // AJUSTE para plural
  const isGame = type === 'games';
  const isAnime = type === 'animes';
  
  // Dados comuns
  const title = isGame ? (item as Game).name : (item as Anime).title;
  const image = isGame ? (item as Game).backgroundImage : (item as Anime).imageUrl;
  const rating = isGame ? (item as Game).rating : (item as Anime).score;
  const isAdult = item.isAdultContent || false;
  
  // Dados específicos
  const released = isGame ? (item as Game).released : null;
  const platforms = isGame ? (item as Game).platforms : [];
  const genres = item.genres || [];
  const episodes = isAnime ? (item as Anime).episodes : null;
  const status = isAnime ? (item as Anime).status : null;
  
  // Para modo lista
  if (viewMode === 'list') {
    return (
      <Card className="flex gap-4 p-4 hover:shadow-md transition-shadow">
        <div className="relative w-24 h-32 flex-shrink-0">
          <Image
            src={imgError ? "/images/placeholder.jpg" : (image || "/images/placeholder.jpg")}
            alt={title || `${isGame ? 'Jogo' : 'Anime'} sem título`}
            fill
            className="object-cover rounded"
            sizes="100px"
            onError={() => setImgError(true)}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">{title || 'Sem título'}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                {isGame ? (
                  <>
                    {released && <span>{released.substring(0, 4)}</span>}
                    {platforms && platforms.length > 0 && (
                      <span>{platforms.slice(0, 2).join(', ')}</span>
                    )}
                  </>
                ) : (
                  <>
                    {episodes && <span>{episodes} episódios</span>}
                    {status && <span>{status}</span>}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdult && (
                <Badge variant="destructive" className="text-xs">
                  18+
                </Badge>
              )}
              <Badge variant={isGame ? "default" : "secondary"} className="text-xs">
                {isGame ? '🎮 Jogo' : '🎌 Anime'}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {genres.slice(0, 3).join(' • ')}
          </p>
          
          <div className="flex items-center gap-4">
            {(rating || rating === 0) && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Modo grid (padrão)
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imgError ? "/images/placeholder.jpg" : (image || "/images/placeholder.jpg")}
          alt={title || `${isGame ? 'Jogo' : 'Anime'} sem título`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgError(true)}
          loading="lazy"
          quality={85}
        />
        
        {/* Badge de tipo */}
        <div className="absolute top-2 left-2 z-10">
          <Badge variant={isGame ? "default" : "secondary"}>
            {isGame ? '🎮 Jogo' : '🎌 Anime'}
          </Badge>
        </div>
        
        {/* Badge de conteúdo adulto */}
        {isAdult && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="destructive" className="font-bold">
              18+
            </Badge>
          </div>
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Rating/Score */}
        {(rating || rating === 0) && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-white">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">
          {title || 'Sem título'}
        </h3>
        
        {/* Informações específicas */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-muted-foreground">
          {released && (
            <div className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3" />
              <span>{released.substring(0, 4)}</span>
            </div>
          )}
          
          {episodes && (
            <div className="flex items-center gap-1 shrink-0">
              <Users className="h-3 w-3" />
              <span>{episodes} eps</span>
            </div>
          )}
          
          {status && (
            <Badge variant="outline" className="text-xs">
              {status}
            </Badge>
          )}
        </div>
        
        {/* Gêneros */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {genres.slice(0, 3).map((genre, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5"
              >
                {genre}
              </Badge>
            ))}
            {genres.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{genres.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Content warnings */}
        {item.contentWarnings && item.contentWarnings.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mb-2">
            <AlertCircle className="h-3 w-3" />
            <span>Contém: {item.contentWarnings.join(', ')}</span>
          </div>
        )}
        
        {/* Platforms (apenas para jogos) */}
        {platforms && platforms.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {platforms.slice(0, 2).join(', ')}
            {platforms.length > 2 && '...'}
          </div>
        )}
      </div>
    </Card>
  );
}