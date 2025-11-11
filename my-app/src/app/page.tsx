"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Feature from "@/components/feature";
import Link from "next/link";
import { useUserRole } from "@/lib/checkRole";

export default function HomePage() {
  const { isAuthenticated } = useUserRole();

  return (
    <div>
      <div className="relative w-full h-screen">
        <Image
          src="/images/background4.jpg"
          alt="Landing Background"
          fill
          style={{ objectFit: "cover" }}
          priority
          sizes="100vw"
        />
        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-3 sm:mb-4 text-emerald-400 drop-shadow-lg">
            DutyNotFree
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 font-bold text-emerald-300 drop-shadow-md max-w-md px-4">
            Your onestop shop for tariff calculations
          </p>
          {!isAuthenticated ? (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-amber-900 w-full sm:w-auto"
                  >
                    Register
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-amber-900 w-full sm:w-auto"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Link href="/tariff" className="w-full sm:w-auto px-4">
              <Button
                variant="default"
                size="lg"
                className="bg-amber-900 w-full sm:w-auto"
              >
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>

      <section className="relative w-full bg-gray-50">
        <Feature />
      </section>
    </div>
  );
}
