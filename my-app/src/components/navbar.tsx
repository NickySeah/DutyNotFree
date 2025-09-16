"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  console.log(session);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-between p-6 bg-gray-900 shadow-md fixed top-0 z-50 h-24">
        <Link href="/">
          <Image src="/images/Duty1.svg" alt="Logo" width={64} height={64} priority />
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
          <Link href="/product" className="text-lg font-semibold text-white">
            Browse Tariffs
          </Link>
          <Link href="/calculator" className="text-lg font-semibold text-white">
            Calculator
          </Link>
        </div>
        {isPending ? (
          <div className="w-20 h-10 bg-gray-700 animate-pulse rounded"></div>
        ) : session ? (
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
