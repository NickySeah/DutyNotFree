import { useMutation } from '@tanstack/react-query';
import { tariffService } from '@/lib/axios';

type TariffUpdateInput = {
  tariff_id : number;
  // hsCode: string;
  // exportingFrom?: string;
  // importingTo?: string;
  // description?: string;
  tariffType: string;
  rate?: number;
  flatFee?: number;
  effectiveDate: Date;
  expirationDate?: Date | null;
};

export function useUpdateTariff() {
  return useMutation({
    mutationFn: async (data: TariffUpdateInput) => {
      const { tariff_id, tariffType, ...payload } = data;
      // Map frontend fields to backend expected fields
      const backendPayload = {
        // hs_code: payload.hsCode,
        // origin_country: payload.exportingFrom,
        // dest_country: payload.importingTo,
        // description: payload.description,
        // tariff_type: payload.type,
        standard_rate: tariffType === "Ad Valorem" ? payload.rate : null,
        flat_fee: tariffType === "Flat Fee" ? payload.flatFee : null,
        effective_date: payload.effectiveDate, // start_date
        end_date: payload.expirationDate, //end_date (if its undefined, it would not be sent)
      };
      const response = await tariffService.put(`/tariffs/${tariff_id}`, backendPayload);
      return response.data;
    },
  });
}