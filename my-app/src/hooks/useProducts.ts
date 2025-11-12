import { useQuery } from '@tanstack/react-query'
import { productService } from '@/lib/axios'
import type { Product } from '@/types/product'


export function useProducts(userId : string) {
    return useQuery({
        queryKey: ['products', userId],
        queryFn: async (): Promise<Product[]> => {
            const response = await productService.get(`/user/${userId}`);
            return response.data.map((item: any) => ({
                product_id: item.id,
                hsCode: item.hsCode.code,
                description: item.hsCode.description,
                name: item.name,
                userId: item.user_id,
                isPrivate: item.is_private,
            }));
        },
    });
}