"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { UserInformation } from "@/types/user";

// export const columns: ColumnDef<UserInformation>[] = [
export const createColumns = (
  handleUpdateUser: (user: UserInformation) => void, // function type
  handleDeleteUser: (user: UserInformation) => void, // function type
): ColumnDef<UserInformation>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey : "providerId",
    header: "Provider ID",
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => {
      const emailVerified = row.getValue("emailVerified") as boolean;
      return emailVerified ? "Yes" : "No";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
            onClick={() => {
              console.log("Update User Clicked");
              handleUpdateUser(user);
            }}
            >Update User</DropdownMenuItem>

            {user.role !== "admin" && (
              <DropdownMenuItem
              onClick={() => {
                console.log("Delete User clicked");
                handleDeleteUser(user); // Call the delete function and pass the current user
              }}
              >Delete User</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
