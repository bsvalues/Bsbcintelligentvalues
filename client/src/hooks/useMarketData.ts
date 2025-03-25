import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export interface MarketMetrics {
  county: string;
  medianSalePrice: number;
  averageSalePrice: number;
  totalSales: number;
  daysOnMarket: number;
  pricePerSquareFoot: number;
  inventoryCount: number;
  newListings: number;
  assessmentRatio: number;
  trendDirection: 'up' | 'down' | 'stable';
  month: number;
  year: number;
  timestamp: string;
}

export interface MarketTrend {
  metric: string;
  data: Array<{
    date: string;
    value: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  forecast?: Array<{
    date: string;
    value: number;
    lowerBound?: number;
    upperBound?: number;
  }>;
}

export interface MarketHotspot {
  id: string;
  neighborhood: string;
  county: string;
  city: string;
  state: string;
  zipCode: string;
  medianSalePrice: number;
  priceChangePercent: number;
  averageDaysOnMarket: number;
  salesVolume: number;
  inventoryCount: number;
  supplyDemandIndex: number;
  investmentScore: number;
  latitude: number;
  longitude: number;
}

/**
 * Hook for fetching market metrics for a county
 */
export function useMarketMetrics(county: string) {
  return useQuery<MarketMetrics>({
    queryKey: ['/api/market', county, 'metrics'],
    queryFn: async () => {
      const response = await fetch(`/api/market/${encodeURIComponent(county)}/metrics`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch market metrics');
      }
      
      return response.json();
    },
    enabled: !!county,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching market trends
 */
export function useMarketTrend(metric: string, county: string, period: 'month' | 'quarter' | 'year' = 'year') {
  return useQuery<MarketTrend>({
    queryKey: ['/api/market', 'trends', metric, county, period],
    queryFn: async () => {
      const response = await fetch(`/api/predict-market-trend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric,
          county,
          period,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch market trend');
      }
      
      return response.json();
    },
    enabled: !!metric && !!county,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching market hotspots
 */
export function useMarketHotspots(county: string) {
  return useQuery<MarketHotspot[]>({
    queryKey: ['/api/market', 'hotspots', county],
    queryFn: async () => {
      const response = await fetch(`/api/find-hotspots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          county,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch market hotspots');
      }
      
      return response.json();
    },
    enabled: !!county,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}