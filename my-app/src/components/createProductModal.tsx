"use client";

import { useState } from "react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";

// Hooks and Data
import { useCreateProduct } from "@/hooks/useCreateProduct";
import { useHsCodes } from "@/hooks/useHsCodes";

interface CreateProductModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  hsCode: string;
  // description: string;
  // userId: string;
  isPrivate: boolean;
}

export function CreateProductModal({ userId, isOpen, onClose }: CreateProductModalProps) {
  const initialFormData: FormData = {   // placed inside function to initiate with userId
      name: "",
      hsCode: "",
      // description: "",
      // userId: userId,    // removed, add when sending payload
      isPrivate: true,
  };

  // Hooks
  const { data: hsCodes, isLoading: hsCodesLoading } = useHsCodes();
  const { mutate, isPending } = useCreateProduct();

  // State
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const hsCodeOptions = hsCodes?.map((hsCode) => ({
    value: hsCode.code,
    label: `${hsCode.code} - ${hsCode.description}`,
  })) || [];

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  // Validation
  const validateForm = (): boolean => {
    const validations = [
      {
        condition: (!formData.name || formData.name.trim().length === 0),
        message: "Please provide a name for your product"
      },
      {
        condition: !formData.hsCode,
        message: "Please select an HS code"
      },
      // {
      //   condition: !formData.isPrivate,
      //   message: "Please select an importing country"
      // }
    ];

    for (const validation of validations) {
      if (validation.condition) {
        toast.error(validation.message);
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const productPayload = {
      name: formData.name,
      hsCode: formData.hsCode,
      isPrivate: formData.isPrivate,
      userId: userId                  // from modal prop
    };

    mutate(productPayload, {
      onSuccess: () => {
        toast.success("Product created successfully!");
        resetForm();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create product");
      },
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  // Render helper
  const renderHsCodeSelection = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        HS Code
      </Label>
      <Combobox
        options={hsCodeOptions}
        value={formData.hsCode}
        onValueChange={(value) => handleChange("hsCode", value)}
        placeholder="Select HS Code"
        searchPlaceholder="Search HS codes..."
        emptyMessage="No HS codes found."
        width="w-full"
        loading={hsCodesLoading}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Create New Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <Label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
              Product Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Steamed Hams"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          {/* HS Code */}
          {renderHsCodeSelection()}

          {/* Description
          <div>
            <Label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="border rounded-md w-full p-2 text-sm min-h-[100px]"
            />
          </div> */}

          {/* Private checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isPrivate"
              checked={!formData.isPrivate}                                      // Checked = public, Unchecked = private
              onCheckedChange={(checked) => handleChange("isPrivate", !checked)} // Negate here
            />
            <Label htmlFor="isPrivate" className="text-sm text-gray-700">
              Make product visible to public?
            </Label>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-gray-100">
          <div className="flex space-x-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
