"use client";

import type { TradeRate } from "@/types/trade";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import Link from "next/dist/client/link";
import { ArrowRight } from "lucide-react";
import { useTariffs } from "@/hooks/useTariffs";
import { UpdateTariffModal } from "@/components/updateTariffModal";
import { DeleteTariffModal } from "@/components/deleteTariffModal";
import { useState } from "react";
import TariffTableSkeleton from "@/components/tariffTableSkeleton";
import { useUserRole } from "@/lib/checkRole";

export default function ProductPage() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<TradeRate | null>(null);
  const { isAdmin, isPending } = useUserRole();

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

  const columns = createColumns(handleModifyTariff, handleDeleteTariff, isAdmin, isPending);

  const { data: tariffs = [], isLoading, error } = useTariffs();

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">Error loading tariffs</div>
    );
  }

  // Need to replace with real data fetching logic
  // For now, using dummy data
  // const dummyData: TradeRate[] = [
  //   {
  //     tariff_id: 1,
  //     description: "Product A",
  //     hsCode: "HSN123",
  //     exportingFrom: "United States",
  //     importingTo: "Country B",
  //     type: "Tariff",
  //     rate: 5,
  //     effectiveDate: new Date(),
  //     expirationDate: new Date(),
  //   },
  //   {
  //     tariff_id : 2,
  //     description: "Product B",
  //     hsCode: "HSN124",
  //     exportingFrom: "Country A",
  //     importingTo: "Singapore",
  //     type: "Duty",
  //     rate: 10,
  //     effectiveDate: new Date(),
  //     expirationDate: new Date(),
  //   },
  // ];

  return (
    <div>

        {isLoading ? (
          <TariffTableSkeleton />
        ) : (
          <>
          <div className="p-8 mx-auto text-center">
            <h1 className="text-2xl font-bold">Tariff Definition</h1>
            <h3 className="text-lg font-medium text-gray-500">
              View, manage, and define tariffs and fees
             </h3>
         </div>
           <div className="container mx-auto p-5">
           <DataTable columns={columns} data={tariffs} />
          </div>
          </>
        )}

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
