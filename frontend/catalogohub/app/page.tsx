// app/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import {InteractiveCarousel} from "@/components/carousel/InteractiveCarousel";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Sparkles, Gamepad2, Tv } from "lucide-react";
import { useDebounce } from "@/hooks/shared/useDebounce";
import { useRecentGames, useGamesSearch } from "@/hooks/games";
import { usePopularAnimes, useAnimesSearch } from "@/hooks/animes";
import type { Game, Anime } from "@/types";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"games" | "animes">("games");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [includeAdult, setIncludeAdult] = useState(false);

  // Hooks para dados iniciais
  const {
    data: recentGamesData,
    isLoading: isLoadingRecentGames,
    refetch: refetchRecentGames,
  } = useRecentGames(10, includeAdult);

  const {
    data: popularAnimesData,
    isLoading: isLoadingPopularAnimes,
    refetch: refetchPopularAnimes,
  } = usePopularAnimes(20);

  // Hooks para busca
  const {
    data: gamesSearchData,
    isLoading: isLoadingGamesSearch,
    refetch: refetchGamesSearch,
  } = useGamesSearch(
    debouncedSearchQuery,
    1,
    20,
    activeTab === "games" && !!debouncedSearchQuery.trim(),
  );

  const {
    data: animesSearchData,
    isLoading: isLoadingAnimesSearch,
    refetch: refetchAnimesSearch,
  } = useAnimesSearch(
    debouncedSearchQuery,
    1,
    20,
    activeTab === "animes" && !!debouncedSearchQuery.trim(),
  );

  // Determinar se está em modo de busca
  const isSearchMode = !!debouncedSearchQuery.trim();

  // Dados atuais para exibição
  const currentData = useMemo(() => {
    if (activeTab === "games") {
      return isSearchMode
        ? gamesSearchData?.results || []
        : recentGamesData || [];
    } else {
      return isSearchMode
        ? animesSearchData?.results || []
        : popularAnimesData || [];
    }
  }, [
    activeTab,
    isSearchMode,
    gamesSearchData,
    animesSearchData,
    recentGamesData,
    popularAnimesData,
  ]);

  // Loading atual
  const currentLoading = useMemo(() => {
    if (activeTab === "games") {
      return isSearchMode ? isLoadingGamesSearch : isLoadingRecentGames;
    } else {
      return isSearchMode ? isLoadingAnimesSearch : isLoadingPopularAnimes;
    }
  }, [
    activeTab,
    isSearchMode,
    isLoadingGamesSearch,
    isLoadingAnimesSearch,
    isLoadingRecentGames,
    isLoadingPopularAnimes,
  ]);

  // Dados para o carrossel
  const carouselData = useMemo(() => {
  const sourceData = activeTab === 'games' ? recentGamesData || [] : popularAnimesData || [];
  
  return sourceData
    .map((item: Game | Anime) => {
      if (activeTab === 'games') {
        const game = item as Game;
        return {
          id: game.id,
          title: game.name || 'Sem título',
          imageUrl: game.backgroundImage || '/images/placeholder.jpg',
          description: `Rating: ${game.rating?.toFixed(1) || 'N/A'} • ${game.released?.substring(0, 4) || 'N/A'}`,
          type: 'games' as const, // Mude para plural
          isAdult: game.isAdultContent || false
        };
      } else {
        const anime = item as Anime;
        return {
          id: anime.malId,
          title: anime.title || 'Sem título',
          imageUrl: anime.imageUrl || '/images/placeholder.jpg',
          description: `Score: ${anime.score || 'N/A'} • ${anime.type || 'Anime'}`,
          type: 'animes' as const, // Mude para plural
          isAdult: anime.isAdultContent || false
        };
      }
    })
    .filter(item => includeAdult || !item.isAdult);
}, [activeTab, recentGamesData, popularAnimesData, includeAdult]);

  const carouselLoading =
    activeTab === "games" ? isLoadingRecentGames : isLoadingPopularAnimes;

  // Efeito para buscar quando o query mudar
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setIsSearching(true);
      if (activeTab === "games") {
        refetchGamesSearch();
      } else {
        refetchAnimesSearch();
      }
      // Reset do estado de busca após um tempo
      setTimeout(() => setIsSearching(false), 1000);
    } else {
      setIsSearching(false);
    }
  }, [
    debouncedSearchQuery,
    activeTab,
    refetchGamesSearch,
    refetchAnimesSearch,
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cabeçalho com ícone dinâmico */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
              {activeTab === "games" ? (
                <Gamepad2 className="h-8 w-8 text-white" />
              ) : (
                <Tv className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Descubra{" "}
              {activeTab === "games" ? "jogos incríveis" : "animes épicos"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {activeTab === "games"
                ? "Encontre os jogos mais recentes e populares para sua coleção"
                : "Explore recomendações dos melhores animes da temporada"}
            </p>
          </div>

          {/* 🔥 CARROSSEL DINÂMICO */}
          <div className="mb-12 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${activeTab === "games" ? "bg-blue-100 dark:bg-blue-900" : "bg-purple-100 dark:bg-purple-900"}`}
                >
                  {activeTab === "games" ? (
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {activeTab === "games"
                      ? " Jogos Recentes"
                      : " Animes Populares"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "games"
                      ? "Os jogos mais novos e populares da comunidade"
                      : "Animes mais populares da temporada"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </div>

            {/* Toggle de conteúdo adulto */}
            <div className="absolute top-0 right-0 z-20">
              <label className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full border">
                <input
                  type="checkbox"
                  checked={includeAdult}
                  onChange={(e) => setIncludeAdult(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Mostrar conteúdo adulto</span>
              </label>
            </div>

            {carouselLoading ? (
              <div className="h-[400px] md:h-[500px] w-full rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">
                    Carregando{" "}
                    {activeTab === "games" ? "jogos recentes" : "animes"}...
                  </p>
                </div>
              </div>
            ) : carouselData.length > 0 ? (
              <InteractiveCarousel items={carouselData} />
            ) : (
              <div className="h-[400px] md:h-[500px] w-full rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-20">
                    {activeTab === "games" ? "🎮" : "📺"}
                  </div>
                  <p className="text-muted-foreground">
                    Nenhum {activeTab === "games" ? "jogo" : "anime"} encontrado
                    {!includeAdult && " (conteúdo adulto oculto)"}
                  </p>
                  {!includeAdult && (
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={() => setIncludeAdult(true)}
                    >
                      Mostrar conteúdo adulto
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Barra de busca */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                type="search"
                placeholder={`Buscar ${activeTab === "games" ? "jogos por nome, gênero..." : "animes por título, gênero..."}`}
                className="pl-10 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setIsSearching(true);
                    if (activeTab === "games") {
                      refetchGamesSearch();
                    } else {
                      refetchAnimesSearch();
                    }
                  }
                }}
              />
              <Button
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setIsSearching(true);
                    if (activeTab === "games") {
                      refetchGamesSearch();
                    } else {
                      refetchAnimesSearch();
                    }
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
            {!searchQuery && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {activeTab === "games"
                  ? "Deixe em branco para ver jogos recentes"
                  : "Deixe em branco para ver animes populares"}
              </p>
            )}
          </div>

          {/* Catálogo com filtros futuros */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {isSearchMode
                    ? `Resultados para "${searchQuery}"`
                    : `${activeTab === "games" ? "🎮 Jogos Populares" : "🎌 Animes Populares"}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSearchMode
                    ? `Encontrados ${currentData.length} resultados`
                    : activeTab === "games"
                      ? "Os jogos mais populares da comunidade"
                      : "Animes mais populares da temporada"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* 🔥 FUTURO: Botão de filtros */}
                <Button variant="outline" size="sm" className="gap-2">
                  <TrendingUp size={16} />
                  Filtros (Em breve)
                </Button>

                <div className="flex border rounded-lg">
                  <Button
                    variant={activeTab === "games" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setActiveTab("games");
                      setSearchQuery(""); // Limpa busca ao trocar tab
                      setIsSearching(false);
                    }}
                    className="rounded-r-none gap-2"
                  >
                    <Gamepad2 size={16} />
                    Jogos
                  </Button>
                  <Button
                    variant={activeTab === "animes" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setActiveTab("animes");
                      setSearchQuery(""); // Limpa busca ao trocar tab
                      setIsSearching(false);
                    }}
                    className="rounded-l-none gap-2"
                  >
                    <Tv size={16} />
                    Animes
                  </Button>
                </div>
              </div>
            </div>

            <CatalogGrid
              items={currentData}
              type={activeTab} 
              isLoading={currentLoading}
              includeAdult={includeAdult}
            />

            
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 py-12 mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Comece a criar sua coleção hoje!
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Cadastre-se gratuitamente e comece a salvar seus{" "}
              {activeTab === "games" ? "jogos" : "animes"} favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/register">Criar Conta Gratuita</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
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
