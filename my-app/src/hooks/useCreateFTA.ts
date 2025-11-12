import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ftaService } from "@/lib/axios";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";
import { toast } from "sonner";

export interface FTAInput {
  name: string;
  partyA: string; // TradeParty code
  partyB: string; // TradeParty code  
  effectiveDate: Date;
  expirationDate?: Date | null;
  defaultRate: number;
  excludedHsCodes?: string[];
  concessions?: {
    hsCode: string;
    finalRate: number;
  }[];
}

export function useCreateFTA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FTAInput) => {
      const backendPayload = {
        name: data.name,
        partyA: data.partyA,
        partyB: data.partyB,
        effectiveDate: formatDateToYYYYMMDD(data.effectiveDate),
        expirationDate: data.expirationDate ? formatDateToYYYYMMDD(data.expirationDate) : null,
        defaultRate: data.defaultRate,
        excludedHsCodes: data.excludedHsCodes || [],
        concessions: data.concessions || [],
      };
      const response = await ftaService.post("", backendPayload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch FTAs data
      queryClient.invalidateQueries({ queryKey: ['ftas'] });
    },
    onError: (error) => {
      // Optional: Add error handling
      console.error("Failed to create FTA:", error);
      // You could also add a toast notification here
      toast.error("Failed to create FTA. Please try again.");
    }
  });
}