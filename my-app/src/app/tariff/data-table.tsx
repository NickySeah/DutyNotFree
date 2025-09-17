"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { ArrowRight } from "lucide-react";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { countries, typeOfTariffs } from "@/lib/testData";

import { useCreateTariff } from "@/hooks/useCreateTariff";
import { se } from "date-fns/locale";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isAdmin } = useUserRole();
  
  const [formData, setFormData] = useState({
    exportingCountry: "",
    importingCountry: "",
    description: "",
    tariffRate: 0,
    tariffType: "",
    hsnCode: "",
    effectiveDate: undefined as Date | undefined,
    expirationDate: undefined as Date | undefined,
  });

  const validateForm = () => {
    if (!formData.exportingCountry) {
      toast.error("Please select an exporting country");
      return false;
    }

    if (!formData.importingCountry) {
      toast.error("Please select an importing country");
      return false;
    }

    if (formData.exportingCountry === formData.importingCountry) {
      toast.error("Exporting and importing countries cannot be the same");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a tariff description");
      return false;
    }

    if (formData.tariffRate < 0) {
      toast.error("Please enter a valid tariff rate greater or equals to 0");
      return false;
    }

    if (formData.tariffRate > 100) {
      toast.error("Tariff rate cannot exceed 100%");
      return false;
    }

    if (!formData.tariffType) {
      toast.error("Please select a tariff type");
      return false;
    }

    if (!formData.hsnCode.trim()) {
      toast.error("Please enter an HSN code");
      return false;
    }

    // HSN code validation (should be 6-8 digits)
    if (!/^\d{6,8}$/.test(formData.hsnCode)) {
      toast.error("HSN code must be 6-8 digits");
      return false;
    }

    if (!formData.effectiveDate) {
      toast.error("Please select an effective date");
      return false;
    }

    if (!formData.expirationDate) {
      toast.error("Please select an expiration date");
      return false;
    }

    if (formData.expirationDate <= formData.effectiveDate) {
      toast.error("Expiration date must be after effective date");
      return false;
    }

    return true;
  };

  const { mutate, isPending, isError } = useCreateTariff();

  function handleChange(
    field: keyof typeof formData,
    value: string | Date | undefined | number
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const globalFilter = (row: any, columnId: string, value: string) => {
    const description = String(row.getValue("description")).toLowerCase();
    const hsCode = String(row.getValue("hsCode")).toLowerCase();
    const searchValue = value.toLowerCase();

    return description.includes(searchValue) || hsCode.includes(searchValue);
  };

  const [sorting, setSorting] = useState<SortingState>([]);
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
            placeholder="Filter by description or HsCode..."
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
        {isAdmin() &&
        <Button
          variant="default"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Define New Tariff
        </Button>
}
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

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setFormData({
              exportingCountry: "",
              importingCountry: "",
              description: "",
              tariffRate: 0,
              tariffType: "",
              hsnCode: "",
              effectiveDate: undefined,
              expirationDate: undefined,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Define New Tariff</DialogTitle>
          </DialogHeader>

          <div className="mt-2 flex flex-row justify-between">
            <div>
              <Select
                onValueChange={(val) => handleChange("exportingCountry", val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Exporting Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="self-center">
              <ArrowRight />
            </div>

            <div>
              <Select
                onValueChange={(val) => handleChange("importingCountry", val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Importing Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Input
              placeholder="Tariff Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-row space-x-4">
            <Input
              placeholder="Tariff Rate (%)"
              type="number"
              value={formData.tariffRate}
              onChange={(e) =>
                handleChange(
                  "tariffRate",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <Select onValueChange={(val) => handleChange("tariffType", val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tariff Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOfTariffs.map((tariff) => (
                  <SelectItem key={tariff} value={tariff}>
                    {tariff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <Input
              placeholder="HSN Code"
              value={formData.hsnCode}
              onChange={(e) => handleChange("hsnCode", e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-row justify-between">
            {/* Effective Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.effectiveDate
                    ? format(formData.effectiveDate, "PPP")
                    : "Effective Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={formData.effectiveDate}
                  onSelect={(date) => handleChange("effectiveDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Expiration Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expirationDate
                    ? format(formData.expirationDate, "PPP")
                    : "Expiration Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={formData.expirationDate}
                  onSelect={(date) => handleChange("expirationDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => {
                if (!validateForm()) {
                  return;
                }

                const tariffPayload = {
                  ...formData,
                  effectiveDate: formData.effectiveDate!, // Non-null assertion since validation passed
                  expirationDate: formData.expirationDate!, // Non-null assertion since validation passed
                };
                mutate(tariffPayload, {
                  onSuccess: () => {
                    toast.success("Tariff created successfully!");
                    setIsModalOpen(false);
                    setFormData({
                      exportingCountry: "",
                      importingCountry: "",
                      description: "",
                      tariffRate: 0,
                      tariffType: "",
                      hsnCode: "",
                      effectiveDate: undefined,
                      expirationDate: undefined,
                    });
                  },
                  onError: (err) => {
                    console.error("Failed to create tariff", err);
                    toast.error("Failed to create tariff");
                    setIsModalOpen(false);
                    setFormData({
                      exportingCountry: "",
                      importingCountry: "",
                      description: "",
                      tariffRate: 0,
                      tariffType: "",
                      hsnCode: "",
                      effectiveDate: undefined,
                      expirationDate: undefined,
                    });
                  },
                });
              }}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
