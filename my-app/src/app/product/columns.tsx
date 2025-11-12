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
import { DataTableColumnHeader } from "@/components/data-table-column-header";

import type { Product } from "@/types/product";

export const createColumns = (
  onModify: (product: Product) => void,
  onDelete: (product: Product) => void,
  isSupplier: boolean,
  isPending: boolean
): ColumnDef<Product>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return (
          <div className="text-center max-w-[150px] md:max-w-xs">
            <span
              className="block truncate cursor-help hover:bg-slate-100 px-2 py-1 rounded transition-colors text-xs md:text-sm"
              title={name}
            >
              {name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "hsCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HS Code" />
      ),
      cell: ({ row }) => (
        <div className="text-center text-xs md:text-sm">
          {row.getValue("hsCode")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="flex justify-center w-full">
            <span
              className="block truncate cursor-help hover:bg-slate-100 px-1 py-1 rounded transition-colors max-w-[200px] md:max-w-2xl text-xs md:text-sm"
              title={description}
            >
              {description}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "isPrivate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Visibility" />
      ),
      cell: ({ row }) => {
        const isPrivate = row.getValue("isPrivate") as boolean;
        return (
          <div className="text-center">
            <span
              className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${
                isPrivate
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isPrivate ? "Private" : "Public"}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.isPrivate ? 1 : 0;
        const b = rowB.original.isPrivate ? 1 : 0;
        return a - b; // Public before Private
      },
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;

        if (isPending || !isSupplier) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-sm">Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(product.name)}
                className="text-xs md:text-sm"
              >
                Copy Product Name
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onModify(product)}
                className="text-xs md:text-sm"
              >
                Modify Product Details
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDelete(product)}
                className="text-xs md:text-sm"
              >
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
