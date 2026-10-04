"use client";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Database, Globe2, Percent, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DataStatus } from "@/components/data-status";
import { useTariffs } from "@/hooks/useTariffs";
import { summarizeTariffs } from "@/lib/analytics";
const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
export default function TariffDashboard() {
  const tariffs = useTariffs();
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [hsCode, setHsCode] = useState("all");
  const data = useMemo(
    () =>
      (tariffs.data || []).filter(
        (t) =>
          (country === "all" || t.importingTo === country) &&
          (type === "all" || t.type === type) &&
          (hsCode === "all" || t.hsCode === hsCode),
      ),
    [tariffs.data, country, type, hsCode],
  );
  const summaries = useMemo(() => summarizeTariffs(data), [data]);
  const rates = data.flatMap((t) => (t.rate !== null ? [t.rate] : []));
  const average = rates.length
    ? rates.reduce((a, b) => a + b, 0) / rates.length
    : null;
  const header = (
    <PageHeader
      title="Trade analytics"
      description="Find perspective in the tariff data available to you."
    />
  );
  if (tariffs.isPending)
    return (
      <>
        {header}
        <DataStatus loading />
      </>
    );
  if (tariffs.isError)
    return (
      <>
        {header}
        <DataStatus error retry={() => tariffs.refetch()} />
      </>
    );
  return (
    <>
      {header}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <SlidersHorizontal className="mr-1 size-4 text-muted-foreground" />
        {[
          {
            id: "country",
            label: "Destination",
            value: country,
            set: setCountry,
            options: [...new Set(tariffs.data?.map((t) => t.importingTo))],
          },
          {
            id: "type",
            label: "Tariff type",
            value: type,
            set: setType,
            options: [...new Set(tariffs.data?.map((t) => t.type))],
          },
          {
            id: "hs",
            label: "HS classification",
            value: hsCode,
            set: setHsCode,
            options: [...new Set(tariffs.data?.map((t) => t.hsCode))],
          },
        ].map((filter) => (
          <label
            key={filter.id}
            className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground"
          >
            {filter.label}
            <select
              value={filter.value}
              onChange={(e) => filter.set(e.target.value)}
              className="h-9 max-w-full rounded-lg border bg-background px-3 text-sm text-foreground"
            >
              <option value="all">
                All{" "}
                {filter.id === "country"
                  ? "destinations"
                  : filter.id === "type"
                    ? "types"
                    : "HS codes"}
              </option>
              {filter.options.sort().map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Database,
            label: "Tariff records",
            value: data.length.toLocaleString(),
            note: "Matching your current filters",
          },
          {
            icon: Globe2,
            label: "Destination markets",
            value: summaries.length.toLocaleString(),
            note: "Represented in this dataset",
          },
          {
            icon: Percent,
            label: "Average percentage rate",
            value: average === null ? "—" : `${average.toFixed(2)}%`,
            note: "Flat fees excluded from the average",
          },
        ].map(({ icon: Icon, label, value, note }) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>
      {!data.length ? (
        <DataStatus
          title="No matching tariff records"
          description="Choose another filter combination to explore the available data."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="min-w-0 rounded-xl border bg-card p-5 md:p-6">
            <h2 className="text-base font-semibold">
              Percentage rates by destination
            </h2>
            <p className="mb-7 mt-1 text-xs text-muted-foreground">
              Average ad valorem rate. Top 8 markets by record count.
            </p>
            <div
              className="h-72"
              role="img"
              aria-label="Average percentage tariff rates by destination"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summaries
                    .filter((s) => s.averageRate !== null)
                    .slice(0, 8)}
                  margin={{ top: 5, right: 5, bottom: 30, left: -15 }}
                >
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="country"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(2)}%`,
                      "Average rate",
                    ]}
                  />
                  <Bar
                    dataKey="averageRate"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={44}
                  >
                    {summaries.map((s, i) => (
                      <Cell key={s.country} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="min-w-0 rounded-xl border bg-card p-5 md:p-6">
            <h2 className="text-base font-semibold">Dataset coverage</h2>
            <p className="mb-6 mt-1 text-xs text-muted-foreground">
              Tariff records per destination, rather than market share.
            </p>
            <div className="max-h-80 space-y-5 overflow-y-auto">
              {summaries.map((s) => (
                <div key={s.country}>
                  <div className="mb-2 flex justify-between gap-4 text-sm">
                    <span>{s.country}</span>
                    <span className="text-muted-foreground">
                      {s.count} records
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(s.count / data.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="min-w-0 rounded-xl border bg-card p-5 md:p-6 xl:col-span-2">
            <h2 className="mb-5 text-base font-semibold">
              Destination overview
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-3 font-medium">Destination</th>
                    <th className="pb-3 font-medium">Records</th>
                    <th className="pb-3 font-medium">Average percentage</th>
                    <th className="pb-3 font-medium">Flat-fee rules</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => (
                    <tr key={s.country} className="border-b last:border-0">
                      <td className="py-4 font-medium">{s.country}</td>
                      <td className="py-4 tabular-nums">{s.count}</td>
                      <td className="py-4 tabular-nums">
                        {s.averageRate === null
                          ? "Not applicable"
                          : `${s.averageRate.toFixed(2)}%`}
                      </td>
                      <td className="py-4 tabular-nums">{s.flatFeeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        These summaries describe the available tariff records, including records
        with different effective dates. They do not represent live market
        prices, historical trends, trade volumes, or an official competitiveness
        ranking.
      </p>
    </>
  );
}
