'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Game, Anime } from '@/types';

interface CatalogCardProps {
  item: Game | Anime;
  type: 'games' | 'animes';
  viewMode?: 'grid' | 'list';
}
function getDetailHref(item: Game | Anime, type: 'games' | 'animes'): string {
  if (type === 'games') return `/games/${(item as Game).id}`;
  return `/animes/${(item as Anime).malId}`;
}

export function CatalogCard({ item, type, viewMode = 'grid' }: CatalogCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isGame = type === 'games';
  const isAnime = type === 'animes';

  const title = isGame ? (item as Game).name : (item as Anime).title;
  const image = isGame ? (item as Game).backgroundImage : (item as Anime).imageUrl;
  const rating = isGame ? (item as Game).rating : (item as Anime).score;
  const isAdult = item.isAdultContent || false;

  const released = isGame ? (item as Game).released : null;
  const platforms = isGame ? (item as Game).platforms : [];
  const genres = item.genres || [];
  const episodes = isAnime ? (item as Anime).episodes : null;
  const status = isAnime ? (item as Anime).status : null;

  const href = getDetailHref(item, type);

  const accentShadow = isGame
    ? 'hover:shadow-blue-500/20'
    : 'hover:shadow-purple-500/20';
  const overlayGradient = isGame
    ? 'from-blue-900/95 via-blue-900/80'
    : 'from-purple-900/95 via-purple-900/80';
  const accentText = isGame ? 'text-cyan-300' : 'text-fuchsia-300';
  const accentBorder = isGame ? 'border-blue-400/60' : 'border-purple-400/60';

  if (viewMode === 'list') {
    return (
      <Link href={href} className="block group">
        <Card className={cn(
          'flex gap-4 p-4 transition-all duration-300',
          'hover:shadow-lg border-transparent hover:border-border',
          isGame ? 'hover:border-l-4 hover:border-l-blue-500' : 'hover:border-l-4 hover:border-l-purple-500',
        )}>
          <div className="relative w-24 h-32 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={imgError ? '/images/placeholder.jpg' : (image || '/images/placeholder.jpg')}
              alt={title || `${isGame ? 'Jogo' : 'Anime'} sem título`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="100px"
              onError={() => setImgError(true)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                  {title || 'Sem título'}
                </h3>
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
              <motion.div
                animate={{ x: isHovered ? 0 : -4, opacity: isHovered ? 1 : 0 }}
                className="shrink-0 mt-1"
              >
                <ArrowRight className={cn('h-4 w-4', accentText)} />
              </motion.div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {genres.slice(0, 3).join(' • ')}
            </p>

            <div className="flex items-center gap-4">
              {(rating || rating === 0) && typeof rating === 'number' && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                </div>
              )}
              {isAdult && <Badge variant="destructive" className="text-xs">18+</Badge>}
              <Badge variant={isGame ? 'default' : 'secondary'} className="text-xs">
                {isGame ? 'Jogo' : 'Anime'}
              </Badge>
            </div>
          </div>
        </Card>
      </Link>
    );
  }
  return (
    <Link href={href} className="block group h-full">
      <Card
        className={cn(
          'overflow-hidden transition-all duration-300 cursor-pointer',
          'hover:shadow-xl h-full flex flex-col', accentShadow,
          'hover:-translate-y-1',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Imagem + overlay  */}
        <div className={cn(
          'relative overflow-hidden',
          type === 'animes' ? 'aspect-[2/3]' : 'aspect-video',
        )}>
          <Image
            src={imgError ? '/images/placeholder.jpg' : (image || '/images/placeholder.jpg')}
            alt={title || `${isGame ? 'Jogo' : 'Anime'} sem título`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
            onError={() => setImgError(true)}
            loading="lazy"
            quality={85}
          />

          {/* Gradiente base permanente */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges de tipo e 18+ */}
          <div className="absolute top-2 left-2 z-10">
            <Badge variant={isGame ? 'default' : 'secondary'}>
              {isGame ? 'Jogo' : 'Anime'}
            </Badge>
          </div>
          {isAdult && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="destructive" className="font-bold">18+</Badge>
            </div>
          )}

          {/* Rating permanente no canto inferior */}
          {(rating || rating === 0) && typeof rating === 'number' && (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
            </div>
          )}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'absolute inset-0 z-20 flex flex-col items-center justify-end pb-5',
                  `bg-linear-to-t ${overlayGradient} to-transparent`,
                )}
              >
                {/* "Ver detalhes" pill */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.06, duration: 0.2 }}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white',
                    'border backdrop-blur-sm shadow-lg',
                    accentBorder,
                    isGame ? 'bg-blue-600/70' : 'bg-purple-600/70',
                  )}
                >
                  Ver detalhes
                  <ArrowRight className="h-3 w-3" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info abaixo da imagem  */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className={cn(
            'font-bold text-base mb-2 line-clamp-2 transition-colors duration-200',
            isHovered && (isGame ? 'text-blue-500' : 'text-purple-500'),
          )}>
            {title || 'Sem título'}
          </h3>

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
              <Badge variant="outline" className="text-xs">{status}</Badge>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {genres.slice(0, 3).map((genre, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {genre}
                </Badge>
              ))}
              {genres.length > 3 && (
                <span className="text-xs text-muted-foreground">+{genres.length - 3}</span>
              )}
            </div>
          )}

          {item.contentWarnings && item.contentWarnings.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mb-2">
              <AlertCircle className="h-3 w-3" />
              <span>Contém: {item.contentWarnings.join(', ')}</span>
            </div>
          )}

          {platforms && platforms.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {platforms.slice(0, 2).join(', ')}
              {platforms.length > 2 && '...'}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}