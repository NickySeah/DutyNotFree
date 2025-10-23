"use client";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
// import { LoaderCircle } from "lucide-react";
import { useUserRole } from "@/lib/checkRole";

export default function Navbar() {
  const { isAdmin, isAuthenticated, isPending } = useUserRole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-between p-6 bg-gray-900 shadow-md fixed top-0 z-50 h-24">
        <Link href="/">
          <Image
            src="/images/Duty1.svg"
            alt="Logo"
            width={64}
            height={64}
            priority
          />
        </Link>
        <div className="flex space-x-4">
          <div className="w-20 h-10 bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex items-center justify-between p-6 bg-gray-900 shadow-md fixed top-0 z-50 h-24">
      <Link href="/">
        <Image src="/images/Duty1.svg" alt="Logo" width={64} height={64} />
      </Link>

      <div className="flex space-x-4">
        <div className="hidden md:flex space-x-6">
          {!isPending && isAdmin && (
            <Link
              href="/admin-dashboard"
              className="text-lg font-semibold text-white"
            >
              Manage Users
            </Link>
          )}
          <Link href="/tariff" className="text-lg font-semibold text-white">
            Browse Tariffs
          </Link>
          <Link href="/calculator" className="text-lg font-semibold text-white">
            Calculator
          </Link>
          <Link href="/dashboard" className="text-lg font-semibold text-white">
            Analytics
          </Link>
          <Link href="/api-docs" className="text-lg font-semibold text-white">
            API Docs
          </Link>
          {/* Only show these links if user is authenticated */}
          {!isPending && isAuthenticated && (
            <>
              <Link href="/tariff" className="text-lg font-semibold text-white">
                Browse Tariffs
              </Link>
              <Link
                href="/calculator"
                className="text-lg font-semibold text-white"
              >
                Calculator
              </Link>
            </>
          )}
        </div>
        {isPending ? (
          <div className="w-20 h-10 bg-gray-700 animate-pulse rounded"></div>
        ) : isAuthenticated ? (
          <Button variant={"destructive"} onClick={() => signOut()}>
            {" "}
            Sign Out{" "}
          </Button>
        ) : (
          <>
            <Link href="/login" className="text-lg font-semibold text-white">
              Login
            </Link>
            <Link href="/register" className="text-lg font-semibold text-white">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
