"use client";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useUserRole } from "@/lib/checkRole";
import { redirect, RedirectType } from "next/navigation";

export default function Navbar() {
  const { isImporter, isSupplier, isAdmin, isAuthenticated, isPending } =
    useUserRole();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    redirect("/", RedirectType.replace);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-between p-4 md:p-6 bg-gray-900 shadow-md fixed top-0 z-50 h-16 md:h-24">
        <Link href="/">
          <Image
            src="/images/Duty1.svg"
            alt="Logo"
            width={48}
            height={48}
            className="md:w-16 md:h-16"
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
    <div className="w-full bg-gray-900 shadow-md fixed top-0 z-50">
      <div className="flex items-center justify-between p-4 md:p-6 h-16 md:h-24">
        <Link href="/" onClick={closeMenu}>
          <Image
            src="/images/Duty1.svg"
            alt="Logo"
            width={48}
            height={48}
            className="md:w-16 md:h-16"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          <div className="flex space-x-6">
            {!isPending && isAdmin && (
              <Link
                href="/admin-dashboard"
                className="text-lg font-semibold text-white"
              >
                Manage Users
              </Link>
            )}
            {!isPending && isAuthenticated && (
              <>
                <Link
                  href="/tariff"
                  className="text-lg font-semibold text-white"
                >
                  Browse Tariffs
                </Link>
                <Link href="/fta" className="text-lg font-semibold text-white">
                  Browse FTA
                </Link>
                {(isAdmin || isSupplier) && (
                  <Link
                    href="/product"
                    className="text-lg font-semibold text-white"
                  >
                    Browse Products
                  </Link>
                )}
                <Link
                  href="/calculator"
                  className="text-lg font-semibold text-white"
                >
                  Calculator
                </Link>
                <Link
                  href="/dashboard"
                  className="text-lg font-semibold text-white"
                >
                  Analytics
                </Link>
                <Link
                  href="/api-docs"
                  className="text-lg font-semibold text-white"
                >
                  API Docs
                </Link>
              </>
            )}
          </div>
          {isPending ? (
            <div className="w-20 h-10 bg-gray-700 animate-pulse rounded"></div>
          ) : isAuthenticated ? (
            <Button variant={"destructive"} onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-lg font-semibold text-white">
                Login
              </Link>
              <Link
                href="/register"
                className="text-lg font-semibold text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 shadow-lg">
          <div className="flex flex-col space-y-4 p-4">
            {!isPending && isAdmin && (
              <Link
                href="/admin-dashboard"
                className="text-base font-semibold text-white hover:text-gray-300"
                onClick={closeMenu}
              >
                Manage Users
              </Link>
            )}
            {!isPending && isAuthenticated && (
              <>
                <Link
                  href="/tariff"
                  className="text-base font-semibold text-white hover:text-gray-300"
                  onClick={closeMenu}
                >
                  Browse Tariffs
                </Link>
                <Link
                  href="/fta"
                  className="text-base font-semibold text-white hover:text-gray-300"
                  onClick={closeMenu}
                >
                  Browse FTA
                </Link>
                {(isAdmin || isSupplier) && (
                  <Link
                    href="/product"
                    className="text-base font-semibold text-white hover:text-gray-300"
                    onClick={closeMenu}
                  >
                    Browse Products
                  </Link>
                )}
                <Link
                  href="/calculator"
                  className="text-base font-semibold text-white hover:text-gray-300"
                  onClick={closeMenu}
                >
                  Calculator
                </Link>
                <Link
                  href="/dashboard"
                  className="text-base font-semibold text-white hover:text-gray-300"
                  onClick={closeMenu}
                >
                  Analytics
                </Link>
                <Link
                  href="/api-docs"
                  className="text-base font-semibold text-white hover:text-gray-300"
                  onClick={closeMenu}
                >
                  API Docs
                </Link>
              </>
            )}

            <div className="border-t border-gray-700 pt-4">
              {isPending ? (
                <div className="w-full h-10 bg-gray-700 animate-pulse rounded"></div>
              ) : isAuthenticated ? (
                <Button
                  variant={"destructive"}
                  onClick={() => {
                    handleSignOut();
                    closeMenu();
                  }}
                  className="w-full"
                >
                  Sign Out
                </Button>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="text-base font-semibold text-white hover:text-gray-300"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-base font-semibold text-white hover:text-gray-300"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
