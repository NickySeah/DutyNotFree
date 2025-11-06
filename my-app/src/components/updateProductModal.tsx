"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useUpdateProduct } from "@/hooks/useUpdateProduct";
import type { Product } from "@/types/product";
import { Description } from "@radix-ui/react-dialog";

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function UpdateProductModal({isOpen,onClose,product: product,}: UpdateProductModalProps) {

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
        name : product.name || "",
        isPrivate: product.isPrivate,
      });
    }
  }, [product, isOpen]);

  // Reset form data function
  const resetFormData = () => {
    //if (product) setFormData(fillFormFromProduct(product));
    setFormData({
        name : "",
        isPrivate: true,
    });
  };
  // Form validation function
  const validateForm = () => {
        if (!formData.name || formData.name.trim().length === 0) {  // null OR blank name
            toast.error("Product name cannot be empty");
            return false;
        }

        if (typeof formData.isPrivate !== "boolean") {              // somehow non-boolean
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
      product_id: product.product_id, // This one just take from the product prop
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Update Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Product Name
            </h3>

            <div className="space-y-3">
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Current Name:
              </span>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-md">
                <span className="font-bold text-orange-400 text-lg">
                  {product.name}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Name:
                </label>
                <Input
                  placeholder="Enter new product name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                  className="w-full text-lg font-medium"
                />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Product Information
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">HS Code:</span>
                <p className="text-sm text-gray-800 mt-1">
                  {product.hsCode}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Description:</span>
                <p className="text-sm text-gray-800 mt-1">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Visibility Configuration */}
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Product Visibility
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visibility Checkbox */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isPrivate"
                    checked={!formData.isPrivate}                                      // Checked = public, Unchecked = private
                    onCheckedChange={(checked) => handleChange("isPrivate", !checked)} // Negate here
                  />
                  <Label htmlFor="isPrivate" className="text-sm text-gray-700">
                    Visible to Public?
                  </Label>
                </div>
              </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-gray-100">
          <div className="flex space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleUpdate}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Tariff"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
