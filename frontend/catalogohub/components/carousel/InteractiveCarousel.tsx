'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CarouselImage from './CarouselImage';

interface CarouselItem {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
  type: 'games' | 'animes';
  isAdult?: boolean;
}

interface InteractiveCarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
}

export function InteractiveCarousel({ items, autoPlayInterval = 5000 }: InteractiveCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => { setCurrentIndex(0); }, [items]);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => prev === items.length - 1 ? 0 : prev + 1);
  }, [items.length]);

  const prevSlide = () => {
    setCurrentIndex(prev => prev === 0 ? items.length - 1 : prev - 1);
  };

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval, items.length]);

  if (items.length === 0) return null;

  const safeIndex = Math.min(currentIndex, items.length - 1);
  const currentItem = items[safeIndex];
  if (!currentItem) return null;

  const isAnime = currentItem.type === 'animes';

  return (
    <div
      className="relative h-[400px] md:h-[700px] w-full rounded-xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Imagem — componente dedicado que trata portrait vs landscape */}
      <CarouselImage
        src={currentItem.imageUrl}
        alt={currentItem.title}
        priority={safeIndex === 0}
        isAnime={isAnime}
      />

      {/* Setas de navegação */}
      <div className="absolute inset-0 flex items-center justify-between p-4 z-30">
        <Button
          variant="ghost" size="icon" onClick={prevSlide}
          className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost" size="icon" onClick={nextSlide}
          className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Dots de navegação */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === safeIndex ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Info do item */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-30">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm',
              isAnime ? 'bg-purple-600/90' : 'bg-blue-600/90'
            )}>
              {isAnime ? ' ANIME' : ' JOGO'}
            </span>
            {currentItem.isAdult && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/90 backdrop-blur-sm">18+</span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-2xl">
            {currentItem.title}
          </h2>
          <p className="text-gray-200 text-base md:text-lg line-clamp-2 drop-shadow-lg">
            {currentItem.description}
          </p>
        </div>
      </div>
    </div>
  );
}