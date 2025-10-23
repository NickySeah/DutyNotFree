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
// import { getCountryIsoCode } from "@/utils/countryUtils";
// import ReactCountryFlag from "react-country-flag";
// import { getBackendValueFromData} from "@/lib/testData";

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

//   // No Expiration state
//   const [noExpiration, setNoExpiration] = useState(false);

  // Mutation hook
  const { mutate, isPending } = useUpdateProduct();

  // Populate form data when product prop changes
  useEffect(() => {
    if (product && isOpen) {
    //   const hasNoExpiration = !product.expirationDate;
    //   setNoExpiration(hasNoExpiration);

      // Map the TradeRate properties to form data
      setFormData({
        name : product.name || "",
        isPrivate: !! product.isPrivate,
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
            toast.error("name cannot be empty");
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

//   const handleNoExpirationChange = (checked: boolean) => {
//     setNoExpiration(checked);
//     if (checked) {
//       // Clear expiration date when "No Expiration" is checked
//       setFormData((prev) => ({ ...prev, expirationDate: undefined }));
//     }
//   };

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
      product_id: product.product_id, // This one just take from the tariff prop
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
          <div className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-md mt-2">
            name: {product.name}
          </div>
        </DialogHeader>

        

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
