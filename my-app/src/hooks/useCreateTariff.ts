import { useMutation } from '@tanstack/react-query';
import { tariffService } from '@/lib/axios';

type TariffInput = {
    exportingFrom: string;    // changed from exportingCountry
    importingTo: string;      // changed from importingCountry
    description: string;
    rate: number;            // changed from tariffRate
    type: string;            // changed from tariffType
    hsCode: string;
    flatFee?: number;        // added missing field
    effectiveDate: Date;
    expirationDate: Date;
}

export function useCreateTariff() {
    return useMutation({
        mutationFn: async (data: TariffInput) => {
            // Map frontend fields to backend expected fields
            const backendPayload = {
                hs_code: data.hsCode,
                origin_country: data.exportingFrom,
                dest_country: data.importingTo,
                description: data.description,
                standard_rate: data.rate,
                tariff_type: data.type,
                flat_fee: data.flatFee || 0,
                effective_date: data.effectiveDate,
                expiry_date: data.expirationDate,
            };
            const response = await tariffService.post('/tariffs', backendPayload);
            return response.data;
        },
    });
}

