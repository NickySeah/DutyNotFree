import { useMutation } from '@tanstack/react-query';
import { tariffService } from '@/lib/axios';

type TariffUpdateInput = {
  hsCode: string;
  exportingCountry?: string;
  importingCountry?: string;
  description?: string;
  tariffRate?: number;
  tariffType?: string;
  effectiveDate?: Date;
  expirationDate?: Date;
};

export function useUpdateTariff() {
  return useMutation({
    mutationFn: async (data: TariffUpdateInput) => {
      const { hsCode, ...payload } = data;
      const response = await tariffService.put(`/tariffs/${hsCode}`, payload);
      return response.data;
    },
  });
}