'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CarouselImage from './CarouselImage';
import Link from 'next/link';

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

const EASE_OUT_EXPO: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '8%' : '-8%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-8%' : '8%',
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.28, ease: EASE_OUT_EXPO },
  }),
};

const textContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
};

const textItemVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: EASE_OUT_QUINT },
  },
};

export function InteractiveCarousel({ items, autoPlayInterval = 6000 }: InteractiveCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => { setCurrentIndex(0); }, [items]);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    goTo(currentIndex === items.length - 1 ? 0 : currentIndex + 1, 1);
  }, [currentIndex, items.length, goTo]);

  const prevSlide = useCallback(() => {
    goTo(currentIndex === 0 ? items.length - 1 : currentIndex - 1, -1);
  }, [currentIndex, items.length, goTo]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, autoPlayInterval, items.length]);

  if (items.length === 0) return null;

  const safeIndex = Math.min(currentIndex, items.length - 1);
  const currentItem = items[safeIndex];
  if (!currentItem) return null;

  const isAnime = currentItem.type === 'animes';
  const accentColor = isAnime ? 'from-purple-600 to-fuchsia-500' : 'from-blue-600 to-cyan-400';
  const accentBg = isAnime ? 'bg-purple-600/90' : 'bg-blue-600/90';
  const detailHref = `/${currentItem.type}/${currentItem.id}`;

  const thumbCount = Math.min(5, items.length); //mostra 5 itens
  const thumbIndices = Array.from({ length: thumbCount }, (_, i) =>
    (safeIndex + i) % items.length
  );

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: 'clamp(380px, 55vw, 680px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Slide principal com AnimatePresence ── */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={safeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Imagem de fundo */}
          <CarouselImage
            src={currentItem.imageUrl}
            alt={currentItem.title}
            priority={safeIndex === 0}
            isAnime={isAnime}
          />

          {/* Gradiente multicamada para profundidade */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent z-10" />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent z-10" />

          {/* Vinheta lateral sutil */}
          <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-black/30 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-black/30 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* ── Conteúdo de texto (AnimatePresence separado) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${safeIndex}`}
          variants={textContainerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="absolute bottom-0 left-0 right-0 z-30 p-6 md:p-10"
        >
          {/* Badge tipo */}
          <motion.div variants={textItemVariants} className="flex items-center gap-2 mb-3">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-white backdrop-blur-md shadow-lg',
              accentBg
            )}>
              <Play className="h-2.5 w-2.5 fill-white" />
              {isAnime ? 'Anime' : 'Jogo'}
            </span>
            {currentItem.isAdult && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white backdrop-blur-md">
                18+
              </span>
            )}
          </motion.div>

          {/* Título */}
          <motion.h2
            variants={textItemVariants}
            className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-3 max-w-2xl"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {currentItem.title}
          </motion.h2>

          {/* Descrição */}
          <motion.p
            variants={textItemVariants}
            className="text-gray-300 text-sm md:text-base max-w-xl mb-6 line-clamp-2"
          >
            {currentItem.description}
          </motion.p>

          {/* Ações */}
          <motion.div variants={textItemVariants} className="flex items-center gap-3">
            {/* Botão Ver mais → leva para a tela de detalhe */}
            <Button
              asChild
              size="lg"
              className={cn(
                'gap-2 font-bold text-white shadow-xl rounded-xl px-6 group',
                `bg-linear-to-r ${accentColor} hover:opacity-90 border-0`
              )}
            >
              <Link href={detailHref}>
                Ver mais
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>

            {/* Contador de slides */}
            <span className="text-white/50 text-sm font-mono select-none">
              {String(safeIndex + 1).padStart(2, '0')}
              <span className="mx-1 text-white/25">/</span>
              {String(items.length).padStart(2, '0')}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Setas de navegação ── */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-40 pointer-events-none">
        <button
          onClick={prevSlide}
          className={cn(
            'pointer-events-auto h-10 w-10 rounded-full flex items-center justify-center',
            'bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm',
            'border border-white/15 hover:border-white/40',
            'transition-all duration-200 hover:scale-110 shadow-xl'
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className={cn(
            'pointer-events-auto h-10 w-10 rounded-full flex items-center justify-center',
            'bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm',
            'border border-white/15 hover:border-white/40',
            'transition-all duration-200 hover:scale-110 shadow-xl'
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Tira de thumbnails (canto inferior direito) ── */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-40 flex gap-2 items-end">
        {thumbIndices.map((itemIdx, i) => {
          const thumbItem = items[itemIdx];
          const isActive = itemIdx === safeIndex;
          return (
            <motion.button
              key={itemIdx}
              onClick={() => goTo(itemIdx, itemIdx > safeIndex ? 1 : -1)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'relative overflow-hidden rounded-lg border-2 transition-all duration-300 shrink-0',
                isActive
                  ? 'border-white shadow-[0_0_0_2px_rgba(255,255,255,0.3)] scale-110'
                  : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
              )}
              style={{ width: isActive ? 56 : 44, height: isActive ? 72 : 58 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbItem.imageUrl}
                alt={thumbItem.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay escuro nos inativos */}
              {!isActive && (
                <div className="absolute inset-0 bg-black/40" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}