import { useQuery } from '@tanstack/react-query'
import { tariffService } from '@/lib/axios'
import type { TradeRate } from '@/types/trade'

// Define the API response structure
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

export function useTariffs() {
    return useQuery({
        queryKey: ['tariffs'],
        queryFn: async (): Promise<TradeRate[]> => {
            const response = await tariffService.get('/api/v1/tariffs/all');
            // Map API response to TradeRate interface
            return response.data.map((item: TariffApiResponse) => ({
                tariff_id: item.id,
                hsCode: item.hsCode.code,
                description: item.hsCode.description,
                exportingFrom: item.originCountry.name,
                importingTo: item.destCountry.name,
                type: item.tariffType,
                rate: item.standardRate,
                flatFee: item.flatFee || 0,
                effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : null,
                expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
            }));
        },
    });
}