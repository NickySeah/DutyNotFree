import { useQuery } from "@tanstack/react-query";
import { ftaService } from "@/lib/axios";
import type { FTA, TradeParty } from "@/types/fta";

interface FTAApiResponse {
  id: number;
  name: string;
  type: "BILATERAL" | "PLURILATERAL";
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
  type: "COUNTRY" | "BLOC";
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
    queryKey: ["ftas"],
    queryFn: async (): Promise<FTA[]> => {
      try {
        const response = await ftaService.get("/all");
        const apiData: FTAApiResponse[] = response.data;

        return apiData.map((item: FTAApiResponse) => {
          // Map TradeParty with null checks
          const mapTradeParty = (party: TradePartyApiResponse): TradeParty => {
            if (!party) {
              throw new Error("TradeParty is null or undefined");
            }

            const baseParty: TradeParty = {
              id: party.id,
              type: party.type,
              name:
                party.type === "COUNTRY"
                  ? party.country?.name || "Unknown Country"
                  : party.bloc?.name || "Unknown Bloc",
            };

            if (party.type === "COUNTRY" && party.country) {
              return {
                ...baseParty,
                country: party.country,
              };
            } else if (party.type === "BLOC" && party.bloc) {
              return {
                ...baseParty,
                bloc: {
                  code: party.bloc.code,
                  name: party.bloc.name,
                  memberCountries:
                    party.bloc.memberCountries?.map((member) => member.name) ||
                    [],
                },
              };
            }

            return baseParty;
          };

          // Calculate display fields with safe defaults
          const excludedTariffLines = item.excludedHsCodes?.length || 0;
          const specialConcessionsCount = item.specialConcessions?.length || 0;
          const applicableTariffLines = 10000 - excludedTariffLines;

          return {
            id: item.id,
            name: item.name || "Unknown FTA",
            type: item.type,
            partyA: mapTradeParty(item.partyA),
            partyB: mapTradeParty(item.partyB),
            effectiveDate: item.effectiveDate
              ? new Date(item.effectiveDate)
              : undefined,
            expirationDate: item.expirationDate
              ? new Date(item.expirationDate)
              : undefined,
            defaultRate: item.defaultRate || 0,
            excludedHsCodes: item.excludedHsCodes || [],
            specialConcessions: item.specialConcessions || [],
            applicableTariffLines,
            excludedTariffLines,
            specialConcessionsCount,
          };
        });
      } catch (error) {
        console.error("Error fetching FTAs:", error);
        throw error;
      }
    },
  });
}
