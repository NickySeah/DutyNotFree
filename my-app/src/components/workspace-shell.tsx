"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Calculator,
  Database,
  FileCode2,
  Globe2,
  LogOut,
  Menu,
  Package,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { useUserRole } from "@/lib/checkRole";
import { signOut } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import Navbar from "./navbar";
import Footer from "./footer";
const items = [
  { href: "/tariff", label: "Tariff explorer", icon: Database },
  { href: "/fta", label: "Trade agreements", icon: Globe2 },
  { href: "/product", label: "Product library", icon: Package },
  { href: "/calculator", label: "Cost calculator", icon: Calculator },
  { href: "/dashboard", label: "Trade analytics", icon: BarChart3 },
  { href: "/api-docs", label: "API reference", icon: FileCode2 },
];
const publicRoutes = [
  "/",
  "/about",
  "/login",
  "/register",
  "/choose-role",
  "/verify-your-email",
];
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAdmin, session, userRole } = useUserRole();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const nav = isAdmin
    ? [
        ...items,
        { href: "/admin-dashboard", label: "User management", icon: Shield },
      ]
    : items;
  const active = nav.find((item) => item.href === pathname);
  async function logout() {
    setSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) throw new Error(result.error.message);
      clearAuthToken();
      queryClient.clear();
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }
  const navigation = (
    <>
      <div className="flex items-center justify-between px-5 pb-8 pt-7">
        <Brand />
        <span className="lg:hidden">
          <ThemeToggle />
        </span>
      </div>
      <p className="px-6 pb-3 text-xs font-medium text-muted-foreground">
        Trade workspace
      </p>
      <nav className="space-y-1 px-3" aria-label="Workspace navigation">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "workspace-link",
              pathname === href && "workspace-link-active",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="rounded-xl border bg-background p-4">
          <p className="text-sm font-medium">Plan your next shipment</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Compare duties before choosing your trade route.
          </p>
          <Link
            href="/calculator"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary"
          >
            Open calculator
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t pt-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
            {session?.user?.name?.slice(0, 1).toUpperCase() || "D"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {session?.user?.name || "Your account"}
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              {userRole || "Trade workspace"}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            disabled={signingOut}
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
  if (publicRoutes.includes(pathname))
    return (
      <>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </>
    );
  return (
    <div className="min-h-screen">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="workspace-sidebar hidden lg:flex">{navigation}</aside>
      <div className="lg:pl-60">
        <header className="workspace-header">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </Button>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Workspace
            </span>
            <span className="hidden text-border sm:inline">/</span>
            <span className="text-sm font-medium">
              {active?.label || "DutyNotFree"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground md:inline">
              Your trade, clearly understood.
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main id="main-content" className="workspace-content">
          {children}
        </main>
        <div className="px-6 pb-6 text-xs text-muted-foreground">
          DutyNotFree · Educational estimates based on the available tariff
          dataset.
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="inset-y-0 left-0 flex h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0">
          <DialogTitle className="sr-only">Workspace navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Navigate trade tools, change your theme, or sign out.
          </DialogDescription>
          {navigation}
        </DialogContent>
      </Dialog>
    </div>
  );
}
