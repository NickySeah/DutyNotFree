export const typeOfTariffs = [
  { name: "MFN", value: "Ad Valorem", displayName: "MFN" },
  { name: "ExciseDuty (Flat)", value: "Flat Fee", displayName: "ExciseDuty" },
  { name: "ExciseDuty (Rate)", value: "Ad Valorem", displayName: "ExciseDuty" },
  { name: "Reciprocal Tariffs", value: "Ad Valorem", displayName: "Reciprocal Tariffs" },
] as const;

// Helper function to get the backend value from the display name
export const getTariffBackendValue = (name: string) => {
  return typeOfTariffs.find(tariff => tariff.name === name)?.value || name;
};

// Helper function to get the table display name (without specifics)
export const getTableDisplayName = (name: string) => {
  return typeOfTariffs.find(tariff => tariff.name === name)?.displayName || name;
};

// Helper to get the backend value from display name and data
export const getBackendValueFromData = (displayName: string, rate: number | null, flatFee: number | null) => {
  if (displayName === "ExciseDuty") {
    return (flatFee !== null && flatFee > 0) ? "Flat Fee" : "Ad Valorem";
  }
  
  const tariff = typeOfTariffs.find(t => t.displayName === displayName);
  return tariff?.value || "Ad Valorem";
};