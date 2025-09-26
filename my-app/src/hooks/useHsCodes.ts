import { useQuery } from '@tanstack/react-query'
import { hsCodeService} from '@/lib/axios'

interface HsCode {
  code: string;
  description: string;
}

export function useHsCodes() {
  return useQuery({
    queryKey: ['hsCodes'],
    queryFn: async (): Promise<HsCode[]> => {
      const response = await hsCodeService.get('/all');
      return response.data;
    },
  });
}