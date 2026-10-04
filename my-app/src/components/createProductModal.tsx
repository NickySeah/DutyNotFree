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
  isPrivate: boolean;
}

export function CreateProductModal({
  userId,
  isOpen,
  onClose,
}: CreateProductModalProps) {
  const initialFormData: FormData = {
    name: "",
    hsCode: "",
    isPrivate: true,
  };

  // Hooks
  const { data: hsCodes, isLoading: hsCodesLoading } = useHsCodes();
  const { mutate, isPending } = useCreateProduct();

  // State
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const hsCodeOptions =
    hsCodes?.map((hsCode) => ({
      value: hsCode.code,
      label: `${hsCode.code} - ${hsCode.description}`,
    })) || [];

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  // Validation
  const validateForm = (): boolean => {
    const validations = [
      {
        condition: !formData.name || formData.name.trim().length === 0,
        message: "Please provide a name for your product",
      },
      {
        condition: !formData.hsCode,
        message: "Please select an HS code",
      },
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
      userId: userId,
    };

    mutate(productPayload, {
      onSuccess: () => {
        toast.success("Product created successfully!");
        resetForm();
        onClose();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Failed to create product",
        );
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
      <Label className="text-xs md:text-sm font-medium text-foreground">
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
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl font-semibold text-foreground">
            Create New Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4">
          {/* Product Name */}
          <div>
            <Label
              htmlFor="name"
              className="block mb-1 text-xs md:text-sm font-medium text-foreground"
            >
              Product Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Steamed Hams"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full text-sm"
            />
          </div>

          {/* HS Code */}
          {renderHsCodeSelection()}

          {/* Private checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isPrivate"
              checked={!formData.isPrivate}
              onCheckedChange={(checked) => handleChange("isPrivate", !checked)}
            />
            <Label
              htmlFor="isPrivate"
              className="text-xs md:text-sm text-foreground cursor-pointer"
            >
              Make product visible to public?
            </Label>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border">
          <div className="flex flex-col-reverse sm:flex-row space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto text-sm"
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
