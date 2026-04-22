"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/shared/useDebounce";
import { useGamesCatalog } from "@/hooks/games/useGamesCatalog";
import { useAnimesCatalog } from "@/hooks/animes/useAnimesCatalog";
import { useGameGenres } from "@/hooks/games/useGameGenres";
import { useAnimeGenres } from "@/hooks/animes/useAnimeGenres";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gamepad2,
  Tv,
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Game, Anime, Genre } from "@/types";
import CatalogGrid from "@/components/catalog/CatalogGrid";
import { cn } from "@/lib/utils";

type ContentType = "games" | "animes";
type Theme = "blue" | "purple";

const GAME_ORDERING = [
  { value: "-rating", label: "Melhor avaliação" },
  { value: "-released", label: "Mais recentes" },
  { value: "-metacritic", label: "Metacritic" },
  { value: "name", label: "A–Z" },
  { value: "-name", label: "Z–A" },
];

const ANIME_ORDERING = [
  { value: "score", label: "Melhor avaliação" },
  { value: "popularity", label: "Mais populares" },
  { value: "start_date", label: "Mais recentes" },
  { value: "title", label: "A–Z" },
];

const ANIME_TYPES = [
  { value: "tv", label: "TV" },
  { value: "movie", label: "Filme" },
  { value: "ova", label: "OVA" },
  { value: "special", label: "Especial" },
];

const ANIME_STATUS = [
  { value: "airing", label: "Em exibição" },
  { value: "complete", label: "Finalizado" },
  { value: "upcoming", label: "Em breve" },
];

const GENRES_VISIBLE_DEFAULT = 12;

interface GenreSelectorProps {
  genres: Genre[];
  activeIds: number[];
  activeSlugs: string[];
  isGames: boolean;
  theme: Theme;
  onToggle: (g: Genre) => void;
}

