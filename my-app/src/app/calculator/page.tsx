'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './productCard';
import { Product, TariffData } from '@/types/calculator';
import {
    Calculator,
    Package,
    DollarSign,
    // Percent,
    Info,
    Plus,
    // X,
    // Move,
    Globe,
    ArrowRight,
    // Trash2,
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
import { toast } from "sonner";
import { useCountries } from '@/hooks/useCountry';
import { useProducts } from '@/hooks/useProducts';
import { calculatorService, tariffService } from '@/lib/axios';
import { formatDateToYYYYMMDD } from '@/utils/dateUtils';

const TariffCalculator = () => {
    const isMounted = useRef(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [countries, setCountries] = useState({
        origin: '',
        destination: ''
    });
    // const [draggedItem, setDraggedItem] = useState<Product | null>(null);
    const [results, setResults] = useState({
        totalValue: 0,
        totalTariff: 0,
        totalCost: 0,
        effectiveRate: 0
    });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [tariffDate, setTariffDate] = useState<Date | undefined>(undefined);
    const [productTariffDetails, setProductTariffDetails] = useState<{ [productId: number]: string }>({});

    const { data: countryData, isLoading: countriesLoading } = useCountries();
    const { 
        data: productsData, 
        // isLoading: productsLoading
     } = useProducts();


    const countryMap = useRef({} as { [key: string]: { name: string; alpha3: string; code: string } });

    // Country-specific tariff data
    // const countryData = {
    //     'US': { name: 'United States', vatRate: 0, currency: 'USD' },
    //     'EU': { name: 'European Union', vatRate: 20, currency: 'EUR' },
    //     'UK': { name: 'United Kingdom', vatRate: 20, currency: 'GBP' },
    //     'CN': { name: 'China', vatRate: 13, currency: 'CNY' },
    //     'JP': { name: 'Japan', vatRate: 10, currency: 'JPY' },
    //     'CA': { name: 'Canada', vatRate: 5, currency: 'CAD' },
    //     'AU': { name: 'Australia', vatRate: 10, currency: 'AUD' },
    //     'IN': { name: 'India', vatRate: 18, currency: 'INR' }
    // };


    // Trade agreement multipliers
    // const tradeAgreements: { [key: string]: number } = {
    //     'US-EU': 0.85,
    //     'US-UK': 0.9,
    //     'EU-UK': 0.95,
    //     'US-CA': 0.7,
    //     'default': 1.0
    // };


    // Product categories with HS codes and tariff rates
    // const productCategories: ProductCategory[] = [
    //     { id: 1, name: 'Electronics', hsCode: '8517', baseRate: 5.5, category: 'Technology' },
    //     { id: 2, name: 'Textiles', hsCode: '6109', baseRate: 8.2, category: 'Clothing' },
    //     { id: 3, name: 'Automobiles', hsCode: '8703', baseRate: 10.0, category: 'Automotive' },
    //     { id: 4, name: 'Agricultural Products', hsCode: '0801', baseRate: 2.3, category: 'Food' },
    //     { id: 5, name: 'Steel Products', hsCode: '7208', baseRate: 15.0, category: 'Materials' },
    //     { id: 6, name: 'Chemicals', hsCode: '2902', baseRate: 3.7, category: 'Industrial' },
    //     { id: 7, name: 'Pharmaceuticals', hsCode: '3004', baseRate: 0.0, category: 'Medical' },
    //     { id: 8, name: 'Machinery', hsCode: '8419', baseRate: 2.2, category: 'Industrial' }
    // ];

    // const sampleProductList: Product[] = [
    //     // Initial sample product
    //     { id: 1, name: 'Smartphone', hsCode: '8517', value: 300, quantity: 10, tariffRate: 5.5, category: 'Electronics' },
    //     { id: 2, name: 'Jeans', hsCode: '6109', value: 50, quantity: 20, tariffRate: 8.2, category: 'Textiles' },
    //     { id: 3, name: 'Car', hsCode: '8703', value: 20000, quantity: 2, tariffRate: 10.0, category: 'Automobiles' },
    //     { id: 4, name: 'Laptop', hsCode: '8471', value: 1200, quantity: 5, tariffRate: 3.0, category: 'Electronics' },
    //     { id: 5, name: 'T-Shirt', hsCode: '6109', value: 20, quantity: 50, tariffRate: 8.2, category: 'Textiles' },
    //     { id: 6, name: 'Tablet', hsCode: '8471', value: 400, quantity: 15, tariffRate: 3.0, category: 'Electronics' },
    //     { id: 7, name: 'Headphones', hsCode: '8518', value: 150, quantity: 25, tariffRate: 4.0, category: 'Electronics' },
    //     { id: 8, name: 'Sneakers', hsCode: '6404', value: 80, quantity: 30, tariffRate: 6.5, category: 'Footwear' }
    // ];


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
        setProducts(products.map(
            product => product.id === id ? { ...product, [field]: value } : product
        ));
    };

    // Remove product entirely
    const removeProduct = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
    };


    // const loadSampleProduct = (category: ProductCategory) => {
    //     const product = {
    //         id: Date.now(),
    //         name: category.name,
    //         hsCode: category.hsCode,
    //         value: Math.floor(Math.random() * 50000) + 10000,
    //         quantity: Math.floor(Math.random() * 100) + 10,
    //         tariffRate: category.baseRate,
    //         category: category.name
    //     };
    //     setProducts([...products, product]);
    // };


    const getCountry = (code: string) => {
        return countryMap.current[code]?.name || "N/A";
    };

    const getTariffData = async (origin: string, destination: string, hsCode: string, date: string) => {
        try {
            const response = await tariffService.get("", {
                params: {
                    origin: origin,
                    dest: destination,
                    hsCode: hsCode,
                    date: date
                }
            });
            
            return response.data as TariffData[];
        } catch (error) {
            console.error(`Error fetching tariff data for HS Code ${hsCode}:`, error);
            throw error;
        }
    };


    const calculateTariffs = async () => {
        const warningToastId = "select-fields-warning";

        if ((!tariffDate || countries.origin === '' || countries.destination === '') && isMounted.current) {
            toast.warning("Please select valid origin, destination and date before calculating", {
                id: warningToastId
            });
            return;
        }

        if (products.length === 0) {
            setResults({
                totalValue: 0,
                totalTariff: 0,
                totalCost: 0,
                effectiveRate: 0
            });
            return;
        }

        const productsToCalculate = products;
        let totalValue = 0;
        let totalTariff = 0;
        
        const newProductTariffDetails: { [productId: number]: string } = {};

        for (const product of productsToCalculate) {
            const finalProductValue = product.value * product.quantity;
            const origin = countries.origin;
            const destination = countries.destination;
            const hsCode = product.hsCode.code;
            const date = tariffDate ? formatDateToYYYYMMDD(tariffDate) : '';

            try {
                let tariffs: TariffData[] = [];
                if (!(!origin || !destination || !hsCode || !date)) {
                    tariffs = await getTariffData(origin, destination, hsCode, date);
                }
                else {
                    newProductTariffDetails[product.id] = "N/A";
                    totalValue += finalProductValue;
                    continue;
                }
                
                // Format tariffs for display
                const formattedTariffs = formatTariffsForDisplay(tariffs);
                newProductTariffDetails[product.id] = formattedTariffs;

                const response = await calculatorService.get("", {
                    params: {
                        value: finalProductValue,
                        origin: origin,
                        dest: destination,
                        hsCode: hsCode,
                        date: date
                    }
                });

                const tariffAmount = response.data - finalProductValue;
                totalValue += finalProductValue;
                totalTariff += tariffAmount;

            } catch (error) {
                console.error(`Error calculating tariff for product ${product.name}:`, error);
                newProductTariffDetails[product.id] = "Error loading tariff data";
                totalValue += finalProductValue;
            }
        }

        setProductTariffDetails(newProductTariffDetails);

        const totalCost = totalValue + totalTariff;
        const effectiveRate = totalValue > 0 ? ((totalCost - totalValue) / totalValue) * 100 : 0;

        setResults({
            totalValue,
            totalTariff,
            totalCost,
            effectiveRate
        });
    };

    const formatTariffsForDisplay = (tariffs: TariffData[]): string => {
        if (!tariffs || tariffs.length === 0) {
            return "No tariffs applicable";
        }

        const tariffStrings = tariffs.map(tariff => {
            const rateInfo = tariff.standardRate !== null 
                ? `${tariff.standardRate}% (Ad Valorem)`
                : tariff.flatFee !== null 
                ? `$${tariff.flatFee.toFixed(2)} (Specific)`
                : "Rate not specified";

            const expiryInfo = tariff.expirationDate 
                ? ` (expires: ${new Date(tariff.expirationDate).toLocaleDateString()})`
                : " (no expiry)";

            return `${tariff.tariffType}: ${rateInfo}${expiryInfo}`;
        });

        return tariffStrings.join(" | ");
    };


    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        calculateTariffs();
    }, [products, countries, tariffDate]);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        countryMap.current = countryData ? Object.fromEntries(countryData.map(data => [data.code, data])) : {};
    }, [countryData]);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <Calculator className="text-blue-600" size={32} />
                    <h1 className="text-3xl font-bold text-gray-800">Tariff Calculator</h1>
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
                            {/* <Combobox
                                value={countries.origin}
                                onValueChange={(value) => setCountries({ ...countries, origin: value })}
                                options={countryData ? Object.entries(countryData).filter(([code]) => code !== countries.destination).map(([code, data]) => ({ value: code, label: data.name })) : []}
                                placeholder="Select a country"
                                emptyMessage='No countries found.'
                                loading={countriesLoading}
                            /> */}
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
                                        {countryData ? Object.values(countryData).filter((data) => data.code !== countries.destination).map((data) => (
                                            <SelectItem key={data.code} value={data.code}>
                                                {data.name}
                                            </SelectItem>
                                        )) : null}
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
                            {/* <Combobox
                                value={countries.destination}
                                onValueChange={(value) => setCountries({ ...countries, destination: value })}
                                options={countryData ? Object.entries(countryData).filter(([code]) => code !== countries.origin).map(([code, data]) => ({ value: code, label: data.name })) : []}
                                placeholder="Select a country"
                                emptyMessage='No countries found.'
                                loading={countriesLoading}
                            /> */}

                            <Select value={countries.destination} onValueChange={(value) => setCountries({ ...countries, destination: value })}>
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Countries</SelectLabel>
                                        {countryData ? Object.values(countryData).filter((data) => data.code !== countries.origin).map((data) => (
                                            <SelectItem key={data.code} value={data.code}>
                                                {data.name}
                                            </SelectItem>
                                        )) : null}
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
                        {/* <div className="ml-4 text-sm text-gray-600">
                            {(() => {
                                const tradeKey = `${countries.origin}-${countries.destination}`;
                                const multiplier = tradeAgreements[tradeKey] || tradeAgreements.default;
                                return multiplier < 1 ?
                                    `Trade Agreement: ${Math.round((1 - multiplier) * 100)}% discount` :
                                    'Standard tariff rates';
                            })()}
                        </div> */}
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Management */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product List */}
                        <div
                            className="min-h-[300px] bg-blue-50 p-4 rounded-lg border-2 border-dashed border-blue-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Package className="text-blue-600" size={18} />
                                    Products ({products.length})
                                </h3>
                                <div>
                                    {/* Select product from product list */}
                                    <Select onValueChange={(value) => {
                                        if (!productsData) return;
                                        const product = productsData.find(prod => prod.id.toString() === value);
                                        if (product) {
                                            const addProduct = { ...product, quantity: 1, value: 0 };
                                            setSelectedProduct(addProduct);
                                        };
                                    }} value={selectedProduct?.id.toString() || ''}>
                                        <SelectTrigger className="w-[280px]">
                                            <SelectValue placeholder="Select a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Products</SelectLabel>
                                                {productsData ? productsData.map(product => (
                                                    <SelectItem key={product.id} value={product.id.toString()}>
                                                        {product.name}
                                                    </SelectItem>
                                                )) : null}
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
                                            tariffDetails={productTariffDetails[product.id] || "Calculating..."}
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

                            {/* if countries is undefined show loading state and hide the rest */}
                            {countriesLoading || !countryData || countries.destination == '' || countries.origin == '' || tariffDate === undefined ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Globe size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No countries or date selected.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-md">
                                        <div className="text-sm text-gray-600">Total Goods Value</div>
                                        <div className="text-lg font-semibold">US$ {results.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>


                                    <div className="bg-white p-3 rounded-md">
                                        <div className="text-sm text-gray-600">Tariff Amount</div>
                                        <div className="text-lg font-semibold text-red-600">US$ {results.totalTariff.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    </div>


                                    <div className="bg-gray-800 text-white p-4 rounded-md">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-300">Total Landed Cost</div>
                                            <div className="text-2xl font-bold">US$ {results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                            <div className="text-sm text-gray-300 mt-1">
                                                Effective Rate: {results.effectiveRate.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="mt-4 text-xs text-gray-600">
                                Calculating: All {products.length} products
                            </div>
                        </div>


                        {/* Trade Information */}
                        {countriesLoading || !countryData ? "" : (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Info className="text-blue-600" size={16} />
                                    Trade Route Info
                                </h3>
                                <div className="text-sm space-y-2">
                                    <div><strong>Origin:</strong> {getCountry(countries.origin)}</div>
                                    <div><strong>Destination:</strong> {getCountry(countries.destination)}</div>
                                    <div><strong>Currency:</strong> US$</div>
                                    {/* {(() => {
                                        const tradeKey = `${countries.origin}-${countries.destination}`;
                                        const multiplier = tradeAgreements[tradeKey];
                                        return multiplier && multiplier < 1 ? (
                                            <div className="text-green-700"><strong>Trade Benefit:</strong> {Math.round((1 - multiplier) * 100)}% tariff reduction</div>
                                        ) : null;
                                    })()} */}
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 text-sm">How to use:</h3>
                            <div className="text-xs text-gray-600 space-y-1">
                                <div>1. Add products using buttons or &quot;Add Product&quot;</div>
                                <div>2. Fill in product details (value, HS code, etc.)</div>
                                <div>3. Change origin/destination countries to see different rates</div>
                                <div>4. View calculated tariffs and total landed cost</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TariffCalculator;