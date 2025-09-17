import { useSession } from "@/lib/auth-client";

export const useUserRole = () => {
  const { data: session, isPending } = useSession();
  
  const isAdmin = () => session?.user?.role === "admin";
  const isUser = () => session?.user?.role === "user";
  const hasRole = (role: string) => session?.user?.role === role;
  const isAuthenticated = () => !!session?.user;
  
  return {
    session,
    isPending,
    isAdmin,
    isUser,
    hasRole,
    isAuthenticated,
    userRole: session?.user?.role,
  };
};

// Alternative: Non-hook version if you have session data available
export const checkUserRole = (session: any) => ({
  isAdmin: () => session?.user?.role === "admin",
  isUser: () => session?.user?.role === "user", 
  hasRole: (role: string) => session?.user?.role === role,
  isAuthenticated: () => !!session?.user,
});