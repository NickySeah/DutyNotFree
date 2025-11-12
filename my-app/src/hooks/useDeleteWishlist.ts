import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/lib/axios"; // Using your wishlistService instance

export function useDeleteWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (wishlistId: number) => {
      // Calls DELETE /api/v1/wishlists/{id}
      const response = await wishlistService.delete(`/${wishlistId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch *both* queries used by the useWishlistData hook
      // This will automatically refresh your "My Wishlist" tab
      queryClient.invalidateQueries({ queryKey: ['wishlistTariffs'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistItems'] });
    },
    onError: (error) => {
      // Optional: Add error handling
      console.error("Failed to delete wishlist item:", error);
    }
  });
}
