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
    ChevronDown,
    ChevronUp,
    BadgeCheck,
    FileText
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
import { useUserRole } from "@/lib/checkRole";

// Add these interfaces
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

interface AppliedFTA {
    name: string;
    partyA: string;
    partyB: string;
    appliedRate: number;
    effectiveDate: string;
    expirationDate: string | null;
}

interface CalculationResponse {
    tariffTotal: number;
    finalValue: number;
    appliedTariffs?: AppliedTariff[];
    appliedFTA?: AppliedFTA;
}

interface ProductBreakdown {
    product: Product;
    originalValue: number;
    tariffAmount: number;
    finalValue: number;
    appliedTariffs?: AppliedTariff[];
    appliedFTA?: AppliedFTA;
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
    const [overallAppliedFTA, setOverallAppliedFTA] = useState<AppliedFTA | null>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    const { data: countryData, isLoading: countriesLoading } = useCountries();
    const { userId } = useUserRole();
    if (!userId) return null;
    const { data: productsData } = useProducts(userId);

    const countryMap = useRef({} as { [key: string]: { name: string; alpha3: string; code: string } });

    const addProduct = () => {
        if (!selectedProduct) return;
        setProducts([...products, { ...selectedProduct, id: Date.now() }]);
        setSelectedProduct(null);
    };

    const updateProduct = (id: number, field: keyof Product, value: string | number) => {
        setProducts(products.map(
            product => product.id === id ? { ...product, [field]: value } : product
        ));
    };

    const removeProduct = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const handleCountryChange = (field: 'origin' | 'destination', value: string) => {
        setHasUserInteracted(true);
        setCountries(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (date: Date | undefined) => {
        setHasUserInteracted(true);
        setTariffDate(date);
    };

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

        // Only show warning after user has interacted
        if ((!tariffDate || countries.origin === '' || countries.destination === '') && hasUserInteracted) {
            toast.warning("Please select valid origin, destination and date before calculating", {
                id: warningToastId
            });
            return;
        }

        // Set interacted when calculate is attempted
        if (!hasUserInteracted) {
            setHasUserInteracted(true);
        }

        if (products.length === 0) {
            setResults({
                totalValue: 0,
                totalTariff: 0,
                totalCost: 0,
                effectiveRate: 0
            });
            setProductBreakdowns([]);
            setOverallAppliedFTA(null);
            return;
        }

        const productsToCalculate = products;
        let totalValue = 0;
        let totalTariff = 0;
        const newProductBreakdowns: ProductBreakdown[] = [];
        
        const newProductTariffDetails: { [productId: number]: string } = {};
        let ftaAppliedCount = 0;
        let mostCommonFTA: AppliedFTA | null = null;

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
                
                // Format tariffs for display
                const formattedTariffs = formatTariffsForDisplay(tariffs, calculationResult.appliedFTA);
                newProductTariffDetails[product.id] = formattedTariffs;
                
                totalValue += finalProductValue;
                totalTariff += calculationResult.tariffTotal;

                // Track FTA usage
                if (calculationResult.appliedFTA) {
                    ftaAppliedCount++;
                    // For simplicity, track the most common FTA applied
                    if (!mostCommonFTA) {
                        mostCommonFTA = calculationResult.appliedFTA;
                    }
                }

                // Add detailed breakdown for this product
                newProductBreakdowns.push({
                    product,
                    originalValue: finalProductValue,
                    tariffAmount: calculationResult.tariffTotal,
                    finalValue: calculationResult.finalValue,
                    appliedTariffs: calculationResult.appliedTariffs,
                    appliedFTA: calculationResult.appliedFTA
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
        }

        setProductTariffDetails(newProductTariffDetails);
        setProductBreakdowns(newProductBreakdowns);
        
        // Set overall FTA if majority of products use the same FTA
        if (ftaAppliedCount > products.length / 2 && mostCommonFTA) {
            setOverallAppliedFTA(mostCommonFTA);
        } else {
            setOverallAppliedFTA(null);
        }

        const totalCost = totalValue + totalTariff;
        const effectiveRate = totalValue > 0 ? ((totalCost - totalValue) / totalValue) * 100 : 0;

        setResults({
            totalValue,
            totalTariff,
            totalCost,
            effectiveRate
        });
    };

    const formatTariffsForDisplay = (tariffs: TariffData[], appliedFTA?: AppliedFTA): string => {
        if (appliedFTA) {
            return `FTA Applied: ${appliedFTA.name} (${appliedFTA.appliedRate}%)`;
        }

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
                : " (ongoing)";

            return `${tariff.tariffType}: ${rateInfo}${expiryInfo}`;
        });

        return tariffStrings.join("\n");
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

            {/* FTA Information */}
            {breakdown.appliedFTA && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <BadgeCheck className="h-4 w-4 text-green-600" />
                        <h5 className="font-medium text-green-800">Free Trade Agreement Applied</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="font-medium">FTA:</span> {breakdown.appliedFTA.name}
                        </div>
                        <div>
                            <span className="font-medium">Rate:</span> {breakdown.appliedFTA.appliedRate}%
                        </div>
                        <div>
                            <span className="font-medium">Parties:</span> {breakdown.appliedFTA.partyA} ↔ {breakdown.appliedFTA.partyB}
                        </div>
                        <div>
                            <span className="font-medium">Effective:</span> {new Date(breakdown.appliedFTA.effectiveDate).toLocaleDateString()}
                        </div>
                    </div>
                    {breakdown.appliedFTA.expirationDate && (
                        <div className="text-xs text-green-600 mt-1">
                            Expires: {new Date(breakdown.appliedFTA.expirationDate).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}

            {breakdown.appliedTariffs && breakdown.appliedTariffs.length > 0 && (
                <div className="border-t pt-3">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Applied Tariffs:
                    </h5>
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
                            <Select
                                    value={countries.origin}
                                    onValueChange={(value) => handleCountryChange('origin', value)}
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
                            <Select value={countries.destination} onValueChange={(value) => handleCountryChange('destination', value)}>
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
                                        onClick={() => setHasUserInteracted(true)}
                                    >
                                        <CalendarIcon />
                                        {tariffDate ? format(tariffDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={tariffDate} onSelect={handleDateChange} />
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
                                            tariffDetails={productTariffDetails[product.id] || "Calculating..."}
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
                                        {/* {overallAppliedFTA && (
                                            <div className="text-xs text-green-600 mt-1">
                                                Using FTA: {overallAppliedFTA.appliedRate}% rate
                                            </div>
                                        )} */}
                                    </div>

                                    <div className="bg-gray-800 text-white p-4 rounded-md">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-300">Total Landed Cost</div>
                                            <div className="text-2xl font-bold">US$ {results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                            {/* {overallAppliedFTA && (
                                                <div className="text-xs text-green-300 mt-1">
                                                    FTA savings applied
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* <div className="mt-4 text-xs text-gray-600">
                                Calculating: All {products.length} products
                                {overallAppliedFTA && (
                                    <div className="text-green-600 mt-1">
                                        ✓ Free Trade Agreement applied for preferential rates
                                    </div>
                                )}
                            </div> */}
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
                                    {/* {overallAppliedFTA && (
                                        <div className="text-green-600">
                                            <strong>FTA Applied:</strong> {overallAppliedFTA.name}
                                        </div>
                                    )} */}
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
                                {/* <div className="text-green-600 font-medium">6. Green panels show when FTAs are applied for savings</div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TariffCalculator;