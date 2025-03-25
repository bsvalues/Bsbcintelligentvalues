/**
 * MarketMetricsCard Component
 * 
 * A card component that displays key market metrics for a selected area
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMarketMetrics } from '../../hooks/useMarketData';
import { DataLoadingState } from '../common/DataLoadingState';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface MarketMetricsCardProps {
  area: string;
  areaType: 'city' | 'neighborhood' | 'county' | 'zip';
  className?: string;
}

export function MarketMetricsCard({ area, areaType, className = '' }: MarketMetricsCardProps) {
  const { data: marketMetrics, isLoading, isError, error, refetch } = useMarketMetrics(area, areaType);
  
  // Check if data is empty
  const isEmpty = !marketMetrics;
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format percentage values
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };
  
  // Determine trend icon and color based on change value
  const getTrendIndicator = (change: number) => {
    if (change > 0) {
      return { icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-500' };
    } else if (change < 0) {
      return { icon: <TrendingDown className="h-4 w-4" />, color: 'text-red-500' };
    } else {
      return { icon: <Minus className="h-4 w-4" />, color: 'text-gray-500' };
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Market Metrics</CardTitle>
        <CardDescription>
          Current market metrics for {areaType === 'county' ? 'County' : areaType} of {area}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataLoadingState
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          error={error as Error}
          onRetry={() => refetch()}
          emptyText={`No market data available for ${area}`}
        >
          {marketMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Average Price */}
              <div className="bg-muted rounded-md p-3">
                <div className="text-sm text-muted-foreground">Average Price</div>
                <div className="text-xl font-bold mt-1">
                  {formatCurrency(marketMetrics.metrics.averagePrice)}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className={getTrendIndicator(marketMetrics.yearOverYearChanges.averagePrice).color}>
                    {getTrendIndicator(marketMetrics.yearOverYearChanges.averagePrice).icon}
                  </span>
                  <span className={`ml-1 ${getTrendIndicator(marketMetrics.yearOverYearChanges.averagePrice).color}`}>
                    {formatPercent(marketMetrics.yearOverYearChanges.averagePrice)}
                  </span>
                  <span className="ml-1 text-muted-foreground">YoY</span>
                </div>
              </div>
              
              {/* Median Price */}
              <div className="bg-muted rounded-md p-3">
                <div className="text-sm text-muted-foreground">Median Price</div>
                <div className="text-xl font-bold mt-1">
                  {formatCurrency(marketMetrics.metrics.medianPrice)}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className={getTrendIndicator(marketMetrics.yearOverYearChanges.medianPrice).color}>
                    {getTrendIndicator(marketMetrics.yearOverYearChanges.medianPrice).icon}
                  </span>
                  <span className={`ml-1 ${getTrendIndicator(marketMetrics.yearOverYearChanges.medianPrice).color}`}>
                    {formatPercent(marketMetrics.yearOverYearChanges.medianPrice)}
                  </span>
                  <span className="ml-1 text-muted-foreground">YoY</span>
                </div>
              </div>
              
              {/* Price Per Sq Ft */}
              <div className="bg-muted rounded-md p-3">
                <div className="text-sm text-muted-foreground">Price Per Sq Ft</div>
                <div className="text-xl font-bold mt-1">
                  {formatCurrency(marketMetrics.metrics.averagePricePerSqFt)}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className={getTrendIndicator(marketMetrics.yearOverYearChanges.averagePricePerSqFt).color}>
                    {getTrendIndicator(marketMetrics.yearOverYearChanges.averagePricePerSqFt).icon}
                  </span>
                  <span className={`ml-1 ${getTrendIndicator(marketMetrics.yearOverYearChanges.averagePricePerSqFt).color}`}>
                    {formatPercent(marketMetrics.yearOverYearChanges.averagePricePerSqFt)}
                  </span>
                  <span className="ml-1 text-muted-foreground">YoY</span>
                </div>
              </div>
              
              {/* Days on Market */}
              <div className="bg-muted rounded-md p-3">
                <div className="text-sm text-muted-foreground">Days on Market</div>
                <div className="text-xl font-bold mt-1">
                  {marketMetrics.metrics.averageDaysOnMarket.toFixed(0)}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className={getTrendIndicator(-marketMetrics.yearOverYearChanges.averageDaysOnMarket).color}>
                    {getTrendIndicator(-marketMetrics.yearOverYearChanges.averageDaysOnMarket).icon}
                  </span>
                  <span className={`ml-1 ${getTrendIndicator(-marketMetrics.yearOverYearChanges.averageDaysOnMarket).color}`}>
                    {formatPercent(marketMetrics.yearOverYearChanges.averageDaysOnMarket)}
                  </span>
                  <span className="ml-1 text-muted-foreground">YoY</span>
                </div>
              </div>
              
              {/* Additional Metrics */}
              <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-4 mt-2">
                <div className="bg-muted bg-opacity-50 rounded-md p-3">
                  <div className="text-sm text-muted-foreground">Total Properties</div>
                  <div className="text-lg font-semibold mt-1">
                    {marketMetrics.metrics.totalProperties.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-muted bg-opacity-50 rounded-md p-3">
                  <div className="text-sm text-muted-foreground">Total Sales (Year)</div>
                  <div className="text-lg font-semibold mt-1">
                    {marketMetrics.metrics.totalSales.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-muted bg-opacity-50 rounded-md p-3">
                  <div className="text-sm text-muted-foreground">List/Sale Ratio</div>
                  <div className="text-lg font-semibold mt-1">
                    {(marketMetrics.metrics.listToSaleRatio * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Snapshot Date */}
              <div className="col-span-2 md:col-span-4 text-xs text-muted-foreground mt-2">
                Data as of: {new Date(marketMetrics.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}
        </DataLoadingState>
      </CardContent>
    </Card>
  );
}