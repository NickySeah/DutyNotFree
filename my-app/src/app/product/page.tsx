"use client";

import type { Product } from "@/types/product";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useUserProduct } from "@/hooks/useUserProduct";
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
  const { userId, isSupplier, isAdmin, isPending } = useUserRole();

  // Column functions
  const handleModifyProduct = (product: Product) => {
    console.log("Modifying product:", product);
    setSelectedProduct(product);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    console.log("Deleting product:", product);
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const columns = createColumns(
    handleModifyProduct,
    handleDeleteProduct,
    isSupplier,
    isAdmin,
    isPending
  );
  
  if (!userId) return null;
  const { data: products = [], isLoading, error } = useUserProduct(userId);

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading products
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <>
          <div className="p-8 mx-auto text-center">
            <h1 className="text-2xl font-bold">Product Catalog</h1>
            <h3 className="text-lg font-medium text-gray-500">
              View, manage and register new products
            </h3>
          </div>

          <div className="container mx-auto p-5">
            {/* HS Code Assistant Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Find HS Codes for Your Products</h2>
              </div>

              {/* AI Assistant */}
              <CompactChatInterface />
            </div>

            {/* Existing Products Table */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Products</h2>
              <DataTable columns={columns} data={products} />
            </div>
          </div>
        </>
      )}

      <div className="p-8 mx-auto text-center">
        <h1 className="text-2xl font-bold">Need help calculating tariffs?</h1>
        <p className="text-lg font-medium text-gray-500 mb-4">
          Use our calculator to determine correct tariffs based on product HS codes.
        </p>
        <Link href="/calculator" className="inline-flex items-center">
          Go to Calculator
          <ArrowRight className="ml-2" />
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
