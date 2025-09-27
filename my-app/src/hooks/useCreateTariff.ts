import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tariffService } from "@/lib/axios";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";

type TariffInput = {
  hsCode: string;
  exportingFrom: string; // changed from exportingCountry
  importingTo: string; // changed from importingCountry
  type: string; // changed from tariffType
  rate: number | null; // changed from tariffRate
  flatFee: number | null; // added missing field
  effectiveDate: Date;
  expirationDate?: Date | null;
};

export function useCreateTariff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TariffInput) => {
      // Map frontend fields to backend expected fields
      const backendPayload = {
        hsCode: data.hsCode,
        originCountry: data.exportingFrom,
        destCountry: data.importingTo,
        tariffType: data.type,
        standardRate: data.rate,
        flatFee: data.flatFee,
        effectiveDate: formatDateToYYYYMMDD(data.effectiveDate), // Convert to YYYY-MM-DD
        expirationDate: data.expirationDate ? formatDateToYYYYMMDD(data.expirationDate) : null, // Convert to YYYY-MM-DD or null
      };
      const response = await tariffService.post("", backendPayload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tariffs after successful creation
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
    },
  });
}
