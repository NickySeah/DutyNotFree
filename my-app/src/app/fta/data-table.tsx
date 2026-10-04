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
  Row,
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

import { CreateFTAModal } from "@/components/createFTAModal";
import { FTA } from "@/types/fta";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
// no wrong file data imported in columns.tsx
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAdmin, isPending } = useUserRole();

  // What can be filtered
  const globalFilter = (row: Row<TData>, columnId: string, value: string) => {
    const name = String(row.getValue("name")).toLowerCase();
    const partyA = row.getValue("partyA") as FTA["partyA"];
    const partyB = row.getValue("partyB") as FTA["partyB"];

    const partyAName = partyA.name.toLowerCase();
    const partyBName = partyB.name.toLowerCase();

    const searchValue = value.toLowerCase();

    return (
      name.includes(searchValue) ||
      partyAName.includes(searchValue) ||
      partyBName.includes(searchValue)
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center py-3 md:py-4 justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          {/*Search Bar*/}
          <Input
            aria-label="Search records"
            placeholder="Filter by name or party..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            className="w-full sm:max-w-sm text-sm"
          />
          <Button
            variant="ghost"
            onClick={() => {
              table.setGlobalFilter("");
            }}
            className="text-sm"
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
            className="text-sm md:text-base w-full sm:w-auto"
          >
            Define New FTA
          </Button>
        )}
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs md:text-sm">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                    <TableCell key={cell.id} className="text-xs md:text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Create Tariff Modal */}
      <CreateFTAModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
