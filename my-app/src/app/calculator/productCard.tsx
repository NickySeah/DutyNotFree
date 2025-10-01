import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/types/calculator';
import { Box, Move, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const ProductCard = ({
    product,
    updateProduct,
    removeProduct,
    tariffDetails
}: {
    product: Product;
    updateProduct: (id: number, field: keyof Product, value: string | number) => void;
    removeProduct: (id: number) => void;
    tariffDetails?: string;
}) => {
    const [localState, setLocalState] = useState({
        name: product.name,
        value: 0,
        hsCode: product.hsCode,
        quantity: 1
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
        setLocalState(prev => ({ ...prev, [field]: value }));
    };

    const saveChanges = () => {
        Object.entries(localState).forEach(([field, value]) => {
            if (field === "hsCode") return; // skip hsCode if not string/number
            if (product[field as keyof Product] !== value) {
                updateProduct(product.id, field as keyof Product, value as string | number);
            }
        });
    };

    // Generate unique ids for input linking to labels
    const inputId = (field: string) => `product-${product.id}-${field}`;

    return (
        <div
            className={`bg-white p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <Box size={16} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-800">{product.name || 'Unnamed Product'}</h4>
                </div>
                <button
                    onClick={() => removeProduct(product.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    <X size={16} />
                </button>
            </div>

            {/* <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span className="text-gray-600">Value:</span> ${(product.value || 0).toLocaleString()}
                </div>
                <div>
                    <span className="text-gray-600">HS Code:</span> {product.hsCode}
                </div>
                <div>
                    <span className="text-gray-600">Qty:</span> {product.quantity}
                </div>
                <div>
                    <span className="text-gray-600">Rate:</span> {product.tariffRate}%
                </div>
            </div> */}


            <div className="mt-3 space-y-4">
                {/* <div>
                    <Label htmlFor={inputId('name')} className="block text-sm font-medium text-gray-700">
                        Product Name
                    </Label>
                    <Input
                        id={inputId('name')}
                        type="text"
                        value={localState.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Product name"
                        className="w-full px-2 py-1 text-sm border rounded"
                    />
                    </div> */}

                {/* <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={inputId('hsCode')} className="block text-sm font-medium text-gray-700">
                            HS Code
                        </Label>
                        <Input
                            id={inputId('hsCode')}
                            type="text"
                            value={localState.hsCode.code}
                            placeholder="HS Code"
                            className="w-full px-2 py-1 text-sm border rounded disabled"
                            disabled
                        />
                    </div>
                    <div>
                        <Label htmlFor={inputId('tariffRate')} className="block text-sm font-medium text-gray-700">
                            Rate %
                        </Label>
                        <Input
                            id={inputId('tariffRate')}
                            type="number"
                            step="0.1"
                            value={localState.tariffRate}
                            onChange={e => handleChange('tariffRate', Number(e.target.value))}
                            placeholder="Rate %"
                            className="w-full px-2 py-1 text-sm border rounded"
                            disabled
                        />
                    </div>
                </div> */}

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <Label htmlFor={inputId('hsCode')} className="block text-sm font-medium text-gray-700">
                            HS Code
                        </Label>
                        <Input
                            id={inputId('hsCode')}
                            type="text"
                            value={localState.hsCode.code}
                            placeholder="HS Code"
                            className="w-full px-2 py-1 text-sm border rounded disabled"
                            disabled
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={inputId('value')} className="block text-sm font-medium text-gray-700">
                            Value
                        </Label>
                        <Input
                            id={inputId('value')}
                            type="number"
                            value={localState.value}
                            onChange={e => handleChange('value', e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="Value"
                            className="w-full px-2 py-1 text-sm border rounded"
                            min={0}
                        />
                    </div>
                    <div>
                        <Label htmlFor={inputId('quantity')} className="block text-sm font-medium text-gray-700">
                            Quantity
                        </Label>
                        <Input
                            id={inputId('quantity')}
                            type="number"
                            value={localState.quantity}
                            onChange={e => handleChange('quantity', e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="Qty"
                            className="w-full px-2 py-1 text-sm border rounded"
                            min={1}
                        />
                    </div>

                </div>

                <Button
                    onClick={saveChanges}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Save
                </Button>
            </div>

            {/* Tariff Details */}
            {tariffDetails && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium text-gray-700 mb-1">Applicable Tariffs:</div>
                    <div className="text-gray-600">{tariffDetails}</div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
