"use client";
import { useUserRole } from "@/lib/checkRole";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DeleteUserModal from "@/components/deleteUserModal";
import UpdateUserModal from "@/components/updateUserModal";

import { DataTable } from "./data-table";
import { createColumns } from "./columns";

import type { UserInformation } from "@/types/user";
import { useUsers } from "@/hooks/useUser";
import { Users, Shield, AlertCircle, Loader2, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  const { isAdmin, isPending, isAuthenticated } = useUserRole();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInformation | null>(
    null
  );
  const { data: users, isLoading, error } = useUsers();

  // This function will be passed to createColumns
  const handleDeleteUser = (user: UserInformation) => {
    console.log("Deleting user:", user);
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-slate-600 dark:text-slate-400 animate-spin" />
          <div className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-400">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Don't render content if not admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl md:rounded-2xl shadow-lg">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1">
                Manage users and monitor system activity
              </p>
            </div>
          </div>
        </div>

        {/* User Management Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg md:text-2xl flex items-center gap-2">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                  User Management
                </CardTitle>
                <CardDescription className="mt-2 text-xs md:text-sm">
                  {users
                    ? `Managing ${users.length} user accounts`
                    : "Loading user data..."}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-xs"
              >
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 md:h-12 w-full rounded-lg" />
                <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
              </div>
            ) : error ? (
              <Alert
                variant="destructive"
                className="border-red-200 dark:border-red-900"
              >
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                <AlertDescription className="ml-2 text-xs md:text-sm">
                  <span className="font-medium">Error fetching users.</span>{" "}
                  Please try refreshing the page or contact support if the issue
                  persists.
                </AlertDescription>
              </Alert>
            ) : users ? (
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 md:p-6 border border-slate-200 dark:border-slate-800">
                <DataTable columns={columns} data={users} />
              </div>
            ) : null}
          </CardContent>
        </Card>
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
