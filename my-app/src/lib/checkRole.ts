import { useSession } from "@/lib/auth-client";

export const useUserRole = () => {
  const { data: session, isPending } = useSession();
  
  // Return computed values instead of functions
  const isAdmin = session?.user?.role === "admin";
  const isUser = session?.user?.role === "user";
  const isAuthenticated = !!session?.user;
  
  // Keep function versions if needed elsewhere
  const checkIsAdmin = () => session?.user?.role === "admin";
  const checkIsUser = () => session?.user?.role === "user";
  const hasRole = (role: string) => session?.user?.role === role;
  const checkIsAuthenticated = () => !!session?.user;
  
  return {
    session,
    isPending,
    isAdmin,        // ✅ Boolean value
    isUser,         // ✅ Boolean value
    isAuthenticated, // ✅ Boolean value
    checkIsAdmin,   // Function version if needed
    checkIsUser,    // Function version if needed
    hasRole,
    checkIsAuthenticated,
    userRole: session?.user?.role,
  };
};