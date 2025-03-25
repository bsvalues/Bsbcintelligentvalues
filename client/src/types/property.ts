/**
 * Property type definitions for the BS Values application
 */

/**
 * Represents a property in the system
 */
export interface Property {
  id: number | string;
  address: string;
  parcelId?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  assessedValue?: number;
  landValue?: number;
  improvementValue?: number;
  yearBuilt?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  lotSize?: number;
  latitude?: number;
  longitude?: number;
  status?: 'active' | 'sold' | 'pending' | 'exempt';
  lastAssessedDate?: string;
  lastSaleDate?: string;
  lastSalePrice?: number;
  zoning?: string;
  neighborhood?: string;
  taxDistrict?: string;
  county?: string;
  images?: string[];
  features?: string[];
}

/**
 * Property search response from the API
 */
export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}