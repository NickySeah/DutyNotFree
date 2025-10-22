"use client";

import { useEffect, useState } from "react";
import { Mail, Loader2, Clock } from "lucide-react";
import { sendVerificationEmail } from "@/lib/auth-client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VerifyEmailPage() {
  // Use null to represent the initial state before client-side hydration
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [countdown, setCountdown] = useState(0); // Timer in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);

  // On component mount, read the email from the URL query params.
  // This avoids Next.js specific hooks and is more robust.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get("email");
    setUserEmail(emailFromUrl || ""); // Set to empty string if not found, to differentiate from null
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setStatus("idle");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, countdown]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      setFeedbackMessage(
        "Email address not found. Please try signing up again."
      );
      setStatus("error");
      return;
    }

    setStatus("sending");
    setFeedbackMessage("");

    try {
      await sendVerificationEmail({
        email: userEmail,
        // callbackURL: "/verify-your-email/success", // Where to redirect after successful verification
      });

      setFeedbackMessage("A new verification link has been sent!");
      setStatus("sent");
      
      // Start 2-minute countdown (120 seconds)
      setCountdown(120);
      setIsTimerActive(true);
      
    } catch (error: any) {
      console.error("Resend failed:", error);
      setFeedbackMessage(error.message || "An unknown error occurred.");
      setStatus("error");
    }
  };

  // Format countdown display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Show a loading state until the email has been read from the URL
  if (userEmail === null) {
    return (
      <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-background p-4">
        <Card className="flex w-full max-w-md items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      </main>
    );
  }

  // Render a clear message if the email is missing from the URL
  if (!userEmail) {
    return (
      <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Missing Information</CardTitle>
            <CardDescription>
              The email address was not provided in the URL. Please return to
              the signup page and try again.
            </CardDescription>
            <Link href="/register" className="bg-sky-500 hover:bg-sky-700 text-center text-white p-2 rounded ">Signup</Link>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="rounded-full bg-primary/10 p-4 flex align-center justify-evenly mb-4">
            <Mail className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          </div>

          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-semibold text-foreground">{userEmail}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Click the link in the email to complete registration. If you don't
            see it, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex-col items-stretch">
          {(status === "error" || status === "sent") && feedbackMessage && (
            <Alert
              variant={status === "error" ? "destructive" : "default"}
              className="mb-4"
            >
              <AlertTitle>
                {status === "error" ? "Error" : "Success"}
              </AlertTitle>
              <AlertDescription>{feedbackMessage}</AlertDescription>
            </Alert>
          )}
          
          {/* Timer Display */}
          {isTimerActive && countdown > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Resend available in: <span className="font-mono font-semibold">{formatTime(countdown)}</span>
              </span>
            </div>
          )}

          <Button
            onClick={handleResendEmail}
            disabled={status === "sending" || isTimerActive}
            className="w-full"
          >
            {status === "sending" && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            )}
            {isTimerActive && countdown > 0 && (
              <>
                <Clock className="mr-2 h-4 w-4" /> Wait {formatTime(countdown)}
              </>
            )}
            {!status.includes("sending") && !isTimerActive && "Resend Verification Email"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}