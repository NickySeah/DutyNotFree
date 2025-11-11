"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import type { Product } from "@/types/product";

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function UpdateProductModal({
  isOpen,
  onClose,
  product: product,
}: UpdateProductModalProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    isPrivate: true,
  });

  // Mutation hook
  const { mutate, isPending } = useUpdateProduct();

  // Populate form data when product prop changes
  useEffect(() => {
    if (product && isOpen) {
      // Map the Product properties to form data
      setFormData({
        name: product.name || "",
        isPrivate: product.isPrivate,
      });
    }
  }, [product, isOpen]);

  // Reset form data function
  const resetFormData = () => {
    setFormData({
      name: "",
      isPrivate: true,
    });
  };

  // Form validation function
  const validateForm = () => {
    if (!formData.name || formData.name.trim().length === 0) {
      toast.error("Product name cannot be empty");
      return false;
    }

    if (typeof formData.isPrivate !== "boolean") {
      toast.error("Invalid value for 'isPrivate'");
      return false;
    }

    return true;
  };

  function handleChange(field: keyof typeof formData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      resetFormData();
      onClose();
    }
  };

  const handleUpdate = () => {
    if (!product?.product_id) {
      toast.error("No Product Id found for update");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const updatePayload = {
      product_id: product.product_id,
      name: formData.name,
      isPrivate: formData.isPrivate,
    };

    mutate(updatePayload, {
      onSuccess: () => {
        toast.success("Product updated successfully!");
        resetFormData();
        onClose();
      },
      onError: (err) => {
        console.error("Failed to update product", err);
        toast.error("Failed to update product");
      },
    });
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl font-semibold text-gray-900">
            Update Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4">
          <div className="bg-white rounded-lg p-2 md:p-3 border-2 border-orange-200">
            <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
              Product Name
            </h3>

            <div className="space-y-2 md:space-y-3">
              <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Current Name:
              </span>
              <div className="flex items-center justify-between p-2 md:p-3 bg-orange-50 rounded-md">
                <span className="font-bold text-orange-400 text-base md:text-lg break-words">
                  {product.name}
                </span>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  New Name:
                </label>
                <Input
                  placeholder="Enter new product name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full text-base md:text-lg font-medium"
                />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-200">
            <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Product Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] md:text-xs text-gray-500">
                  HS Code:
                </span>
                <p className="text-xs md:text-sm text-gray-800 mt-1 font-mono break-all">
                  {product.hsCode}
                </p>
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-gray-500">
                  Description:
                </span>
                <p className="text-xs md:text-sm text-gray-800 mt-1 break-words">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Visibility Configuration */}
          <div className="bg-white rounded-lg p-2 md:p-3 border border-blue-200">
            <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
              Product Visibility
            </h3>

            <div className="grid grid-cols-1 gap-2 md:gap-4">
              {/* Visibility Checkbox */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <Checkbox
                  id="isPrivate"
                  checked={!formData.isPrivate}
                  onCheckedChange={(checked) =>
                    handleChange("isPrivate", !checked)
                  }
                />
                <Label
                  htmlFor="isPrivate"
                  className="text-xs md:text-sm text-gray-700 cursor-pointer"
                >
                  Visible to Public?
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 md:pt-4 border-t border-gray-100">
          <div className="flex flex-col-reverse sm:flex-row space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleUpdate}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs md:text-sm"
            >
              {isPending ? (
                <>
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
