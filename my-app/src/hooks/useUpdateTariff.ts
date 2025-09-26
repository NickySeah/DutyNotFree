import { useMutation } from '@tanstack/react-query';
import { tariffService } from '@/lib/axios';
import { formatDateToYYYYMMDD } from '@/utils/dateUtils';

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
        standardRate: tariffType === "Ad Valorem" ? payload.rate : null,
        flatFee: tariffType === "Flat Fee" ? payload.flatFee : null,
        effectiveDate: formatDateToYYYYMMDD(payload.effectiveDate), // Convert to YYYY-MM-DD
        expirationDate: payload.expirationDate ? formatDateToYYYYMMDD(payload.expirationDate) : null, // Convert to YYYY-MM-DD or null
      };
      const response = await tariffService.put(`${tariff_id}`, backendPayload);
      return response.data;
    },
  });
}