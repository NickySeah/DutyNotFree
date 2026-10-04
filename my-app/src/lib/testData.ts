export const typeOfTariffs = [
  { name: "MFN", value: "Ad Valorem", displayName: "MFN" },
  { name: "Excise Duty (Flat)", value: "Flat Fee", displayName: "Excise Duty" },
  {
    name: "Excise Duty (Rate)",
    value: "Ad Valorem",
    displayName: "Excise Duty",
  },
  {
    name: "Reciprocal Tariffs",
    value: "Ad Valorem",
    displayName: "Reciprocal Tariffs",
  },
] as const;

// Helper function to get the backend value from the display name
// Input is name
// Output is value
export const getTariffBackendValue = (name: string) => {
  return typeOfTariffs.find((tariff) => tariff.name === name)?.value || name;
};

// Helper function to get the table display name (without specifics)
// Input is name
// Output is displayName
// Used in the table to show "Excise Duty" instead of "Excise Duty (Flat)" or "Excise Duty (Rate)"
export const getTableDisplayName = (name: string) => {
  return (
    typeOfTariffs.find((tariff) => tariff.name === name)?.displayName || name
  );
};

// Helper to get the backend value from display name and data
// Input is displayName, rate, flatFee
// Output is value
export const getBackendValueFromData = (
  displayName: string,
  rate: number | null,
  flatFee: number | null,
) => {
  if (displayName === "Excise Duty") {
    return rate === null && flatFee !== null ? "Flat Fee" : "Ad Valorem";
  }

  const tariff = typeOfTariffs.find((t) => t.displayName === displayName);
  return tariff?.value || "Ad Valorem";
};
