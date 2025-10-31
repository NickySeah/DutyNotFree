"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react"; // Import a "remove" icon
import ReactCountryFlag from "react-country-flag";
import { getCountryIsoCode } from "@/utils/countryUtils";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import type { TradeRate } from "@/types/trade";

// This function creates the columns for the Wishlist table
export const createWishlistColumns = (
  onRemove: (tariff: TradeRate) => void // Function to remove from wishlist
): ColumnDef<TradeRate>[] => {
  return [
    // --- Re-using your existing columns (simplified for brevity) ---
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="truncate max-w-xs">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "hsCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN Code" />
      ),
    },
    {
      accessorKey: "exportingFrom",
      header: "Exporting From",
      cell: ({ row }) => {
        const countryName = row.getValue("exportingFrom") as string;
        const countryCode = getCountryIsoCode(countryName);
        return (
          <div className="flex items-center">
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: "2em", height: "2em", marginRight: "8px" }}
            />
            {countryName}
          </div>
        );
      },
    },
    {
      accessorKey: "importingTo",
      header: "Importing To",
      cell: ({ row }) => {
        const countryName = row.getValue("importingTo") as string;
        const countryCode = getCountryIsoCode(countryName);
        return (
          <div className="flex items-center">
            <ReactCountryFlag
              countryCode={countryCode}
              svg
              style={{ width: "2em", height: "2em", marginRight: "8px" }}
            />
            {countryName}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("type")}</div>
      ),
    },
    {
      id: "tariffValue",
      header: "Tariff Value",
      cell: ({ row }) => {
        const rate = row.original.rate;
        const flatFee = row.original.flatFee;
        return (
          <div>
            {flatFee !== null && flatFee > 0 ? `$${flatFee}` : `${rate}%`}
          </div>
        );
      },
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
      id: "isActive",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Status"
            className="text-center"
          />
        );
      },
      cell: ({ row }) => {
        const tradeRate = row.original;
        const currentDate = new Date();
        const effectiveDate = tradeRate.effectiveDate;
        const expirationDate = tradeRate.expirationDate;

        let isActive = false;

        if (effectiveDate) {
          const startOfEffectiveDay = new Date(effectiveDate);
          startOfEffectiveDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000
          const isAfterEffective = currentDate >= startOfEffectiveDay;

          let isBeforeExpiration = true;
          if (expirationDate) {
            const endOfExpirationDay = new Date(expirationDate);
            endOfExpirationDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999
            isBeforeExpiration = currentDate <= endOfExpirationDay;
          }

          isActive = isAfterEffective && isBeforeExpiration;
        }

        return (
          <div className="text-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const currentDate = new Date();

        const getIsActive = (row: Row<TradeRate>) => {
          const effectiveDate = row.original.effectiveDate;
          const expirationDate = row.original.expirationDate;

          if (!effectiveDate) return false;

          const isAfterEffective = currentDate >= new Date(effectiveDate);
          const isBeforeExpiration =
            !expirationDate || currentDate <= new Date(expirationDate);
          return isAfterEffective && isBeforeExpiration;
        };

        const aActive = getIsActive(rowA);
        const bActive = getIsActive(rowB);

        // Active items first
        return bActive ? 1 : aActive ? -1 : 0;
      },
      enableSorting: true,
    },

    // --- The new "Remove" action column ---
    {
      id: "actions",
      cell: ({ row }) => {
        const tradeRate = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(tradeRate)}
            aria-label="Remove from wishlist"
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        );
      },
    },
  ];
};
