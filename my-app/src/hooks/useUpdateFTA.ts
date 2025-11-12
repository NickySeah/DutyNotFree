import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ftaService } from '@/lib/axios';
import { formatDateToYYYYMMDD } from '@/utils/dateUtils';

type FTAUpdateInput = {
  fta_id: number;      // identifier; for endpoint
  name?: string;
  defaultRate?: number;
  effectiveDate?: Date;
  expirationDate?: Date | null;
  includeHSCodes?: string[];
  excludeHSCodes?: string[];
  addConcessions?: {
    hsCode: string;
    finalRate: number;
  }[];
  removeConcessions?: string[]; // concession IDs to remove
}

export function useUpdateFTA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FTAUpdateInput) => {
      const { fta_id, ...payload } = data;
      
      // Build update payload with only provided fields
      const backendPayload: any = {};
      
      if (payload.name !== undefined) backendPayload.name = payload.name;
      if (payload.defaultRate !== undefined) backendPayload.defaultRate = payload.defaultRate;
      if (payload.effectiveDate) backendPayload.effectiveDate = formatDateToYYYYMMDD(payload.effectiveDate);
      if (payload.expirationDate !== undefined) {
        backendPayload.expirationDate = payload.expirationDate ? formatDateToYYYYMMDD(payload.expirationDate) : null;
      }
      if (payload.includeHSCodes) backendPayload.includeHSCodes = payload.includeHSCodes;
      if (payload.excludeHSCodes) backendPayload.excludeHSCodes = payload.excludeHSCodes;
      if (payload.addConcessions) backendPayload.addConcessions = payload.addConcessions;
      if (payload.removeConcessions) backendPayload.removeConcessions = payload.removeConcessions;

      const response = await ftaService.put(`/${fta_id}`, backendPayload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch FTAs data
      queryClient.invalidateQueries({ queryKey: ['ftas'] });
    },
    onError: (error) => {
      console.error('Failed to update FTA:', error);
    },
  });
}