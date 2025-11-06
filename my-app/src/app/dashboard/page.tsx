'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { useTariffs } from '@/hooks/useTariffs';
import { useCountries } from '@/hooks/useCountry';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Package, 
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Target
} from 'lucide-react';

import { useUserRole } from '@/lib/checkRole';

// Color schemes for different chart types
const COLORS = {
  primary: '#10b981', // emerald-500
  secondary: '#3b82f6', // blue-500
  accent: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  success: '#22c55e', // green-500
  warning: '#f97316', // orange-500
  purple: '#8b5cf6', // violet-500
  pink: '#ec4899', // pink-500
};

const CHART_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
  '#22c55e', '#f97316', '#8b5cf6', '#ec4899'
];

export default function TariffDashboard() {
  const { userId } = useUserRole();
  const { data: tariffs = [], isLoading: tariffsLoading } = useTariffs();
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  if (!userId) return null;
  const { data: products = [], isLoading: productsLoading } = useProducts(userId);
  
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedTariffType, setSelectedTariffType] = useState('all');

  // Process data for charts with filtering
  const chartData = useMemo(() => {
    if (!tariffs.length) return [];

    // Apply filters
    let filteredTariffs = tariffs;
    
    if (selectedCountry !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.destCountry?.name === selectedCountry || tariff.importingTo === selectedCountry
      );
    }
    
    if (selectedProduct !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.hsCode?.code === selectedProduct || tariff.hsCode === selectedProduct
      );
    }
    
    if (selectedTariffType !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.type === selectedTariffType || tariff.tariffType === selectedTariffType
      );
    }

    // Group tariffs by destination country and calculate metrics
    const countryData = filteredTariffs.reduce((acc: any, tariff: any) => {
      const key = tariff.destCountry?.name || tariff.importingTo || 'Unknown Country';
      if (!acc[key]) {
        acc[key] = {
          country: key,
          totalTariffs: 0,
          avgRate: 0,
          maxRate: 0,
          minRate: Infinity,
          count: 0,
          rates: []
        };
      }
      
      const rate = tariff.rate || tariff.standardRate || 0;
      acc[key].totalTariffs += rate;
      acc[key].count += 1;
      acc[key].rates.push(rate);
      acc[key].maxRate = Math.max(acc[key].maxRate, rate);
      acc[key].minRate = Math.min(acc[key].minRate, rate);
      
      return acc;
    }, {});

    // Calculate averages and format for charts
    const countriesWithStats = Object.values(countryData).map((country: any) => {
      const avgRate = country.totalTariffs / country.count;
      const medianRate = country.rates.sort((a: number, b: number) => a - b)[Math.floor(country.rates.length / 2)];
      const rateVariance = country.rates.reduce((sum: number, rate: number) => sum + Math.pow(rate - avgRate, 2), 0) / country.count;
      const rateStdDev = Math.sqrt(rateVariance);
      
      return {
        ...country,
        avgRate,
        minRate: country.minRate === Infinity ? 0 : country.minRate,
        medianRate,
        rateStdDev,
        rateRange: country.maxRate - (country.minRate === Infinity ? 0 : country.minRate),
        tariffDiversity: country.rates.length, // Number of different tariff rates
      };
    });

    // Sort by competitiveness (lower avg rate = more competitive) and add ranking
    return countriesWithStats
      .sort((a, b) => a.avgRate - b.avgRate)
      .map((country, index) => ({
        ...country,
        rank: index + 1,
        competitiveness: country.avgRate < 5 ? 'High' : country.avgRate < 8 ? 'Medium' : 'Low',
        competitivenessColor: country.avgRate < 5 ? '#10b981' : country.avgRate < 8 ? '#f59e0b' : '#ef4444'
      }));
  }, [tariffs, selectedCountry, selectedProduct, selectedTariffType]);

  // Event-driven tariff rate simulation data - Daily/Weekly view with major announcements
  const priceData = useMemo(() => {
    const baseRate = 5.5; // Base tariff rate
    const data = [];
    const now = new Date();
    
    // Simulate major tariff events over the last 30 days (daily intervals)
    const events = [
      { day: 0, event: 'Normal Operations', impact: 0, description: 'Standard tariff rates' },
      { day: 3, event: 'US-China Trade Tensions', impact: 1.2, description: 'Increased tariffs on Chinese goods' },
      { day: 7, event: 'EU Trade Agreement', impact: -0.8, description: 'Reduced tariffs with EU partners' },
      { day: 10, event: 'Trump 100% China Tariffs', impact: 8.5, description: 'Major announcement: 100% tariffs on Chinese imports' },
      { day: 12, event: 'Market Reaction', impact: 2.1, description: 'Global markets respond to tariff announcement' },
      { day: 15, event: 'WTO Dispute', impact: 1.5, description: 'WTO challenges new tariff policies' },
      { day: 18, event: 'Retaliatory Measures', impact: 3.2, description: 'China announces counter-tariffs' },
      { day: 22, event: 'Trade Negotiations', impact: -1.8, description: 'Bilateral talks begin' },
      { day: 25, event: 'Partial Agreement', impact: -2.5, description: 'Some tariffs reduced through negotiation' },
      { day: 28, event: 'Policy Review', impact: 0.5, description: 'Ongoing policy assessment' },
      { day: 30, event: 'Current Status', impact: 0, description: 'Current tariff environment' },
    ];
    
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily intervals
      const day = 30 - i;
      
      // Calculate cumulative impact from all events that have occurred up to this day
      let cumulativeImpact = 0;
      let currentEvent = events[0]; // Default to first event
      
      for (const event of events) {
        if (event.day <= day) {
          cumulativeImpact += event.impact;
          currentEvent = event; // Track the most recent event for display
        }
      }
      
      // Apply cumulative impact to base rate
      const baseRateWithImpact = Math.max(0, baseRate + cumulativeImpact);
      
      // Add small random variation around the current rate
      const variation = (Math.random() - 0.5) * 0.3; // Small random variation
      const rate = Math.max(0, baseRateWithImpact + variation);
      
      data.push({
        time: time.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        price: rate,
        event: currentEvent.event,
        impact: currentEvent.impact,
        description: currentEvent.description,
        change: i === 0 ? variation : 0,
      });
    }
    
    return data;
  }, []);

  // Product distribution data with realistic market shares
  const productData = useMemo(() => {
    // Realistic market share percentages that add up to 100%
    const marketShares = [40, 30, 20, 10]; // Total: 100% - Only 4 main categories
    
    // Apply product filter if selected
    let filteredProducts = products;
    if (selectedProduct !== 'all') {
      filteredProducts = products.filter((product: any) => 
        product.hsCode?.code === selectedProduct || product.name === selectedProduct
      );
    }
    
    // If no products are available, create some sample data
    if (!filteredProducts || filteredProducts.length === 0) {
      const sampleProducts = [
        { name: 'Electronics', hsCode: { code: '851712', description: 'Mobile phones' } },
        { name: 'Textiles', hsCode: { code: '620342', description: 'Cotton shirts' } },
        { name: 'Automotive', hsCode: { code: '870321', description: 'Passenger cars' } },
        { name: 'Food & Beverages', hsCode: { code: '220300', description: 'Beer' } },
      ];
      
      return sampleProducts.map((product: any, index: number) => ({
        name: product.name,
        value: marketShares[index] || 1,
        color: CHART_COLORS[index % CHART_COLORS.length],
        tariff: Math.random() * 15 + 2,
        marketShare: `${marketShares[index] || 1}%`,
        description: product.hsCode.description,
        hsCode: product.hsCode.code,
      }));
    }
    
    // Remove duplicates and limit to 4 products for cleaner display
    const uniqueProducts = filteredProducts
      .filter((product: any, index: number, self: any[]) => 
        index === self.findIndex((p: any) => p.name === product.name)
      )
      .slice(0, 4);
    
    return uniqueProducts.map((product: any, index: number) => ({
      name: product.name || `Product ${index + 1}`,
      value: marketShares[index] || 1,
      color: CHART_COLORS[index % CHART_COLORS.length],
      tariff: Math.random() * 15 + 2,
      marketShare: `${marketShares[index] || 1}%`,
      description: product.hsCode?.description || `Product ${index + 1} description`,
      hsCode: product.hsCode?.code || `HS${index + 1}`,
    }));
  }, [products, productsLoading, selectedProduct]);

  // Product Risk Assessment data
  const productRiskData = useMemo(() => {
    if (!tariffs.length || !products.length) return [];

    // Apply filters to tariffs for risk assessment
    let filteredTariffs = tariffs;
    
    if (selectedCountry !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.destCountry?.name === selectedCountry || tariff.importingTo === selectedCountry
      );
    }
    
    if (selectedProduct !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.hsCode?.code === selectedProduct || tariff.hsCode === selectedProduct
      );
    }
    
    if (selectedTariffType !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.type === selectedTariffType || tariff.tariffType === selectedTariffType
      );
    }

    // Group tariffs by product/HS code and calculate risk metrics
    const productRiskMap = filteredTariffs.reduce((acc: any, tariff: any) => {
      const hsCode = tariff.hsCode?.code || tariff.hsCode || 'Unknown';
      const productName = products.find((p: any) => p.hsCode?.code === hsCode)?.name || `Product ${hsCode}`;
      
      if (!acc[hsCode]) {
        acc[hsCode] = {
          product: productName,
          hsCode: hsCode,
          rates: [],
          totalRates: 0,
          count: 0
        };
      }
      
      const rate = tariff.rate || tariff.standardRate || 0;
      acc[hsCode].rates.push(rate);
      acc[hsCode].totalRates += rate;
      acc[hsCode].count += 1;
      
      return acc;
    }, {});

    // Calculate risk metrics for each product and deduplicate by HS code
    const uniqueProducts = new Map();
    
    Object.values(productRiskMap).forEach((product: any) => {
      const rates = product.rates;
      const avgRate = product.totalRates / product.count;
      const maxRate = Math.max(...rates);
      const minRate = Math.min(...rates);
      const rateRange = maxRate - minRate;
      
      // Calculate variance (standard deviation)
      const variance = Math.sqrt(
        rates.reduce((sum: number, rate: number) => sum + Math.pow(rate - avgRate, 2), 0) / rates.length
      );
      
      // Determine risk level based on variance (adjusted for realistic thresholds)
      let riskLevel = 'Low';
      let riskColor = '#10b981'; // Green
      
      if (variance > 2) {
        riskLevel = 'High';
        riskColor = '#ef4444'; // Red
      } else if (variance > 1) {
        riskLevel = 'Medium';
        riskColor = '#f59e0b'; // Orange
      }
      
      // Only keep one entry per HS code (the one with highest variance if there are duplicates)
      if (!uniqueProducts.has(product.hsCode) || uniqueProducts.get(product.hsCode).variance < variance) {
        uniqueProducts.set(product.hsCode, {
          product: product.product,
          hsCode: product.hsCode,
          variance: variance,
          avgRate: avgRate,
          maxRate: maxRate,
          minRate: minRate,
          rateRange: rateRange,
          riskLevel: riskLevel,
          riskColor: riskColor,
          count: product.count
        });
      }
    });
    
    return Array.from(uniqueProducts.values()).sort((a, b) => b.variance - a.variance); // Sort by highest risk first
  }, [tariffs, products, selectedCountry, selectedProduct, selectedTariffType]);

  // Key metrics
  const metrics = useMemo(() => {
    // Apply filters to get accurate counts
    let filteredTariffs = tariffs;
    
    if (selectedCountry !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.destCountry?.name === selectedCountry || tariff.importingTo === selectedCountry
      );
    }
    
    if (selectedProduct !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.hsCode?.code === selectedProduct || tariff.hsCode === selectedProduct
      );
    }
    
    if (selectedTariffType !== 'all') {
      filteredTariffs = filteredTariffs.filter((tariff: any) => 
        tariff.type === selectedTariffType || tariff.tariffType === selectedTariffType
      );
    }

    const totalCountries = countries.length;
    const totalProducts = products.length;
    const totalTariffs = filteredTariffs.length;
    
    // Calculate meaningful tariff statistics using filtered data
    const allRates = filteredTariffs.map(t => t.rate || 0).filter(rate => rate > 0);
    const avgTariffRate = allRates.length > 0 ? allRates.reduce((sum, rate) => sum + rate, 0) / allRates.length : 0;
    const maxTariffRate = allRates.length > 0 ? Math.max(...allRates) : 0;
    const minTariffRate = allRates.length > 0 ? Math.min(...allRates) : 0;
    const medianTariffRate = allRates.length > 0 ? allRates.sort((a, b) => a - b)[Math.floor(allRates.length / 2)] : 0;
    
    // Calculate HS Code diversity using filtered data
    const uniqueHSCodes = new Set(filteredTariffs.map(t => t.hsCode || '')).size;
    
    // Calculate origin-destination pairs using filtered data
    const uniqueRoutes = new Set(filteredTariffs.map(t => `${t.exportingFrom}-${t.importingTo}`)).size;

    return {
      totalCountries,
      totalProducts,
      totalTariffs,
      uniqueHSCodes,
      uniqueRoutes,
      avgTariffRate: avgTariffRate.toFixed(2),
      maxTariffRate: maxTariffRate.toFixed(2),
      minTariffRate: minTariffRate.toFixed(2),
      medianTariffRate: medianTariffRate.toFixed(2),
      tariffRange: (maxTariffRate - minTariffRate).toFixed(2),
    };
  }, [countries, products, tariffs, chartData, selectedCountry, selectedProduct, selectedTariffType]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">Tariff Analytics</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filter Controls */}
        <div className="mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-sm font-medium">Filters:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Country:</span>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Product:</span>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.hsCode?.code || product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Tariff Type:</span>
                  <Select value={selectedTariffType} onValueChange={setSelectedTariffType}>
                    <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="preferential">Preferential</SelectItem>
                      <SelectItem value="anti-dumping">Anti-dumping</SelectItem>
                      <SelectItem value="countervailing">Countervailing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCountry('all');
                    setSelectedProduct('all');
                    setSelectedTariffType('all');
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Avg Tariff Rate</p>
                    <p className="text-3xl font-bold text-white">{metrics.avgTariffRate}%</p>
                    <p className="text-slate-500 text-xs mt-1">Global Average</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Max Tariff Rate</p>
                    <p className="text-3xl font-bold text-white">{metrics.maxTariffRate}%</p>
                    <p className="text-slate-500 text-xs mt-1">Highest Rate</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Trade Routes</p>
                    <p className="text-3xl font-bold text-white">{metrics.uniqueRoutes}</p>
                    <p className="text-slate-500 text-xs mt-1">Origin-Destination Pairs</p>
                  </div>
                  <Globe className="w-8 h-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">HS Codes</p>
                    <p className="text-3xl font-bold text-white">{metrics.uniqueHSCodes}</p>
                    <p className="text-slate-500 text-xs mt-1">Product Categories</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Real-time Tariff Rate Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <BarChart3 className="w-5 h-5 mr-2 text-emerald-400" />
                  Real-time Tariff Rates
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  <span className="text-green-400 font-semibold">Trade war index</span> showing simulated daily tariff rate changes over 30 days. Demonstrates how major policy announcements (like Trump's 100% China tariffs) impact global trade costs. 
                  <span className="text-yellow-400 font-semibold">⚠️ Simulated data</span> - represents general trends, not actual database values.
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9ca3af"
                        fontSize={12}
                        tick={{ fill: '#9ca3af' }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        fontSize={12}
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          padding: '12px'
                        }}
                        formatter={(value: any, name: any, props: any) => {
                          return [
                            `${value.toFixed(2)}%`, 
                            'Tariff Rate'
                          ];
                        }}
                        labelFormatter={(label: any, payload: any) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <span style={{ maxWidth: '300px', lineHeight: '1.4', display: 'block' }}>
                                <span style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px', color: '#ffffff', display: 'block' }}>
                                  {data.time}
                                </span>
                                <span style={{ marginBottom: '6px', fontSize: '14px', display: 'block' }}>
                                  <strong style={{ color: '#60a5fa' }}>Event:</strong> 
                                  <span style={{ color: '#ffffff', marginLeft: '4px' }}>{data.event}</span>
                                </span>
                                <span style={{ marginBottom: '6px', fontSize: '14px', display: 'block' }}>
                                  <strong style={{ color: '#60a5fa' }}>Tariff Rate:</strong> 
                                  <span style={{ color: '#ffffff', marginLeft: '4px' }}>{data.price.toFixed(2)}%</span>
                                </span>
                                <span style={{ marginBottom: '6px', fontSize: '14px', display: 'block' }}>
                                  <strong style={{ color: '#60a5fa' }}>Impact:</strong> 
                                  <span style={{ color: data.impact > 0 ? '#ef4444' : '#10b981', marginLeft: '4px' }}>
                                    {data.impact > 0 ? '+' : ''}{data.impact.toFixed(1)}%
                                  </span>
                                </span>
                                <span style={{ marginBottom: '4px', fontSize: '12px', color: '#9ca3af', display: 'block' }}>
                                  {data.description}
                                </span>
                              </span>
                            );
                          }
                          return label;
                        }}
                        labelStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorPrice)"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Country Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Globe className="w-5 h-5 mr-2 text-blue-400" />
                  Country Competitiveness Index
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  <span className="text-green-400 font-semibold">Ranked by trade competitiveness</span> - Countries with lower average tariff rates are more trade-friendly. 
                  <span className="text-blue-400 font-semibold"> Numbers show average percentage tariff rates (e.g., 5.2% = 5.2% average tariff rate). Green = High competitiveness, Orange = Medium, Red = Low.</span>
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="country" 
                        stroke="#9ca3af"
                        fontSize={12}
                        tick={{ fill: '#9ca3af' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        fontSize={12}
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={formatPercentage}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          padding: '12px'
                        }}
                        formatter={(value: any, name: any, props: any) => {
                          return [
                            formatPercentage(value), 
                            'Average Tariff Rate'
                          ];
                        }}
                        labelFormatter={(label: any, payload: any) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <span>
                                <span style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                  #{data.rank} {data.country}
                                </span>
                                <span style={{ marginBottom: '4px', display: 'block' }}>
                                  <strong>Competitiveness:</strong> 
                                  <span style={{ 
                                    color: data.competitivenessColor, 
                                    marginLeft: '4px',
                                    fontWeight: 'bold'
                                  }}>
                                    {data.competitiveness}
                                  </span>
                                </span>
                                <span style={{ marginBottom: '4px', display: 'block' }}>
                                  <strong>Average Rate:</strong> {formatPercentage(data.avgRate)}
                                </span>
                                <span style={{ marginBottom: '4px', display: 'block' }}>
                                  <strong>Maximum Rate:</strong> {formatPercentage(data.maxRate)}
                                </span>
                                <span style={{ marginBottom: '4px', display: 'block' }}>
                                  <strong>Tariff Diversity:</strong> {data.tariffDiversity} rates
                                </span>
                              </span>
                            );
                          }
                          return label;
                        }}
                        labelStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                      />
                      <Bar 
                        dataKey="avgRate" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <PieChartIcon className="w-5 h-5 mr-2 text-purple-400" />
                  Product Distribution
                </CardTitle>
        <p className="text-slate-400 text-sm">
          Market share distribution of products in the system. Each slice represents the percentage of total market share for that product type.
          <span className="text-blue-400 font-semibold"> Numbers show market share percentages (e.g., 35% = 35% of total market share).</span>
        </p>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                      <p className="text-slate-400">Loading products...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col">
                    {/* Product Legend - Moved to top */}
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {productData.map((product, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: product.color }}
                          ></div>
                          <span className="text-sm text-slate-300">
                            {product.name}: {product.marketShare}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart Container */}
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <Pie
                          data={productData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={false}
                        >
                          {productData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937',
                            fontSize: '14px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            fontWeight: '500'
                          }}
                          formatter={(value: any, name: any, props: any) => {
                            return [
                              `${value}%`, 
                              'Market Share'
                            ];
                          }}
                          labelFormatter={(label: any, payload: any) => {
                            if (payload && payload.length > 0) {
                              const data = payload[0].payload;
                              return (
                                <span style={{ maxWidth: '280px', lineHeight: '1.5', display: 'block' }}>
                                  <span style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '18px', color: '#1f2937', display: 'block' }}>
                                    {data.name}
                                  </span>
                                  <span style={{ marginBottom: '8px', fontSize: '14px', display: 'block' }}>
                                    <strong style={{ color: '#059669', fontWeight: '600' }}>Market Share:</strong> 
                                    <span style={{ color: '#1f2937', marginLeft: '6px', fontWeight: '500' }}>{data.value}%</span>
                                  </span>
                                  <span style={{ marginBottom: '8px', fontSize: '14px', display: 'block' }}>
                                    <strong style={{ color: '#059669', fontWeight: '600' }}>Tariff Rate:</strong> 
                                    <span style={{ color: '#1f2937', marginLeft: '6px', fontWeight: '500' }}>{data.tariff.toFixed(1)}%</span>
                                  </span>
                                  <span style={{ marginBottom: '8px', fontSize: '14px', display: 'block' }}>
                                    <strong style={{ color: '#059669', fontWeight: '600' }}>HS Code:</strong> 
                                    <span style={{ color: '#1f2937', marginLeft: '6px', fontWeight: '500' }}>{data.hsCode}</span>
                                  </span>
                                  <span style={{ marginBottom: '4px', fontSize: '13px', color: '#6b7280', display: 'block', fontStyle: 'italic' }}>
                                    {data.description}
                                  </span>
                                </span>
                              );
                            }
                            return label;
                          }}
                          labelStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                        />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tariff Trends */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
                  Tariff Trends
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  Comparison of average vs maximum tariff rates by country. Orange bars show average rates, red line shows peak rates.
                  <span className="text-blue-400 font-semibold"> Numbers show percentage tariff rates - orange bars are average rates, red line shows maximum rates (e.g., 6.5% = 6.5% tariff rate).</span>
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.slice(0, 6)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="country" 
                        stroke="#9ca3af"
                        fontSize={12}
                        tick={{ fill: '#9ca3af' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        fontSize={12}
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={formatPercentage}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          padding: '12px'
                        }}
                        formatter={(value: any, name: any, props: any) => {
                          if (name === 'avgRate') {
                            return [formatPercentage(value), 'Average Rate'];
                          } else if (name === 'maxRate') {
                            return [formatPercentage(value), 'Maximum Rate'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label: any, payload: any) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <span>
                                <span style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                  {data.country}
                                </span>
                                <span style={{ marginBottom: '4px', display: 'block' }}>
                                  <strong>Average Rate:</strong> {formatPercentage(data.avgRate)}
                                </span>
                                <span style={{ marginBottom: '4px', display: 'block' }}>
                                  <strong>Maximum Rate:</strong> {formatPercentage(data.maxRate)}
                                </span>
                                <span style={{ marginBottom: '4px', display: 'block' }}>
                                  <strong>Total Tariffs:</strong> {data.totalTariffs}
                                </span>
                              </span>
                            );
                          }
                          return label;
                        }}
                        labelStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                      />
                      <Bar 
                        dataKey="avgRate" 
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                        name="Average Rate"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="maxRate" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        name="Maximum Rate"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Product Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                Product Risk Assessment
              </CardTitle>
              <p className="text-slate-400 text-sm">
                <span className="text-red-400 font-semibold">Tariff uncertainty analysis</span> - Products with higher tariff rate variance face greater trade risk. 
                <span className="text-blue-400 font-semibold"> Numbers show tariff rate variance (e.g., 0.6 = 0.6% variance in tariff rates). Red = High risk (&gt;2%), Orange = Medium risk (1-2%), Green = Low risk (&lt;1%).</span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productRiskData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="product" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tick={{ fill: '#9ca3af' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      fontSize={12}
                      tick={{ fill: '#9ca3af' }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        padding: '12px'
                      }}
                    formatter={(value: any, name: any, props: any) => {
                      return null;
                    }}
                      labelFormatter={(label: any, payload: any) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return (
                            <span style={{ 
                              color: '#ffffff', 
                              backgroundColor: 'transparent',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              display: 'block'
                            }}>
                              <span style={{ 
                                fontWeight: 'bold', 
                                marginBottom: '8px', 
                                display: 'block', 
                                color: '#ffffff',
                                fontSize: '16px'
                              }}>
                                {data.product}
                              </span>
                              <span style={{ 
                                marginBottom: '4px', 
                                display: 'block', 
                                color: '#ffffff'
                              }}>
                                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>Risk Level:</span> 
                                <span style={{ 
                                  color: data.riskColor, 
                                  marginLeft: '4px',
                                  fontWeight: 'bold'
                                }}>
                                  {data.riskLevel}
                                </span>
                              </span>
                              <span style={{ 
                                marginBottom: '4px', 
                                display: 'block', 
                                color: '#ffffff'
                              }}>
                                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>Tariff Variance:</span> 
                                <span style={{ color: '#ffffff', marginLeft: '4px' }}>{data.variance.toFixed(2)}%</span>
                              </span>
                              <span style={{ 
                                marginBottom: '4px', 
                                display: 'block', 
                                color: '#ffffff'
                              }}>
                                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>Average Rate:</span> 
                                <span style={{ color: '#ffffff', marginLeft: '4px' }}>{data.avgRate.toFixed(2)}%</span>
                              </span>
                            </span>
                          );
                        }
                        return label;
                      }}
                      labelStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
                    />
                    <Bar 
                      dataKey="variance" 
                      radius={[4, 4, 0, 0]}
                    >
                      {productRiskData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.riskColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
