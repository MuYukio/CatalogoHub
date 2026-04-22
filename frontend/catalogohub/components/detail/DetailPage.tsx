'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft, Star, Calendar, Tag, Heart,
  Tv, Gamepad2, Clock, Users, PlayCircle, Building2,
  Trophy, TrendingUp, BookOpen, BarChart2, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/Footer';
import { InfoCard } from './InfoCard';
import { type DetailData } from '@/types';

interface DetailPageProps {
  data: DetailData;
  type: 'game' | 'anime';
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  isTogglingFavorite?: boolean;
}

const THEME = {
  game: {
    gradient: 'from-black/80 via-black/50 to-transparent',
    gradientBody: 'from-blue-600/80 via-cyan-600/40 to-transparent',
    accent: 'from-blue-600 to-cyan-400',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    badgeBg: 'bg-blue-600/90',
    icon: <Gamepad2 className="h-4 w-4" />,
    ratingLabel: 'Rating',
    ratingMax: '5',
  },
  anime: {
    gradient: 'from-black/80 via-black/50 to-transparent',
    gradientBody: 'from-purple-600/80 via-fuchsia-600/40 to-transparent',
    accent: 'from-purple-600 to-fuchsia-400',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500/30',
    accentBg: 'bg-purple-500/10',
    badgeBg: 'bg-purple-600/90',
    icon: <Tv className="h-4 w-4" />,
    ratingLabel: 'Score',
    ratingMax: '10',
  },
} as const;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE, staggerChildren: 0.08 } },
};

const heroContentVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
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
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const heroImage = data.backgroundImage || data.imageUrl || '';
  const coverImage = data.imageUrl || data.backgroundImage || '';
  const ratingValue = type === 'game' ? data.rating?.toFixed(1) : data.score?.toFixed(1);

  const infoFieldsLeft = [
    ratingValue && {
      icon: <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      label: theme.ratingLabel,
      value: `${ratingValue} / ${theme.ratingMax}`,
    },
    data.year && { icon: <Calendar className="h-4 w-4" />, label: 'Ano', value: String(data.year) },
    data.genres?.length && { icon: <Tag className="h-4 w-4" />, label: 'Gênero principal', value: data.genres[0] },
    type === 'anime' && data.episodes && { icon: <PlayCircle className="h-4 w-4" />, label: 'Episódios', value: String(data.episodes) },
    type === 'anime' && data.studio && { icon: <Building2 className="h-4 w-4" />, label: 'Estúdio', value: data.studio },
    type === 'anime' && data.season && { icon: <Calendar className="h-4 w-4" />, label: 'Temporada', value: data.season },
    type === 'game' && data.developer && { icon: <Building2 className="h-4 w-4" />, label: 'Desenvolvedor', value: data.developer },
    type === 'game' && data.publisher && { icon: <Users className="h-4 w-4" />, label: 'Publicadora', value: data.publisher },
    type === 'game' && data.playtime && { icon: <Clock className="h-4 w-4" />, label: 'Tempo médio', value: `~${data.playtime} horas` },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  const infoFieldsRight = [
    type === 'anime' && data.status && { icon: <Tv className="h-4 w-4" />, label: 'Status', value: data.status },
    type === 'anime' && data.rank && { icon: <Trophy className="h-4 w-4" />, label: 'Ranking MAL', value: `#${data.rank}` },
    type === 'anime' && data.popularity && { icon: <TrendingUp className="h-4 w-4" />, label: 'Popularidade', value: `#${data.popularity}` },
    type === 'anime' && data.source && { icon: <BookOpen className="h-4 w-4" />, label: 'Origem', value: data.source },
    type === 'anime' && data.aired && { icon: <Globe className="h-4 w-4" />, label: 'Exibição', value: data.aired },
    type === 'game' && data.status && { icon: <Tv className="h-4 w-4" />, label: 'Status', value: data.status },
    type === 'game' && data.metacritic && {
      icon: <BarChart2 className="h-4 w-4" />,
      label: 'Metacritic',
      value: String(data.metacritic),
      highlight: (data.metacritic >= 75 ? 'green' : data.metacritic >= 50 ? 'yellow' : 'red') as 'green' | 'yellow' | 'red',
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; highlight?: 'green' | 'yellow' | 'red' }[];

  const textGradient = type === 'game' ? 'ch-text-games' : 'ch-text-animes';
  const btnFavoriteClass = isFavorited
    ? 'bg-red-500 hover:bg-red-600 text-white border-0'
    : `bg-gradient-to-r ${theme.accent} text-white border-0 hover:opacity-90`;

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <Header activeTab={type === 'game' ? 'games' : 'animes'} onTabChange={() => {}} />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 text-muted-foreground hover:text-foreground -ml-2 shrink-0 ch-btn-outline"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                <Link href="/" className="hover:text-foreground transition-colors shrink-0">Início</Link>
                <span className="shrink-0">/</span>
                <Link href={`/?tab=${type === 'game' ? 'games' : 'animes'}`} className="hover:text-foreground transition-colors shrink-0">
                  {type === 'game' ? 'Jogos' : 'Animes'}
                </Link>
                <span className="shrink-0">/</span>
                <span className="truncate text-foreground font-medium">{data.title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div
          ref={heroRef}
          className="relative overflow-hidden"
          style={{ minHeight: 'clamp(380px, 40vw, 480px)' }}
        >
          {heroImage && (
            <motion.div className="absolute inset-0 z-0" style={{ y: heroImageY }}>
              <Image
                src={heroImage}
                alt=""
                fill
                className="object-cover scale-110"
                style={{ filter: 'blur(3px) brightness(0.45)' }}
                priority
                unoptimized
              />
            </motion.div>
          )}

          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
          <div className={cn('absolute inset-0 z-10 bg-gradient-to-r opacity-50', theme.gradientBody)} />

          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex flex-col md:flex-row items-end gap-8 md:gap-12 pt-12 pb-16 md:pb-24">
              {/* Capa */}
              <motion.div variants={heroContentVariants} className="shrink-0 self-end md:self-auto">
                <div
                  className={cn(
                    'relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-2 transition-transform duration-300 hover:scale-105',
                    theme.accentBorder,
                    type === 'anime'
                      ? 'w-48 md:w-64 lg:w-[320px]'
                      : 'w-64 md:w-80 lg:w-[580px]',
                  )}
                  style={{
                    aspectRatio: type === 'anime' ? '2/3' : '16/9',
                    minHeight: type === 'anime' ? 280 : 240,
                  }}
                >
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt={data.title}
                      fill
                      className="object-cover"
                      priority
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      unoptimized
                    />
                  ) : (
                    <div className={cn('w-full h-full flex flex-col items-center justify-center gap-2', theme.accentBg)}>
                      {theme.icon}
                      <span className="text-xs text-white/60">Imagem indisponível</span>
                    </div>
                  )}
                  {data.isAdultContent && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-xs font-black bg-red-600 text-white z-10 shadow-lg">
                      18+
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Informações */}
              <motion.div variants={heroContentVariants} className="flex-1 text-white pb-2">
                <div className="flex items-center gap-2 mb-4">
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

                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-5 max-w-2xl">
                  {data.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 text-sm text-gray-200">
                  {ratingValue && (
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {ratingValue}
                      <span className="text-gray-400 font-normal">/ {theme.ratingMax}</span>
                    </span>
                  )}
                  {type === 'game' && data.metacritic && (
                    <span className={cn(
                      'flex items-center gap-1 font-bold px-2 py-0.5 rounded text-xs',
                      data.metacritic >= 75 ? 'bg-green-600/90 text-white' :
                      data.metacritic >= 50 ? 'bg-yellow-600/90 text-white' : 'bg-red-600/90 text-white'
                    )}>
                      MC {data.metacritic}
                    </span>
                  )}
                  {type === 'anime' && data.rank && (
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                      #{data.rank}
                    </span>
                  )}
                  {data.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {data.year}
                    </span>
                  )}
                  {type === 'anime' && data.episodes && (
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5 text-gray-400" />
                      {data.episodes} eps
                    </span>
                  )}
                  {type === 'game' && data.playtime && (
                    <span className="flex items-center gap-1">
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
                      btnFavoriteClass,
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

        {/* Corpo */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna esquerda */}
            <div className="lg:col-span-2 space-y-8">
              {data.description && (
                <motion.section variants={sectionVariants} className="ch-card p-6 md:p-8 shadow-sm">
                  <h2 className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.accentText)}>
                    Sinopse
                  </h2>
                  <p className="text-foreground leading-relaxed text-base">
                    {data.description.replace(/<[^>]*>/g, '')}
                  </p>
                </motion.section>
              )}

              {infoFieldsLeft.length > 0 && (
                <motion.section variants={sectionVariants}>
                  <h2 className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.accentText)}>
                    Informações
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {infoFieldsLeft.map((field, i) => (
                      <InfoCard key={i} icon={field.icon} label={field.label} value={field.value} theme={type} />
                    ))}
                  </div>
                </motion.section>
              )}
            </div>

            {/* Coluna direita */}
            <div className="space-y-8">
              {infoFieldsRight.length > 0 && (
                <motion.section variants={sectionVariants}>
                  <h2 className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.accentText)}>
                    Detalhes
                  </h2>
                  <div className="flex flex-col gap-3">
                    {infoFieldsRight.map((field, i) => (
                      <InfoCard
                        key={i}
                        icon={field.icon}
                        label={field.label}
                        value={field.value}
                        theme={type}
                        highlight={field.highlight}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

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

              {type === 'game' && data.tags && data.tags.length > 0 && (
                <motion.section variants={sectionVariants}>
                  <h2 className={cn('text-sm font-bold uppercase tracking-widest mb-4', theme.accentText)}>
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

export { DetailData };
