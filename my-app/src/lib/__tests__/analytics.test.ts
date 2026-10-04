import { summarizeTariffs } from "../analytics";
import type { TradeRate } from "@/types/trade";
const rate = (
  percentage: number | null,
  fee: number | null = null,
): TradeRate => ({
  tariff_id: 1,
  hsCode: "847130",
  description: "Laptop",
  exportingFrom: "Singapore",
  importingTo: "United States",
  exportingFromCode: "702",
  importingToCode: "840",
  type: "Standard",
  rate: percentage,
  flatFee: fee,
  effectiveDate: null,
  expirationDate: null,
});
test("zero percentage rates remain part of the average", () => {
  expect(summarizeTariffs([rate(0), rate(10)])[0]).toMatchObject({
    country: "United States",
    count: 2,
    averageRate: 5,
    flatFeeCount: 0,
  });
});
test("flat fees are not averaged with percentages", () => {
  expect(summarizeTariffs([rate(null, 50)])[0]).toMatchObject({
    averageRate: null,
    flatFeeCount: 1,
  });
});
test("summaries are deterministic and empty data has no invented groups", () => {
  expect(summarizeTariffs([])).toEqual([]);
  const input = [rate(10), rate(5)];
  expect(summarizeTariffs(input)).toEqual(summarizeTariffs(input));
});
