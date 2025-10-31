"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Bookmark, BookmarkCheck } from "lucide-react";

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
import type { TradeRate } from "@/types/trade";

// Parent component has the actual logic for modify and delete
// Create Columns function need to call those functions
// So we pass them as parameters to createColumns function
export const createColumns = (
  onModify: (tariff: TradeRate) => void, // this is the function : function type
  onDelete: (tariff: TradeRate) => void,
  onAddToWishlist: (tariff: TradeRate) => void, // <-- ADDED
  onRemoveFromWishlist: (tariff: TradeRate) => void, // <-- ADDED
  wishlistedItemKeys: Set<string>, // <-- ADDED
  isAdmin: boolean,
  isPending: boolean
): ColumnDef<TradeRate>[] => {
  return [
    {
      accessorKey: "description",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Description " />;
      },
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="text-center max-w-xs">
            <span
              className="block truncate cursor-help hover:bg-slate-100 px-2 py-1 rounded transition-colors"
              title={description}
            >
              {description}
            </span>
          </div>
        );
      },
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
          <div className="flex items-center justify-between w-40 min-w-40">
            <span className="truncate pr-2">{countryName}</span>
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
          <div className="flex items-center justify-between w-40 min-w-40">
            <span className="truncate pr-2">{countryName}</span>
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
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("type")}</div>
      ),
    },
    {
      id: "tariffValue",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Tariff Value" />;
      },
      cell: ({ row }) => {
        const tradeRate = row.original;
        const rate = tradeRate.rate;
        const flatFee = tradeRate.flatFee;

        return (
          <div className="text-center">
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
    // {
    //   accessorKey: "expirationDate",
    //   header: () => <div className="text-center">Expiration Date</div>,
    //   cell: ({ row }) => {
    //     const date = new Date(row.getValue("expirationDate"));
    //     return (
    //       <div className="text-center">
    //         {date.toLocaleDateString("en-US", {
    //           year: "numeric",
    //           month: "2-digit",
    //           day: "2-digit",
    //         })}
    //       </div>
    //     );
    //   },
    // },

    {
      id: "actions",
      cell: ({ row }) => {
        const tradeRate = row.original; // Access to this row of data

        // Don't render actions while loading
        if (isPending) {
          return null;
        }

        // --- ADMIN ACTIONS ---
        if (isAdmin) {
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
                  Copy Description
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    console.log("Modify Tariff Details clicked");
                    onModify(tradeRate);
                  }}
                >
                  Modify Tariff Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    console.log("Delete Tariff clicked");
                    onDelete(tradeRate); // Call the delete function and pass the current tradeRate
                  }}
                >
                  Delete Tariff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        // --- USER ACTIONS ---

        // 1. Create the unique key for this tariff (requires codes)
        const key = `${tradeRate.hsCode}-${tradeRate.exportingFromCode}-${tradeRate.importingToCode}`;

        // 2. Check if it's already in the user's wishlist
        const isWishlisted = wishlistedItemKeys.has(key);

        if (isWishlisted) {
          // --- ALREADY WATCHING (GOLD BUTTON) ---
          return (
            <Button
              variant="outline"
              size="sm"
              // Gold/Yellow styling
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
              onClick={() => onRemoveFromWishlist(tradeRate)}
            >
              <BookmarkCheck className="h-4 w-4 mr-2" />
              Watching
            </Button>
          );
        }

        // --- NOT WATCHING (STANDARD BUTTON) ---
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddToWishlist(tradeRate)}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Watch
          </Button>
        );
      },
    },
  ];
};
