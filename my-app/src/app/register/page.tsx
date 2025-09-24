"use client";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/utils/auth";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

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
        onSuccess: () => {
          toast.success("Registration successful!");
          router.push("/tariff");
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
    // Simple validation
    const name = formData.get("name") as string;
    if (!name) return toast.error("Name is required");
    const email = formData.get("email") as string;
    if (!email) return toast.error("Email is required");
    const password = formData.get("password") as string;
    if (!password) return toast.error("Password is required");
    const confirmPassword = formData.get("confirm-password") as string;
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    console.log({ name, email, password });

    await handleEmailPasswordRegister(name, email, password);
  };
  return (
    <div>
      <div className="flex flex-row border-2 m-8 rounded-4xl shadow-lg overflow-hidden">
        <div className="w-2/5 p-10 flex flex-col justify-center items-center mt-8">
          <h1 className="text-3xl font-bold text-center mb-2">Register</h1>
          <h3 className="text-center text-gray-500 mb-4">
            Create a new account
          </h3>

          <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4">
            <div className="space-y-4">
              <label htmlFor="name" className="font-bold">
                Name
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-lg"
                  type="text"
                  id="name"
                  name="name"
                />
              </div>
            </div>
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
              <label htmlFor="password" className="font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-lg"
                  type="password"
                  id="password"
                  name="password"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="font-bold">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="border-2 w-full p-2 rounded-md text-lg"
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-8 mb-8">
              Register
            </Button>
          </form>
          <div className="flex justify-center w-full border-t py-4">
            <p className="text-center text-xs text-neutral-500">
              Already have account?{" "}
              <Link href="/login" className="text-orange-400">Sign in</Link>
            </p>
          </div>
        </div>
        <div className="w-3/5 flex items-center justify-center relative rounded-r-4xl overflow-hidden">
          <Image src="/images/register.jpg" alt="Login with Google" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </div>
    </div>
  );
}
