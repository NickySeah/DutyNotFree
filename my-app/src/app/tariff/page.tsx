"use client";

import type { TradeRate } from "@/types/trade";
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
    console.log("Modifying tariff:", tariff);
    setSelectedTariff(tariff);
    setIsUpdateModalOpen(true);
  };
  // This is the delete function to be passed to createColumns
  const handleDeleteTariff = (tariff: TradeRate) => {
    console.log("Deleting tariff:", tariff);
    setSelectedTariff(tariff);
    setIsDeleteModalOpen(true);
  };
  const handleAddToWishlist = (tariff: TradeRate) => {
    if (!userId) {
      console.error("User not logged in");
      // Here you would show a login prompt or toast
      return;
    }
    console.log("Adding to wishlist:", tariff);

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
  } = useTariffs();
  const {
    wishlistTariffs,
    wishlistItems,
    isLoading: isWishlistLoading,
  } = useWishlistData();

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">Error loading tariffs</div>
    );
  }

  // Create a Set of wishlisted item keys for quick lookup
  const wishlistedItemKeys = new Set<string>(
    wishlistItems.map(
      (item) =>
        `${item.hsCode}-${item.exportingCountry}-${item.importingCountry}`
    )
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
      console.log("Deleting wishlist item with ID:", wishlistId);
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
    isPending
  );

  // Create Wishlist columns
  const wishlistTableColumns = createWishlistColumns(handleRemoveFromWishlist);

  return (
    <div>
      <div className="p-8 mx-auto text-center">
        <h1 className="text-2xl font-bold">Tariff Definition</h1>
        <h3 className="text-lg font-medium text-gray-500">
          View, manage, and define tariffs and fees
        </h3>
      </div>

      <Tabs defaultValue="all" className="container mx-auto p-5">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="all">All Tariffs</TabsTrigger>
          <TabsTrigger value="my_wishlist">My Wishlist</TabsTrigger>
        </TabsList>

        {/* --- "All Tariffs" Tab --- */}
        <TabsContent value="all">
          <div className="flex items-center justify-end py-4">
            {/* "Create" Button is now here, and only on this tab */}
            {!isPending && isAdmin && (
              <Button
                variant="default"
                onClick={() => setIsCreateModalOpen(true)}
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
          <div className="text-center font-bold text-md text-muted-foreground p-4 bg-blue-200 border border-blue-200 rounded-md mb-4">
            You will receive an email notification for any creations, updates,
            or expirations for tariffs you are watching.
          </div>
          {isWishlistLoading ? (
            <TariffTableSkeleton />
          ) : (
            <DataTable columns={wishlistTableColumns} data={wishlistTariffs} />
          )}
        </TabsContent>
      </Tabs>

      <div className="p-8 mx-auto text-center">
        <h1 className="text-2xl font-bold">Need help calculating tariffs?</h1>
        <p className="text-lg font-medium text-gray-500 mb-4">
          Our calculator can help you determine the correct tariffs and fees for
          your products.
        </p>
        <Link href="/calculator">
          Go to Calculator
          <ArrowRight className="inline-block ml-2" />
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
