import { useQuery } from '@tanstack/react-query';
import { tariffService } from '@/lib/axios';
import type { Product } from '@/types/product'; // make sure this matches your table/interface

// Assuming this is the raw API response type
interface ProductApiResponse {
  id: number;
  is_private: boolean;
  name: string;
  user_id: string;
  hsCode: {
    code: string;
    description: string;
  };
}

export function useUserProduct() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await tariffService.get('/all');

      // Map API response to Product interface
      const data: Product[] = response.data.map((item: ProductApiResponse) => ({
        product_id: item.id,
        hsCode: item.hsCode.code,
        description: item.hsCode.description,
        isPrivate: item.is_private,
        name: item.name,
        userId: item.user_id,
      }));

      return data;
    },
  });
}