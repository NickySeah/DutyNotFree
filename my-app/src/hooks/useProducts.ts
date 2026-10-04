import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/axios";
import type { Product } from "@/types/product";

export function useProducts(userId?: string) {
  return useQuery({
    queryKey: ["products", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Product[]> => {
      const response = await productService.get(`/user/${userId}`);
      return response.data.map(
        (item: {
          id: number;
          hsCode: { code: string; description: string };
          name: string;
          userId: string;
          private: boolean;
        }) => ({
          product_id: item.id,
          hsCode: item.hsCode.code,
          description: item.hsCode.description,
          name: item.name,
          userId: item.userId,
          isPrivate: item.private,
        }),
      );
    },
  });
}
