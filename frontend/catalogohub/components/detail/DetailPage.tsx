'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft, Star, Calendar, Tag, Heart,
  Tv, Gamepad2, Clock, Users, PlayCircle, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/Footer';

export interface DetailData {
  id: number | string;
  title: string;
  backgroundImage?: string;
  imageUrl?: string;
  description?: string;
  rating?: number;
  score?: number;
  year?: string | number;
  genres?: string[];
  isAdultContent?: boolean;
  episodes?: number;
  status?: string;
  studio?: string;
  season?: string;
  platforms?: string[];
  developer?: string;
  publisher?: string;
  playtime?: number;
}

interface DetailPageProps {
  data: DetailData;
  type: 'game' | 'anime';
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  isTogglingFavorite?: boolean;
}

const THEME = {
  game: {
    gradient: 'from-blue-600/80 via-cyan-600/40 to-transparent',
    accent: 'from-blue-600 to-cyan-400',
    accentSolid: 'bg-blue-600',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    badge: '🎮 Jogo',
    badgeBg: 'bg-blue-600/90',
    icon: <Gamepad2 className="h-4 w-4" />,
    ratingLabel: 'Rating',
    ratingMax: '5',
  },
  anime: {
    gradient: 'from-purple-600/80 via-fuchsia-600/40 to-transparent',
    accent: 'from-purple-600 to-fuchsia-400',
    accentSolid: 'bg-purple-600',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500/30',
    accentBg: 'bg-purple-500/10',
    badge: '📺 Anime',
    badgeBg: 'bg-purple-600/90',
    icon: <Tv className="h-4 w-4" />,
    ratingLabel: 'Score',
    ratingMax: '10',
  },
} as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE, staggerChildren: 0.08 },
  },
};

const heroContentVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export function DetailPage({
  data,
  type,
  isFavorited = false,
  onToggleFavorite,
  isTogglingFavorite = false,
}: DetailPageProps) {
  const theme = THEME[type];
  const router = useRouter();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  const heroImage = data.backgroundImage || data.imageUrl || '';
  const coverImage = data.imageUrl || data.backgroundImage || '';

  const ratingValue = type === 'game'
    ? data.rating?.toFixed(1)
    : data.score?.toFixed(1);

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <Header activeTab={type === 'game' ? 'games' : 'animes'} onTabChange={() => {}} />

      <main className="flex-1">
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 text-muted-foreground hover:text-foreground -ml-2 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                <Link href="/" className="hover:text-foreground transition-colors shrink-0">Início</Link>
                <span className="shrink-0">/</span>
                <Link
                  href={`/?tab=${type === 'game' ? 'games' : 'animes'}`}
                  className="hover:text-foreground transition-colors shrink-0"
                >
                  {type === 'game' ? 'Jogos' : 'Animes'}
                </Link>
                <span className="shrink-0">/</span>
                <span className="truncate text-foreground font-medium">{data.title}</span>
              </div>
            </div>
          </div>
        </div>
        <div
          ref={heroRef}
          className="relative overflow-hidden"
          style={{ minHeight: 'clamp(320px, 60vw, 400px)' }}
        >
          {heroImage && (
            <motion.div className="absolute inset-0 z-0" style={{ y: heroImageY }}>
              <Image
                src={heroImage}
                alt=""
                fill
                className="object-cover scale-110"
                style={{ filter: 'blur(2px) brightness(0.5)' }}
                priority
                unoptimized
              />
            </motion.div>
          )}

          <div className="carousel-overlay z-10" />
          <div className={cn('absolute inset-0 z-10 bg-linear-to-r opacity-60', theme.gradient)} />

          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex flex-col md:flex-row items-end gap-8 pt-12 pb-16 md:pb-24">

              {/* Capa */}
              <motion.div
                variants={heroContentVariants}
                className={cn(
                  'relative shrink-0 rounded-xl overflow-hidden shadow-2xl border-2',
                  theme.accentBorder,
                  type === 'anime' ? 'w-48 md:w-56' : 'w-full max-w-xs md:max-w-sm',
                )}
                style={{ aspectRatio: type === 'anime' ? '2/3' : '16/9' }}
              >
                {coverImage ? (
                  <Image src={coverImage} alt={data.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className={cn('w-full h-full flex items-center justify-center', theme.accentBg)}>
                    {theme.icon}
                  </div>
                )}
                {data.isAdultContent && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-black bg-red-600 text-white">
                    18+
                  </span>
                )}
              </motion.div>

              {/* Info */}
              <motion.div variants={heroContentVariants} className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm',
                    theme.badgeBg,
                  )}>
                    {theme.icon}
                    {type === 'game' ? 'Jogo' : 'Anime'}
                  </span>
                  {data.isAdultContent && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-600/90">
                      Conteúdo adulto
                    </span>
                  )}
                </div>

                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4 max-w-3xl"
                  style={{ textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
                >
                  {data.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-gray-200">
                  {ratingValue && (
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {ratingValue}
                      <span className="text-gray-400 font-normal">/ {theme.ratingMax}</span>
                    </span>
                  )}
                  {data.year && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {data.year}
                    </span>
                  )}
                  {type === 'anime' && data.episodes && (
                    <span className="flex items-center gap-1.5">
                      <PlayCircle className="h-3.5 w-3.5 text-gray-400" />
                      {data.episodes} eps
                    </span>
                  )}
                  {type === 'game' && data.playtime && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      ~{data.playtime}h
                    </span>
                  )}
                  {data.status && (
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', theme.accentBg, theme.accentText)}>
                      {data.status}
                    </span>
                  )}
                </div>

                {data.genres && data.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {data.genres.slice(0, 6).map(genre => (
                      <span
                        key={genre}
                        className="px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm bg-white/10 border-white/20 text-white/90"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {onToggleFavorite && (
                  <Button
                    size="default"
                    onClick={onToggleFavorite}
                    disabled={isTogglingFavorite}
                    className={cn(
                      'gap-2 font-semibold transition-all min-w-36',
                      isFavorited
                        ? 'bg-red-500 hover:bg-red-600 text-white border-0'
                        : `bg-linear-to-r ${theme.accent} text-white border-0 hover:opacity-90`,
                    )}
                  >
                    <Heart className={cn('h-4 w-4', isFavorited && 'fill-white')} />
                    {isTogglingFavorite ? 'Aguarde...' : isFavorited ? 'Desfavoritar' : 'Favoritar'}
                  </Button>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Corpo ── */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {data.description && (
            <motion.section
              variants={sectionVariants}
              className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
            >
              <h2 className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.accentText)}>
                Sinopse
              </h2>
              <p className="text-foreground leading-relaxed text-base">
                {data.description.replace(/<[^>]*>/g, '')}
              </p>
            </motion.section>
          )}

          <motion.section variants={sectionVariants}>
            <h2 className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.accentText)}>
              Informações
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ratingValue && (
                <InfoCard icon={<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />} label={theme.ratingLabel} value={`${ratingValue} / ${theme.ratingMax}`} theme={type} />
              )}
              {data.year && (
                <InfoCard icon={<Calendar className="h-4 w-4" />} label="Ano" value={String(data.year)} theme={type} />
              )}
              {data.genres && data.genres.length > 0 && (
                <InfoCard icon={<Tag className="h-4 w-4" />} label="Gênero principal" value={data.genres[0]} theme={type} />
              )}
              {type === 'anime' && data.episodes && (
                <InfoCard icon={<PlayCircle className="h-4 w-4" />} label="Episódios" value={String(data.episodes)} theme={type} />
              )}
              {type === 'anime' && data.studio && (
                <InfoCard icon={<Building2 className="h-4 w-4" />} label="Estúdio" value={data.studio} theme={type} />
              )}
              {type === 'anime' && data.season && (
                <InfoCard icon={<Calendar className="h-4 w-4" />} label="Temporada" value={data.season} theme={type} />
              )}
              {type === 'anime' && data.status && (
                <InfoCard icon={<Tv className="h-4 w-4" />} label="Status" value={data.status} theme={type} />
              )}
              {type === 'game' && data.developer && (
                <InfoCard icon={<Building2 className="h-4 w-4" />} label="Desenvolvedor" value={data.developer} theme={type} />
              )}
              {type === 'game' && data.publisher && (
                <InfoCard icon={<Users className="h-4 w-4" />} label="Publicadora" value={data.publisher} theme={type} />
              )}
              {type === 'game' && data.playtime && (
                <InfoCard icon={<Clock className="h-4 w-4" />} label="Tempo médio" value={`~${data.playtime} horas`} theme={type} />
              )}
            </div>
          </motion.section>

          {type === 'game' && data.platforms && data.platforms.length > 0 && (
            <motion.section variants={sectionVariants}>
              <h2 className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.accentText)}>
                Plataformas
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.platforms.map(platform => (
                  <span
                    key={platform}
                    className={cn('px-3 py-1.5 rounded-lg text-sm font-medium border', theme.accentBg, theme.accentText, theme.accentBorder)}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: 'game' | 'anime';
}

function InfoCard({ icon, label, value, theme: t }: InfoCardProps) {
  const theme = THEME[t];
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card border-border shadow-sm">
      <div className={cn('flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide', theme.accentText)}>
        {icon}
        {label}
      </div>
      <p className="text-foreground font-semibold text-sm leading-snug">{value}</p>
    </div>
  );
}