"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Eye } from "lucide-react";
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
import type { FTA } from "@/types/fta";

// export const columns: ColumnDef<TradeRate>[] = [

// Parent component has the actual logic for modify and delete
// Create Columns function need to call those functions
// So we pass them as parameters to createColumns function
interface CreateColumnsProps {
  onViewDetails: (fta: FTA) => void;
  onModify: (fta: FTA) => void;
  onDelete: (fta: FTA) => void;
  isAdmin: boolean;
  isPending: boolean;
}

export const createColumns = ({
  onViewDetails,
  onModify,
  onDelete,
  isAdmin,
  isPending,
}: CreateColumnsProps): ColumnDef<FTA>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium text-xs md:text-sm">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "partyA",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Party A" />
      ),
      cell: ({ row }) => {
        const partyA = row.getValue("partyA") as FTA["partyA"];
        return (
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
            {/* Party is a country */}
            {partyA.type === "COUNTRY" && (
              <>
                <span className="font-semibold text-xs md:text-sm">
                  {partyA.name}
                </span>
                <ReactCountryFlag
                  countryCode={getCountryIsoCode(partyA.name)}
                  svg
                  style={{ width: "2em", height: "2em" }}
                  className="md:w-12 md:h-12"
                />
              </>
            )}
            {/* Party is a bloc */}
            {partyA.type === "BLOC" && (
              <>
                <span className="font-semibold text-xs md:text-sm">
                  {partyA.bloc?.code}
                </span>
                <span className="text-[10px] md:text-xs bg-accent text-primary px-2 py-1 rounded-full">
                  Bloc
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "partyB",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Party B" />
      ),
      cell: ({ row }) => {
        const partyB = row.getValue("partyB") as FTA["partyB"];
        return (
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
            {/* Party is a country */}
            {partyB.type === "COUNTRY" && (
              <>
                <span className="font-semibold text-xs md:text-sm">
                  {partyB.name}
                </span>
                <ReactCountryFlag
                  countryCode={getCountryIsoCode(partyB.name)}
                  svg
                  style={{ width: "2em", height: "2em" }}
                  className="md:w-12 md:h-12"
                />
              </>
            )}
            {/* Party is a bloc */}
            {partyB.type === "BLOC" && (
              <>
                <span className="font-semibold text-xs md:text-sm">
                  {partyB.bloc?.code}
                </span>
                <span className="text-[10px] md:text-xs bg-accent text-primary px-2 py-1 rounded-full">
                  Bloc
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "excludedTariffLines",
      header: () => (
        <div className="text-left text-xs md:text-sm">Excluded HS codes</div>
      ),
      // header: ({ column }) => (<DataTableColumnHeader column={column} title="Applicable Tariff Lines" />),
      cell: ({ row }) => (
        <div className="text-left font-mono text-xs md:text-sm">
          {row.getValue("excludedTariffLines")?.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "effectiveDate",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Effective Date" />;
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("effectiveDate"));
        return (
          <div className="text-left text-xs md:text-sm">
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
            className="text-left"
          />
        );
      },
      cell: ({ row }) => {
        const fta = row.original;
        const currentDate = new Date();
        const effectiveDate = fta.effectiveDate;
        const expirationDate = fta.expirationDate;

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
          <div className="text-left">
            <span
              className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${
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

        const getIsActive = (row: Row<FTA>) => {
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
    {
      id: "actions",
      cell: ({ row }) => {
        const fta = row.original;

        if (isPending) {
          return null;
        }

        return (
          <div className="flex items-center justify-center space-x-2">
            {/* ONLY ADMIN USERS */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-sm">
                    Actions
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(fta.name)}
                    className="text-xs md:text-sm"
                  >
                    Copy Name
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onViewDetails(fta)}
                    className="text-xs md:text-sm"
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onModify(fta)}
                    className="text-xs md:text-sm"
                  >
                    Modify FTA
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(fta)}
                    className="text-destructive text-xs md:text-sm"
                  >
                    Delete FTA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* ALL OTHER USERS */}
            {!isAdmin && (
              <div className="flex items-center justify-center">
                {/* View Details Button - Always visible */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(fta)}
                  className="flex items-center space-x-1 text-xs md:text-sm"
                  title="View FTA Details"
                >
                  <Eye className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      },
    },
  ];
};
