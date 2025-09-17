export interface TradeRate {
  description: string;
  hsCode: string;
  exportingFrom: string;
  importingTo: string;
  type: string;          // e.g. "Tariff", "Duty", etc.
  rate: number;           // percentage or numeric
  effectiveDate: Date | undefined;
  expirationDate: Date | undefined;
}
