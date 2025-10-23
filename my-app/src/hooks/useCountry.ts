import { useQuery } from '@tanstack/react-query'
import { countriesService } from '@/lib/axios'

interface Country {
  code: string;
  name: string;
  alpha3: string;
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async (): Promise<Country[]> => {
      const response = await countriesService.get('/api/v1/countries/all');
      return response.data;
    },
  });
}