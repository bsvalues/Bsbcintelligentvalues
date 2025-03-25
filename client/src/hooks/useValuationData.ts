/**
 * Valuation Data Hooks
 * 
 * Custom hooks for fetching valuation-related data and interacting with the valuation agent
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';

/**
 * Interface for property valuation request
 */
interface ValuationRequest {
  propertyId?: string;
  address?: string;
  propertyDetails?: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    lotSize?: number;
    yearBuilt?: number;
    propertyType?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      city?: string;
      county?: string;
      state?: string;
      zipCode?: string;
    };
  };
  valuationDate?: string;
  includeComparables?: boolean;
  includeDetails?: boolean;
}

/**
 * Interface for property valuation result
 */
interface ValuationResult {
  propertyId?: string;
  address: string;
  estimatedValue: number;
  confidenceScore: number;
  valueRange: [number, number];
  comparableProperties?: Array<{
    id: string;
    address: string;
    salesPrice: number;
    salesDate: string;
    adjustments: Record<string, number>;
    adjustedPrice: number;
    distance?: number;
  }>;
  adjustmentsApplied?: Record<string, number>;
  modelId?: string;
  valuationDate: string;
  approaches: {
    salesComparison?: {
      value: number;
      confidenceScore: number;
      comparablesCount: number;
    };
    costApproach?: {
      value: number;
      landValue: number;
      improvementValue: number;
      depreciation: number;
    };
    incomeApproach?: {
      value: number;
      netOperatingIncome: number;
      capRate: number;
    };
  };
}

/**
 * Interface for methodology recommendation
 */
interface MethodologyRecommendation {
  recommendedApproach: 'sales_comparison' | 'cost' | 'income' | 'hybrid';
  confidence: number;
  explanation: string;
  alternativeApproaches: Array<{
    approach: string;
    suitabilityScore: number;
    reasoning: string;
  }>;
  dataQualityAssessment: {
    comparablesQuality: number;
    costDataQuality: number;
    incomeDataQuality: number;
  };
}

/**
 * Fetch valuation agent details
 */
export function useValuationAgent() {
  return useQuery<{ id: string; name: string; description: string; capabilities: string[] }>({
    queryKey: ['/api/valuation-agent'],
  });
}

/**
 * Request a property valuation from the valuation agent
 */
export function usePropertyValuation() {
  return useMutation<ValuationResult, Error, ValuationRequest>({
    mutationFn: (request: ValuationRequest) => {
      return apiRequest<ValuationResult>('/api/valuation-agent/valuation', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
  });
}

/**
 * Request a methodology recommendation for a specific property
 */
export function useMethodologyRecommendation() {
  return useMutation<MethodologyRecommendation, Error, ValuationRequest>({
    mutationFn: (request: ValuationRequest) => {
      return apiRequest<MethodologyRecommendation>('/api/valuation-agent/methodology', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
  });
}

/**
 * Fetch recent valuation history for a specific property
 */
export function usePropertyValuationHistory(propertyId: string | null) {
  return useQuery<Array<{ date: string; value: number; source: string }>>({
    queryKey: [`/api/analytics/properties/${propertyId}/valuation-history`],
    enabled: !!propertyId, // Only run query if propertyId is provided
  });
}

/**
 * Fetch valuation accuracy metrics
 */
export function useValuationAccuracyMetrics(
  area: string,
  areaType: 'city' | 'neighborhood' | 'county' | 'zip' = 'county',
) {
  return useQuery<{
    averageError: number;
    medianError: number;
    priceRelatedDifferential: number;
    coefficientOfDispersion: number;
    sampleSize: number;
  }>({
    queryKey: [`/api/analytics/valuation-metrics/${areaType}/${area}`],
    enabled: !!area, // Only run query if area is provided
  });
}