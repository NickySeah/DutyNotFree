"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/checkRole";
import { useUsers } from "@/hooks/useUser";
import { PageHeader } from "@/components/page-header";
import { DataStatus } from "@/components/data-status";
import DeleteUserModal from "@/components/deleteUserModal";
import UpdateUserModal from "@/components/updateUserModal";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import type { UserInformation } from "@/types/user";
export default function AdminDashboardPage() {
  const { isAdmin, isPending, isAuthenticated } = useUserRole();
  const router = useRouter();
  const users = useUsers(isAdmin);
  const [selected, setSelected] = useState<UserInformation | null>(null);
  const [modal, setModal] = useState<"update" | "delete" | null>(null);
  useEffect(() => {
    if (!isPending && !isAdmin)
      router.replace(isAuthenticated ? "/tariff" : "/login");
  }, [isPending, isAdmin, isAuthenticated, router]);
  const columns = createColumns(
    (user) => {
      setSelected(user);
      setModal("update");
    },
    (user) => {
      setSelected(user);
      setModal("delete");
    },
  );
  if (!isPending && !isAdmin)
    return (
      <DataStatus
        title="Administrator access required"
        description="Returning you to your workspace."
      />
    );
  return (
    <>
      <PageHeader
        title="User management"
        description="Manage access and accounts in your trade workspace."
        actions={
          <span className="rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
            {users.data?.length ?? 0} accounts
          </span>
        }
      />
      {isPending || users.isPending ? (
        <DataStatus loading />
      ) : users.isError ? (
        <DataStatus error retry={() => users.refetch()} />
      ) : (
        <div className="data-surface">
          <DataTable columns={columns} data={users.data || []} />
        </div>
      )}
      <UpdateUserModal
        isOpen={modal === "update"}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        user={selected}
      />
      <DeleteUserModal
        isOpen={modal === "delete"}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        user={selected}
      />
    </>
  );
}
