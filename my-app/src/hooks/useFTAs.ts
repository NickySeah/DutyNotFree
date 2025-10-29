import { useQuery } from '@tanstack/react-query'
import { ftaService } from '@/lib/axios'
import type { FTA, TradeParty } from '@/types/fta'

interface FTAApiResponse {
  id: number;
  name: string;
  type: 'BILATERAL' | 'PLURILATERAL';
  partyA: TradePartyApiResponse;
  partyB: TradePartyApiResponse;
  effectiveDate: string;
  expirationDate: string | null;
  defaultRate: number;
  excludedHsCodes: Array<{
    code: string;
    description: string;
  }>;
  specialConcessions: Array<{
    id: number;
    hsCode: {
      code: string;
      description: string;
    };
    finalRate: number;
  }>;
}

interface TradePartyApiResponse {
  id: number;
  type: 'COUNTRY' | 'BLOC';
  country?: {
    code: string;
    name: string;
    alpha3: string;
  };
  bloc?: {
    code: string;
    name: string;
    memberCountries: Array<{
      name: string;
      code: string;
      alpha3: string;
    }>;
  };
}

export function useFTAs() {
  return useQuery({
    queryKey: ['ftas'],
    queryFn: async (): Promise<FTA[]> => {
      const response = await ftaService.get('/all');
      const apiData: FTAApiResponse[] = response.data;
      
      return apiData.map((item: FTAApiResponse) => {
        // Map TradeParty
        const mapTradeParty = (party: TradePartyApiResponse): TradeParty => {
          const baseParty: TradeParty = {
            id: party.id,
            type: party.type,
            name: party.type === 'COUNTRY' ? party.country!.name : party.bloc!.name
          };

          if (party.type === 'COUNTRY' && party.country) {
            return {
              ...baseParty,
              country: party.country
            };
          } 
          else if (party.type === 'BLOC' && party.bloc) {
            return {
              ...baseParty,
              bloc: {
                code: party.bloc.code,
                name: party.bloc.name,
                memberCountries: party.bloc.memberCountries?.map(member => member.name) || []
              }
            };
          }

          return baseParty;
        };

        // Calculate display fields
        const excludedTariffLines = item.excludedHsCodes.length;
        const specialConcessionsCount = item.specialConcessions.length;
        const applicableTariffLines = 10000 - excludedTariffLines;

        return {
          id: item.id,
          name: item.name,
          type: item.type,
          partyA: mapTradeParty(item.partyA),
          partyB: mapTradeParty(item.partyB),
          effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : undefined,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
          defaultRate: item.defaultRate,
          excludedHsCodes: item.excludedHsCodes,
          specialConcessions: item.specialConcessions,
          applicableTariffLines,
          excludedTariffLines,
          specialConcessionsCount
        };
      });
    },
  });
}