import type { TradeRate } from "@/types/trade";
export function summarizeTariffs(
  tariffs: TradeRate[],
): {
  country: string;
  count: number;
  averageRate: number | null;
  flatFeeCount: number;
}[] {
  const groups = new Map<
    string,
    { count: number; rates: number[]; flatFeeCount: number }
  >();
  for (const tariff of tariffs) {
    const country = tariff.importingTo || "Unspecified";
    const group = groups.get(country) || {
      count: 0,
      rates: [],
      flatFeeCount: 0,
    };
    group.count++;
    if (tariff.rate !== null && Number.isFinite(tariff.rate))
      group.rates.push(tariff.rate);
    else if (tariff.flatFee !== null) group.flatFeeCount++;
    groups.set(country, group);
  }
  return [...groups]
    .map(([country, group]) => ({
      country,
      count: group.count,
      averageRate: group.rates.length
        ? group.rates.reduce((a, b) => a + b, 0) / group.rates.length
        : null,
      flatFeeCount: group.flatFeeCount,
    }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}
