export type ShipmentLine = {
  id: number;
  name: string;
  hsCode: string;
  unitValue: number;
  quantity: number;
};
export type AppliedFTA = {
  name: string;
  appliedRate: number;
  partyA: string;
  partyB: string;
};
export type AppliedTariff = {
  id: number;
  tariffType: string;
  standardRate: number | null;
  flatFee: number | null;
};
export type CalculationResponse = {
  tariffTotal: number;
  finalValue: number;
  appliedFTA: AppliedFTA | null;
  appliedTariffs: AppliedTariff[];
};
export type ShipmentResult = {
  declaredValue: number;
  duties: number;
  landedCost: number;
  lines: (ShipmentLine & { result: CalculationResponse })[];
};
export async function calculateManifest(
  lines: ShipmentLine[],
  request: (hsCode: string, value: number) => Promise<CalculationResponse>,
): Promise<ShipmentResult> {
  if (
    !lines.length ||
    lines.some(
      (line) =>
        !line.hsCode ||
        !Number.isFinite(line.unitValue) ||
        line.unitValue < 0 ||
        !Number.isSafeInteger(line.quantity) ||
        line.quantity < 1 ||
        !Number.isFinite(line.unitValue * line.quantity),
    )
  )
    throw new Error(
      "Use a valid product, non-negative value, and a whole quantity of at least 1.",
    );
  const results = await Promise.all(
    lines.map(async (line) => {
      const result = await request(line.hsCode, line.unitValue * line.quantity);
      if (
        ![result.tariffTotal, result.finalValue].every(
          (value) => Number.isFinite(value) && value >= 0,
        )
      )
        throw new Error("The tariff service returned an invalid estimate.");
      return { ...line, result };
    }),
  );
  return {
    declaredValue: lines.reduce(
      (sum, line) => sum + line.unitValue * line.quantity,
      0,
    ),
    duties: results.reduce((sum, line) => sum + line.result.tariffTotal, 0),
    landedCost: results.reduce((sum, line) => sum + line.result.finalValue, 0),
    lines: results,
  };
}
