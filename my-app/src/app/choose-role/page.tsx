"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Package, Ship } from "lucide-react";
import { useUserRole } from "@/lib/checkRole";
import { Button } from "@/components/ui/button";
export default function ChooseRolePage() {
  const router = useRouter();
  const { isPending, isAuthenticated, needsRoleSelection } = useUserRole();
  const [role, setRole] = useState<"supplier" | "importer" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isPending) {
      if (!isAuthenticated) router.replace("/login");
      else if (!needsRoleSelection) router.replace("/tariff");
    }
  }, [isPending, isAuthenticated, needsRoleSelection, router]);
  async function save() {
    if (!role || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/set-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Could not save your role.");
      }
      window.location.replace("/tariff");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save your role.",
      );
      setSaving(false);
    }
  }
  return (
    <div className="site-container max-w-3xl py-16 md:py-24">
      <p className="mb-3 text-sm text-primary">Make the workspace yours</p>
      <h1 className="text-4xl font-semibold tracking-[-1.5px]">
        How do you work with trade?
      </h1>
      <p className="mb-8 mt-4 max-w-lg text-muted-foreground">
        Choose the role that fits. It determines how you manage products and use
        the workspace.
      </p>
      {isPending || !isAuthenticated || !needsRoleSelection ? (
        <p role="status" className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Getting your account ready…
        </p>
      ) : (
        <>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">Your role</legend>
            {[
              {
                value: "importer" as const,
                title: "I’m an importer",
                text: "Explore products, compare routes, and estimate the duties on your shipments.",
                icon: Ship,
              },
              {
                value: "supplier" as const,
                title: "I’m a supplier",
                text: "Manage your product library, classify goods, and understand their trade costs.",
                icon: Package,
              },
            ].map(({ value, title, text, icon: Icon }) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border bg-card p-6 ${role === value ? "border-primary ring-1 ring-primary" : ""}`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="size-6 text-primary" />
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value)}
                    className="size-4 accent-[var(--primary)]"
                  />
                </div>
                <span className="block text-lg font-semibold">{title}</span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {text}
                </span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="mt-5 text-destructive">
              {error}
            </p>
          )}
          <Button
            onClick={save}
            disabled={!role || saving}
            size="lg"
            className="mt-8 h-11"
          >
            {saving ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
            Continue to workspace
          </Button>
        </>
      )}
    </div>
  );
}
