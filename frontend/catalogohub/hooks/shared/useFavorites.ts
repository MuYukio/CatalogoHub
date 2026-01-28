import { useQuery,useMutation,useQueryClient } from "@tanstack/react-query";
import { favoritesService, type CreateFavorite } from '@/services/favorites.service'

export function useFavorite() {
    return useQuery({
        queryKey: ['favorites'],
        queryFn: () => favoritesService.getAll(),
    })
}

export function useFavoritesBytype(type:'Game'| 'Anime'){
    
    return useQuery ({
        queryKey: ['favorite','type',type ],
        queryFn: () => favoritesService.getByType({ type })
    })
}
export function useCreateFavorite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateFavorite) => favoritesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => favoritesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useGeneratePdf() {
  return useMutation({
    mutationFn: () => favoritesService.generatePdf(),
  })
}