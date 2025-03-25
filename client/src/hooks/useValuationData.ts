import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

// Valuation related types
export interface ValuationModel {
  id: string;
  name: string;
  description: string;
  propertyType: string;
  county: string;
  neighborhoods: string[];
  coefficients: Record<string, number>;
  intercept: number;
  rSquared: number;
  adjustedRSquared: number;
  standardError: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValuationResult {
  propertyId: string;
  address: string;
  estimatedValue: number;
  confidenceInterval: [number, number];
  assessedValue: number;
  assessmentRatio: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  comparables: Array<{
    id: string;
    address: string;
    salePrice: number;
    saleDate: string;
    adjustedValue: number;
    adjustments: Record<string, number>;
  }>;
  factors: Record<string, {
    value: number;
    contribution: number;
    percentageContribution: number;
  }>;
  modelId: string;
  createdAt: string;
}

export interface ValuationRequest {
  propertyId: string;
  modelId?: string;
  includeComparables?: boolean;
  includeFactors?: boolean;
}

// Function to get all available valuation models
export function useValuationModels(county?: string, propertyType?: string) {
  return useQuery({
    queryKey: ['/api/valuation/models', county, propertyType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (county) params.append('county', county);
      if (propertyType) params.append('propertyType', propertyType);
      
      const response = await apiRequest<ValuationModel[]>(`/api/valuation/models?${params.toString()}`);
      return response;
    },
  });
}

// Function to get a specific valuation model by ID
export function useValuationModel(id: string) {
  return useQuery({
    queryKey: ['/api/valuation/models', id],
    queryFn: async () => {
      const response = await apiRequest<ValuationModel>(`/api/valuation/models/${id}`);
      return response;
    },
    enabled: !!id,
  });
}

// Function to request a property valuation
export function usePropertyValuation(propertyId: string, modelId?: string) {
  return useQuery({
    queryKey: ['/api/valuation/property', propertyId, modelId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (modelId) params.append('modelId', modelId);
      params.append('includeComparables', 'true');
      params.append('includeFactors', 'true');
      
      const response = await apiRequest<ValuationResult>(`/api/valuation/property/${propertyId}?${params.toString()}`);
      return response;
    },
    enabled: !!propertyId,
  });
}

// Function to get valuation history for a property
export function useValuationHistory(propertyId: string) {
  return useQuery({
    queryKey: ['/api/valuation/history', propertyId],
    queryFn: async () => {
      const response = await apiRequest<Array<{
        id: string;
        propertyId: string;
        estimatedValue: number;
        assessedValue: number;
        assessmentRatio: number;
        modelId: string;
        createdAt: string;
      }>>(`/api/valuation/history/${propertyId}`);
      return response;
    },
    enabled: !!propertyId,
  });
}

// Mutation to create a new valuation
export function useCreateValuation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: ValuationRequest) => {
      const response = await apiRequest<ValuationResult>('/api/valuation/create', {
        method: 'POST',
        data: request,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/valuation/property', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['/api/valuation/history', variables.propertyId] });
    },
  });
}

// Function to get assessment quality statistics
export function useAssessmentQualityStats(county: string) {
  return useQuery({
    queryKey: ['/api/valuation/assessment-quality', county],
    queryFn: async () => {
      const response = await apiRequest<{
        medianAssessmentRatio: number;
        coefficientOfDispersion: number;
        priceRelatedDifferential: number;
        underassessedCount: number;
        overassessedCount: number;
        totalProperties: number;
      }>(`/api/valuation/assessment-quality?county=${county}`);
      return response;
    },
    enabled: !!county,
  });
}