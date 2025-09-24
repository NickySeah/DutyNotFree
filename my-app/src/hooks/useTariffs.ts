import { useQuery } from '@tanstack/react-query'
import { tariffService } from '@/lib/axios'
import type { TradeRate } from '@/types/trade'

export function useTariffs() {
    return useQuery({
        queryKey: ['tariffs'],
        queryFn: async (): Promise<TradeRate[]> => {
            const response = await tariffService.get('/tariffs');
            return response.data;
        },
    });
}