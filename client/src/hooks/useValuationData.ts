import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export interface ValuationRequest {
  propertyId: string;
  assessmentYear?: number;
  valuationDate?: string;
  options?: {
    includeComparables?: boolean;
    includeFactors?: boolean;
    includeMarketAdjustments?: boolean;
    maxComparables?: number;
    confidenceThreshold?: number;
  };
}

export interface PropertyValuationResult {
  propertyId: string;
  address?: string;
  estimatedValue: number;
  landValue?: number;
  improvementValue?: number;
  confidenceScore: number;
  valueRange: [number, number];
  valuationDate: string;
  assessmentYear: number;
  comparableProperties?: {
    propertyId: string;
    address: string;
    salePrice: number;
    saleDate: string;
    adjustments: Record<string, number>;
    adjustedPrice: number;
    distanceInMiles?: number;
  }[];
  factors?: Record<string, {
    value: number;
    contribution: number;
    percentageContribution: number;
  }>;
  methods: {
    salesComparison?: {
      value: number;
      confidence: number;
      weight: number;
    };
    costApproach?: {
      value: number;
      confidence: number;
      weight: number;
    };
    incomeApproach?: {
      value: number;
      confidence: number;
      weight: number;
    };
    aiModel?: {
      value: number;
      confidence: number;
      weight: number;
    };
  };
}

/**
 * Hook for predicting property value
 */
export function usePropertyValuation(valuationRequest: ValuationRequest) {
  return useQuery<PropertyValuationResult>({
    queryKey: ['/api/predict-property-value', valuationRequest],
    queryFn: async () => {
      const response = await fetch('/api/predict-property-value', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valuationRequest),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to predict property value');
      }
      
      return response.json();
    },
    enabled: !!valuationRequest.propertyId,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export interface BatchValuationRequest {
  propertyIds: string[];
  assessmentYear?: number;
  options?: {
    confidenceThreshold?: number;
    includeFactors?: boolean;
    batchSize?: number;
  };
}

export interface BatchValuationResult {
  results: PropertyValuationResult[];
  summary: {
    totalProperties: number;
    completedProperties: number;
    totalEstimatedValue: number;
    averageConfidence: number;
    processingTimeMs: number;
  };
}

/**
 * Hook for batch property valuation
 */
export function useBatchValuation(batchRequest: BatchValuationRequest) {
  return useQuery<BatchValuationResult>({
    queryKey: ['/api/batch-property-valuation', batchRequest],
    queryFn: async () => {
      const response = await fetch('/api/batch-property-valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchRequest),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to perform batch valuation');
      }
      
      return response.json();
    },
    enabled: !!batchRequest.propertyIds && batchRequest.propertyIds.length > 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}