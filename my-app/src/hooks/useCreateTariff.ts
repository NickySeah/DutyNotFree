import { useMutation } from '@tanstack/react-query';
import { tariffService } from '@/lib/axios';

type TariffInput = {
    exportingCountry: string;
    importingCountry: string;
    description: string;
    tariffRate: number;
    tariffType: string;
    hsnCode: string;
    effectiveDate: Date;
    expirationDate: Date;
}

export function useCreateTariff() {
    return useMutation({
        mutationFn: async (data: TariffInput) => {
            const response = await tariffService.post('/tariffs', data);
            return response.data;
        },
    });
}

