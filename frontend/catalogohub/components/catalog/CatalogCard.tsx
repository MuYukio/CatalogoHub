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
  variant?: 'default' | 'compact';
}

function getDetailHref(item: Game | Anime, type: 'games' | 'animes'): string {
  if (type === 'games') return `/games/${(item as Game).id}`;
  return `/animes/${(item as Anime).malId}`;
}

export function CatalogCard({ item, type, viewMode = 'grid', variant = 'default' }: CatalogCardProps) {
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

  const imageSizeClass = variant === 'compact'
    ? (type === 'animes' ? 'aspect-[3/4]' : 'aspect-video')
    : (type === 'animes' ? 'aspect-[2/3]' : 'aspect-video');

  const href = getDetailHref(item, type);

  const borderColor = isGame ? 'border-blue-500' : 'border-purple-500';
  const borderHover = isGame ? 'hover:border-blue-400' : 'hover:border-purple-400';
  const shadowColor = isGame ? 'hover:shadow-blue-500/20' : 'hover:shadow-purple-500/20';
  const overlayGradient = isGame
    ? 'from-blue-900/95 via-blue-900/80'
    : 'from-purple-900/95 via-purple-900/80';
  const accentText = isGame ? 'text-cyan-300' : 'text-fuchsia-300';
  const badgeBg = isGame ? 'bg-blue-600/70' : 'bg-purple-600/70';
  const titleHoverColor = isGame ? 'text-blue-500' : 'text-purple-500';

  if (viewMode === 'list') {
    return (
      <Link href={href} className="block group">
        <Card
          className={cn(
            'flex gap-4 p-4 transition-all duration-300',
            'hover:shadow-lg border-l',
            isGame ? 'border-l-blue-500 hover:border-l-blue-600' : 'border-l-purple-500 hover:border-l-purple-600',
          )}
        >
          <div className="relative w-28 h-36 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={imgError ? '/images/placeholder.jpg' : (image || '/images/placeholder.jpg')}
              alt={title || `${isGame ? 'Jogo' : 'Anime'} sem título`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="112px"
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
              {rating != null && typeof rating === 'number' && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                </div>
              )}
              {isAdult && <Badge variant="destructive" className="text-xs">18+</Badge>}
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
          'hover:shadow-xl h-full flex flex-col border',
          borderColor,
          shadowColor,
          'hover:-translate-y-1',
          borderHover,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn('relative overflow-hidden', imageSizeClass)}>
          <Image
            src={imgError ? '/images/placeholder.jpg' : (image || '/images/placeholder.jpg')}
            alt={title || `${isGame ? 'Jogo' : 'Anime'} sem título`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={() => setImgError(true)}
            loading="lazy"
            quality={85}
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {isAdult && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="destructive" className="font-bold">18+</Badge>
            </div>
          )}

          {rating != null && typeof rating === 'number' && (
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
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.06, duration: 0.2 }}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white',
                    'border backdrop-blur-sm shadow-lg border-white/40',
                    badgeBg,
                  )}
                >
                  Ver detalhes
                  <ArrowRight className="h-3 w-3" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className={cn(
            'flex flex-col flex-1',
            variant === 'compact' ? 'p-3 gap-1' : 'p-4 gap-2',
          )}
        >
          <h3
            className={cn(
              'font-bold line-clamp-2 transition-colors duration-200',
              variant === 'compact' ? 'text-sm' : 'text-base',
              isHovered && titleHoverColor,
            )}
          >
            {title || 'Sem título'}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {released && (
              <div className="flex items-center gap-1 shrink-0">
                <Calendar className={cn('h-3 w-3', variant === 'compact' && 'h-2 w-2')} />
                <span className={variant === 'compact' ? 'text-xs' : 'text-sm'}>
                  {released.substring(0, 4)}
                </span>
              </div>
            )}
            {episodes && (
              <div className="flex items-center gap-1 shrink-0">
                <Users className={cn('h-3 w-3', variant === 'compact' && 'h-2 w-2')} />
                <span className={variant === 'compact' ? 'text-xs' : 'text-sm'}>
                  {episodes} eps
                </span>
              </div>
            )}
            {status && (
              <Badge variant="outline" className={cn('text-xs', variant === 'compact' && 'text-[10px]')}>
                {status}
              </Badge>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {genres.slice(0, variant === 'compact' ? 2 : 3).map((genre, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={cn(
                    'text-xs px-2 py-0.5',
                    variant === 'compact' && 'text-[10px] px-1.5 py-0',
                  )}
                >
                  {genre}
                </Badge>
              ))}
              {genres.length > (variant === 'compact' ? 2 : 3) && (
                <span className="text-xs text-muted-foreground">
                  +{genres.length - (variant === 'compact' ? 2 : 3)}
                </span>
              )}
            </div>
          )}

          {item.contentWarnings && item.contentWarnings.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mb-2">
              <AlertCircle className="h-3 w-3" />
              <span className={variant === 'compact' ? 'text-[10px]' : 'text-xs'}>
                Contém: {item.contentWarnings.join(', ')}
              </span>
            </div>
          )}

          {platforms && platforms.length > 0 && (
            <div
              className={cn(
                'text-muted-foreground',
                variant === 'compact' ? 'text-[10px]' : 'text-xs',
              )}
            >
              {platforms.slice(0, variant === 'compact' ? 1 : 2).join(', ')}
              {platforms.length > (variant === 'compact' ? 1 : 2) && '...'}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}