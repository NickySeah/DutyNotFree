"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactCountryFlag from "react-country-flag";
import { getCountryIsoCode } from "@/utils/countryUtils";

import { DataTableColumnHeader } from "@/components/data-table-column-header";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import type { TradeRate } from "@/types/trade";

// export const columns: ColumnDef<TradeRate>[] = [
export const createColumns = (onModify: (tariff: TradeRate) => void): ColumnDef<TradeRate>[] => [
  {
    accessorKey: "description",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Description " />;
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "hsCode",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="HSN Code" />;
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("hsCode")}</div>
    ),
  },
  {
    accessorKey: "exportingFrom",
    header: () => <div className="">Exporting From</div>,
    cell: ({ row }) => {
      const countryName = row.getValue("exportingFrom") as string;
      const countryCode = getCountryIsoCode(countryName);
      return (
        <div className="flex items-center gap-2">
          {countryName}
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{ width: "3em", height: "3em" }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "importingTo",
    header: () => <div className="">Importing To</div>,
    cell: ({ row }) => {
      const countryName = row.getValue("importingTo") as string;
      const countryCode = getCountryIsoCode(countryName);
      return (
        <div className="flex items-center gap-2">
          {countryName}
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{ width: "3em", height: "3em" }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("type")}</div>,
  },
  {
    accessorKey: "rate",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Rate" />;
    },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("rate")}%</div>
    ), //Cell rendering with percentage
  },
  {
    accessorKey: "effectiveDate",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Effective Date" />;
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("effectiveDate"));
      return (
        <div className="text-center">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "expirationDate",
    header: () => <div className="text-center">Expiration Date</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("expirationDate"));
      return (
        <div className="text-center">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tradeRate = row.original;

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
              onClick={() =>
                navigator.clipboard.writeText(tradeRate.description)
              }
            >
              Copy trade rate product description
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                console.log("Modify Tariff Details clicked")
                onModify(tradeRate);
              }}
            >
              Modify Tariff Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
