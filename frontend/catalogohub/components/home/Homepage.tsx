"use client";

import { useState, useEffect, useMemo, useCallback, startTransition } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import { InteractiveCarousel } from "@/components/carousel/InteractiveCarousel";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Gamepad2, Tv, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/shared/useDebounce";
import { useRecentGames, useGamesSearch } from "@/hooks/games";
import { useCurrentSeasonAnimes, useAnimesSearch } from "@/hooks/animes";
import { useAuthStore } from "@/stores/auth.store";
import type { Game, Anime } from "@/types";
import { cn } from "@/lib/utils";
import { GamesUnavailableModal } from "@/components/games/GamesUnavailableModal";

export default function HomePage() {
  const [activeTab, setActiveTab]               = useState<"games" | "animes">("games");
  const [searchQuery, setSearchQuery]           = useState("");
  const [isSearching, setIsSearching]           = useState(false);
  const debouncedSearchQuery                    = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage]           = useState(1);
  const [accumulatedResults, setAccumulatedResults] = useState<(Game | Anime)[]>([]);
  const [hasMorePages, setHasMorePages]         = useState(false);
  const [isLoadingMore, setIsLoadingMore]       = useState(false);
  const [hydrated, setHydrated]                 = useState(false);

  useEffect(() => {
    startTransition(() => setHydrated(true));
  }, []);

  const { user, isAuthenticated } = useAuthStore();
  const includeAdult = hydrated && isAuthenticated && (user?.allowAdultContent ?? false);

  const { data: recentGamesData,   isLoading: isLoadingRecentGames }   = useRecentGames(20, includeAdult);
  const { data: popularAnimesData, isLoading: isLoadingPopularAnimes } = useCurrentSeasonAnimes(20);

  const {
    data: gamesSearchData,
    isLoading: isLoadingGamesSearch,
    isFetching: isFetchingGamesSearch,
    refetch: refetchGamesSearch,
  } = useGamesSearch(
    debouncedSearchQuery, currentPage, 20,
    activeTab === "games" && !!debouncedSearchQuery.trim()
  );

  const {
    data: animesSearchData,
    isLoading: isLoadingAnimesSearch,
    isFetching: isFetchingAnimesSearch,
    refetch: refetchAnimesSearch,
  } = useAnimesSearch(
    debouncedSearchQuery, currentPage, 20,
    activeTab === "animes" && !!debouncedSearchQuery.trim()
  );

  const isSearchMode = !!debouncedSearchQuery.trim();

  useEffect(() => {
    if (!isSearchMode) {
      startTransition(() => {
        setAccumulatedResults([]);
        setHasMorePages(false);
      });
      return;
    }

    if (activeTab === "games" && gamesSearchData) {
      startTransition(() => {
        if (currentPage === 1) {
          setAccumulatedResults(gamesSearchData.results || []);
        } else {
          setAccumulatedResults(prev => {
            const newResults  = gamesSearchData.results || [];
            const existingIds = new Set(prev.map(item => (item as Game).id));
            return [...prev, ...newResults.filter(item => !existingIds.has((item as Game).id))];
          });
        }
        setHasMorePages(gamesSearchData.hasNextPage || false);
        setIsLoadingMore(false);
      });
    } else if (activeTab === "animes" && animesSearchData) {
      startTransition(() => {
        if (currentPage === 1) {
          setAccumulatedResults(animesSearchData.results || []);
        } else {
          setAccumulatedResults(prev => {
            const newResults  = animesSearchData.results || [];
            const existingIds = new Set(prev.map(item => (item as Anime).malId));
            return [...prev, ...newResults.filter((item: Anime) => !existingIds.has((item as Anime).malId))];
          });
        }
        setHasMorePages(animesSearchData.hasNextPage || false);
        setIsLoadingMore(false);
      });
    }
  }, [gamesSearchData, animesSearchData, activeTab, isSearchMode, currentPage]);

  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      startTransition(() => setIsSearching(false));
      return;
    }
    startTransition(() => setIsSearching(true));
    const timer = setTimeout(() => {
      startTransition(() => setIsSearching(false));
    }, 1000);
    return () => clearTimeout(timer);
  }, [debouncedSearchQuery, activeTab]);

  const currentData: Game[] | Anime[] = useMemo(() => {
    if (activeTab === "games")
      return isSearchMode ? (accumulatedResults as Game[]) : (recentGamesData || []);
    return isSearchMode ? (accumulatedResults as Anime[]) : (popularAnimesData || []);
  }, [activeTab, isSearchMode, accumulatedResults, recentGamesData, popularAnimesData]);

  const currentLoading = useMemo(() => {
    if (activeTab === "games") return isSearchMode ? isLoadingGamesSearch : isLoadingRecentGames;
    return isSearchMode ? isLoadingAnimesSearch : isLoadingPopularAnimes;
  }, [activeTab, isSearchMode, isLoadingGamesSearch, isLoadingAnimesSearch, isLoadingRecentGames, isLoadingPopularAnimes]);

  const isFetchingMore = useMemo(() =>
    (activeTab === "games" ? isFetchingGamesSearch : isFetchingAnimesSearch) && currentPage > 1,
    [activeTab, isFetchingGamesSearch, isFetchingAnimesSearch, currentPage]
  );

  const carouselData = useMemo(() => {
    const source: (Game | Anime)[] = activeTab === "games"
      ? recentGamesData  || []
      : popularAnimesData || [];

    return source.map((item) => {
      if (activeTab === "games") {
        const game = item as Game;
        return {
          id: game.id,
          title: game.name || "Sem título",
          imageUrl: game.backgroundImage || "/images/placeholder.jpg",
          description: `Rating: ${game.rating?.toFixed(1) || "N/A"} • ${game.released?.substring(0, 4) || "N/A"}`,
          type: "games" as const,
          isAdult: game.isAdultContent || false,
        };
      }
      const anime = item as Anime;
      return {
        id: anime.malId,
        title: anime.title || "Sem título",
        imageUrl: anime.imageUrl || "/images/placeholder.jpg",
        description: `Score: ${anime.score || "N/A"} • ${anime.type || "Anime"}`,
        type: "animes" as const,
        isAdult: anime.isAdultContent || false,
      };
    }).filter(item => includeAdult || !item.isAdult);
  }, [activeTab, recentGamesData, popularAnimesData, includeAdult]);

  const carouselLoading = activeTab === "games" ? isLoadingRecentGames : isLoadingPopularAnimes;

  const handleTabChange = useCallback((tab: "games" | "animes") => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    setAccumulatedResults([]);
    setHasMorePages(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isSearchMode && hasMorePages && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isSearchMode, hasMorePages, isLoadingMore]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    setCurrentPage(1);
    setAccumulatedResults([]);
    startTransition(() => setIsSearching(true));
    if (activeTab === "games") {
      refetchGamesSearch();
    } else {
      refetchAnimesSearch();
    }
  }, [searchQuery, activeTab, refetchGamesSearch, refetchAnimesSearch]);

  const resultCount = currentData.length;
  const isGames     = activeTab === "games";

  return (
    
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#f0f0f8]">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
        {isGames && <GamesUnavailableModal />}
      <main className="flex-1 relative">

        {/* Ruído de fundo global */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px",
          }}
        />

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

          {/* ── Hero ── */}
          <div className="mb-12 pt-8">
            {/* Eyebrow badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase mb-6 border",
              isGames
                ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                : "text-purple-400 border-purple-500/30 bg-purple-500/10"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isGames ? "bg-blue-400" : "bg-purple-400"
              )} />
              {isGames ? "Lançamentos Recentes" : "Temporada Atual"}
            </div>

            {/* Título principal */}
            <h1 className="text-5xl md:text-7xl font-black leading-[1.0] tracking-tight mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Descubra<br />
              <span className={cn(
                "bg-clip-text text-transparent bg-linear-to-r",
                isGames
                  ? "from-blue-400 to-cyan-400"
                  : "from-purple-400 to-pink-400"
              )}>
                {isGames ? "jogos incríveis" : "animes épicos"}
              </span>
            </h1>

            <p className="text-base text-[#8888aa] max-w-lg font-light mb-10">
              {isGames
                ? "Encontre os jogos mais recentes e populares para sua coleção"
                : "Explore os melhores animes da temporada atual"}
            </p>

            {/* Tabs */}
            <div className="inline-flex bg-[#111118] border border-white/10 rounded-full p-1 gap-1">
              {(["games", "animes"] as const).map((t) => {
                const active = activeTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleTabChange(t)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      active
                        ? t === "games"
                          ? "bg-gradient-to-r from-blue-900/80 to-blue-800/60 text-blue-300 border border-blue-500/30"
                          : "bg-gradient-to-r from-purple-900/80 to-purple-800/60 text-purple-300 border border-purple-500/30"
                        : "text-[#8888aa] hover:text-[#f0f0f8]"
                    )}
                  >
                    {t === "games"
                      ? <Gamepad2 className="h-4 w-4" />
                      : <Tv className="h-4 w-4" />}
                    {t === "games" ? "Jogos" : "Animes"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Carrossel ── */}
          <div className="mb-16">
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#8888aa] mb-1.5">
              Destaque da semana
            </p>
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Syne', sans-serif" }}>
              {isGames ? "Jogos Recentes" : "Animes da Temporada"}
            </h2>

            {carouselLoading ? (
              <div className={cn(
                "h-[400px] md:h-[560px] w-full rounded-2xl bg-[#111118] border border-white/[0.06] flex items-center justify-center",
              )}>
                {/* gradiente de fundo sutil */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl opacity-40",
                  isGames
                    ? "bg-[radial-gradient(ellipse_60%_60%_at_30%_50%,#4a90e815,transparent)]"
                    : "bg-[radial-gradient(ellipse_60%_60%_at_30%_50%,#9b6ef315,transparent)]"
                )} />
                <div className="text-center relative z-10">
                  <div className={cn(
                    "inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mb-4",
                    isGames ? "border-blue-500" : "border-purple-500"
                  )} />
                  <p className="text-[#8888aa] text-sm">
                    Carregando {isGames ? "jogos recentes" : "animes da temporada"}...
                  </p>
                </div>
              </div>
            ) : carouselData.length > 0 ? (
              <InteractiveCarousel items={carouselData} />
            ) : (
              <div className="h-[400px] md:h-[560px] w-full rounded-2xl bg-[#111118] border border-white/[0.06] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3 opacity-20">{isGames ? "🎮" : "📺"}</div>
                  <p className="text-[#8888aa] text-sm">Nenhum {isGames ? "jogo" : "anime"} encontrado</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Busca ── */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className={cn(
              "rounded-2xl p-[1px] transition-all duration-300",
              isGames
                ? "bg-gradient-to-r from-blue-500/20 via-transparent to-cyan-500/20"
                : "bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20"
            )}>
              <div className="bg-[#111118] rounded-2xl flex items-center gap-2 p-1.5">
                <Search className="ml-3 h-4 w-4 text-[#8888aa] flex-shrink-0" />
                <Input
                  type="search"
                  placeholder={`Buscar ${isGames ? "jogos por nome, gênero..." : "animes por título, gênero..."}`}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[#f0f0f8] placeholder:text-[#8888aa] text-sm py-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                />
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className={cn(
                    "rounded-xl px-5 py-2 text-sm font-medium border-0",
                    isGames
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                      : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-pink-500 text-white"
                  )}
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Buscando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5" />
                      Buscar
                    </div>
                  )}
                </Button>
              </div>
            </div>
            {!searchQuery && (
              <p className="text-center text-xs text-[#8888aa] mt-2.5 italic">
                {isGames ? "Deixe em branco para ver jogos recentes" : "Deixe em branco para ver animes da temporada"}
              </p>
            )}
          </div>

          {/* ── Grid de resultados ── */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  
                  <h2 className="text-4xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {isSearchMode
                      ? `Resultados para "${searchQuery}"`
                      : isGames ? "Jogos Populares" : "Animes Populares"}
                  </h2>
                </div>
                <p className="text-xl text-[#8888aa]">
                  {isSearchMode
                    ? `${resultCount} resultado${resultCount !== 1 ? "s" : ""}${hasMorePages ? " (mais disponíveis)" : ""}`
                    : isGames
                      ? "Os jogos mais bem avaliados da comunidade"
                      : "Animes mais populares desta temporada"}
                </p>
              </div>

              {/* Mini tab switcher */}
              <div className="flex border border-white/10 rounded-xl overflow-hidden bg-[#111118]">
                <button
                  onClick={() => handleTabChange("games")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all",
                    isGames
                      ? "bg-blue-600/20 text-blue-300"
                      : "text-[#8888aa] hover:text-[#f0f0f8]"
                  )}
                >
                  <Gamepad2 className="h-3.5 w-3.5" /> Jogos
                </button>
                <button
                  onClick={() => handleTabChange("animes")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all border-l border-white/10",
                    !isGames
                      ? "bg-purple-600/20 text-purple-300"
                      : "text-[#8888aa] hover:text-[#f0f0f8]"
                  )}
                >
                  <Tv className="h-3.5 w-3.5" /> Animes
                </button>
              </div>
            </div>

            <CatalogGrid
              items={currentData}
              type={activeTab}
              isLoading={currentLoading}
              includeAdult={includeAdult}
            />

            {isSearchMode && hasMorePages && currentData.length > 0 && !isFetchingMore && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "min-w-48 gap-2 rounded-xl border bg-transparent text-sm font-medium",
                    isGames
                      ? "border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      : "border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  )}
                >
                  {isLoadingMore
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Carregando...</>
                    : "Carregar Mais"}
                </Button>
                <p className="text-xs text-[#8888aa] mt-2">
                  Página {currentPage} • {resultCount} resultados carregados
                </p>
              </div>
            )}

            {isSearchMode && !hasMorePages && currentData.length > 0 && (
              <p className="text-center text-xs text-[#8888aa] mt-10">
                Todos os {resultCount} resultados foram carregados
              </p>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="relative overflow-hidden py-20 mt-8 z-10">
          {/* Gradiente de fundo */}
          <div className="absolute inset-0 bg-[#111118] border-y border-white/[0.06]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_120%_at_50%_100%,#4a90e810,transparent)]" />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#8888aa] mb-4">
              Comece agora
            </p>
            <h2 className="text-3xl md:text-5xl font-black leading-[1.05] tracking-tight mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Comece a criar sua{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                coleção hoje
              </span>
            </h2>
            <p className="text-sm text-[#8888aa] mb-10 max-w-md mx-auto font-light">
              Cadastre-se gratuitamente e comece a salvar seus {isGames ? "jogos" : "animes"} favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 rounded-xl px-8 font-medium"
                asChild
              >
                <a href="/register">Criar Conta Gratuita</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/10 bg-transparent text-[#f0f0f8] hover:bg-white/5 px-8"
                asChild
              >
                <a href="/catalog">Explorar Catálogo</a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}