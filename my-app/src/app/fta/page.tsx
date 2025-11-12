"use client";

import type { FTA } from "@/types/fta";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import Link from "next/dist/client/link";
import { ArrowRight } from "lucide-react";
import { useFTAs } from "@/hooks/useFTAs";
import { FTADetailsModal } from "@/components/ftaDetailsModal";
import { UpdateFTAModal } from "@/components/updateFTAModal";
import { DeleteFTAModal } from "@/components/deleteFTAModal";
import { useState } from "react";
import { useUserRole } from "@/lib/checkRole";
import FtaTableSkeleton from "@/components/ftaTableSkeleton";

export default function ProductPage() {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFTA, setSelectedFTA] = useState<FTA | null>(null);
  const { isAdmin, isPending } = useUserRole();

  // This function will be passed to createColumns
  const handleViewDetails = (fta: FTA) => {
    setSelectedFTA(fta);
    setIsDetailsModalOpen(true);
  };

  const handleModifyFTA = (fta: FTA) => {
    console.log("Modifying FTA:", fta);
    setSelectedFTA(fta);
    setIsUpdateModalOpen(true);
  };
  // This is the delete function to be passed to createColumns
  const handleDeleteFTA = (fta: FTA) => {
    console.log("Deleting FTA:", fta);
    setSelectedFTA(fta);
    setIsDeleteModalOpen(true);
  };
  const columns = createColumns({
    onViewDetails: handleViewDetails,
    onModify: handleModifyFTA,
    onDelete: handleDeleteFTA,
    isAdmin,
    isPending,
  });

  const { data: ftas = [], isLoading, error } = useFTAs();

  if (error) {
    console.error("FTA Error:", error);
    return (
      <div className="p-4 md:p-8 text-center">
        <div className="text-red-500 font-bold mb-2 text-sm md:text-base">
          Error loading free trade agreements
        </div>
        <div className="text-xs md:text-sm text-gray-600">
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <FtaTableSkeleton />
      ) : (
        <>
          <div className="p-4 md:p-8 mx-auto text-center">
            <h1 className="text-xl md:text-2xl font-bold">
              Free Trade Agreements
            </h1>
            <h3 className="text-base md:text-lg font-medium text-gray-500">
              View, manage, and define free trade agreements
            </h3>
          </div>
          <div className="container mx-auto p-3 md:p-5">
            <DataTable columns={columns} data={ftas} />
          </div>
        </>
      )}

      <div className="p-4 md:p-8 mx-auto text-center">
        <h1 className="text-xl md:text-2xl font-bold">
          Need help calculating tariffs?
        </h1>
        <p className="text-sm md:text-lg font-medium text-gray-500 mb-4">
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

      {/* View FTA Modal */}
      <FTADetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedFTA(null);
        }}
        fta={selectedFTA}
      />
      {/* Update FTA Modal */}
      <UpdateFTAModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedFTA(null);
        }}
        fta={selectedFTA}
      />
      {/* Delete FTA Modal */}
      <DeleteFTAModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedFTA(null);
        }}
        fta={selectedFTA}
      />
    </div>
  );
}
