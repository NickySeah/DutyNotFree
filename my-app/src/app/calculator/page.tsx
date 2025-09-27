'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './productCard';
import { Product, ProductCategory } from '@/types/calculator';
import {
    Calculator,
    Package,
    DollarSign,
    Percent,
    Info,
    Plus,
    X,
    Move,
    Globe,
    ArrowRight,
    Trash2,
    CalendarIcon,
    ArrowRightLeft
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const TariffCalculator = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [consolidatedProducts, setConsolidatedProducts] = useState<Product[]>([]);
    const [countries, setCountries] = useState({
        origin: 'US',
        destination: 'EU'
    });
    const [draggedItem, setDraggedItem] = useState<Product | null>(null);
    const [results, setResults] = useState({
        totalValue: 0,
        totalTariff: 0,
        totalVAT: 0,
        totalAdditional: 0,
        totalCost: 0,
        effectiveRate: 0
    });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [tariffDate, setTariffDate] = useState<Date | undefined>(undefined);


    // Country-specific tariff data
    const countryData = {
        'US': { name: 'United States', vatRate: 0, currency: 'USD' },
        'EU': { name: 'European Union', vatRate: 20, currency: 'EUR' },
        'UK': { name: 'United Kingdom', vatRate: 20, currency: 'GBP' },
        'CN': { name: 'China', vatRate: 13, currency: 'CNY' },
        'JP': { name: 'Japan', vatRate: 10, currency: 'JPY' },
        'CA': { name: 'Canada', vatRate: 5, currency: 'CAD' },
        'AU': { name: 'Australia', vatRate: 10, currency: 'AUD' },
        'IN': { name: 'India', vatRate: 18, currency: 'INR' }
    };


    // Trade agreement multipliers
    const tradeAgreements: { [key: string]: number } = {
        'US-EU': 0.85,
        'US-UK': 0.9,
        'EU-UK': 0.95,
        'US-CA': 0.7,
        'default': 1.0
    };


    // Product categories with HS codes and tariff rates
    const productCategories: ProductCategory[] = [
        { id: 1, name: 'Electronics', hsCode: '8517', baseRate: 5.5, category: 'Technology' },
        { id: 2, name: 'Textiles', hsCode: '6109', baseRate: 8.2, category: 'Clothing' },
        { id: 3, name: 'Automobiles', hsCode: '8703', baseRate: 10.0, category: 'Automotive' },
        { id: 4, name: 'Agricultural Products', hsCode: '0801', baseRate: 2.3, category: 'Food' },
        { id: 5, name: 'Steel Products', hsCode: '7208', baseRate: 15.0, category: 'Materials' },
        { id: 6, name: 'Chemicals', hsCode: '2902', baseRate: 3.7, category: 'Industrial' },
        { id: 7, name: 'Pharmaceuticals', hsCode: '3004', baseRate: 0.0, category: 'Medical' },
        { id: 8, name: 'Machinery', hsCode: '8419', baseRate: 2.2, category: 'Industrial' }
    ];

    const sampleProductList: Product[] = [
        // Initial sample product
        { id: 1, name: 'Smartphone', hsCode: '8517', value: 300, quantity: 10, tariffRate: 5.5, category: 'Electronics' },
        { id: 2, name: 'Jeans', hsCode: '6109', value: 50, quantity: 20, tariffRate: 8.2, category: 'Textiles' },
        { id: 3, name: 'Car', hsCode: '8703', value: 20000, quantity: 2, tariffRate: 10.0, category: 'Automobiles' },
        { id: 4, name: 'Laptop', hsCode: '8471', value: 1200, quantity: 5, tariffRate: 3.0, category: 'Electronics' },
        { id: 5, name: 'T-Shirt', hsCode: '6109', value: 20, quantity: 50, tariffRate: 8.2, category: 'Textiles' },
        { id: 6, name: 'Tablet', hsCode: '8471', value: 400, quantity: 15, tariffRate: 3.0, category: 'Electronics' },
        { id: 7, name: 'Headphones', hsCode: '8518', value: 150, quantity: 25, tariffRate: 4.0, category: 'Electronics' },
        { id: 8, name: 'Sneakers', hsCode: '6404', value: 80, quantity: 30, tariffRate: 6.5, category: 'Footwear' }
    ];


    const addProduct = () => {
        // const newProduct = {
        //     id: Date.now(),
        //     name: '',
        //     hsCode: '',
        //     value: 0,
        //     quantity: 1,
        //     tariffRate: 0,
        //     category: 'Electronics'
        // };
        if (!selectedProduct) return;
        setProducts([...products, { ...selectedProduct, id: Date.now() }]);
        setSelectedProduct(null);
    };


    const updateProduct = (id: number, field: keyof Product, value: string | number) => {
        setProducts(products.map(product =>
            product.id === id ? { ...product, [field]: value } : product
        ));
    };

    // Remove product entirely
    const removeProduct = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
        setConsolidatedProducts(consolidatedProducts.filter(p => p.id !== id));
    };

    // Remove only from consolidated shipment
    const removeFromConsolidated = (id: number) => {
        setConsolidatedProducts(consolidatedProducts.filter(p => p.id !== id));
    };


    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, product: Product) => {
        setDraggedItem(product);
        e.dataTransfer.effectAllowed = 'move';
    };


    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };


    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetZone: string) => {
        e.preventDefault();
        if (!draggedItem) return;


        if (targetZone === 'consolidated') {
            // Add to consolidated if not already there
            if (!consolidatedProducts.find(p => p.id === draggedItem.id)) {
                setConsolidatedProducts([...consolidatedProducts, draggedItem]);
            }
        } else if (targetZone === 'products') {
            // Remove from consolidated
            setConsolidatedProducts(consolidatedProducts.filter(p => p.id !== draggedItem.id));
        }
        setDraggedItem(null);
    };


    const loadSampleProduct = (category: ProductCategory) => {
        const product = {
            id: Date.now(),
            name: category.name,
            hsCode: category.hsCode,
            value: Math.floor(Math.random() * 50000) + 10000,
            quantity: Math.floor(Math.random() * 100) + 10,
            tariffRate: category.baseRate,
            category: category.name
        };
        setProducts([...products, product]);
    };


    const calculateTariffs = () => {
        const productsToCalculate = consolidatedProducts.length > 0 ? consolidatedProducts : products;


        let totalValue = 0;
        let totalTariff = 0;
        let totalVAT = 0;
        let totalAdditional = 0;


        const tradeKey = `${countries.origin}-${countries.destination}`;
        const tradeMultiplier = tradeAgreements[tradeKey] || tradeAgreements.default;
        const destinationVATRate = countryData[countries.destination as keyof typeof countryData]?.vatRate || 0;


        productsToCalculate.forEach(product => {
            const productValue = product.value || 0;
            const tariffRate = product.tariffRate || 0;


            // Apply trade agreement discount
            const adjustedTariffRate = tariffRate * tradeMultiplier;
            const tariffAmount = (productValue * adjustedTariffRate) / 100;


            // VAT calculated on duty-paid value
            const dutyPaidValue = productValue + tariffAmount;
            const vatAmount = (dutyPaidValue * destinationVATRate) / 100;


            // Additional duties (anti-dumping, safeguard, etc.)
            const additionalAmount = (productValue * 1) / 100; // 1% example


            totalValue += productValue;
            totalTariff += tariffAmount;
            totalVAT += vatAmount;
            totalAdditional += additionalAmount;
        });


        const totalCost = totalValue + totalTariff + totalVAT + totalAdditional;
        const effectiveRate = totalValue > 0 ? ((totalCost - totalValue) / totalValue) * 100 : 0;


        setResults({
            totalValue,
            totalTariff,
            totalVAT,
            totalAdditional,
            totalCost,
            effectiveRate
        });
    };


    useEffect(() => {
        calculateTariffs();
    }, [products, consolidatedProducts, countries]);


    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <Calculator className="text-blue-600" size={32} />
                    <h1 className="text-3xl font-bold text-gray-800">Multi-Product Import/Export Calculator</h1>
                </div>

                {/* Country Selection */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Globe className="text-blue-600" size={20} />
                        <h2 className="text-xl font-semibold">Trade Route</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-1">From</Label>
                            <Select
                                value={countries.origin}
                                onValueChange={(value) => setCountries({ ...countries, origin: value })}
                            >
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Countries</SelectLabel>
                                        {Object.entries(countryData).filter(([code]) => code !== countries.destination).map(([code, data]) => (
                                            <SelectItem key={code} value={code}>
                                                {data.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div
                            className="flex items-center justify-center mt-6 cursor-pointer group relative"
                            onClick={() => setCountries(({ origin, destination }) => ({ origin: destination, destination: origin }))}
                        >
                            <ArrowRight
                                className="text-gray-400 group-hover:hidden"
                                size={20}
                            />
                            <ArrowRightLeft
                                className="text-blue-500 hidden group-hover:inline"
                                size={20}
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-1">To</Label>
                            <Select value={countries.destination} onValueChange={(value) => setCountries({ ...countries, destination: value })}>
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Countries</SelectLabel>
                                        {Object.entries(countryData).filter(([code]) => code !== countries.origin).map(([code, data]) => (
                                            <SelectItem key={code} value={code}>
                                                {data.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Input for selecting tariff date */}
                        <div>
                            <Label htmlFor="tariffDate" className="block text-sm font-medium text-gray-700 ml-6">Tariff Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        data-empty={!tariffDate}
                                        className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                                    >
                                        <CalendarIcon />
                                        {tariffDate ? format(tariffDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={tariffDate} onSelect={setTariffDate} />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="ml-4 text-sm text-gray-600">
                            {(() => {
                                const tradeKey = `${countries.origin}-${countries.destination}`;
                                const multiplier = tradeAgreements[tradeKey] || tradeAgreements.default;
                                return multiplier < 1 ?
                                    `Trade Agreement: ${Math.round((1 - multiplier) * 100)}% discount` :
                                    'Standard tariff rates';
                            })()}
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Management */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product List */}
                        <div
                            className="min-h-[300px] bg-blue-50 p-4 rounded-lg border-2 border-dashed border-blue-300"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'products')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Package className="text-blue-600" size={18} />
                                    Products ({products.length})
                                </h3>
                                <div>
                                    {/* Select product from product list */}
                                    <Select onValueChange={(value) => {
                                        const product = sampleProductList.find(prod => prod.id.toString() === value);
                                        setSelectedProduct(product || null);
                                    }} value={selectedProduct?.id.toString() || ''}>
                                        <SelectTrigger className="w-[280px]">
                                            <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Products</SelectLabel>
                                                {sampleProductList.map(product => (
                                                    <SelectItem key={product.id} value={product.id.toString()}>
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button disabled={selectedProduct === null} onClick={addProduct}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    <Plus size={16} />
                                    Add Product
                                </Button>
                            </div>


                            {products.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No products added yet. Click &quot;Add Product&quot;</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            updateProduct={updateProduct}
                                            removeProduct={removeProduct}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Results Panel */}
                    <div className="space-y-6">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <DollarSign className="text-yellow-600" size={20} />
                                Import Cost Calculation
                            </h2>


                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-md">
                                    <div className="text-sm text-gray-600">Total Goods Value</div>
                                    <div className="text-lg font-semibold">{countryData[countries.destination as keyof typeof countryData]?.currency} {results.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                </div>


                                <div className="bg-white p-3 rounded-md">
                                    <div className="text-sm text-gray-600">Tariff Amount</div>
                                    <div className="text-lg font-semibold text-red-600">{countryData[countries.destination as keyof typeof countryData]?.currency} {results.totalTariff.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                </div>


                                <div className="bg-white p-3 rounded-md">
                                    <div className="text-sm text-gray-600">VAT ({countryData[countries.destination as keyof typeof countryData]?.vatRate || 0}%)</div>
                                    <div className="text-lg font-semibold text-orange-600">{countryData[countries.destination as keyof typeof countryData]?.currency} {results.totalVAT.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                </div>


                                <div className="bg-white p-3 rounded-md">
                                    <div className="text-sm text-gray-600">Additional Duties</div>
                                    <div className="text-lg font-semibold text-purple-600">{countryData[countries.destination as keyof typeof countryData]?.currency} {results.totalAdditional.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                </div>


                                <div className="bg-gray-800 text-white p-4 rounded-md">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-300">Total Landed Cost</div>
                                        <div className="text-2xl font-bold">{countryData[countries.destination as keyof typeof countryData]?.currency} {results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            Effective Rate: {results.effectiveRate.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="mt-4 text-xs text-gray-600">
                                Calculating: {consolidatedProducts.length > 0 ? `${consolidatedProducts.length} consolidated products` : `All ${products.length} products`}
                            </div>
                        </div>


                        {/* Trade Information */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Info className="text-blue-600" size={16} />
                                Trade Route Info
                            </h3>
                            <div className="text-sm space-y-2">
                                <div><strong>Origin:</strong> {countryData[countries.origin as keyof typeof countryData]?.name}</div>
                                <div><strong>Destination:</strong> {countryData[countries.destination as keyof typeof countryData]?.name}</div>
                                <div><strong>Currency:</strong> {countryData[countries.destination as keyof typeof countryData]?.currency}</div>
                                <div><strong>VAT Rate:</strong> {countryData[countries.destination as keyof typeof countryData]?.vatRate || 0}%</div>
                                {(() => {
                                    const tradeKey = `${countries.origin}-${countries.destination}`;
                                    const multiplier = tradeAgreements[tradeKey];
                                    return multiplier && multiplier < 1 ? (
                                        <div className="text-green-700"><strong>Trade Benefit:</strong> {Math.round((1 - multiplier) * 100)}% tariff reduction</div>
                                    ) : null;
                                })()}
                            </div>
                        </div>


                        {/* Instructions */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 text-sm">How to use:</h3>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div>1. Add products using buttons or &quot;Add Product&quot;</div>
                                <div>2. Fill in product details (value, HS code, etc.)</div>
                                <div>3. Drag products to &quot;Consolidated Shipment&quot; to calculate specific items</div>
                                <div>4. Change origin/destination countries to see different rates</div>
                                <div>5. View calculated tariffs, VAT, and total landed cost</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TariffCalculator;