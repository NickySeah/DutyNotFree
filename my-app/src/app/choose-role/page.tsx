"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useUserRole } from "@/lib/checkRole";

export default function ChooseRolePage() {
  const [selectedRole, setSelectedRole] = useState<
    "supplier" | "importer" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    isAuthenticated,
    needsRoleSelection,
    isPending,
    isAdmin,
    isSupplier,
    isImporter,
  } = useUserRole();

  // ADD DEBUG LOGGING
  console.log("ChooseRolePage debug:", {
    isAuthenticated,
    needsRoleSelection,
    isPending,
    isAdmin,
    isSupplier,
    isImporter,
  });

  useEffect(() => {
    console.log("useEffect triggered with:", {
      isPending,
      isAuthenticated,
      needsRoleSelection,
    });

    // If not authenticated, redirect to login
    if (!isPending && !isAuthenticated) {
      console.log("Redirecting to login - not authenticated");
      router.replace("/login");
      return;
    }

    // If user already has a valid role, redirect to tariff page
    if (!isPending && isAuthenticated && !needsRoleSelection) {
      console.log("Redirecting to tariff - user has valid role");
      window.location.replace("/tariff"); // Use window.location instead of router
      // router.replace("/tariff"); //Use in production
      return;
    }
  }, [
    isAuthenticated,
    needsRoleSelection,
    isPending,
    router,
    isAdmin,
    isSupplier,
    isImporter,
  ]);

  // Prevent back navigation
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/set-role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set role");
      }

      toast.success(`Role set successfully as ${selectedRole}`);
      window.location.replace("/tariff");
    } catch (error) {
      console.error("Error setting role:", error);
      toast.error("Failed to set role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isPending) {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-base md:text-lg">Loading...</div>
      </div>
    );
  }

  // If user already has a role, show redirecting message
  if (!isPending && isAuthenticated && !needsRoleSelection) {
    console.log("Showing redirecting state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-base md:text-lg text-center">
          You already have a role assigned. Redirecting...
        </div>
      </div>
    );
  }

  console.log("Showing role selection form");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl font-bold">
            Choose Your Role
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Please select your role to continue using DutyNotFree
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 md:px-6">
          <div className="space-y-3">
            <div
              className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedRole === "supplier"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedRole("supplier")}
            >
              <h3 className="font-semibold text-base md:text-lg">Supplier</h3>
              <p className="text-xs md:text-sm text-gray-600">
                I export goods and need to manage product information
              </p>
            </div>

            <div
              className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedRole === "importer"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedRole("importer")}
            >
              <h3 className="font-semibold text-base md:text-lg">Importer</h3>
              <p className="text-xs md:text-sm text-gray-600">
                I import goods and need to calculate duties and tariffs
              </p>
            </div>
          </div>

          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className="w-full text-sm md:text-base"
          >
            {isLoading ? "Setting Role..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
