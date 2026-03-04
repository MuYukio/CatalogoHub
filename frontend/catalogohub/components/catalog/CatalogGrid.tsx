"use client";

import { useState, useEffect } from "react";
import { Game, Anime } from "@/types";
import { CatalogCard } from "./CatalogCard";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List } from "lucide-react";

interface CatalogGridProps {
  items: Game[] | Anime[] | undefined;
  type: "games" | "animes";
  isLoading: boolean;
  includeAdult?: boolean;
}

export default function CatalogGrid({
  items,
  type,
  isLoading,
  includeAdult = false,
}: CatalogGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [displayedItems, setDisplayedItems] = useState<(Game | Anime)[]>([]);

  useEffect(() => {
    console.log(" DEBUG - CatalogGrid recebeu:", {
      itemsCount: items?.length,
      type,
      includeAdult,
      sampleItem: items?.[0],
    });
  }, [items, type, includeAdult]);

  useEffect(() => {
    if (!items) {
      setDisplayedItems([]);
      return;
    }
    const filtered = items.filter((item) => {

      if (includeAdult) return true;

      const isAdult = item.isAdultContent || false;

      if (isAdult) {
        console.log(" Item filtrado (adulto):", {
          title: type === "games" ? (item as Game).name : (item as Anime).title,
          isAdult,
          item,
        });
      }

      return !isAdult;
    });

    setDisplayedItems(filtered);
  }, [items, type, includeAdult]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
              : "space-y-4"
          }
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-lg mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 mb-1" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayedItems || displayedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 opacity-20">
          {type === "games" ? "🎮" : "📺"}
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Nenhum {type === "games" ? "jogo" : "anime"} encontrado
        </h3>
        <p className="text-muted-foreground mb-6">
          {!includeAdult
            ? "Conteúdo adulto está oculto. Ative a opção 'Mostrar conteúdo adulto' para ver todos os itens."
            : "Tente ajustar seus filtros de busca ou explore outras categorias."}
        </p>
        {!includeAdult && (
          <Button onClick={() => window.location.reload()} variant="outline">
            Atualizar página
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            {displayedItems.length} {type === "games" ? "jogos" : "animes"}{" "}
            encontrados
          </h3>
          {!includeAdult && displayedItems.length < (items?.length || 0) && (
            <p className="text-sm text-muted-foreground">
              {(items?.length || 0) - displayedItems.length} itens adultos
              ocultos
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            : "space-y-4"
        }
      >
        {displayedItems.map((item, index) => {
          const itemId =
            type === "games" ? (item as Game).id : (item as Anime).malId;

          const uniqueKey = `${type}-${itemId || index}-${Date.now()}`;

          return (
            <CatalogCard
              key={uniqueKey}
              item={item}
              type={type}
              viewMode={viewMode}
            />
          );
        })}
      </div>
    </div>
  );
}
