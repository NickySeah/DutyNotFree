"use client";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import { useState } from "react"; // Add this import
import { Loader2 } from "lucide-react"; // Add this import for loading icon

export default function RegisterPage() {
  const [loading, setLoading] = useState(false); // Add loading state

  const handleEmailPasswordRegister = async (
    name: string,
    email: string,
    password: string
  ) => {
    authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onRequest: () => {
          setLoading(true); // Start loading when request begins
        },
        onResponse: () => {
          setLoading(false); // Stop loading when response is received
        },
        onSuccess: () => {
          toast.success("Registration successful!");
          // Use replace instead of push to remove register from history
          redirect(
            `/verify-your-email?email=${encodeURIComponent(email)}`,
            RedirectType.replace
          );
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    if (!name) return toast.error("Name is required");
    const email = formData.get("email") as string;
    if (!email) return toast.error("Email is required");
    const password = formData.get("password") as string;
    if (!password) return toast.error("Password is required");
    const confirmPassword = formData.get("confirm-password") as string;
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    // console.log({ name, email, password });

    await handleEmailPasswordRegister(name, email, password);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row border-2 m-4 md:m-8 rounded-4xl shadow-lg overflow-hidden">
        <div className="w-full md:w-2/5 p-6 md:p-10 flex flex-col justify-center items-center mt-4 md:mt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            Register
          </h1>
          <h3 className="text-sm md:text-base text-center text-gray-500 mb-4 px-2">
            Create a new account
          </h3>

          <form
            onSubmit={handleSubmit}
            className="max-w-md w-full space-y-4 px-4 md:px-0"
          >
            <div className="space-y-4">
              <label htmlFor="name" className="font-bold text-sm md:text-base">
                Name
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-base md:text-lg"
                  type="text"
                  id="name"
                  name="name"
                  disabled={loading} // Disable input when loading
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="font-bold text-sm md:text-base">
                Email
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-base md:text-lg"
                  type="email"
                  id="email"
                  name="email"
                  disabled={loading} // Disable input when loading
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="font-bold text-sm md:text-base"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-base md:text-lg"
                  type="password"
                  id="password"
                  name="password"
                  disabled={loading} // Disable input when loading
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="font-bold text-sm md:text-base"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-base md:text-lg"
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  disabled={loading} // Disable input when loading
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 md:mt-8 mb-6 md:mb-8"
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
          <div className="flex justify-center w-full border-t py-4 mt-8 md:mt-0">
            <p className="text-center text-xs text-neutral-500">
              Already have account?{" "}
              <Link href="/login" className="text-orange-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <div className="w-full md:w-3/5 h-64 md:h-auto flex items-center justify-center relative rounded-b-4xl md:rounded-r-4xl md:rounded-bl-none overflow-hidden">
          <Image
            src="/images/register.jpg"
            alt="Login with Google"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
