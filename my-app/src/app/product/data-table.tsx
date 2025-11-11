"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/data-table-pagination";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";

import { useUserRole } from "@/lib/checkRole";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CreateProductModal } from "@/components/createProductModal";
import type { Product } from "@/types/product";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { userId, isSupplier, isAdmin, isPending } = useUserRole();

  // Global search only for Product fields
  const globalFilter = (row: any, columnId: string, value: string) => {
    // const name = String(row.getValue("name")).toLowerCase();
    const hsCode = String(row.getValue("hsCode")).toLowerCase();
    const description = String(row.getValue("description")).toLowerCase();
    const searchValue = value.toLowerCase();

    return (
      //   name.includes(searchValue) ||
      hsCode.includes(searchValue) || description.includes(searchValue)
    );
  };

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: globalFilter,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      {/* Search + Create button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center py-3 md:py-4 justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Input
            placeholder="Filter by HS Code or description..."
            value={table.getState().globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-full sm:max-w-sm text-sm"
          />
          <Button
            variant="ghost"
            onClick={() => table.setGlobalFilter("")}
            className="text-sm"
          >
            Clear
          </Button>
        </div>

        {!isPending && isSupplier && (
          <Button
            variant="default"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-sm md:text-base w-full sm:w-auto"
          >
            Create Product
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs md:text-sm">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs md:text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Create Product Modal */}
      <CreateProductModal
        userId={userId || ""}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
