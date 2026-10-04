"use client";

import type { FTA } from "@/types/fta";
import { PageHeader } from "@/components/page-header";
import { DataStatus } from "@/components/data-status";
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
    setSelectedFTA(fta);
    setIsUpdateModalOpen(true);
  };
  // This is the delete function to be passed to createColumns
  const handleDeleteFTA = (fta: FTA) => {
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

  const { data: ftas = [], isLoading, error, refetch } = useFTAs();

  if (error) {
    return (
      <>
        <PageHeader
          title="Trade agreements"
          description="Explore the agreements that connect your markets."
        />
        <DataStatus error retry={() => refetch()} />
      </>
    );
  }

  return (
    <div>
      {isLoading ? (
        <FtaTableSkeleton />
      ) : (
        <>
          <PageHeader
            title="Trade agreements"
            description="Explore the agreements that connect your markets."
            actions={
              <span className="rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
                {ftas.length} agreements
              </span>
            }
          />
          <div className="data-surface">
            <DataTable columns={columns} data={ftas} />
          </div>
        </>
      )}

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
