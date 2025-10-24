
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/axios";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";

type ProductInput = {
  hsCode: string;
  name: string;
  userId: string; 
  isPrivate: boolean; 
};

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductInput) => {
      // Map frontend fields to backend expected fields
      const backendPayload = {
        hsCode: data.hsCode,
        name: data.name,
        userId: data.userId,
        isPrivate: data.isPrivate, 
      };
      const response = await productService.post("", backendPayload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch products after successful creation
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['userProducts'] });
    },
  });
}