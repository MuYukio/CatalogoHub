// components/carousel/InteractiveCarousel.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export function InteractiveCarousel({ 
  items, 
  autoPlayInterval = 5000 
}: InteractiveCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval, items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div 
      className="relative h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Imagem de fundo otimizada */}
      <div className="absolute inset-0">
        <Image
          src={currentItem.imageUrl || '/images/placeholder.jpg'}
          alt={currentItem.title}
          fill
          className="object-cover brightness-90 dark:brightness-75 transition-transform duration-700 group-hover:scale-105"
          priority
          quality={90} // Aumentei a qualidade
          sizes="100vw"
          // Otimizações específicas por tipo
          unoptimized={currentItem.imageUrl?.includes('rawg.io') ? false : true}
        />
        {/* Overlay para melhor contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent dark:from-black/80 dark:via-black/40" />
        {/* Overlay adicional para tema claro */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:hidden" />
      </div>

      {/* Botões de navegação - ajustados para não sobrepor */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        {/* Botão esquerda - ajustado para ficar mais à esquerda */}
        <div className="relative z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Botão direita - ajustado para ficar mais à direita */}
        <div className="relative z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentIndex 
                ? 'w-8 bg-white shadow-lg' 
                : 'w-2 bg-white/50 hover:bg-white/75 backdrop-blur-sm'
            )}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Conteúdo textual - Ajustado para evitar sobreposição */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm',
              currentItem.type === 'games' 
                ? 'bg-blue-600/90' 
                : 'bg-purple-600/90'
            )}>
              {currentItem.type === 'games' ? '🎮 JOGO' : '🎌 ANIME'}
            </span>
            {currentItem.isAdult && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/90 backdrop-blur-sm">
                18+
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-2xl shadow-black">
            {currentItem.title}
          </h2>
          <p className="text-gray-200 text-base md:text-lg line-clamp-2 drop-shadow-lg shadow-black">
            {currentItem.description}
          </p>
        </div>
      </div>
    </div>
  );
}