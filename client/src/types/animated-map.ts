/**
 * Types for the Animated Property Trend Map
 * 
 * This file contains all the TypeScript type definitions for the property trend
 * visualization feature, including animation controls, property data points,
 * and market statistics.
 */

/**
 * Property point data for a single property on the map
 */
export interface PropertyPoint {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  latitude: number;
  longitude: number;
  propertyType: string;
  status: 'active' | 'pending' | 'sold' | 'off-market';
  daysOnMarket: number;
  listingDate?: string;
  priceChange?: number; // As percentage (0.05 = 5% increase)
  pricePerSqFt?: number;
  lastSoldPrice?: number;
  lastSoldDate?: string;
}

/**
 * Market statistics for a given time point
 */
export interface MarketStats {
  // Price metrics
  averagePriceChange: number; // As percentage (0.05 = 5% increase)
  medianPriceChange: number;
  priceVolatility: number;
  
  // Inventory metrics
  inventoryChange: number; // As percentage
  absorptionRate: number; // In months
  
  // Market health metrics
  marketHealth: number; // 0-10 scale
  
  // Velocity metrics
  avgDaysOnMarket: number;
  medianDaysOnMarket: number;
  turnoverRate: number;
  
  // Additional metrics
  priceToListRatio: number;
  competitivenessScore: number;
}

/**
 * Data for a single point in time for the animation
 */
export interface PropertyTimeseriesPoint {
  date: string;
  properties: PropertyPoint[];
  
  // Market statistics for this time point
  medianPrice: number;
  medianPricePerSqft: number;
  medianDOM: number;
  activeListings: number;
  newListings: number;
  soldListings: number;
  pendingListings: number;
  
  // Detailed market statistics
  marketStats: MarketStats;
}

/**
 * Complete timeseries data for property animation
 */
export interface PropertyTimeseriesData {
  // Timeframe metadata
  timeframe: {
    id: string; // e.g., "1yr", "5yr"
    label: string; // e.g., "1 Year", "5 Years"
    duration: string; // e.g., "1 year", "5 years"
    interval: string; // e.g., "monthly", "quarterly"
  };
  
  // Date range for the data
  dateRange: {
    start: string; // ISO date
    end: string;   // ISO date
  };
  
  // Market area info
  marketArea: string;
  
  // Total properties in the dataset
  totalProperties: number;
  
  // Array of data points for each time step
  timeseries: PropertyTimeseriesPoint[];
}

/**
 * Animation control state
 */
export interface AnimationControlState {
  isPlaying: boolean;
  currentIndex: number;
  speed: number; // milliseconds between frames
  loop: boolean;
}

/**
 * Map display options
 */
export interface MapDisplayOptions {
  colorBy: 'price' | 'daysOnMarket' | 'priceChange' | 'pricePerSqFt';
  sizeBy: 'squareFeet' | 'price' | 'fixed';
  showSold: boolean;
  showActive: boolean;
  showPending: boolean;
  clusterPoints: boolean;
  heatmapEnabled: boolean;
}