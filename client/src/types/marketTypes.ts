/**
 * Market Data Types
 * 
 * This file defines interfaces for market-related data structures
 * used throughout the application.
 */

/**
 * Market metrics snapshot data
 */
export interface MarketMetricsSnapshot {
  id: string;
  date: string;
  area: string;
  areaType: 'city' | 'neighborhood' | 'county' | 'zip';
  metrics: {
    averagePrice: number;
    medianPrice: number;
    averagePricePerSqFt: number;
    totalProperties: number;
    totalSales: number;
    averageDaysOnMarket: number;
    listToSaleRatio: number;
    foreclosureRate?: number;
  };
  yearOverYearChanges: {
    averagePrice: number;
    medianPrice: number;
    averagePricePerSqFt: number;
    totalSales: number;
    averageDaysOnMarket: number;
  };
}

/**
 * Market trend data (time series)
 */
export interface MarketTrend {
  area: string;
  areaType: 'city' | 'neighborhood' | 'county' | 'zip';
  metric: 'averagePrice' | 'medianPrice' | 'salesVolume' | 'daysOnMarket' | 'pricePerSqFt';
  timeframe: 'monthly' | 'quarterly' | 'yearly';
  data: {
    date: string;
    value: number;
  }[];
}

/**
 * Market prediction data
 */
export interface MarketPrediction {
  id: string;
  area: string;
  areaType: 'city' | 'neighborhood' | 'county' | 'zip';
  generatedDate: string;
  predictionType: 'short_term' | 'medium_term' | 'long_term';
  predictions: {
    metric: 'averagePrice' | 'medianPrice' | 'salesVolume' | 'daysOnMarket';
    values: {
      date: string;
      predicted: number;
      confidenceLow?: number;
      confidenceHigh?: number;
    }[];
  }[];
  factors: {
    name: string;
    impact: 'high' | 'medium' | 'low';
    direction: 'positive' | 'negative' | 'neutral';
  }[];
}

/**
 * Market alert data
 */
export interface MarketAlert {
  id: string;
  date: string;
  area: string;
  areaType: 'city' | 'neighborhood' | 'county' | 'zip';
  type: 'trend_change' | 'threshold_breach' | 'anomaly' | 'forecast';
  severity: 'high' | 'medium' | 'low' | 'info';
  metric: string;
  message: string;
  previousValue?: number;
  newValue?: number;
  percentChange?: number;
  read: boolean;
}

/**
 * Neighborhood comparison data
 */
export interface NeighborhoodComparison {
  date: string;
  neighborhoods: {
    name: string;
    metrics: {
      averagePrice: number;
      medianPrice: number;
      averagePricePerSqFt: number;
      totalSales: number;
      averageDaysOnMarket: number;
      yearOverYearAppreciation: number;
    };
  }[];
}

/**
 * Market search filters
 */
export interface MarketSearchFilters {
  area?: string;
  areaType?: 'city' | 'neighborhood' | 'county' | 'zip';
  dateStart?: string;
  dateEnd?: string;
  metric?: string;
  predictionType?: 'short_term' | 'medium_term' | 'long_term';
}

/**
 * Property heat map data for visualization
 */
export interface HeatMapData {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  points: {
    lat: number;
    lng: number;
    weight: number; // Value for heat intensity (0-1)
  }[];
  metric: 'price' | 'priceChange' | 'daysOnMarket' | 'salesVolume';
  date: string;
}