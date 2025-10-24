import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/axios";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: number) => {
      const response = await productService.delete(`/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch product after successful deletion
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['userProducts'] });
    },
  });
}
