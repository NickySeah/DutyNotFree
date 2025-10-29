import { useQuery } from '@tanstack/react-query'
import { blocService } from '@/lib/axios'

export interface Bloc {
  id: number;
  code: string;
  name: string;
  memberCountries?: Array<{
    name: string;
    code: string;
    alpha3: string;
  }>;
}

export function useBlocs() {
  return useQuery({
    queryKey: ['blocs'],
    queryFn: async (): Promise<Bloc[]> => {
      try {
        const response = await blocService.get('/all');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching blocs:', error);
        return [];
      }
    },
  });
}