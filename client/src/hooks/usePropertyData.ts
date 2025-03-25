import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export interface PropertySearchParams {
  county?: string;
  zipCode?: string;
  neighborhood?: string;
  minValue?: number;
  maxValue?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  propertyType?: string;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Property {
  id: string;
  parcelId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  neighborhood?: string;
  assessedValue: number;
  marketValue?: number;
  landValue?: number;
  improvementValue?: number;
  yearBuilt?: number;
  squareFeet?: number;
  lotSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  zoning?: string;
  lastSaleDate?: string;
  lastSalePrice?: number;
  latitude?: number;
  longitude?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyValuation {
  propertyId: string;
  valuationId: string;
  valuationDate: string;
  assessedValue: number;
  marketValue: number;
  landValue?: number;
  improvementValue?: number;
  method: string;
  description?: string;
  adjustments?: Record<string, number>;
  taxYear: number;
  assessorId: string;
  status: 'draft' | 'review' | 'final' | 'appealed';
}

/**
 * Hook for searching properties
 */
export function usePropertySearch(searchParams: PropertySearchParams = {}) {
  return useQuery<PropertySearchResult>({
    queryKey: ['/api/properties/search', searchParams],
    queryFn: async ({ queryKey }) => {
      // Convert search params to URL parameters
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      // Build the URL with parameters
      const url = `/api/properties/search?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch properties');
      }
      
      return response.json();
    },
    enabled: true,
    retry: 1,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook for fetching a single property by ID
 */
export function usePropertyDetail(propertyId: string) {
  return useQuery<Property>({
    queryKey: ['/api/properties', propertyId],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch property details');
      }
      
      return response.json();
    },
    enabled: !!propertyId,
    retry: 1,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook for fetching property valuations
 */
export function usePropertyValuations(propertyId: string) {
  return useQuery<PropertyValuation[]>({
    queryKey: ['/api/properties', propertyId, 'valuations'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/properties/${propertyId}/valuations`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch property valuations');
      }
      
      return response.json();
    },
    enabled: !!propertyId,
    retry: 1,
    refetchOnWindowFocus: false
  });
}