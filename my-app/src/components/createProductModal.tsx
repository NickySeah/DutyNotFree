
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

import { useCreateProduct } from "@/hooks/useCreateProduct";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}
interface FormData {
    name: string;
  hsCode: string;
  description: string;
  userId: string;
  isPrivate: boolean;
}

const initialFormData: FormData = {
    name: "",
    hsCode: "",
    description: "",
    userId: "", 
    isPrivate: false,

};

export function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    hsCode: "",
    description: "",
    userId: "", // if your backend auto-handles this, you can omit it
    isPrivate: false,
  });

  const { mutate, isPending } = useCreateProduct();

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      hsCode: "",
      description: "",
      userId: "",
      isPrivate: false,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return false;
    }
    if (!formData.hsCode.trim()) {
      toast.error("Please enter an HS Code");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    if (!validateForm()) return;

    mutate(formData, {
      onSuccess: () => {
        toast.success("✅ Product created successfully!");
        resetForm();
        onClose();
      },
      onError: () => {
        toast.error("❌ Failed to create product");
      },
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

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
              placeholder="e.g. Steel Bolts"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          {/* HS Code */}
          <div>
            <Label htmlFor="hsCode" className="block mb-1 text-sm font-medium text-gray-700">
              HS Code
            </Label>
            <Input
              id="hsCode"
              placeholder="e.g. 73181590"
              value={formData.hsCode}
              onChange={(e) => handleChange("hsCode", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Description */}
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
          </div>

          {/* Private checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isPrivate"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => handleChange("isPrivate", !!checked)}
            />
            <Label htmlFor="isPrivate" className="text-sm text-gray-700">
              Make this product private
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
              onClick={handleCreate}
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
