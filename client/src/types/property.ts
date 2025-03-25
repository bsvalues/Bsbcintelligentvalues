/**
 * Property Types
 */

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