"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/data-table-pagination";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getCoreRowModel,
  useReactTable,
  Row
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

import { CreateTariffModal } from "@/components/createTariffModal";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAdmin, isPending } = useUserRole();

  const globalFilter = (row: Row<TData>, columnId: string, value: string) => {
    const description = String(row.getValue("description")).toLowerCase();
    const hsCode = String(row.getValue("hsCode")).toLowerCase();
    const exportingFrom = String(row.getValue("exportingFrom")).toLowerCase();
    const importingTo = String(row.getValue("importingTo")).toLowerCase();
    // Add more fields as needed
    const searchValue = value.toLowerCase();

    return (
      description.includes(searchValue) ||
      hsCode.includes(searchValue) ||
      exportingFrom.includes(searchValue) ||
      importingTo.includes(searchValue)
    );
  };

  const [sorting, setSorting] = useState<SortingState>([
    // {
    //   id: "effectiveDate",
    //   desc: true, // Initialize with default sorting
    // },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: globalFilter,
    state: {
      sorting,
      columnFilters,
    },
  });


  return (
    <div>
      <div className="flex items-center py-4 justify-between">
        <div className="flex items-center space-x-2 w-md">
          <Input
            placeholder="Filter by description or HsCode or Country..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            className="max-w-sm"
          />
          <Button
            variant="ghost"
            onClick={() => {
              table.setGlobalFilter("");
            }}
          >
            Clear
          </Button>
        </div>
        {!isPending && isAdmin && (
          <Button
            variant="default"
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            Define New Tariff
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Create Tariff Modal */}
      <CreateTariffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
