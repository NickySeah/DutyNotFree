export interface FTA {
  id: number;
  name: string;
  type: 'BILATERAL' | 'PLURILATERAL';
  partyA: TradeParty;
  partyB: TradeParty;
  effectiveDate: Date | undefined;
  expirationDate: Date | undefined;
  defaultRate: number;
  excludedHsCodes: HSCode[];
  specialConcessions: Concession[];
  // Calculated fields for display
  applicableTariffLines?: number;
  excludedTariffLines?: number;
  specialConcessionsCount?: number;
}

export interface TradeParty {
  id: number;
  type: 'COUNTRY' | 'BLOC';
  name: string;
  // For COUNTRY type
  country?: {
    code: string;
    name: string;
    alpha3: string;
  };
  // For BLOC type
  bloc?: {
    code: string;
    name: string;
    memberCountries: string[]; // country names
  };
}

export interface HSCode {
  code: string;
  description: string;
}

export interface Concession {
  id: number;
  hsCode: HSCode;
  finalRate: number;
  // Note: No staging
}