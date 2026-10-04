"use client";
import { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/axios";
import { Toaster } from "@/components/ui/sonner";
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } }));
  const { data: session, isPending } = useSession();
  const previousIdentity = useRef<string | null | undefined>(undefined);
  const identity = session?.user?.id ?? null;
  useEffect(() => {
    if (isPending || previousIdentity.current === identity) return;
    clearAuthToken();
    if (previousIdentity.current !== undefined) client.clear();
    previousIdentity.current = identity;
  }, [identity, isPending, client]);
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange><QueryClientProvider client={client}>{children}<Toaster position="top-center" richColors /></QueryClientProvider></ThemeProvider>;
}
