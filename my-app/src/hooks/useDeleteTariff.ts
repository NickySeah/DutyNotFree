import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tariffService } from "@/lib/axios";

export function useDeleteTariff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tariffId: number) => {
      const response = await tariffService.delete(`/${tariffId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tariffs after successful deletion
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
    },
  });
}