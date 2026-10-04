"use client";

import type { Product } from "@/types/product";
import { PageHeader } from "@/components/page-header";
import { DataStatus } from "@/components/data-status";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useUserProduct } from "@/hooks/useUserProduct";
import { useProducts } from "@/hooks/useProducts"; // Add this import
import { UpdateProductModal } from "@/components/updateProductModal";
import { DeleteProductModal } from "@/components/deleteProductModal";
import { CompactChatInterface } from "@/components/CompactChatInterface";
import { useState } from "react";
import ProductTableSkeleton from "@/components/productTableSkeleton";
import { useUserRole } from "@/lib/checkRole";
import { Button } from "@/components/ui/button";

export default function ProductPage() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { userId, isSupplier, isImporter, isAdmin, isPending } = useUserRole();

  // Early return after all hooks are called
  // Always call both hooks (React rules of hooks)
  const {
    data: userProducts = [],
    isLoading: isLoadingUserProducts,
    error: userProductsError,
    refetch: refetchUser,
  } = useUserProduct(userId);

  const {
    data: allProducts = [],
    isLoading: isLoadingAllProducts,
    error: allProductsError,
    refetch: refetchAll,
  } = useProducts(userId);

  // Determine which data to use based on role
  const products = isSupplier
    ? userProducts || []
    : ((allProducts || []) as Product[]);
  const isLoading = isSupplier ? isLoadingUserProducts : isLoadingAllProducts;
  const error = isSupplier ? userProductsError : allProductsError;

  // Column functions
  const handleModifyProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const columns = createColumns(
    handleModifyProduct,
    handleDeleteProduct,
    isSupplier || isAdmin,
    isPending,
  );

  if (error) {
    return (
      <>
        <PageHeader
          title="Product library"
          description="Keep your products and classifications ready for the next shipment."
        />
        <DataStatus
          error
          retry={() => {
            refetchUser();
            refetchAll();
          }}
        />
      </>
    );
  }

  return (
    <div>
      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <>
          <PageHeader
            title="Product library"
            description="Keep your products and classifications ready for the next shipment."
          />

          <div className="space-y-6">
            {/* HS Code Assistant Section */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  Find HS Codes for Your Products
                </h2>
              </div>

              {/* AI Assistant */}
              <CompactChatInterface />
            </div>

            {/* Existing Products Table */}
            <div className="data-surface">
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                {isSupplier ? "Your Products" : "All Products"}
              </h2>
              <DataTable columns={columns} data={products} />
            </div>
          </div>
        </>
      )}

      <div className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">
          Need help calculating tariffs?
        </h2>
        <p className="text-sm md:text-lg font-medium text-muted-foreground mb-4">
          Use our calculator to determine correct tariffs based on product HS
          codes.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center text-sm md:text-base"
        >
          Go to Calculator
          <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        </Link>
      </div>

      {/* Update Product Modal */}
      <UpdateProductModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Delete Product Modal */}
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
}
