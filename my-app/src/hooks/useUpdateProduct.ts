import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/lib/axios';
// import { formatDateToYYYYMMDD } from '@/utils/dateUtils';
// import { getBackendValueFromData } from '@/lib/testData';

type ProductUpdateInput = {
  product_id: number;
  name: string;
  isPrivate: boolean; 
  // userId: string; 
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductUpdateInput) => {
      const { product_id, ...payload } = data;
      // Map frontend fields to backend expected fields
      const backendPayload = {
        name: payload.name,
        isPrivate: payload.isPrivate 
      };
      const response = await productService.put(`${product_id}`, backendPayload);
      return response.data;
    },
        onSuccess: () => {
      // Invalidate and refetch tariffs data
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}