/**
 * MarketTrendChart Component
 * 
 * A chart component that displays market trends over time for a selected area and metric
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useMarketTrend } from '../../hooks/useMarketData';
import { DataLoadingState } from '../common/DataLoadingState';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface MarketTrendChartProps {
  area: string;
  areaType: 'city' | 'neighborhood' | 'county' | 'zip';
  className?: string;
}

export function MarketTrendChart({ area, areaType, className = '' }: MarketTrendChartProps) {
  // State for selected metric and timeframe
  const [metric, setMetric] = useState<'medianPrice' | 'averagePrice' | 'salesVolume' | 'daysOnMarket' | 'pricePerSqFt'>('medianPrice');
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  // Fetch market trend data
  const { data: marketTrend, isLoading, isError, error, refetch } = useMarketTrend(area, areaType, metric, timeframe);
  
  // Check if data is empty
  const isEmpty = !marketTrend || marketTrend.data.length === 0;
  
  // Format data for chart
  const formatChartData = () => {
    if (!marketTrend || !marketTrend.data) return [];
    
    return marketTrend.data.map(item => {
      // Parse date
      const date = new Date(item.date);
      
      // Format date label based on timeframe
      let dateLabel;
      if (timeframe === 'monthly') {
        dateLabel = format(date, 'MMM yyyy');
      } else if (timeframe === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        dateLabel = `Q${quarter} ${date.getFullYear()}`;
      } else {
        dateLabel = date.getFullYear().toString();
      }
      
      return {
        date: dateLabel,
        value: item.value,
        raw: item.date,
      };
    });
  };
  
  // Format y-axis values based on selected metric
  const formatYAxis = (value: number) => {
    if (metric === 'medianPrice' || metric === 'averagePrice') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 0,
      }).format(value);
    } else if (metric === 'pricePerSqFt') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    } else if (metric === 'daysOnMarket') {
      return `${value.toFixed(0)} days`;
    } else {
      return value.toLocaleString();
    }
  };
  
  // Format tooltip values
  const formatTooltipValue = (value: number) => {
    if (metric === 'medianPrice' || metric === 'averagePrice' || metric === 'pricePerSqFt') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    } else if (metric === 'daysOnMarket') {
      return `${value.toFixed(1)} days`;
    } else {
      return value.toLocaleString();
    }
  };
  
  // Get Y-axis domain to ensure chart doesn't start at zero for some metrics
  const getYAxisDomain = () => {
    if (!marketTrend || !marketTrend.data || marketTrend.data.length === 0) {
      return [0, 'auto'];
    }
    
    // For DOM and percentage metrics, we want to see small changes clearly
    if (metric === 'daysOnMarket') {
      const values = marketTrend.data.map(item => item.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max - min) * 0.1;
      return [Math.max(0, min - padding), max + padding];
    }
    
    return [0, 'auto'];
  };
  
  // Get chart color based on metric
  const getChartColor = () => {
    switch (metric) {
      case 'medianPrice':
      case 'averagePrice':
      case 'pricePerSqFt':
        return 'var(--primary)';
      case 'salesVolume':
        return 'var(--blue-9)';
      case 'daysOnMarket':
        return 'var(--orange-9)';
      default:
        return 'var(--primary)';
    }
  };
  
  // Get metric label
  const getMetricLabel = () => {
    switch (metric) {
      case 'medianPrice':
        return 'Median Price';
      case 'averagePrice':
        return 'Average Price';
      case 'pricePerSqFt':
        return 'Price Per Sq Ft';
      case 'salesVolume':
        return 'Sales Volume';
      case 'daysOnMarket':
        return 'Days on Market';
      default:
        return '';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle>Market Trends</CardTitle>
            <CardDescription>
              {getMetricLabel()} trends for {areaType === 'county' ? 'County' : areaType} of {area}
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Metric selector */}
            <Select value={metric} onValueChange={(value) => setMetric(value as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medianPrice">Median Price</SelectItem>
                <SelectItem value="averagePrice">Average Price</SelectItem>
                <SelectItem value="pricePerSqFt">Price Per Sq Ft</SelectItem>
                <SelectItem value="salesVolume">Sales Volume</SelectItem>
                <SelectItem value="daysOnMarket">Days on Market</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Timeframe selector */}
            <ToggleGroup type="single" value={timeframe} onValueChange={(value) => value && setTimeframe(value as any)}>
              <ToggleGroupItem value="monthly" size="sm">Monthly</ToggleGroupItem>
              <ToggleGroupItem value="quarterly" size="sm">Quarterly</ToggleGroupItem>
              <ToggleGroupItem value="yearly" size="sm">Yearly</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <DataLoadingState
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          error={error as Error}
          onRetry={() => refetch()}
          emptyText={`No trend data available for ${getMetricLabel()} in ${area}`}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formatChartData()}
                margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={getChartColor()} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                  domain={getYAxisDomain()}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number) => [formatTooltipValue(value), getMetricLabel()]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getChartColor()} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataLoadingState>
      </CardContent>
    </Card>
  );
}