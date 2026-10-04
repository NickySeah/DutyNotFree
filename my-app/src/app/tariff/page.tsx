"use client";

import type { TradeRate } from "@/types/trade";
import { PageHeader } from "@/components/page-header";
import { DataStatus } from "@/components/data-status";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { createWishlistColumns } from "./wishlistColumns";
import Link from "next/dist/client/link";
import { ArrowRight } from "lucide-react";
import { useTariffs } from "@/hooks/useTariffs";
import { UpdateTariffModal } from "@/components/updateTariffModal";
import { DeleteTariffModal } from "@/components/deleteTariffModal";
import { useState } from "react";
import TariffTableSkeleton from "@/components/tariffTableSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/lib/checkRole";
import { useWishlistData } from "@/hooks/useWishlistData";
import { CreateTariffModal } from "@/components/createTariffModal";
import { Button } from "@/components/ui/button";
import { useDeleteWishlist } from "@/hooks/useDeleteWishlist";
import { useCreateWishlist } from "@/hooks/useCreateWishlist";

export default function ProductPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<TradeRate | null>(null);
  const { isAdmin, isPending, userId } = useUserRole();
  const { mutate: deleteWishlistMutation, isPending: isDeleteWishlistPending } =
    useDeleteWishlist();
  const { mutate: createWishlistMutation } = useCreateWishlist();

  // This function will be passed to createColumns
  const handleModifyTariff = (tariff: TradeRate) => {
    setSelectedTariff(tariff);
    setIsUpdateModalOpen(true);
  };
  // This is the delete function to be passed to createColumns
  const handleDeleteTariff = (tariff: TradeRate) => {
    setSelectedTariff(tariff);
    setIsDeleteModalOpen(true);
  };
  const handleAddToWishlist = (tariff: TradeRate) => {
    if (!userId) {
      console.error("User not logged in");
      // Here you would show a login prompt or toast
      return;
    }

    // Call the mutation from your hook
    createWishlistMutation({
      hsCode: tariff.hsCode,
      exportingCountry: tariff.exportingFromCode,
      importingCountry: tariff.importingToCode,
      userId: userId,
    });
  };

  // Retrieve all tariffs and wishlist data
  const {
    data: allTariffs = [],
    isLoading: isAllTariffsLoading,
    error,
    refetch,
  } = useTariffs();
  const {
    wishlistTariffs,
    wishlistItems,
    isLoading: isWishlistLoading,
    isError: isWishlistError,
    refetch: refetchWishlist,
  } = useWishlistData();

  if (error) {
    return (
      <>
        <PageHeader
          title="Tariff explorer"
          description="Find the duties that apply to your next trade route."
        />
        <DataStatus error retry={() => refetch()} />
      </>
    );
  }

  // Create a Set of wishlisted item keys for quick lookup
  const wishlistedItemKeys = new Set<string>(
    wishlistItems.map(
      (item) =>
        `${item.hsCode}-${item.exportingCountry}-${item.importingCountry}`,
    ),
  );

  // --- 2. Create the helper Map ---
  // This map will let you find a wishlist.id from a tariff's codes
  const tariffToWishlistIdMap = new Map<string, number>();
  wishlistItems.forEach((item) => {
    const key = `${item.hsCode}-${item.exportingCountry}-${item.importingCountry}`;
    tariffToWishlistIdMap.set(key, item.id);
  });

  // Remove from wishlist handler
  const handleRemoveFromWishlist = (tariff: TradeRate) => {
    // Find the wishlist.id using the map and the CODES
    const key = `${tariff.hsCode}-${tariff.exportingFromCode}-${tariff.importingToCode}`;
    const wishlistId = tariffToWishlistIdMap.get(key);

    if (wishlistId) {
      // Call your DELETE API mutation here
      deleteWishlistMutation(wishlistId);
    } else {
      console.error("Could not find wishlist ID for tariff:", tariff);
    }
  };
  // Create Tariff columns
  const allTariffColumns = createColumns(
    handleModifyTariff,
    handleDeleteTariff,
    handleAddToWishlist,
    handleRemoveFromWishlist, // <-- new
    wishlistedItemKeys,
    isAdmin,
    isPending,
  );

  // Create Wishlist columns
  const wishlistTableColumns = createWishlistColumns(handleRemoveFromWishlist);

  return (
    <div>
      <PageHeader
        title="Tariff explorer"
        description="Find the duties that apply to your next trade route."
        actions={
          <span className="rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
            {allTariffs.length} tariff records
          </span>
        }
      />

      <Tabs defaultValue="all" className="data-surface">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="all" className="text-sm md:text-base">
            All Tariffs
          </TabsTrigger>
          <TabsTrigger value="my_wishlist" className="text-sm md:text-base">
            My Watchlist
          </TabsTrigger>
        </TabsList>

        {/* --- "All Tariffs" Tab --- */}
        <TabsContent value="all">
          <div className="flex items-center justify-end py-3 md:py-4">
            {/* "Create" Button is now here, and only on this tab */}
            {!isPending && isAdmin && (
              <Button
                variant="default"
                onClick={() => setIsCreateModalOpen(true)}
                className="text-sm md:text-base"
              >
                Define New Tariff
              </Button>
            )}
          </div>
          {isAllTariffsLoading ? (
            <TariffTableSkeleton />
          ) : (
            <DataTable columns={allTariffColumns} data={allTariffs} />
          )}
        </TabsContent>

        {/* --- "My Wishlist" Tab --- */}
        <TabsContent value="my_wishlist">
          <div className="text-center font-bold text-xs md:text-sm text-muted-foreground p-3 md:p-4 bg-accent border border-border rounded-md mb-4">
            You will receive an email notification for any creations, updates,
            or expirations for tariffs you are watching.
          </div>
          {isWishlistError ? (
            <DataStatus error retry={() => refetchWishlist()} />
          ) : isWishlistLoading ? (
            <TariffTableSkeleton />
          ) : (
            <DataTable columns={wishlistTableColumns} data={wishlistTariffs} />
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">
          Need help calculating tariffs?
        </h2>
        <p className="text-sm md:text-lg font-medium text-muted-foreground mb-4">
          Our calculator can help you determine the correct tariffs and fees for
          your products.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center text-sm md:text-base"
        >
          Go to Calculator
          <ArrowRight className="inline-block ml-2 h-4 w-4 md:h-5 md:w-5" />
        </Link>
      </div>
      {/* Create Tariff Modal */}
      <CreateTariffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {/* Update Tariff Modal */}
      <UpdateTariffModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTariff(null);
        }}
        tariff={selectedTariff}
      />
      {/* Delete Tariff Modal */}
      <DeleteTariffModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTariff(null);
        }}
        tariff={selectedTariff}
      />
    </div>
  );
}
