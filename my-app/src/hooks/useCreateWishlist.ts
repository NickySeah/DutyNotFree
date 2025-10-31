import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/lib/axios"; // Using your wishlistService instance
import { toast } from "sonner";

// Define the input type for the hook.
// This should match the data you have available in the frontend when
// a user clicks "Add to Wishlist".
type WishlistInput = {
  hsCode: string;
  exportingCountry: string; // The country CODE (e.g., "840")
  importingCountry: string; // The country CODE (e.g., "702")
  userId: string;
};

export function useCreateWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: WishlistInput) => {
      // The backend DTO expects:
      // { hsCode, exportingCountry, importingCountry, userId }
      // Since our WishlistInput type already matches this,
      // we can use it directly as the payload.
      const response = await wishlistService.post("", data);
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
      console.error("Failed to create wishlist item:", error);
      // You could also add a toast notification here
      toast.error("Failed to add item to wishlist. Please try again.");
    }
  });
}