function GenreSelector({
  genres,
  activeIds,
  activeSlugs,
  isGames,
  theme,
  onToggle,
}: GenreSelectorProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? genres : genres.slice(0, GENRES_VISIBLE_DEFAULT);
  const hasMore = genres.length > GENRES_VISIBLE_DEFAULT;
  const activeTabBg = theme === "blue" ? "bg-blue-600" : "bg-purple-600";
  const activeCount = isGames ? activeSlugs.length : activeIds.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Gêneros{" "}
          {activeCount > 0 && (
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-full text-white text-[10px] ${activeTabBg}`}
            >
              {activeCount}
            </span>
          )}
        </span>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ver todos ({genres.length})
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {visible.map((g) => {
            const isActive = isGames
              ? activeSlugs.includes(g.slug)
              : activeIds.includes(g.id);
            return (
              <motion.button
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={() => onToggle(g)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  border transition-all duration-200 select-none
                  ${
                    isActive
                      ? `${activeTabBg} text-white border-transparent shadow-sm`
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/40"
                  }
                `}
              >
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[10px] leading-none"
                  >
                    ✓
                  </motion.span>
                )}
                {g.name}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground">Ativos:</span>
          {(isGames ? activeSlugs : activeIds).map((val) => {
            const g = isGames
              ? genres.find((x) => x.slug === val)
              : genres.find((x) => x.id === val);
            if (!g) return null;
            return (
              <button
                key={String(val)}
                onClick={() => onToggle(g)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${activeTabBg} text-white`}
              >
                {g.name}
                <X className="h-2.5 w-2.5" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme: Theme;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  theme,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const activeClass =
    theme === "blue"
      ? "ch-btn-games shadow-md scale-105"
      : "ch-btn-animes shadow-md scale-105";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center gap-1 mt-12"
    >
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 w-9 rounded-full ch-btn-outline"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-muted-foreground text-sm"
          >
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(p as number)}
            className={`h-9 w-9 rounded-full text-sm transition-all ${p === currentPage ? activeClass : "ch-btn-outline"}`}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 w-9 rounded-full ch-btn-outline"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

// ── Componente principal ───

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [, startTransition] = useTransition();

  const type = (searchParams.get("type") as ContentType) || "games";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const ordering =
    searchParams.get("ordering") || (type === "games" ? "-rating" : "score");
  const animeType = searchParams.get("animeType") || "";
  const status = searchParams.get("status") || "";

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 500);
  const includeAdult = isAuthenticated && !!user?.allowAdultContent;

  const { data: gameGenres = [] } = useGameGenres();
  const { data: animeGenres = [] } = useAnimeGenres();

  const [selectedGenres, setSelectedGenres] = useState<string[]>(() =>
    (searchParams.get("genres") || "").split(",").filter(Boolean),
  );
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(() =>
    (searchParams.get("genreIds") || "").split(",").map(Number).filter(Boolean),
  );

  const latestGenresRef = useRef<string[]>(selectedGenres);
  const latestGenreIdsRef = useRef<number[]>(selectedGenreIds);
  latestGenresRef.current = selectedGenres;
  latestGenreIdsRef.current = selectedGenreIds;
  useEffect(() => {
    const urlGenres = (searchParams.get("genres") || "")
      .split(",")
      .filter(Boolean);
    const urlGenreIds = (searchParams.get("genreIds") || "")
      .split(",")
      .map(Number)
      .filter(Boolean);
    if (JSON.stringify(urlGenres) !== JSON.stringify(selectedGenres)) {
      setSelectedGenres(urlGenres);
      latestGenresRef.current = urlGenres;
    }
    if (JSON.stringify(urlGenreIds) !== JSON.stringify(selectedGenreIds)) {
      setSelectedGenreIds(urlGenreIds);
      latestGenreIdsRef.current = urlGenreIds;
    }
  }, [searchParams, selectedGenres, selectedGenreIds]);

  useEffect(() => {
    const current = searchParams.get("search") || "";
    if (debouncedSearch === current) return;
    updateParams({ search: debouncedSearch || null, page: "1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname, startTransition],
  );

  const handleGenreToggle = useCallback(
    (g: Genre) => {
      if (type === "games") {
        const current = latestGenresRef.current;
        const next = current.includes(g.slug)
          ? current.filter((s) => s !== g.slug)
          : [...current, g.slug];
        latestGenresRef.current = next;
        setSelectedGenres(next);
        updateParams({
          genres: next.length ? next.join(",") : null,
          genreIds: null,
          page: "1",
        });
      } else {
        const current = latestGenreIdsRef.current;
        const next = current.includes(g.id)
          ? current.filter((id) => id !== g.id)
          : [...current, g.id];
        latestGenreIdsRef.current = next;
        setSelectedGenreIds(next);
        updateParams({
          genreIds: next.length ? next.join(",") : null,
          genres: null,
          page: "1",
        });
      }
    },
    [type, updateParams],
  );

  const handleTypeChange = (newType: ContentType) => {
    latestGenresRef.current = [];
    latestGenreIdsRef.current = [];
    setSelectedGenres([]);
    setSelectedGenreIds([]);
    setSearchInput("");
    router.push(`${pathname}?type=${newType}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const clearFilters = () => {
    latestGenresRef.current = [];
    latestGenreIdsRef.current = [];
    setSelectedGenres([]);
    setSelectedGenreIds([]);
    setSearchInput("");
    router.push(`${pathname}?type=${type}`, { scroll: false });
  };

  const gamesQuery = useGamesCatalog({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    genres: selectedGenres.length ? selectedGenres : undefined,
    ordering,
    includeAdult,
  });

  const animesQuery = useAnimesCatalog({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    genreIds: selectedGenreIds.length ? selectedGenreIds : undefined,
    type: animeType || undefined,
    status: status || undefined,
    ordering,
  });

  const isGames = type === "games";
  const activeData = isGames ? gamesQuery.data : animesQuery.data;
  const isLoading = isGames ? gamesQuery.isLoading : animesQuery.isLoading;
  const isFetching = isGames ? gamesQuery.isFetching : animesQuery.isFetching;
  const theme: Theme = isGames ? "blue" : "purple";

  const hasActiveFilters = !!(
    selectedGenres.length ||
    selectedGenreIds.length ||
    animeType ||
    status ||
    debouncedSearch
  );

  useEffect(() => {
    if (activeData && !isLoading)
      window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeData, isLoading]);

  const themeGradient = isGames
    ? "from-blue-500/20 to-cyan-500/20"
    : "from-purple-500/20 to-pink-500/20";
  const spinnerColor = isGames ? "border-blue-500" : "border-purple-500";
  const textGradient = isGames ? "ch-text-games" : "ch-text-animes";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${themeGradient} border-b border-border/50`}
      >
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 mb-2">
              <span
                className={`ch-eyebrow ${isGames ? "ch-eyebrow-games" : "ch-eyebrow-animes"}`}
              >
                Catálogo
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black">
              Explore{" "}
              <span className={textGradient}>
                {isGames ? "jogos" : "animes"}
              </span>
            </h1>
            <p className="text-muted-foreground text-base mt-4 max-w-2xl">
              Filtre por gênero, plataforma, ano e muito mais para encontrar
              exatamente o que procura.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center md:justify-start mt-8"
          >
            <div className="inline-flex bg-[#111118] border border-white/10 rounded-full p-1 gap-1">
              {(["games", "animes"] as const).map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      active
                        ? t === "games"
                          ? "bg-gradient-to-r from-blue-900/80 to-blue-800/60 text-blue-300 border border-blue-500/30"
                          : "bg-gradient-to-r from-purple-900/80 to-purple-800/60 text-purple-300 border border-purple-500/30"
                        : "text-[#8888aa] hover:text-[#f0f0f8]",
                    )}
                  >
                    {t === "games" ? (
                      <Gamepad2 className="h-4 w-4" />
                    ) : (
                      <Tv className="h-4 w-4" />
                    )}
                    {t === "games" ? "Jogos" : "Animes"}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-5 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isGames ? "Buscar jogo..." : "Buscar anime..."}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 rounded-full bg-muted/30 border-muted focus:bg-background transition-colors"
              />
            </div>

            <Select
              value={ordering}
              onValueChange={(v) => updateParams({ ordering: v, page: "1" })}
            >
              <SelectTrigger className="w-[190px] h-10 rounded-full bg-muted/30 border-muted">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {(isGames ? GAME_ORDERING : ANIME_ORDERING).map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!isGames && (
              <>
                <Select
                  value={animeType || "all"}
                  onValueChange={(v) =>
                    updateParams({
                      animeType: v === "all" ? null : v,
                      page: "1",
                    })
                  }
                >
                  <SelectTrigger className="w-[140px] h-10 rounded-full bg-muted/30 border-muted">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {ANIME_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={status || "all"}
                  onValueChange={(v) =>
                    updateParams({ status: v === "all" ? null : v, page: "1" })
                  }
                >
                  <SelectTrigger className="w-[150px] h-10 rounded-full bg-muted/30 border-muted">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {ANIME_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1.5 text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Linha 2: seletor de gêneros */}
          <div className="ch-card p-4">
            <GenreSelector
              genres={isGames ? gameGenres : animeGenres}
              activeIds={selectedGenreIds}
              activeSlugs={selectedGenres}
              isGames={isGames}
              theme={theme}
              onToggle={handleGenreToggle}
            />
          </div>
        </div>

        {/* Contador */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {activeData
              ? `${activeData.totalCount.toLocaleString("pt-BR")} ${isGames ? "jogos" : "animes"} encontrados`
              : "\u00a0"}
          </p>
          {isFetching && !isLoading && (
            <div
              className={`h-4 w-4 rounded-full border-2 ${spinnerColor} border-t-transparent animate-spin`}
            />
          )}
        </div>

        <CatalogGrid
          items={activeData?.results}
          type={type}
          isLoading={isLoading}
          includeAdult={includeAdult}
          variant="compact"
        />

        {/* Paginação */}
        {activeData && (
          <Pagination
            currentPage={activeData.currentPage}
            totalPages={activeData.totalPages}
            onPageChange={handlePageChange}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}
