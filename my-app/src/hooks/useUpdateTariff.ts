import { useMutation } from '@tanstack/react-query';
import { tariffService } from '@/lib/axios';

type TariffUpdateInput = {
  tariff_id : string;
  hsCode: string;
  exportingFrom?: string;
  importingTo?: string;
  description?: string;
  rate?: number;
  type?: string;
  flatFee?: number;
  effectiveDate?: Date;
  expirationDate?: Date;
};

export function useUpdateTariff() {
  return useMutation({
    mutationFn: async (data: TariffUpdateInput) => {
      const { tariff_id, ...payload } = data;
      // Map frontend fields to backend expected fields
      const backendPayload = {
        hs_code: payload.hsCode,
        origin_country: payload.exportingFrom,
        dest_country: payload.importingTo,
        description: payload.description,
        standard_rate: payload.rate,
        tariff_type: payload.type,
        flat_fee: payload.flatFee,
        effective_date: payload.effectiveDate,
        expiry_date: payload.expirationDate,
      };
      const response = await tariffService.put(`/tariffs/${tariff_id}`, backendPayload);
      return response.data;
    },
  });
}