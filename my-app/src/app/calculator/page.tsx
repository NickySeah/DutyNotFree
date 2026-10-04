"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  ArrowUpRight,
  Calculator,
  Check,
  ChevronDown,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DataStatus } from "@/components/data-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCountries } from "@/hooks/useCountry";
import { useProducts } from "@/hooks/useProducts";
import { useUserRole } from "@/lib/checkRole";
import { calculatorService } from "@/lib/axios";
import {
  calculateManifest,
  ShipmentLine,
  ShipmentResult,
  CalculationResponse,
} from "@/lib/calculator";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";
const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
export default function TariffCalculator() {
  const { userId } = useUserRole();
  const countries = useCountries();
  const products = useProducts(userId);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(() => formatDateToYYYYMMDD(new Date()));
  const [selection, setSelection] = useState("");
  const [lines, setLines] = useState<ShipmentLine[]>([]);
  const [result, setResult] = useState<ShipmentResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const revision = useRef(0);
  const nextId = useRef(0);
  useEffect(
    () => () => {
      revision.current++;
    },
    [],
  );
  function invalidate() {
    revision.current++;
    setResult(null);
    setError("");
    setCalculating(false);
  }
  function addProduct() {
    const product = products.data?.find(
      (p) => String(p.product_id) === selection,
    );
    if (!product) return;
    invalidate();
    setLines((current) => [
      ...current,
      {
        id: ++nextId.current,
        name: product.name,
        hsCode: product.hsCode,
        quantity: 1,
        unitValue: 0,
      },
    ]);
    setSelection("");
  }
  function update(id: number, changes: Partial<ShipmentLine>) {
    invalidate();
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...changes } : line)),
    );
  }
  async function calculate() {
    if (!origin || !destination || !date || origin === destination) {
      setError(
        "Select different origin and destination countries and a valid tariff date.",
      );
      return;
    }
    const currentRevision = ++revision.current;
    setCalculating(true);
    setError("");
    setResult(null);
    try {
      const estimate = await calculateManifest(lines, async (hsCode, value) => {
        const response = await calculatorService.get<CalculationResponse>("", {
          params: { value, origin, dest: destination, hsCode, date },
        });
        return response.data;
      });
      if (revision.current === currentRevision) setResult(estimate);
    } catch (cause) {
      if (revision.current === currentRevision)
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not calculate duties. Try again.",
        );
    } finally {
      if (revision.current === currentRevision) setCalculating(false);
    }
  }
  const declared = lines.reduce(
    (sum, line) => sum + line.unitValue * line.quantity,
    0,
  );
  const header = (
    <PageHeader
      title="Cost calculator"
      description="Know what your shipment could cost, before it leaves."
    />
  );
  if (countries.isPending || (userId && products.isPending))
    return (
      <>
        {header}
        <DataStatus loading />
      </>
    );
  if (countries.isError || products.isError)
    return (
      <>
        {header}
        <DataStatus
          error
          retry={() => {
            countries.refetch();
            products.refetch();
          }}
        />
      </>
    );
  return (
    <>
      {header}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-5 md:p-6">
            <h2 className="mb-5 text-base font-semibold">Your trade route</h2>
            <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <label className="auth-field" htmlFor="origin">
                Origin country
                <select
                  id="origin"
                  className="h-11 w-full rounded-lg border bg-background px-3 font-normal"
                  value={origin}
                  onChange={(event) => {
                    invalidate();
                    setOrigin(event.target.value);
                  }}
                >
                  <option value="">Select origin</option>
                  {countries.data?.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      disabled={c.code === destination}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                variant="outline"
                size="icon"
                className="mb-0.5"
                aria-label="Swap origin and destination"
                onClick={() => {
                  invalidate();
                  setOrigin(destination);
                  setDestination(origin);
                }}
              >
                <ArrowRightLeft />
              </Button>
              <label className="auth-field" htmlFor="destination">
                Destination country
                <select
                  id="destination"
                  className="h-11 w-full rounded-lg border bg-background px-3 font-normal"
                  value={destination}
                  onChange={(event) => {
                    invalidate();
                    setDestination(event.target.value);
                  }}
                >
                  <option value="">Select destination</option>
                  {countries.data?.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      disabled={c.code === origin}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="auth-field" htmlFor="tariff-date">
                Tariff date
                <input
                  id="tariff-date"
                  type="date"
                  value={date}
                  onChange={(event) => {
                    invalidate();
                    setDate(event.target.value);
                  }}
                  required
                />
              </label>
              <div className="self-end rounded-lg bg-background p-3 text-xs text-muted-foreground">
                Rates and agreements are selected for this date from the
                available dataset.
              </div>
            </div>
          </section>
          <section className="rounded-xl border bg-card p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">Shipment contents</h2>
              <span className="text-xs text-muted-foreground">
                {lines.length} product {lines.length === 1 ? "line" : "lines"}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                aria-label="Select product to add"
                className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-sm"
                value={selection}
                onChange={(event) => setSelection(event.target.value)}
              >
                <option value="">Choose from your product library</option>
                {products.data?.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name} · HS {p.hsCode}
                  </option>
                ))}
              </select>
              <Button
                className="h-11"
                onClick={addProduct}
                disabled={!selection}
              >
                <Plus />
                Add product
              </Button>
            </div>
            {!products.data?.length && (
              <p className="mt-3 text-sm text-muted-foreground">
                No products available.{" "}
                <Link className="text-primary underline" href="/product">
                  Open your product library
                </Link>{" "}
                to get started.
              </p>
            )}
            <div className="mt-5 space-y-4">
              {!lines.length ? (
                <div className="rounded-lg border border-dashed py-10 text-center">
                  <Package className="mx-auto mb-3 size-7 text-muted-foreground" />
                  <p className="font-medium">What are you shipping?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a product, its unit value, and quantity.
                  </p>
                </div>
              ) : (
                lines.map((line) => (
                  <div
                    key={line.id}
                    className="rounded-lg border bg-background p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          HS {line.hsCode}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => {
                          invalidate();
                          setLines((current) =>
                            current.filter((item) => item.id !== line.id),
                          );
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <label
                        className="auth-field"
                        htmlFor={`value-${line.id}`}
                      >
                        Unit value (USD)
                        <Input
                          id={`value-${line.id}`}
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unitValue}
                          onChange={(event) =>
                            update(line.id, {
                              unitValue: Number(event.target.value),
                            })
                          }
                        />
                      </label>
                      <label
                        className="auth-field"
                        htmlFor={`quantity-${line.id}`}
                      >
                        Quantity
                        <Input
                          id={`quantity-${line.id}`}
                          type="number"
                          min={1}
                          step={1}
                          value={line.quantity}
                          onChange={(event) =>
                            update(line.id, {
                              quantity: Number(event.target.value),
                            })
                          }
                        />
                      </label>
                      <div className="self-end">
                        <p className="text-xs text-muted-foreground">
                          Declared line value
                        </p>
                        <p className="mt-2 h-9 font-semibold tabular-nums">
                          {money(line.unitValue * line.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          {result && (
            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-base font-semibold">
                Applied rules, product by product
              </h2>
              {result.lines.map((line) => (
                <details key={line.id} className="border-t py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                    <span>{line.name}</span>
                    <span className="flex items-center gap-3 tabular-nums">
                      {money(line.result.tariffTotal)} in duties
                      <ChevronDown className="size-4" />
                    </span>
                  </summary>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {line.result.appliedFTA ? (
                      <p className="flex items-center gap-2 text-primary">
                        <Check className="size-4" />
                        {line.result.appliedFTA.name}:{" "}
                        {line.result.appliedFTA.appliedRate}%
                      </p>
                    ) : line.result.appliedTariffs?.length ? (
                      line.result.appliedTariffs.map((t) => (
                        <p key={t.id}>
                          {t.tariffType}:{" "}
                          {t.standardRate !== null
                            ? `${t.standardRate}%`
                            : `${money(t.flatFee || 0)} flat fee`}
                        </p>
                      ))
                    ) : (
                      <p>
                        No applicable duty rule was returned for this product.
                      </p>
                    )}
                    <p>
                      Declared value {money(line.unitValue * line.quantity)} ·
                      Total {money(line.result.finalValue)}
                    </p>
                  </div>
                </details>
              ))}
            </section>
          )}
        </div>
        <aside className="rounded-xl border bg-card p-6 xl:sticky xl:top-24">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-accent p-2 text-primary">
              <Calculator className="size-5" />
            </span>
            <h2 className="text-base font-semibold">Your cost estimate</h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            A clear breakdown of your shipment’s declared value and applicable
            duties.
          </p>
          <dl className="mt-7 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Declared value</dt>
              <dd className="font-medium tabular-nums">
                {money(result?.declaredValue ?? declared)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Estimated duties</dt>
              <dd className="font-medium tabular-nums">
                {result ? money(result.duties) : "—"}
              </dd>
            </div>
          </dl>
          <div className="my-6 border-t pt-5">
            <p className="text-xs text-muted-foreground">
              Estimated total (USD)
            </p>
            <p
              className="mt-2 text-4xl font-semibold tracking-[-1.5px] tabular-nums"
              aria-live="polite"
            >
              {result ? money(result.landedCost) : "—"}
            </p>
          </div>
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button
            onClick={calculate}
            disabled={calculating || !lines.length}
            className="h-11 w-full"
          >
            {calculating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ArrowUpRight />
            )}
            {calculating ? "Calculating…" : "Calculate duties"}
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Educational estimate. Excludes freight, insurance, taxes, and other
            charges. Flat fees follow the service’s per-product-line rules.
            Changing your inputs clears the previous estimate.
          </p>
        </aside>
      </div>
    </>
  );
}
