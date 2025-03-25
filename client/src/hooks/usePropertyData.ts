import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

// Property data types
export interface PropertyData {
  id: string;
  address: string;
  parcelNumber: string;
  propertyType: string;
  landUseCode: string;
  county: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  lotSize: number;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  assessedValue: number;
  marketValue: number;
  taxAmount: number;
  taxYear: number;
  zoning?: string;
  propertyClass?: string;
  constructionType?: string;
  condition?: 'Excellent' | 'Good' | 'Average' | 'Fair' | 'Poor';
  stories?: number;
  heating?: string;
  cooling?: string;
  foundation?: string;
  basement?: boolean;
  garageType?: string;
  garageCars?: number;
  fireplace?: boolean;
  pool?: boolean;
  view?: string;
  // Appeal related fields
  appealHistory?: Array<{
    id: string;
    year: number;
    status: 'Pending' | 'Approved' | 'Denied' | 'Withdrawn';
    filingDate: string;
    hearingDate?: string;
    previousValue: number;
    requestedValue: number;
    grantedValue?: number;
    reason: string;
  }>;
}

export interface PropertySearchParams {
  county?: string;
  city?: string;
  neighborhood?: string;
  propertyType?: string;
  minValue?: number;
  maxValue?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  address?: string;
  parcelNumber?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyGridCell {
  column: string;
  value: any;
  rawValue?: any;
  adjustment?: number;
  adjustmentPct?: number;
  isHighlighted?: boolean;
  tooltip?: string;
}

export interface ComparableGridRow {
  propertyId: string;
  address: string;
  cells: Record<string, PropertyGridCell>;
  totalAdjustment: number;
  totalAdjustmentPct: number;
  adjustedValue: number;
  distance?: number; // miles from subject property
  saleDate?: string;
  salePrice?: number;
  weightFactor?: number; // 0-1 representing relative weight in final estimate
}

// Function to get a single property by ID
export function useProperty(id: string) {
  return useQuery({
    queryKey: ['/api/property', id],
    queryFn: async () => {
      const response = await apiRequest<PropertyData>(`/api/property/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

// Function to search properties with filters
export function usePropertySearch(params: PropertySearchParams) {
  return useQuery({
    queryKey: ['/api/property/search', params],
    queryFn: async () => {
      // Convert params to URLSearchParams
      const searchParams = new URLSearchParams();
      
      // Append all non-undefined parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      
      const response = await apiRequest<{ properties: PropertyData[]; total: number }>(
        `/api/property/search?${searchParams.toString()}`
      );
      return response;
    },
  });
}

// Function to get recently added or updated properties
export function useRecentProperties(county: string, limit: number = 10) {
  return useQuery({
    queryKey: ['/api/property/recent', county, limit],
    queryFn: async () => {
      const response = await apiRequest<PropertyData[]>(
        `/api/property/recent?county=${county}&limit=${limit}`
      );
      return response;
    },
    enabled: !!county,
  });
}

// Function to get property comparables
export function usePropertyComparables(id: string, count: number = 5) {
  return useQuery({
    queryKey: ['/api/property/comparables', id, count],
    queryFn: async () => {
      const response = await apiRequest<{
        subject: PropertyData;
        comparables: PropertyData[];
        grid: ComparableGridRow[];
      }>(`/api/property/comparables/${id}?count=${count}`);
      return response;
    },
    enabled: !!id,
  });
}

// Function to get property statistics by area
export function usePropertyStats(county: string, groupBy: 'neighborhood' | 'propertyType' | 'yearBuilt' = 'neighborhood') {
  return useQuery({
    queryKey: ['/api/property/stats', county, groupBy],
    queryFn: async () => {
      const response = await apiRequest<Array<{
        group: string;
        count: number;
        avgValue: number;
        medianValue: number;
        minValue: number;
        maxValue: number;
        totalValue: number;
        avgSquareFeet: number;
        avgYearBuilt: number;
        avgLotSize: number;
      }>>(`/api/property/stats?county=${county}&groupBy=${groupBy}`);
      return response;
    },
    enabled: !!county,
  });
}

// Mutation to update a property (admin only)
export function useUpdateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (property: Partial<PropertyData> & { id: string }) => {
      const response = await apiRequest<PropertyData>(`/api/property/${property.id}`, {
        method: 'PATCH',
        body: JSON.stringify(property),
      });
      return response;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/property', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/property/search'] });
      queryClient.invalidateQueries({ queryKey: ['/api/property/recent'] });
    },
  });
}