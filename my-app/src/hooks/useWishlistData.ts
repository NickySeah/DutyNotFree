import { useQueries } from "@tanstack/react-query";
import { tariffService, wishlistService } from "@/lib/axios";
import type { TradeRate, WishlistItem } from "@/types/trade";
import { useUserRole } from "@/lib/checkRole";

// This is the raw response from GET /api/v1/tariffs/wishlist
interface TariffApiResponse {
  id: number;
  hsCode: {
    code: string;
    description: string;
  };
  originCountry: {
    code: string;
    name: string;
    alpha3: string;
  };
  destCountry: {
    code: string;
    name: string;
    alpha3: string;
  };
  tariffType: string;
  standardRate: number | null;
  flatFee: number | null;
  effectiveDate: string;
  expirationDate: string | null;
}

// This is the raw response from GET /api/v1/wishlists
interface WishlistItemApiResponse {
  id: number;
  userId: string;
  hsCode: string;
  exportingCountry: string; // This is the code, e.g., "840"
  importingCountry: string; // This is the code, e.g., "702"
  createdAt: string;
}

/**
 * Fetches both the tariffs for the wishlist table AND
 * the raw wishlist items (for getting the ID for deletion).
 */
export function useWishlistData() {
  const { userId } = useUserRole();

  const results = useQueries({
    queries: [
      {
        // Query 1: Get the full tariff data for displaying in the table
        queryKey: ["wishlistTariffs", userId],
        queryFn: async (): Promise<TradeRate[]> => {
          const response = await tariffService.get(
            `/wishlist?userId=${userId}`
          );

          // Map API response to TradeRate interface (same as useTariffs)
          return response.data.map((item: TariffApiResponse) => ({
            tariff_id: item.id,
            hsCode: item.hsCode.code,
            description: item.hsCode.description,
            exportingFrom: item.originCountry.name,
            importingTo: item.destCountry.name,
            // --- IMPORTANT: We must add the CODES for matching ---
            exportingFromCode: item.originCountry.code,
            importingToCode: item.destCountry.code,
            // ---------------------------------------------------
            type: item.tariffType,
            rate: item.standardRate,
            flatFee: item.flatFee || 0,
            effectiveDate: item.effectiveDate
              ? new Date(item.effectiveDate)
              : null,
            expirationDate: item.expirationDate
              ? new Date(item.expirationDate)
              : null,
          }));
        },
        enabled: !!userId, // Only run if userId is available
      },
      {
        // Query 2: Get the simple wishlist items (for finding the wishlist.id)
        queryKey: ["wishlistItems", userId],
        queryFn: async (): Promise<WishlistItem[]> => {
          const response = await wishlistService.get("", {
            params: {
              userId: userId,
            },
          });

          // Map API response to WishlistItem interface
          return response.data.map((item: WishlistItemApiResponse) => ({
            id: item.id,
            userId: item.userId,
            hsCode: item.hsCode,
            exportingCountry: item.exportingCountry,
            importingCountry: item.importingCountry,
            createdAt: item.createdAt,
          }));
        },
        enabled: !!userId, // Only run if userId is available
      },
    ],
  });

  const [tariffsResult, itemsResult] = results;

  // Consolidate the results into one easy-to-use object
  return {
    wishlistTariffs: tariffsResult.data ?? [],
    wishlistItems: itemsResult.data ?? [],
    isLoading: tariffsResult.isLoading || itemsResult.isLoading,
    isError: tariffsResult.isError || itemsResult.isError,
    error: tariffsResult.error || itemsResult.error,
  };
}
