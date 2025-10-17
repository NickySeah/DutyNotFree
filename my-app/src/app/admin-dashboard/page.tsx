"use client";
import { useUserRole } from "@/lib/checkRole";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import DeleteUserModal from "@/components/deleteUserModal";

import { DataTable } from "./data-table";
import { createColumns } from "./columns";

import type { UserInformation } from "@/types/user";

export default function AdminDashboardPage() {
  const { isAdmin, isPending, isAuthenticated } = useUserRole();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInformation | null>(null);

  // This function will be passed to createColumns
  const handleDeleteUser = (user: UserInformation) => {
    console.log("Deleting user:", user);
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }

  const columns = createColumns(handleDeleteUser);

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
          <div className="container mx-auto py-10">
            <DataTable columns={columns} data={userData.users} />
          </div>
        )}
      </div>
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
}
