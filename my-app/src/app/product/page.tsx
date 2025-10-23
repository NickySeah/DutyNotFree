"use client";

import type { Product } from "@/types/product";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useUserProduct } from "@/hooks/useUserProduct";
import { UpdateProductModal } from "@/components/updateProductModal";
import { DeleteProductModal } from "@/components/deleteProductModal";
import { useState } from "react";
import ProductTableSkeleton from "@/components/productTableSkeleton";
import { useUserRole } from "@/lib/checkRole";

export default function ProductPage() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isAdmin, isPending } = useUserRole();

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
    isAdmin,
    isPending
  );

  const { data: products = [], isLoading, error } = useUserProduct();

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
            <DataTable columns={columns} data={products} />
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
