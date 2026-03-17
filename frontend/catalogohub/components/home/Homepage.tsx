"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import { InteractiveCarousel } from "@/components/carousel/InteractiveCarousel";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Sparkles, Gamepad2, Tv, Loader2, Flame, Clock } from "lucide-react";
import { useDebounce } from "@/hooks/shared/useDebounce";
import { useRecentGames, useGamesSearch } from "@/hooks/games";
import { useCurrentSeasonAnimes, useAnimesSearch } from "@/hooks/animes";
import { useAuthStore } from "@/stores/auth.store";
import type { Game, Anime } from "@/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"games" | "animes">("games");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedResults, setAccumulatedResults] = useState<(Game | Anime)[]>([]);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  
  const { user, isAuthenticated } = useAuthStore();
  const includeAdult = hydrated && isAuthenticated && (user?.allowAdultContent ?? false);

  const { data: recentGamesData, isLoading: isLoadingRecentGames } = useRecentGames(20, includeAdult);
  const { data: popularAnimesData, isLoading: isLoadingPopularAnimes } = useCurrentSeasonAnimes(20);

  const {
    data: gamesSearchData,
    isLoading: isLoadingGamesSearch,
    isFetching: isFetchingGamesSearch,
    refetch: refetchGamesSearch,
  } = useGamesSearch(debouncedSearchQuery, currentPage, 20, activeTab === "games" && !!debouncedSearchQuery.trim());

  const {
    data: animesSearchData,
    isLoading: isLoadingAnimesSearch,
    isFetching: isFetchingAnimesSearch,
    refetch: refetchAnimesSearch,
  } = useAnimesSearch(debouncedSearchQuery, currentPage, 20, activeTab === "animes" && !!debouncedSearchQuery.trim());

  const isSearchMode = !!debouncedSearchQuery.trim();

  useEffect(() => {
    if (isSearchMode) {
      if (activeTab === "games" && gamesSearchData) {
        if (currentPage === 1) {
          setAccumulatedResults(gamesSearchData.results || []);
        } else {
          setAccumulatedResults(prev => {
            const newResults = gamesSearchData.results || [];
            const existingIds = new Set(prev.map(item => (item as Game).id));
            return [...prev, ...newResults.filter(item => !existingIds.has((item as Game).id))];
          });
        }
        setHasMorePages(gamesSearchData.hasNextPage || false);
        setIsLoadingMore(false);
      } else if (activeTab === "animes" && animesSearchData) {
        if (currentPage === 1) {
          setAccumulatedResults(animesSearchData.results || []);
        } else {
          setAccumulatedResults(prev => {
            const newResults = animesSearchData.results || [];
            const existingIds = new Set(prev.map(item => (item as Anime).malId));
            return [...prev, ...newResults.filter((item: Anime) => !existingIds.has((item as Anime).malId))];
          });
        }
        setHasMorePages(animesSearchData.hasNextPage || false);
        setIsLoadingMore(false);
      }
    } else {
      setAccumulatedResults([]);
      setHasMorePages(false);
    }
  }, [gamesSearchData, animesSearchData, activeTab, isSearchMode, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedResults([]);
    setHasMorePages(false);
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
    [activeTab, isFetchingGamesSearch, isFetchingAnimesSearch, currentPage]);

  const carouselData = useMemo(() => {
    const sourceData: (Game | Anime)[] = activeTab === "games" ? recentGamesData || [] : popularAnimesData || [];
    return sourceData.map((item) => {
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

  const handleLoadMore = useCallback(async () => {
    if (isSearchMode && hasMorePages && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isSearchMode, hasMorePages, isLoadingMore]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, activeTab]);

  const resultCount = useMemo(() => currentData.length, [currentData]);
  const isGames = activeTab === "games";

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Hero ── */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4
              bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400">
              <Flame className="h-3 w-3 animate-pulse" />
              {isGames ? "Lançamentos da semana" : "Temporada atual"}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Descubra{" "}
              <span className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r",
                isGames
                  ? "from-blue-500 to-cyan-400"
                  : "from-purple-500 to-pink-400"
              )}>
                {isGames ? "jogos incríveis" : "animes épicos"}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isGames
                ? "Encontre os jogos mais recentes e populares para sua coleção"
                : "Explore os melhores animes da temporada atual"}
            </p>
          </div>

          {/* ── Carrossel ── */}
          <div className="mb-12 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {isGames ? "Jogos Recentes" : "Animes da Temporada"}
                    
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isGames ? "Lançados nos últimos 12 meses" : "Em exibição nesta temporada"}
                  </p>
                </div>
              </div>
            </div>

            {carouselLoading ? (
              <div className="h-[400px] md:h-[700px] w-full rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
                  <p className="text-muted-foreground">
                    Carregando {isGames ? "jogos recentes" : "animes da temporada"}...
                  </p>
                </div>
              </div>
            ) : carouselData.length > 0 ? (
              <InteractiveCarousel items={carouselData} />
            ) : (
              <div className="h-[400px] md:h-[700px] w-full rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-20">{isGames ? "🎮" : "📺"}</div>
                  <p className="text-muted-foreground">
                    Nenhum {isGames ? "jogo" : "anime"} encontrado
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Search ── */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className={cn(
              "rounded-2xl p-1 shadow-lg border transition-all duration-300",
              isGames
                ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800"
                : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800"
            )}>
              <div className="relative bg-background rounded-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  type="search"
                  placeholder={`Buscar ${isGames ? "jogos por nome, gênero..." : "animes por título, gênero..."}`}
                  className="pl-11 pr-32 py-6 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      setIsSearching(true);
                      isGames ? refetchGamesSearch() : refetchAnimesSearch();
                    }
                  }}
                />
                <Button
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2",
                    isGames
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  )}
                  onClick={() => {
                    if (searchQuery.trim()) {
                      setIsSearching(true);
                      isGames ? refetchGamesSearch() : refetchAnimesSearch();
                    }
                  }}
                  disabled={!searchQuery.trim() || isSearching}
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Buscando...
                    </div>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
            {!searchQuery && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {isGames ? "Deixe em branco para ver jogos recentes" : "Deixe em branco para ver animes da temporada"}
              </p>
            )}
          </div>

          {/* ── Grid de resultados ── */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className={cn("h-5 w-5", isGames ? "text-blue-500" : "text-purple-500")} />
                  <h2 className="text-2xl font-bold">
                    {isSearchMode
                      ? `Resultados para "${searchQuery}"`
                      : isGames ? "Jogos Populares" : "Animes Populares"}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isSearchMode
                    ? `${resultCount} resultado${resultCount !== 1 ? "s" : ""}${hasMorePages ? " (mais disponíveis)" : ""}`
                    : isGames
                      ? "Os jogos mais bem avaliados da comunidade"
                      : "Animes mais populares desta temporada"}
                </p>
              </div>

              <div className="flex border rounded-lg overflow-hidden shadow-sm">
                <Button
                  variant={isGames ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setActiveTab("games"); setSearchQuery(""); setCurrentPage(1); setAccumulatedResults([]); }}
                  className={cn("rounded-none gap-2", isGames && "bg-blue-600 hover:bg-blue-700")}
                >
                  <Gamepad2 size={16} />
                  Jogos
                </Button>
                <Button
                  variant={!isGames ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setActiveTab("animes"); setSearchQuery(""); setCurrentPage(1); setAccumulatedResults([]); }}
                  className={cn("rounded-none gap-2", !isGames && "bg-purple-600 hover:bg-purple-700")}
                >
                  <Tv size={16} />
                  Animes
                </Button>
              </div>
            </div>

            <CatalogGrid items={currentData} type={activeTab} isLoading={currentLoading} includeAdult={includeAdult} />

            {isSearchMode && hasMorePages && currentData.length > 0 && !isFetchingMore && (
              <div className="text-center mt-10">
                <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="outline" size="lg" className="min-w-48 gap-2">
                  {isLoadingMore ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</>
                  ) : (
                    <> Carregar Mais</>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Página {currentPage} • {resultCount} resultados carregados
                </p>
              </div>
            )}

            {isSearchMode && !hasMorePages && currentData.length > 0 && (
              <p className="text-center text-muted-foreground mt-10">
                Todos os {resultCount} resultados foram carregados
              </p>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="relative overflow-hidden py-16 mt-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4
              bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-3 w-3" />
              Grátis para sempre
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comece a criar sua{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                coleção hoje!
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Cadastre-se gratuitamente e comece a salvar seus{" "}
              {isGames ? "jogos" : "animes"} favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" asChild>
                <a href="/register">Criar Conta Gratuita</a>
              </Button>
              <Button size="lg" variant="outline" className="border-2" asChild>
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