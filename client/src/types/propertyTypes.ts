/**
 * Property Data Types
 * 
 * This file defines interfaces for property-related data structures
 * used throughout the application.
 */

/**
 * Basic property listing information
 */
export interface PropertyListing {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt?: number;
  lotSize?: number;
  propertyType?: string;
  description?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  listingDate?: string;
  daysOnMarket?: number;
  status?: 'active' | 'pending' | 'sold' | 'off-market';
  photos?: string[];
}

/**
 * Property assessment data
 */
export interface PropertyAssessment {
  id: string;
  propertyId: string;
  assessedValue: number;
  marketValue: number;
  assessmentDate: string;
  taxYear: number;
  assessor: string;
  status: 'pending' | 'completed' | 'review' | 'appealed';
  lastModified: string;
  notes?: string;
}

/**
 * Property tax information
 */
export interface PropertyTax {
  id: string;
  propertyId: string;
  taxYear: number;
  annualAmount: number;
  taxRate: number;
  dueDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'delinquent';
  exemptions?: {
    type: string;
    amount: number;
  }[];
}

/**
 * Appeal information for a property assessment
 */
export interface AssessmentAppeal {
  id: string;
  assessmentId: string;
  propertyId: string;
  dateSubmitted: string;
  appealStatus: 'pending' | 'review' | 'scheduled' | 'completed' | 'denied' | 'withdrawn';
  hearingDate?: string;
  appellant: string;
  reason: string;
  requestedValue: number;
  resolution?: string;
  resolvedValue?: number;
  resolutionDate?: string;
}

/**
 * Property valuation history
 */
export interface ValuationHistory {
  propertyId: string;
  valuations: {
    date: string;
    value: number;
    source: 'assessment' | 'appraisal' | 'market' | 'sale';
  }[];
}

/**
 * Property search filters
 */
export interface PropertySearchFilters {
  address?: string;
  ownerName?: string;
  parcelId?: string;
  propertyType?: string;
  neighborhood?: string;
  minValue?: number;
  maxValue?: number;
  minBeds?: number;
  minBaths?: number;
  minSqFt?: number;
  maxSqFt?: number;
  yearBuiltStart?: number;
  yearBuiltEnd?: number;
}

/**
 * Response data format for property search
 */
export interface PropertySearchResponse {
  properties: PropertyListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}