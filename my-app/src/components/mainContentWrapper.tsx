"use client";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { useUserRole } from "@/lib/checkRole";
import { PacmanLoader } from "react-spinners";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [client] = useState(() => new QueryClient());
  const {
    isAuthenticated,
    needsRoleSelection,
    isPending,
    isAdmin,
    isSupplier,
    isImporter,
  } = useUserRole();

  useEffect(() => {
    // Skip role checking for certain pages
    const skipRoleCheck = ["/", "/login", "/register", "/choose-role"].includes(
      pathname
    );

    if (!isPending && !skipRoleCheck && isAuthenticated) {
      // Only redirect users who need role selection (users with "user" role or no role)
      // Admin, supplier, and importer users bypass this
      if (needsRoleSelection && !isAdmin && !isSupplier && !isImporter) {
        router.push("/choose-role");
      }
    }
  }, [
    isAuthenticated,
    needsRoleSelection,
    isPending,
    pathname,
    router,
    isAdmin,
    isSupplier,
    isImporter,
  ]);

  // Show loading while checking authentication and role
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PacmanLoader 
        loading={isPending}/>
      </div>
    );
  }

  return (
    <div
      className={cn({
        "pt-24": pathname !== "/" && pathname !== "/choose-role",
        "pt-0": pathname === "/" || pathname === "/choose-role",
      })}
    >
      <QueryClientProvider client={client}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}
