"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserRole } from "@/lib/checkRole";
import { Providers } from "./providers";
import { WorkspaceShell } from "./workspace-shell";
function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isPending, needsRoleSelection } = useUserRole();
  useEffect(() => {
    if (!isPending && needsRoleSelection && !["/", "/about", "/login", "/register", "/choose-role", "/verify-your-email"].includes(pathname)) router.replace("/choose-role");
  }, [isPending, needsRoleSelection, pathname, router]);
  return children;
}
export default function MainContent({ children }: { children: React.ReactNode }) {
  return <Providers><WorkspaceShell><RoleGuard>{children}</RoleGuard></WorkspaceShell></Providers>;
}
