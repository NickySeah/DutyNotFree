export interface TradeRate {
  productName: string;
  exportingFrom: string;
  importingTo: string;
  type: string;          // e.g. "Tariff", "Duty", etc.
  rate: number;           // percentage or numeric
  effectiveDate: Date;
  expirationDate: Date;
}
