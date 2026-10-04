"use client";
import Link from "next/link";
import { useUserRole } from "@/lib/checkRole";
import { Button } from "./ui/button";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { ArrowUpRight } from "lucide-react";
export default function Navbar() {
  const { isAuthenticated } = useUserRole();
  return <header className="public-header"><div className="site-container flex h-20 items-center justify-between gap-4"><Brand /><nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex" aria-label="Main navigation"><Link href="/#tools" className="hover:text-foreground">The toolkit</Link><Link href="/about" className="hover:text-foreground">About the project</Link></nav><div className="flex items-center gap-2"><ThemeToggle />{!isAuthenticated && <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link href="/login">Log in</Link></Button>}<Button asChild><Link href={isAuthenticated ? "/tariff" : "/register"}>{isAuthenticated ? "Workspace" : "Get started"}<ArrowUpRight /></Link></Button></div></div></header>;
}
