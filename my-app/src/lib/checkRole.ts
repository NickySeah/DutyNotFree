import { useSession } from "@/lib/auth-client";

export const useUserRole = () => {
  const { data: session, isPending } = useSession();

  // Return computed values instead of functions
  const isAdmin = session?.user?.role === "admin";
  const isUser = session?.user?.role === "user";
  const isSupplier = session?.user?.role === "supplier";
  const isImporter = session?.user?.role === "importer";
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id;

  // Check if user has a role that doesn't need role selection
  const hasValidRole =
    session?.user?.role &&
    ["admin", "supplier", "importer"].includes(session.user.role);

  // Only users with "user" role or no role need role selection
  const needsRoleSelection =
    isAuthenticated && (!session?.user?.role || session?.user?.role === "user");

  // Keep function versions if needed elsewhere
  const checkIsAdmin = () => session?.user?.role === "admin";
  const checkIsUser = () => session?.user?.role === "user";
  const checkIsSupplier = () => session?.user?.role === "supplier";
  const checkIsImporter = () => session?.user?.role === "importer";
  const checkHasRole = (role: string) => session?.user?.role === role;
  const checkIsAuthenticated = () => !!session?.user;

  return {
    session,
    isPending,
    isAdmin,
    isUser,
    isSupplier,
    isImporter,
    isAuthenticated,
    hasValidRole,
    needsRoleSelection,
    checkIsAdmin,
    checkIsUser,
    checkIsSupplier,
    checkIsImporter,
    checkHasRole,
    checkIsAuthenticated,
    userRole: session?.user?.role,
    userId
  };
};
