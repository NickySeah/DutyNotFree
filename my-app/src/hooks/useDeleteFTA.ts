import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ftaService } from "@/lib/axios";

export function useDeleteFTA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ftaId: number) => {
      const response = await ftaService.delete(`/${ftaId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch tariffs after successful deletion
      queryClient.invalidateQueries({ queryKey: ['ftas'] });
    },
  });
}