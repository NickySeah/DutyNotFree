"use client";
import { useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
const endpoints = [
  {
    group: "Tariffs",
    path: "/tariffs/all",
    description:
      "Browse tariff records, classifications, rates, and effective dates.",
  },
  {
    group: "Trade agreements",
    path: "/ftas/all",
    description: "Read the available agreements and their product concessions.",
  },
  {
    group: "Countries",
    path: "/countries/all",
    description: "Get the country codes and names used by the trade service.",
  },
  {
    group: "HS classifications",
    path: "/hscodes/all",
    description: "Browse the supported product classifications.",
  },
  {
    group: "Products",
    path: "/products/all",
    description:
      "List visible products. Private records require authorized access.",
  },
  {
    group: "Calculator",
    path: "/calculator?value=1000&origin=702&dest=840&hsCode=847130&date=2026-10-04",
    description:
      "Estimate duties for a declared value, origin, destination, HS code, and tariff date. Use codes available in your dataset.",
  },
];
export default function ApiDocsPage() {
  const base = "/api/v1";
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
    } catch {
      toast.error("Could not copy. Select the example and copy it manually.");
    }
  }
  return (
    <>
      <PageHeader
        title="API reference"
        description="Connect to the same trade service that powers your workspace."
      />
      <div className="mb-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <FileCode2 className="mb-4 size-6 text-primary" />
          <h2 className="text-base font-semibold">Same-origin API</h2>
          <p className="my-3 text-sm text-muted-foreground">
            The frontend forwards these paths to the backend configured by your
            deployment.
          </p>
          <code className="rounded-lg bg-background px-3 py-2 text-sm">
            {base}
          </code>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-base font-semibold">
            Authentication and permissions
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Protected operations use a bearer token from your signed-in session.
            Obtain it from <code>/api/auth/token</code> and send an{" "}
            <code>Authorization: Bearer &lt;token&gt;</code> header.
            Administrative writes and private resources require the appropriate
            role and ownership.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {endpoints.map((endpoint) => {
          const example = `fetch('${base}${endpoint.path}', { headers: { Authorization: 'Bearer <token>' } })`;
          return (
            <section
              key={endpoint.group}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <h2 className="text-base font-semibold">{endpoint.group}</h2>
                <span className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-primary">
                  GET
                </span>
              </div>
              <div className="p-5">
                <p className="mb-4 text-sm text-muted-foreground">
                  {endpoint.description}
                </p>
                <div className="relative rounded-lg border bg-background p-4 pr-14">
                  <pre className="overflow-x-auto text-xs leading-relaxed">
                    <code>{example}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => copy(example)}
                    aria-label={`Copy ${endpoint.group} example`}
                  >
                    {copied === example ? <Check /> : <Copy />}
                  </Button>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        The backend’s Swagger documentation provides full request schemas and
        mutation endpoints at /swagger-ui/index.html on the backend host.
      </p>
    </>
  );
}
