export interface TradeRate {
  tariff_id: number;
  hsCode: string;           // maps to hs_code in DB
  description: string;     // from hs_code table join
  exportingFrom: string;    // maps to origin_country in DB  
  importingTo: string;      // maps to dest_country in DB
  type: string;            // maps to tariff_type in DB
  rate: number;            // maps to standard_rate in DB
  flatFee: number;        // maps to flat_fee in DB
  effectiveDate: Date | undefined;    // maps to effective_date in DB
  expirationDate: Date | undefined;   // maps to expiry_date in DB
}