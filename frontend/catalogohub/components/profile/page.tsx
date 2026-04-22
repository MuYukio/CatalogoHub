'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { favoritesService } from '@/services/favorites.service';
import { authService } from '@/services/auth.service';
import type { Favorite } from '@/types';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  User,
  Gamepad2,
  Tv,
  Heart,
  LogOut,
  Download,
  Calendar,
  Shield,
  ChevronRight,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { ProfileSettingsModal } from './ProfileSettingsModal';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'Game' | 'Anime'>('all');
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoadingFavorites(true);
    favoritesService
      .getAll()
      .then(setFavorites)
      .catch(() => setError('Erro ao carregar favoritos.'))
      .finally(() => setIsLoadingFavorites(false));
  }, [isAuthenticated]);

  const handleLogout = () => {
    authService.logout();
    logout();
    router.push('/');
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const blob = await favoritesService.generatePdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meus-favoritos.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Erro ao gerar PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const filteredFavorites = favorites.filter((f) =>
    activeTab === 'all' ? true : f.type === activeTab
  );

  const gamesCount = favorites.filter((f) => f.type === 'Game').length;
  const animesCount = favorites.filter((f) => f.type === 'Anime').length;
  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? '?';

  if (!hydrated) return null;
  if (!isAuthenticated || !user) return null;

  // Definição das abas com `as const` para garantir os tipos literais
  const tabs = [
    { key: 'all', label: 'Todos', count: favorites.length, icon: null },
    { key: 'Game', label: 'Jogos', count: gamesCount, icon: <Gamepad2 className="h-3.5 w-3.5" /> },
    { key: 'Anime', label: 'Animes', count: animesCount, icon: <Tv className="h-3.5 w-3.5" /> },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header activeTab="games" onTabChange={() => {}} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Card de perfil */}
        <div className="ch-card overflow-hidden mb-8 relative">
          <div className="h-28 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 opacity-90" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative z-10 h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-background flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{avatarLetter}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <ProfileSettingsModal />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 ch-btn-outline border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 text-red-500"
                >
                  <LogOut size={15} />
                  Sair
                </Button>
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {user.age && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {user.age} anos
                  </span>
                )}
                {user.allowAdultContent && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                    <Shield size={12} />
                    Conteúdo adulto ativo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total',
              value: favorites.length,
              icon: <Heart size={18} />,
              color: 'text-pink-500',
              bg: 'bg-pink-50 dark:bg-pink-950/40',
            },
            {
              label: 'Jogos',
              value: gamesCount,
              icon: <Gamepad2 size={18} />,
              color: 'text-blue-500',
              bg: 'bg-blue-50 dark:bg-blue-950/40',
            },
            {
              label: 'Animes',
              value: animesCount,
              icon: <Tv size={18} />,
              color: 'text-purple-500',
              bg: 'bg-purple-50 dark:bg-purple-950/40',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="ch-card p-4 flex flex-col items-center gap-2 text-center"
            >
              <div className={cn('p-2 rounded-lg', stat.bg, stat.color)}>{stat.icon}</div>
              <span className="text-2xl font-bold">
                {isLoadingFavorites ? '—' : stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Seção de favoritos */}
        <div className="ch-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Meus Favoritos</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || favorites.length === 0}
              className="gap-2 text-sm ch-btn-outline"
            >
              {isDownloadingPdf ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Exportar PDF
            </Button>
          </div>

          {/* Tabs estilizados */}
          <div className="px-6 pt-4 pb-2">
            <div className="inline-flex bg-[#111118] border border-white/10 rounded-full p-1 gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                // Cores dinâmicas para os tabs ativos
                const activeClasses =
                  tab.key === 'Game'
                    ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/60 text-blue-300 border border-blue-500/30'
                    : tab.key === 'Anime'
                    ? 'bg-gradient-to-r from-purple-900/80 to-purple-800/60 text-purple-300 border border-purple-500/30'
                    : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 border border-gray-600/30';
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      isActive
                        ? activeClasses
                        : 'text-[#8888aa] hover:text-[#f0f0f8]'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    <span
                      className={cn(
                        'ml-1 text-xs px-1.5 py-0.5 rounded-full',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 pb-6">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm py-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {isLoadingFavorites ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-muted-foreground" />
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="text-5xl opacity-20">
                  {activeTab === 'Game' ? '🎮' : activeTab === 'Anime' ? '📺' : '⭐'}
                </div>
                <p className="text-muted-foreground text-sm">Nenhum favorito ainda.</p>
                <Button size="sm" variant="outline" asChild className="gap-2 ch-btn-outline">
                  <Link href="/">
                    <BookOpen size={14} />
                    Explorar catálogo
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {filteredFavorites.map((fav) => {
                  const detailHref =
                    fav.type === 'Game'
                      ? `/games/${fav.externalId}`
                      : `/animes/${fav.externalId}`;
                  return (
                    <Link
                      key={fav.id}
                      href={detailHref}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors group"
                    >
                      <div className="relative h-14 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {fav.imageUrl ? (
                          <Image
                            src={fav.imageUrl}
                            alt={fav.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            {fav.type === 'Game' ? <Gamepad2 size={16} /> : <Tv size={16} />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {fav.title}
                        </p>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            fav.type === 'Game'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          )}
                        >
                          {fav.type === 'Game' ? 'Jogo' : 'Anime'}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}