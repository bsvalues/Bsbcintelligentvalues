import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

// Market data types
export interface MarketMetrics {
  county: string;
  date: string;
  medianSalePrice: number;
  averageSalePrice: number;
  totalSales: number;
  daysOnMarket: number;
  listToSaleRatio: number;
  pricePerSquareFoot: number;
  inventoryCount: number;
  newListings: number;
  changeInMedianPrice: number; // percentage change from previous period
  foreclosureRate: number;
  assessmentRatio: number; // assessed value to market value ratio
}

export interface MarketTrendData {
  date: string;
  medianSalePrice: number;
  averageSalePrice: number;
  totalSales: number;
  daysOnMarket: number;
  listToSaleRatio: number;
  pricePerSquareFoot: number;
  inventoryCount: number;
  assessmentRatio: number;
}

export interface MarketHeatmapPoint {
  latitude: number;
  longitude: number;
  value: number; // typically price or ratio
  neighborhood: string;
  county: string;
}

// Function to get current market metrics for a county
export function useMarketMetrics(county: string) {
  return useQuery({
    queryKey: ['/api/market/metrics', county],
    queryFn: async () => {
      const response = await apiRequest<MarketMetrics>(`/api/market/metrics?county=${county}`);
      return response;
    },
    enabled: !!county,
  });
}

// Function to get market trends over time
export function useMarketTrends(county: string, startDate?: string, endDate?: string, metric: string = 'medianSalePrice') {
  return useQuery({
    queryKey: ['/api/market/trends', county, startDate, endDate, metric],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('county', county);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('metric', metric);
      
      const response = await apiRequest<MarketTrendData[]>(`/api/market/trends?${params.toString()}`);
      return response;
    },
    enabled: !!county,
  });
}

// Function to get neighborhood comparison data
export function useNeighborhoodComparison(county: string) {
  return useQuery({
    queryKey: ['/api/market/neighborhood-comparison', county],
    queryFn: async () => {
      const response = await apiRequest<Array<{
        neighborhood: string;
        medianSalePrice: number;
        averageSalePrice: number;
        totalSales: number;
        daysOnMarket: number;
        pricePerSquareFoot: number;
        assessmentRatio: number;
      }>>(`/api/market/neighborhood-comparison?county=${county}`);
      return response;
    },
    enabled: !!county,
  });
}

// Function to get market heatmap data
export function useMarketHeatmap(county: string, metric: string = 'pricePerSquareFoot') {
  return useQuery({
    queryKey: ['/api/market/heatmap', county, metric],
    queryFn: async () => {
      const response = await apiRequest<MarketHeatmapPoint[]>(
        `/api/market/heatmap?county=${county}&metric=${metric}`
      );
      return response;
    },
    enabled: !!county,
  });
}

// Function to get assessment ratio trends
export function useAssessmentRatioTrends(county: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['/api/market/assessment-ratio-trends', county, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('county', county);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await apiRequest<Array<{
        date: string;
        assessmentRatio: number;
        medianAssessmentRatio: number;
        coefficientOfDispersion: number;
        priceRelatedDifferential: number;
      }>>(`/api/market/assessment-ratio-trends?${params.toString()}`);
      return response;
    },
    enabled: !!county,
  });
}