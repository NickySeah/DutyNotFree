"use client";
import { useUserRole } from "@/lib/checkRole";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import DeleteUserModal from "@/components/deleteUserModal";
import UpdateUserModal from "@/components/updateUserModal";

import { DataTable } from "./data-table";
import { createColumns } from "./columns";

import type { UserInformation } from "@/types/user";
import { useUsers } from "@/hooks/useUser";


export default function AdminDashboardPage() {
  const { isAdmin, isPending, isAuthenticated } = useUserRole();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInformation | null>(null);
  const { data: users, isLoading, error } = useUsers();

  // This function will be passed to createColumns
  const handleDeleteUser = (user: UserInformation) => {
    console.log("Deleting user:", user);
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }

  const handleUpdateUser = (user: UserInformation) => {
    console.log("Updating user:", user);
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const columns = createColumns(handleUpdateUser, handleDeleteUser);

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

  // useEffect(() => {
  //   const loadUsers = async () => {
  //     try {
  //       const { data, error } = await authClient.admin.listUsers({
  //         query: { limit: 100 },
  //       });

  //       if (error) {
  //         throw new Error(error.message);
  //       }

  //       // 2. For each user, create a promise to fetch their providerId
  //       const usersWithProviderPromises = data.users.map(async (user) => {
  //         try {
  //           const response = await fetch(
  //             `/api/user/provider?userId=${user.id}`
  //           );
  //           if (!response.ok) {
  //             // If the endpoint returns an error, assign a default value
  //             return { ...user, providerId: "Error" };
  //           }
  //           const { providerId } = await response.json();
  //           return { ...user, providerId }; // Add the providerId to the user object
  //         } catch (e) {
  //           console.error(`Failed to fetch providerId for user ${user.id}`, e);
  //           return { ...user, providerId: "Error" };
  //         }
  //       });

  //       // 3. Wait for all fetch requests to complete
  //       const usersWithProviderId = await Promise.all(usersWithProviderPromises);

  //       console.log("Fetched users:", usersWithProviderId);
  //       setUserData({ users: usersWithProviderId });
  //     } catch (err) {
  //       console.error("Error fetching users:", err);
  //       toast.error("Error fetching users");
  //     } finally {
  //       setLoadingUsers(false);
  //     }
  //   };

  //   loadUsers();
  // }, []);

    // Handle error state
  useEffect(() => {
    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    }
  }, [error]);

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
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : error ? (
          <div className="text-red-500">Error fetching users</div>
        ) : users ? (
          <div className="container mx-auto py-10">
            <DataTable columns={columns} data={users} />
          </div>
        ) : null}
      </div>
      <UpdateUserModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
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
