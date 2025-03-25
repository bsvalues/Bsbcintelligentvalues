/**
 * Market Data Hooks
 * 
 * Custom hooks for fetching market-related data
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';
import type { 
  MarketMetricsSnapshot,
  MarketTrend,
  MarketPrediction,
  MarketAlert,
  NeighborhoodComparison,
  HeatMapData,
  MarketSearchFilters
} from '../types/marketTypes';

/**
 * Fetch market metrics for a specific area
 */
export function useMarketMetrics(
  area: string,
  areaType: 'city' | 'neighborhood' | 'county' | 'zip' = 'county',
) {
  return useQuery<MarketMetricsSnapshot>({
    queryKey: [`/api/market/metrics/${areaType}/${area}`],
    enabled: !!area, // Only run query if area is provided
  });
}

/**
 * Fetch market trend data for a specific metric over time
 */
export function useMarketTrend(
  area: string,
  areaType: 'city' | 'neighborhood' | 'county' | 'zip' = 'county',
  metric: 'averagePrice' | 'medianPrice' | 'salesVolume' | 'daysOnMarket' | 'pricePerSqFt' = 'medianPrice',
  timeframe: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
) {
  return useQuery<MarketTrend>({
    queryKey: [`/api/market/trends/${areaType}/${area}/${metric}/${timeframe}`],
    enabled: !!area, // Only run query if area is provided
  });
}

/**
 * Fetch market predictions for a specific area
 */
export function useMarketPredictions(
  area: string,
  areaType: 'city' | 'neighborhood' | 'county' | 'zip' = 'county',
  predictionType: 'short_term' | 'medium_term' | 'long_term' = 'short_term',
) {
  return useQuery<MarketPrediction>({
    queryKey: [`/api/market/predictions/${areaType}/${area}/${predictionType}`],
    enabled: !!area, // Only run query if area is provided
  });
}

/**
 * Fetch market alerts
 */
export function useMarketAlerts(
  area?: string,
  areaType?: 'city' | 'neighborhood' | 'county' | 'zip',
  limit: number = 10
) {
  // Build query parameters
  const params = new URLSearchParams();
  
  if (area) params.append('area', area);
  if (areaType) params.append('areaType', areaType);
  params.append('limit', limit.toString());
  
  const queryString = params.toString();
  const endpoint = `/api/market/alerts${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<MarketAlert[]>({
    queryKey: [endpoint],
  });
}

/**
 * Fetch neighborhood comparison data
 */
export function useNeighborhoodComparison(countyName: string) {
  return useQuery<NeighborhoodComparison>({
    queryKey: [`/api/market/neighborhoods/comparison/${countyName}`],
    enabled: !!countyName, // Only run query if countyName is provided
  });
}

/**
 * Fetch heat map data for visualization
 */
export function useHeatMapData(
  area: string,
  areaType: 'city' | 'neighborhood' | 'county' | 'zip' = 'county',
  metric: 'price' | 'priceChange' | 'daysOnMarket' | 'salesVolume' = 'price',
) {
  return useQuery<HeatMapData>({
    queryKey: [`/api/spatial/heatmap/${areaType}/${area}/${metric}`],
    enabled: !!area, // Only run query if area is provided
  });
}

/**
 * Fetch available areas (counties, cities, neighborhoods, or zip codes)
 */
export function useAreas(areaType: 'city' | 'neighborhood' | 'county' | 'zip' = 'county') {
  return useQuery<string[]>({
    queryKey: [`/api/market/areas/${areaType}`],
  });
}

/**
 * Mark a market alert as read
 */
export function useMarkAlertRead() {
  return useMutation({
    mutationFn: (alertId: string) => {
      return apiRequest(`/api/market/alerts/${alertId}/read`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      // Invalidate market alerts query when an alert is marked as read
      queryClient.invalidateQueries({ queryKey: ['/api/market/alerts'] });
    },
  });
}