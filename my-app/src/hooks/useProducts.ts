import { useQuery } from '@tanstack/react-query'
import { productService } from '@/lib/axios'

interface Product {
    id: number;
    is_private: boolean;
    name: string;
    user_id: string;
    hsCode: {
        code: string;
        description: string;
    };
}

export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: async (): Promise<Product[]> => {
            const response = await productService.get('/all');
            return response.data;
        },
    });
}