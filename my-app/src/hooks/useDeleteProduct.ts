// "use client";

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { tariffService } from "@/lib/axios";

// import { toast } from "sonner";

// // Replace with your API call
// async function deleteProductApi(productId: string | number) {
//   const response = await fetch(`/api/products/${productId}`, {
//     method: "DELETE",
//   });

//   if (!response.ok) {
//     throw new Error("Failed to delete product");
//   }

//   return response.json();
// }

// export function useDeleteProduct() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: deleteProductApi,
//     onSuccess: (_, productId) => {
//       // Optional: invalidate product list query so UI updates
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//     },
//     onError: (error: any) => {
//       console.error("Delete product failed:", error);
//     },
//   });
// }
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
    },
  });
}
