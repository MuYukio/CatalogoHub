// hooks/useFilteredGames.ts
import { useUserPreferences } from '@/stores/userPreferences.store';
import { Game } from '@/types';

export const useFilteredGames = (games: Game[] | undefined) => {
  const { canViewAdultContent, contentFilters } = useUserPreferences();
  
  const filteredGames = games?.filter(game => {
    // Se não pode ver conteúdo adulto, filtrar
    if (!canViewAdultContent() && game.isAdultContent) {
      return false;
    }
    
    // Aplicar filtros específicos
    if (game.contentWarnings?.includes('Violence') && !contentFilters.violence) {
      return false;
    }
    
    if (game.contentWarnings?.includes('Sexual Content') && !contentFilters.sexualContent) {
      return false;
    }
    
    return true;
  });
  
  return filteredGames;
};