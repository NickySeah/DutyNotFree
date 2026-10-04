import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/axios";
import type { Product } from "@/types/product";

// Assuming this is the raw API response type
interface ProductApiResponse {
  id: number;
  name: string;
  userId: string;
  private: boolean;
  hsCode: {
    code: string;
    description: string;
  };
}

export function useUserProduct(userId?: string) {
  return useQuery<Product[]>({
    queryKey: ["userProducts", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await productService.get("", {
        params: {
          userID: userId,
        },
      });

      // Map API response to Product interface
      const data: Product[] = response.data.map((item: ProductApiResponse) => ({
        product_id: item.id,
        hsCode: item.hsCode.code,
        description: item.hsCode.description,
        isPrivate: item.private,
        name: item.name,
        userId: item.userId,
      }));

      return data;
    },
  });
}
