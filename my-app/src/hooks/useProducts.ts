import { useQuery } from '@tanstack/react-query'
import { productService } from '@/lib/axios'
import { Product } from '@/types/product';

export function useProducts(userId : string) {
    return useQuery({
        queryKey: ['products', userId],
        queryFn: async (): Promise<Product[]> => {
            const response = await productService.get(`/user/${userId}`);
            return response.data;
        },
    });
}