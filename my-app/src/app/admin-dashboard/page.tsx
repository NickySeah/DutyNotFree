"use client";
import { useUserRole } from "@/lib/checkRole";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: string | undefined; // Allow undefined role
  createdAt: Date; // This is a Date object, not string
  emailVerified: number; // This is 0 or 1, not boolean
  image?: string;
  banned?: number;
  banExpires?: null | Date;
  banReason?: null | string;
}

export default function AdminDashboardPage() {
  const { isAdmin, isPending, isAuthenticated } = useUserRole();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (!isAuthenticated) {
        toast.error("Please log in to admin account to access this page");
        router.push("/login");
        return;
      }

      if (!isAdmin) {
        toast.error("Admin access required");
        router.push("/");
        return;
      }
    }
  }, [isAdmin, isPending, isAuthenticated, router]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await authClient.admin.listUsers({
          query: { limit: 100 },
        });

        if (error) {
          throw new Error(error.message);
        }
        console.log("Fetched users:", data?.users);
        setUserData(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Error fetching users");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Show loading while checking authentication
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render content if not admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>
      {/* Admin dashboard content will be implemented here */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        {loadingUsers ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.users.map((user : UserWithRole) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.createdAt.toString()}</TableCell>
                  <TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
