"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Globe2, Loader2, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/axios";
import { Button } from "./ui/button";
import { toast } from "sonner";
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    if (register && password !== values.get("confirm-password")) {
      setError("Your passwords don’t match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = register
        ? await authClient.signUp.email({
            name: String(values.get("name") || "").trim(),
            email,
            password,
            callbackURL: "/choose-role",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/choose-role",
          });
      if (result.error) {
        if (!register && result.error.code === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-your-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(
          result.error.message || "Could not complete your request. Try again.",
        );
        return;
      }
      clearAuthToken();
      router.replace(
        register
          ? `/verify-your-email?email=${encodeURIComponent(email)}`
          : "/choose-role",
      );
      router.refresh();
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }
  async function google() {
    setLoading(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/choose-role",
      });
      if (result.error)
        setError(result.error.message || "Google sign-in is unavailable.");
    } catch {
      toast.error("Could not connect to Google sign-in.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="auth-shell">
      <div className="auth-form">
        <p className="mb-3 text-sm text-primary">Your trade workspace</p>
        <h1 className="text-3xl font-semibold tracking-[-1px]">
          {register ? "Make your next move clearer." : "Welcome back."}
        </h1>
        <p className="mb-8 mt-3 text-sm text-muted-foreground">
          {register
            ? "Create an account to bring your trade details together."
            : "Log in to pick up where you left off."}
        </p>
        <form onSubmit={submit} className="space-y-5">
          {register && (
            <label className="auth-field" htmlFor="name">
              Your name
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                placeholder="Full name"
                maxLength={100}
              />
            </label>
          )}
          <label className="auth-field" htmlFor="email">
            Email address
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="auth-field" htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={register ? 8 : undefined}
              required
              placeholder={
                register ? "At least 8 characters" : "Enter your password"
              }
            />
          </label>
          {register && (
            <label className="auth-field" htmlFor="confirm-password">
              Confirm password
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Re-enter your password"
              />
            </label>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? <Loader2 className="animate-spin" /> : <ArrowUpRight />}
            {register ? "Create account" : "Log in"}
          </Button>
        </form>
        {!register && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 border-t" />
              or continue with
              <span className="flex-1 border-t" />
            </div>
            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={google}
              disabled={loading}
            >
              Google
            </Button>
          </>
        )}
        <p className="mt-7 text-center text-sm text-muted-foreground">
          {register ? "Already have an account?" : "New to DutyNotFree?"}{" "}
          <Link
            className="font-medium text-primary"
            href={register ? "/login" : "/register"}
          >
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
      <aside className="auth-story">
        <Globe2 className="mb-10 size-10 text-primary" />
        <h2>
          A world of trade.
          <br />
          One clear workspace.
        </h2>
        <p className="mb-8 mt-6 max-w-sm leading-relaxed text-muted-foreground">
          Get closer to the details that matter, from your first product to your
          next shipment.
        </p>
        <div className="space-y-4 text-sm">
          {[
            "Compare applicable tariff rates",
            "Understand trade agreement benefits",
            "Keep your product library organized",
          ].map((text) => (
            <p key={text} className="flex items-center gap-3">
              <Check className="size-4 text-primary" />
              {text}
            </p>
          ))}
        </div>
      </aside>
    </div>
  );
}
