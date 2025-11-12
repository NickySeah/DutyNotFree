import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/calculator";
import {
  Box,
  // Move,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";

const ProductCard = ({
  product,
  updateProduct,
  removeProduct,
  tariffDetails,
}: {
  product: Product;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  removeProduct: (id: number) => void;
  tariffDetails?: string;
}) => {
  const [localState, setLocalState] = useState({
    name: product.name,
    value: 0,
    hsCode: product.hsCode,
    quantity: 1,
  });

  useEffect(() => {
    setLocalState({
      name: product.name,
      value: product.value || 0,
      hsCode: product.hsCode,
      quantity: product.quantity || 1,
    });
  }, [product]);

  const handleChange = (field: keyof Product, value: string | number) => {
    setLocalState((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = () => {
    const updates: Partial<Product> = {};

    // Check each field and add to updates if changed
    if (localState.name !== product.name) {
      updates.name = localState.name;
    }
    if (localState.value !== product.value) {
      updates.value = localState.value;
    }
    if (localState.quantity !== product.quantity) {
      updates.quantity = localState.quantity;
    }

    // Only call updateProduct if there are actual changes
    if (Object.keys(updates).length > 0) {
      updateProduct(product.id, updates);
    }
  };

  // Generate unique ids for input linking to labels
  const inputId = (field: string) => `product-${product.id}-${field}`;

  return (
    <div
      className={`bg-white p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Box size={14} className="text-gray-400" />
          <h4 className="font-semibold text-gray-800 text-xs md:text-sm">
            {product.name || "Unnamed Product"}
          </h4>
        </div>
        <button
          onClick={() => removeProduct(product.id)}
          className="text-red-500 hover:text-red-700"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-3 space-y-3 md:space-y-4">
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          <div>
            <Label
              htmlFor={inputId("hsCode")}
              className="block text-xs md:text-sm font-medium text-gray-700"
            >
              HS Code
            </Label>
            <Input
              id={inputId("hsCode")}
              type="text"
              value={localState.hsCode.code}
              placeholder="HS Code"
              className="w-full px-2 py-1 text-xs md:text-sm border rounded disabled"
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div>
            <Label
              htmlFor={inputId("value")}
              className="block text-xs md:text-sm font-medium text-gray-700"
            >
              Value
            </Label>
            <Input
              id={inputId("value")}
              type="number"
              value={localState.value}
              onChange={(e) =>
                handleChange(
                  "value",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="Value"
              className="w-full px-2 py-1 text-xs md:text-sm border rounded"
              min={0}
            />
          </div>
          <div>
            <Label
              htmlFor={inputId("quantity")}
              className="block text-xs md:text-sm font-medium text-gray-700"
            >
              Quantity
            </Label>
            <Input
              id={inputId("quantity")}
              type="number"
              value={localState.quantity}
              onChange={(e) =>
                handleChange(
                  "quantity",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="Qty"
              className="w-full px-2 py-1 text-xs md:text-sm border rounded"
              min={1}
            />
          </div>
        </div>

        <Button
          onClick={saveChanges}
          className="mt-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs md:text-sm w-full"
        >
          Save
        </Button>
      </div>

      {/* Tariff Details */}
      {tariffDetails && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-[10px] md:text-xs">
          <div className="font-medium text-gray-700 mb-1">
            Applicable Tariffs:
          </div>
          <div className="text-gray-600 whitespace-pre-line">
            {tariffDetails}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
