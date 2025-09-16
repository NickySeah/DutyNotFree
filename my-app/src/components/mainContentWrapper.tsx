"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className={cn({
      "pt-24": pathname !== "/",
      "pt-0": pathname === "/"
    })}>
      {children}
    </div>
  );
}
