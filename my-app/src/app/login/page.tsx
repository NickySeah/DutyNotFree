"use client";
import SignIn from "@/components/sign-in";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Key } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    // Simple validation
    const email = formData.get("email");
    if (!email) return toast.error("Email is required");
    const password = formData.get("password");
    if (!password) return toast.error("Password is required");
    await authClient.signIn.email(
      {
        email: email as string,
        password: password as string,
        callbackURL: "/product",
      },
      {
        onRequest: (ctx) => {
          setLoading(true);
        },
        onResponse: (ctx) => {
          setLoading(false);
        },
      }
    );

    // Perform login logic here
  };
  return (
    <div>
      <div className="flex flex-row border-2 m-8 rounded-4xl shadow-lg overflow-hidden">
        <div className="w-2/5 p-10 flex flex-col justify-center items-center mt-8">
          <h1 className="text-3xl font-bold text-center mb-2">Login</h1>
          <h3 className="text-center text-gray-500 mb-4">
            Welcome back! Please enter your credentials.
          </h3>

          <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4">
            <div>
              <label htmlFor="email" className="font-bold">
                Email
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-lg"
                  type="email"
                  id="email"
                  name="email"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <Label htmlFor="password" className="font-bold">
                  Password
                </Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-lg"
                  type="password"
                  id="password"
                  name="password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-8 mb-8"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <p> Login </p>
              )}
            </Button>
          </form>

          <div className="mb-8 text-sm text-center text-gray-500">
            You can also sign in with
          </div>
          <Button
            variant="outline"
            className={cn(
              "max-w-md gap-2 mb-7 w-full",
              loading && "opacity-60"
            )}
            disabled={loading}
            onClick={async () => {
              await authClient.signIn.social(
                {
                  provider: "google",
                  callbackURL: "/product",
                },
                {
                  onRequest: (ctx) => {
                    setLoading(true);
                  },
                  onResponse: (ctx) => {
                    setLoading(false);
                  },
                }
              );
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="0.98em"
              height="1em"
              viewBox="0 0 256 262"
            >
              <path
                fill="#4285F4"
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
              ></path>
              <path
                fill="#34A853"
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
              ></path>
              <path
                fill="#FBBC05"
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
              ></path>
              <path
                fill="#EB4335"
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
              ></path>
            </svg>
            Sign in with Google
          </Button>

          <div className="flex justify-center w-full border-t py-4 mt-15">
            <p className="text-center text-xs text-neutral-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-orange-400">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        <div className="w-3/5 flex items-center justify-center relative rounded-r-4xl overflow-hidden">
          <Image src="/images/shipyard.jpg" alt="Login with Google" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </div>
    </div>
  );
}
