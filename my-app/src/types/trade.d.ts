export type TradeRate = {
  tariff_id: number;
  hsCode: string;
  description: string;
  exportingFrom: string; // This is the country NAME
  importingTo: string;   // This is the country NAME
  
  // --- ADD THESE NEW FIELDS ---
  exportingFromCode: string; // This is the country CODE
  importingToCode: string;   // This is the country CODE
  // --------------------------

  type: string;
  rate: number | null;
  flatFee: number | null;
  effectiveDate: Date | null;
  expirationDate: Date | null;
};

// --- ADD THIS NEW TYPE ---
export type WishlistItem = {
  id: number;
  userId: string;
  hsCode: string;
  exportingCountry: string; // This is the country CODE
  importingCountry: string; // This is the country CODE
  createdAt: string;
};
