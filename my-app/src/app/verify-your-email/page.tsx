"use client";
import { useEffect, useState } from "react";
import { Mail, Loader2, Clock, ArrowLeft } from "lucide-react";
import { sendVerificationEmail } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get("email") || "");
  }, []);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  async function resend() {
    if (!email || sending || countdown > 0) return;
    setSending(true);
    setFeedback("");
    setError("");
    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: "/choose-role",
      });
      if (result.error)
        throw new Error(
          result.error.message ||
            "Could not send the verification email. Please try again.",
        );
      setFeedback("A new verification link has been sent!");
      setCountdown(120);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not send the email. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-6 py-16">
      <section className="w-full rounded-2xl border bg-card p-7 sm:p-10">
        <span className="mb-7 inline-flex rounded-xl bg-accent p-3 text-primary">
          <Mail className="size-6" />
        </span>
        <p className="mb-3 text-sm text-primary">One last step</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Check your inbox.
        </h1>
        {email === null ? (
          <p role="status" className="mt-5 text-muted-foreground">
            Getting your details ready…
          </p>
        ) : email ? (
          <>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              We sent a verification link to{" "}
              <span className="break-all font-medium text-foreground">
                {email}
              </span>
              . Open it to finish setting up your workspace.
            </p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              If it hasn’t arrived, check your spam folder or request a fresh
              link below.
            </p>
            {error && (
              <p
                role="alert"
                className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            {feedback && (
              <p
                role="status"
                className="mt-6 rounded-lg bg-accent p-3 text-sm text-primary"
              >
                {feedback}
              </p>
            )}
            <Button
              className="mt-7 h-11 w-full"
              onClick={resend}
              disabled={sending || countdown > 0}
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending…
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock />
                  Resend in {Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, "0")}
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted-foreground">
              There’s no email address associated with this link. Return to
              registration to get started.
            </p>
            <Button asChild className="mt-7 h-11 w-full">
              <Link href="/register">Create an account</Link>
            </Button>
          </>
        )}
        <Link
          href="/login"
          className="mt-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to log in
        </Link>
      </section>
    </div>
  );
}
