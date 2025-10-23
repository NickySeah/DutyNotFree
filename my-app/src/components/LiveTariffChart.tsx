'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface LiveTariffChartProps {
  productName: string;
  baseValue: number;
  tariffRate: number;
  isCalculating: boolean;
}

export default function LiveTariffChart({ 
  productName, 
  baseValue, 
  tariffRate, 
  isCalculating 
}: LiveTariffChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(baseValue);
  const [trend, setTrend] = useState<'up' | 'down'>('up');
  const [change, setChange] = useState(0);

  // Generate real-time data
  useEffect(() => {
    const generateData = () => {
      const data = [];
      const now = new Date();
      const basePrice = baseValue;
      
      // Define the range bounds - start from base value
      const rangeMin = basePrice; // Start from base value
      const rangeMax = Math.max(basePrice * 1.15, finalPrice * 1.05); // Ensure range includes final price
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily intervals (24 hours)
        
        // Create a progression from basePrice to finalPrice, with some variation
        const progress = (29 - i) / 29; // 0 to 1
        const baseProgression = rangeMin + (finalPrice - rangeMin) * progress;
        const variation = (Math.random() - 0.5) * (basePrice * 0.02); // 2% variation
        const price = Math.max(rangeMin, Math.min(rangeMax, baseProgression + variation));
        
        data.push({
          time: time.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          }),
          price: price,
          timestamp: time.getTime(),
        });
      }
      
      return data;
    };

    const data = generateData();
    // Set the final data point to the computed total landed cost
    if (data.length > 0) {
      data[data.length - 1].price = finalPrice;
    }
    
    // Calculate initial change based on final price vs base value
    const initialChange = ((finalPrice - baseValue) / baseValue) * 100;
    setChange(initialChange);
    setCurrentPrice(finalPrice);
    
    setChartData(data);
    console.log('Initial chart data generated:', {
      dataLength: data.length,
      sampleData: data.slice(0, 3),
      baseValue,
      finalPrice
    });
  }, [baseValue]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isCalculating) return;

    const interval = setInterval(() => {
      setChartData(prevData => {
        const newData = [...prevData];
        const lastPrice = newData[newData.length - 1]?.price || baseValue;
        const variation = (Math.random() - 0.5) * (baseValue * 0.08); // 8% variation for more impact
        const newPrice = lastPrice + variation; // Allow more dynamic movement
        
        // Update trend
        const newTrend = newPrice > lastPrice ? 'up' : 'down';
        setTrend(newTrend);
        setChange(((newPrice - baseValue) / baseValue) * 100);
        setCurrentPrice(newPrice);
        
        // Add new data point and remove oldest
        newData.push({
          time: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          }),
          price: newPrice,
          timestamp: Date.now(),
        });
        
        const finalData = newData.slice(-30); // Keep last 30 points
        console.log('Updated chart data:', {
          dataLength: finalData.length,
          currentPrice: newPrice,
          trend: newTrend,
          change: ((newPrice - baseValue) / baseValue) * 100
        });
        return finalData;
      });
    }, 30000); // 30 seconds for more realistic updates

    return () => clearInterval(interval);
  }, [isCalculating, baseValue]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

  // Debug logging for props
  console.log('LiveTariffChart Props:', { productName, baseValue, tariffRate, isCalculating });

  // Ensure we have valid values
  const validBaseValue = baseValue || 0;
  const validTariffRate = tariffRate || 0;
  const validCurrentPrice = currentPrice || validBaseValue;

  const finalPrice = validBaseValue + (validBaseValue * validTariffRate / 100);
  const tariffAmount = finalPrice - validBaseValue;

  console.log('Calculation Debug:', {
    baseValue: validBaseValue,
    currentPrice: validCurrentPrice,
    tariffRate: validTariffRate,
    finalPrice,
    tariffAmount
  });

  // Debug logging
  console.log('LiveTariffChart Debug:', {
    productName,
    baseValue,
    currentPrice,
    tariffRate,
    finalPrice,
    tariffAmount,
    chartDataLength: chartData.length,
    chartDataSample: chartData.slice(0, 3)
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCalculating ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></div>
            <h3 className="text-lg font-semibold text-white">{productName}</h3>
          </div>
          {isCalculating && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-4 h-4 text-green-400" />
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(finalPrice)}
            </div>
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(change)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[700px] w-full mb-8 -mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id={`colorGradient-${productName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="5 5" stroke="#6b7280" strokeWidth={2} horizontal={false} vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#ffffff"
              strokeWidth={3}
              fontSize={16}
              tick={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 16 }}
              interval="preserveStartEnd"
              axisLine={{ stroke: '#ffffff', strokeWidth: 3 }}
              tickLine={{ stroke: '#ffffff', strokeWidth: 2 }}
            />
            <YAxis 
              stroke="#ffffff"
              strokeWidth={3}
              fontSize={14}
              tick={{ fill: '#ffffff', fontWeight: 'bold', fontSize: 14 }}
              tickFormatter={formatCurrency}
              width={60}
              axisLine={{ stroke: '#ffffff', strokeWidth: 3 }}
              tickLine={{ stroke: '#ffffff', strokeWidth: 2 }}
              domain={['dataMin', 'dataMax']}
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
              formatter={(value: any) => [formatCurrency(value), 'Product Value']}
              labelStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={4}
              fill={`url(#colorGradient-${productName})`}
              dot={false}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
            />
            <ReferenceLine 
              y={validBaseValue} 
              stroke="#f59e0b" 
              strokeDasharray="10 5"
              strokeWidth={5}
            />
            <ReferenceLine 
              y={finalPrice} 
              stroke="#ef4444" 
              strokeDasharray="10 5"
              strokeWidth={5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Reference Line Labels - Positioned outside chart for better readability */}
      <div className="flex justify-between items-center mb-2 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-orange-500 border-dashed border-t-2 border-orange-500"></div>
          <span className="text-orange-500 font-bold text-sm">
            Base Price: {formatCurrency(validBaseValue)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-red-500 border-dashed border-t-2 border-red-500"></div>
          <span className="text-red-500 font-bold text-sm">
            Final Cost: {formatCurrency(finalPrice)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 flex flex-col items-center justify-center">
          <div className="text-slate-300 text-sm font-medium mb-1">Base Price</div>
          <div className="text-white font-bold text-lg">{formatCurrency(validBaseValue)}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 flex flex-col items-center justify-center">
          <div className="text-slate-300 text-sm font-medium mb-1">Tariff ({validTariffRate.toFixed(1)}%)</div>
          <div className="text-red-400 font-bold text-lg">{formatCurrency(tariffAmount)}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 flex flex-col items-center justify-center">
          <div className="text-slate-300 text-sm font-medium mb-1">Final Price</div>
          <div className="text-green-400 font-bold text-lg">{formatCurrency(finalPrice)}</div>
        </div>
      </div>
    </motion.div>
  );
}
