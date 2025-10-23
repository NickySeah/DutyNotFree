'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './productCard';
import { Product, TariffData } from '@/types/calculator';
import {
    Calculator,
    Package,
    DollarSign,
    Info,
    Plus,
    Globe,
    ArrowRight,
    CalendarIcon,
    ArrowRightLeft,
    Activity
    ChevronDown,
    ChevronUp
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
import LiveTariffChart from '@/components/LiveTariffChart';

// Add these interfaces to your types file or at the top of the component
interface AppliedTariff {
    id: number;
    hsCode: {
        code: string;
        description: string;
    };
    originCountry: {
        code: string;
        name: string;
        alpha3: string;
    };
    destCountry: {
        code: string;
        name: string;
        alpha3: string;
    };
    tariffType: string;
    standardRate: number | null;
    flatFee: number | null;
    effectiveDate: string;
    expirationDate: string | null;
}

interface CalculationResponse {
    tariffTotal: number;
    finalValue: number;
    appliedTariffs: AppliedTariff[];
}

interface ProductBreakdown {
    product: Product;
    originalValue: number;
    tariffAmount: number;
    finalValue: number;
    appliedTariffs: AppliedTariff[];
}

const TariffCalculator = () => {
    const isMounted = useRef(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [countries, setCountries] = useState({
        origin: '',
        destination: ''
    });
    const [results, setResults] = useState({
        totalValue: 0,
        totalTariff: 0,
        totalCost: 0,
        effectiveRate: 0
    });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [tariffDate, setTariffDate] = useState<Date | undefined>(undefined);
    const [productTariffDetails, setProductTariffDetails] = useState<{ [productId: number]: string }>({});
    const [productBreakdowns, setProductBreakdowns] = useState<ProductBreakdown[]>([]);
    const [showBreakdown, setShowBreakdown] = useState(false);

    const { data: countryData, isLoading: countriesLoading, error: countriesError } = useCountries();
    const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts();
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationError, setCalculationError] = useState<string | null>(null);
    const [lastCalculationTime, setLastCalculationTime] = useState<number>(0);
    const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [dataVersion, setDataVersion] = useState<number>(0);

    const { data: countryData, isLoading: countriesLoading } = useCountries();
    const { data: productsData } = useProducts();

    const countryMap = useRef({} as { [key: string]: { name: string; alpha3: string; code: string } });

    const addProduct = () => {
        if (!selectedProduct) return;
        
        const newProduct = { ...selectedProduct, id: Date.now() };
        setProducts([...products, newProduct]);
        setSelectedProduct(null);
        
        // Trigger immediate recalculation for new product
        if (isMounted.current) {
            setTimeout(() => {
                calculateTariffs();
            }, 100);
        }
    };


    // Data synchronization function
    const syncData = () => {
        setDataVersion(prev => prev + 1);
        // Trigger recalculation when data is synchronized
        debouncedCalculateTariffs();
    };

    // Debounced calculation function to optimize performance
    const debouncedCalculateTariffs = () => {
        if (calculationTimeoutRef.current) {
            clearTimeout(calculationTimeoutRef.current);
        }
        
        calculationTimeoutRef.current = setTimeout(() => {
            const now = Date.now();
            // Only recalculate if enough time has passed (throttling)
            if (now - lastCalculationTime > 1000) {
                setLastCalculationTime(now);
                calculateTariffs();
            }
        }, 500);
    };

    const updateProduct = (id: number, field: keyof Product, value: string | number) => {
        setProducts(products.map(
            product => product.id === id ? { ...product, [field]: value } : product
        ));
        
        // Trigger debounced recalculation when product data changes
        if (isMounted.current) {
            debouncedCalculateTariffs();
        }
    };

    const removeProduct = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
        
        // Trigger immediate recalculation when product is removed
        if (isMounted.current) {
            setTimeout(() => {
                calculateTariffs();
            }, 100);
        }
    };

    const getCountry = (code: string) => {
        return countryMap.current[code]?.name || "N/A";
    };

    const getTariffData = async (origin: string, destination: string, hsCode: string, date: string) => {
        try {
            const response = await tariffService.get("/api/v1/tariffs", {
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
            // Don't reset results to 0, just skip calculation
            return;
        }

        console.log('Starting calculateTariffs with:', { products: products.length, countries, tariffDate });
        // Set loading state
        setIsCalculating(true);
        setCalculationError(null);

        try {
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

                    const response = await calculatorService.get("/api/v1/calculator", {
                        params: {
                            value: finalProductValue,
                            origin: origin,
                            dest: destination,
                            hsCode: hsCode,
                            date: date
                        }
                    });

                    const tariffAmount = response.data - finalProductValue;
                    console.log(`Product: ${product.name}, Value: ${finalProductValue}, Calculator Response: ${response.data}, Tariff Amount: ${tariffAmount}`);
                    totalValue += finalProductValue;
                    totalTariff += tariffAmount;

                } catch (error) {
                    console.error(`Error calculating tariff for product ${product.name}:`, error);
                    newProductTariffDetails[product.id] = "Error loading tariff data";
                    totalValue += finalProductValue;
                }
            setResults({
                totalValue: 0,
                totalTariff: 0,
                totalCost: 0,
                effectiveRate: 0
            });
            setProductBreakdowns([]);
            return;
        }

        const productsToCalculate = products;
        let totalValue = 0;
        let totalTariff = 0;
        const newProductBreakdowns: ProductBreakdown[] = [];
        
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
                    
                    // Add breakdown with no tariffs
                    newProductBreakdowns.push({
                        product,
                        originalValue: finalProductValue,
                        tariffAmount: 0,
                        finalValue: finalProductValue,
                        appliedTariffs: []
                    });
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

                const calculationResult = response.data as CalculationResponse;
                
                totalValue += finalProductValue;
                totalTariff += calculationResult.tariffTotal;

                // Add detailed breakdown for this product
                newProductBreakdowns.push({
                    product,
                    originalValue: finalProductValue,
                    tariffAmount: calculationResult.tariffTotal,
                    finalValue: calculationResult.finalValue,
                    appliedTariffs: calculationResult.appliedTariffs
                });

            } catch (error) {
                console.error(`Error calculating tariff for product ${product.name}:`, error);
                newProductTariffDetails[product.id] = "Error loading tariff data";
                totalValue += finalProductValue;
                
                // Add breakdown with error state
                newProductBreakdowns.push({
                    product,
                    originalValue: finalProductValue,
                    tariffAmount: 0,
                    finalValue: finalProductValue,
                    appliedTariffs: []
                });
            }

            setProductTariffDetails(newProductTariffDetails);
        setProductTariffDetails(newProductTariffDetails);
        setProductBreakdowns(newProductBreakdowns);

            const totalCost = totalValue + totalTariff;
            const effectiveRate = totalValue > 0 ? ((totalCost - totalValue) / totalValue) * 100 : 0;

            console.log(`Final Results - Total Value: ${totalValue}, Total Tariff: ${totalTariff}, Total Cost: ${totalCost}, Effective Rate: ${effectiveRate}`);
            setResults({
                totalValue,
                totalTariff,
                totalCost,
                effectiveRate
            });

        } catch (error) {
            console.error('Error in calculateTariffs:', error);
            setCalculationError('Failed to calculate tariffs. Please try again.');
            toast.error('Failed to calculate tariffs. Please try again.');
        } finally {
            setIsCalculating(false);
        }
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

    // Component for detailed breakdown
    const ProductBreakdownCard = ({ breakdown }: { breakdown: ProductBreakdown }) => (
        <div className="bg-white border rounded-lg p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-semibold text-gray-800">{breakdown.product.name}</h4>
                    <p className="text-sm text-gray-600">
                        HS Code: {breakdown.product.hsCode.code} | Qty: {breakdown.product.quantity}
                    </p>
                </div>
                <div className="text-right">
                    <div className="font-semibold">US$ {breakdown.finalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className="text-sm text-gray-600">Final Value</div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Original Value</div>
                    <div className="font-semibold">US$ {breakdown.originalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Tariff Amount</div>
                    <div className="font-semibold text-red-600">US$ {breakdown.tariffAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
            </div>

            {breakdown.appliedTariffs.length > 0 && (
                <div className="border-t pt-3">
                    <h5 className="font-medium text-gray-700 mb-2">Applied Tariffs:</h5>
                    <div className="space-y-2">
                        {breakdown.appliedTariffs.map((tariff, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{tariff.tariffType}</span>
                                    <span className="text-blue-600">
                                        {tariff.standardRate !== null 
                                            ? `${tariff.standardRate}% (Ad Valorem)`
                                            : tariff.flatFee !== null 
                                            ? `US$ ${tariff.flatFee.toFixed(2)} (Specific)`
                                            : "Rate not specified"
                                        }
                                    </span>
                                </div>
                                {tariff.expirationDate && (
                                    <div className="text-gray-500 text-xs mt-1">
                                        Expires: {new Date(tariff.expirationDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        
        // Only calculate if we have the necessary data and it's not loading
        if (products.length > 0 && countries.origin && countries.destination && tariffDate && !countriesLoading && !productsLoading) {
            debouncedCalculateTariffs();
        }
    }, [products, countries, tariffDate, countriesLoading, productsLoading]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (calculationTimeoutRef.current) {
                clearTimeout(calculationTimeoutRef.current);
            }
        };
    }, []);

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
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Management */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product List */}
                        <div className="min-h-[300px] bg-blue-50 p-4 rounded-lg border-2 border-dashed border-blue-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Package className="text-blue-600" size={18} />
                                    Products ({products.length})
                                </h3>
                                <div>
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
                                            tariffDetails={productTariffDetails[product.id] || (isCalculating ? "Calculating..." : "Not calculated")}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Detailed Breakdown Section */}
                        {productBreakdowns.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowBreakdown(!showBreakdown)}
                                    className="w-full flex items-center justify-between p-0 h-auto"
                                >
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <DollarSign className="text-green-600" size={18} />
                                        Detailed Cost Breakdown ({productBreakdowns.length} products)
                                    </h3>
                                    {showBreakdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </Button>
                                
                                {showBreakdown && (
                                    <div className="mt-4 space-y-3">
                                        {productBreakdowns.map((breakdown, index) => (
                                            <ProductBreakdownCard key={index} breakdown={breakdown} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    {/* Results Panel */}
                    <div className="space-y-6">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <DollarSign className="text-yellow-600" size={20} />
                                Import Cost Calculation
                            </h2>

                            {/* Show loading states and error messages */}
                            {countriesLoading || productsLoading ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                                    <p>Loading data...</p>
                                </div>
                            ) : countriesError || productsError ? (
                                <div className="text-center py-8 text-red-500">
                                    <Globe size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Error loading data. Please try again.</p>
                                    <button 
                                        onClick={() => window.location.reload()} 
                                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : !countryData || countries.destination == '' || countries.origin == '' || tariffDate === undefined ? (
                            {countriesLoading || !countryData || countries.destination == '' || countries.origin == '' || tariffDate === undefined ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Globe size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No countries or date selected.</p>
                                </div>
                            ) : isCalculating ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                                    <p>Calculating tariffs...</p>
                                </div>
                            ) : calculationError ? (
                                <div className="text-center py-8 text-red-500">
                                    <Globe size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>{calculationError}</p>
                                    <button 
                                        onClick={calculateTariffs} 
                                        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                    >
                                        Retry Calculation
                                    </button>
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
                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="mt-4 flex justify-between items-center text-xs text-gray-600">
                                <span>Calculating: All {products.length} products</span>
                                <button 
                                    onClick={syncData}
                                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                    disabled={isCalculating}
                                >
                                    {isCalculating ? 'Syncing...' : 'Refresh Data'}
                                </button>
                            </div>
                        </div>

                        {/* Live Tariff Charts */}
                        {products.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-green-500" />
                                    Live Tariff Analytics
                                </h3>
                                <div className="grid grid-cols-1 gap-8 w-full">
                                    {products.map((product) => {
                                        // Extract tariff rate more reliably
                                        let tariffRate = 0;
                                        if (productTariffDetails[product.id]) {
                                            const tariffText = productTariffDetails[product.id];
                                            console.log('Raw tariff text:', tariffText);
                                            
                                            // Look for patterns like "rate 5.5%" or "5.5%" or "5.5"
                                            const rateMatch = tariffText.match(/rate\s+(\d+\.?\d*)\s*%/i);
                                            if (rateMatch) {
                                                tariffRate = parseFloat(rateMatch[1]);
                                                console.log('Found rate with "rate X.X%" pattern:', tariffRate);
                                            } else {
                                                // Try other patterns
                                                const altMatch = tariffText.match(/(\d+\.?\d*)\s*%/);
                                                if (altMatch) {
                                                    tariffRate = parseFloat(altMatch[1]);
                                                    console.log('Found rate with "X.X%" pattern:', tariffRate);
                                                } else {
                                                    // Try to find any decimal number in the text
                                                    const numberMatch = tariffText.match(/(\d+\.\d+)/);
                                                    if (numberMatch) {
                                                        tariffRate = parseFloat(numberMatch[1]);
                                                        console.log('Found rate with decimal number pattern:', tariffRate);
                                                    }
                                                }
                                            }
                                        }
                                        
                                        // If no tariff rate found, use a default for demonstration
                                        if (tariffRate === 0) {
                                            tariffRate = 5.5; // Default 5.5% tariff rate
                                            console.log('Using default tariff rate:', tariffRate);
                                        }
                                        
                                        console.log('Product tariff extraction:', {
                                            productId: product.id,
                                            productName: product.name,
                                            tariffText: productTariffDetails[product.id],
                                            extractedRate: tariffRate
                                        });
                                        
                                        const baseValue = product.value * product.quantity;
                                        console.log('Product calculation:', {
                                            productId: product.id,
                                            productName: product.name,
                                            productValue: product.value,
                                            productQuantity: product.quantity,
                                            calculatedBaseValue: baseValue,
                                            tariffRate
                                        });
                                        
                                        return (
                                            <LiveTariffChart
                                                key={product.id}
                                                productName={product.name}
                                                baseValue={baseValue}
                                                tariffRate={tariffRate}
                                                isCalculating={isCalculating}
                                            />
                                        );
                                    })}
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
                                <div>5. Expand &quot;Detailed Cost Breakdown&quot; to see individual product tariffs</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TariffCalculator;