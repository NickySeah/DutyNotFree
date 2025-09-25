import { Product } from '@/types/calculator';
import { Move, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const ProductCard = ({
    product,
    isConsolidated = false,
    updateProduct,
    removeProduct,
    handleDragStart,
    draggedItem
}: {
    product: Product;
    isConsolidated?: boolean;
    updateProduct: (id: number, field: keyof Product, value: string | number) => void;
    removeProduct: (id: number) => void;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, product: Product) => void;
    draggedItem: Product | null;
}) => {
    const [localState, setLocalState] = useState({
        name: product.name,
        value: product.value,
        hsCode: product.hsCode,
        quantity: product.quantity,
        weight: product.weight,
        tariffRate: product.tariffRate,
    });

    useEffect(() => {
        setLocalState({
            name: product.name,
            value: product.value,
            hsCode: product.hsCode,
            quantity: product.quantity,
            weight: product.weight,
            tariffRate: product.tariffRate,
        });
    }, [product]);

    const handleChange = (field: keyof Product, value: any) => {
        setLocalState(prev => ({ ...prev, [field]: value }));
    };

    const saveChanges = () => {
        Object.entries(localState).forEach(([field, value]) => {
            if (product[field as keyof Product] !== value) {
                updateProduct(product.id, field as keyof Product, value);
            }
        });
    };

    // Generate unique ids for input linking to labels
    const inputId = (field: string) => `product-${product.id}-${field}`;

    return (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, product)}
            className={`bg-white p-4 rounded-lg border-2 border-dashed border-gray-200 cursor-move hover:border-blue-400 transition-colors ${draggedItem?.id === product.id ? 'opacity-50' : ''
                } ${isConsolidated ? 'bg-green-50' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <Move size={16} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-800">{product.name || 'Unnamed Product'}</h4>
                </div>
                <button
                    onClick={() => removeProduct(product.id)}
                    className="text-red-500 hover:text-red-700"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
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
            </div>

            {!isConsolidated && (
                <div className="mt-3 space-y-4">
                    <label htmlFor={inputId('name')} className="block text-sm font-medium text-gray-700">
                        Product Name
                    </label>
                    <input
                        id={inputId('name')}
                        type="text"
                        value={localState.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Product name"
                        className="w-full px-2 py-1 text-sm border rounded"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={inputId('value')} className="block text-sm font-medium text-gray-700">
                                Value
                            </label>
                            <input
                                id={inputId('value')}
                                type="number"
                                value={localState.value}
                                onChange={e => handleChange('value', Number(e.target.value))}
                                placeholder="Value"
                                className="w-full px-2 py-1 text-sm border rounded"
                            />
                        </div>
                        <div>
                            <label htmlFor={inputId('hsCode')} className="block text-sm font-medium text-gray-700">
                                HS Code
                            </label>
                            <input
                                id={inputId('hsCode')}
                                type="text"
                                value={localState.hsCode}
                                onChange={e => handleChange('hsCode', e.target.value)}
                                placeholder="HS Code"
                                className="w-full px-2 py-1 text-sm border rounded"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={inputId('quantity')} className="block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <input
                                id={inputId('quantity')}
                                type="number"
                                value={localState.quantity}
                                onChange={e => handleChange('quantity', Number(e.target.value))}
                                placeholder="Qty"
                                className="w-full px-2 py-1 text-sm border rounded"
                            />
                        </div>
                        <div>
                            <label htmlFor={inputId('weight')} className="block text-sm font-medium text-gray-700">
                                Weight
                            </label>
                            <input
                                id={inputId('weight')}
                                type="number"
                                value={localState.weight}
                                onChange={e => handleChange('weight', Number(e.target.value))}
                                placeholder="Weight"
                                className="w-full px-2 py-1 text-sm border rounded"
                            />
                        </div>
                        <div>
                            <label htmlFor={inputId('tariffRate')} className="block text-sm font-medium text-gray-700">
                                Rate %
                            </label>
                            <input
                                id={inputId('tariffRate')}
                                type="number"
                                step="0.1"
                                value={localState.tariffRate}
                                onChange={e => handleChange('tariffRate', Number(e.target.value))}
                                placeholder="Rate %"
                                className="w-full px-2 py-1 text-sm border rounded"
                            />
                        </div>
                    </div>

                    <button
                        onClick={saveChanges}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
