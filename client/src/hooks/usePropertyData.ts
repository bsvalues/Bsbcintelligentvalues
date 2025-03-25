/**
 * Property Data Hooks
 * 
 * Custom hooks for fetching property-related data
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';
import type { 
  PropertyListing, 
  PropertyAssessment,
  PropertyTax,
  AssessmentAppeal,
  PropertySearchFilters,
  PropertySearchResponse
} from '../types/propertyTypes';

/**
 * Fetch a list of properties with optional pagination and filters
 */
export function useProperties(
  page: number = 1, 
  pageSize: number = 10,
  filters?: PropertySearchFilters
) {
  const queryKey = ['/api/analytics/properties', page, pageSize, filters];
  
  return useQuery<PropertySearchResponse>({
    queryKey,
    // Construct the URL with query parameters
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      // Add filters to query parameters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
      }
      
      const url = `/api/analytics/properties?${searchParams.toString()}`;
      return apiRequest<PropertySearchResponse>(url);
    },
  });
}

/**
 * Fetch a single property by ID
 */
export function useProperty(propertyId: string | null) {
  return useQuery<PropertyListing>({
    queryKey: [`/api/analytics/properties/${propertyId}`],
    enabled: !!propertyId, // Only run query if propertyId is provided
  });
}

/**
 * Fetch property assessments by property ID
 */
export function usePropertyAssessments(propertyId: string | null) {
  return useQuery<PropertyAssessment[]>({
    queryKey: [`/api/mass-appraisal/properties/${propertyId}/assessments`],
    enabled: !!propertyId, // Only run query if propertyId is provided
  });
}

/**
 * Fetch property tax information by property ID
 */
export function usePropertyTaxes(propertyId: string | null) {
  return useQuery<PropertyTax[]>({
    queryKey: [`/api/mass-appraisal/properties/${propertyId}/taxes`],
    enabled: !!propertyId, // Only run query if propertyId is provided
  });
}

/**
 * Fetch assessment appeals by property ID
 */
export function usePropertyAppeals(propertyId: string | null) {
  return useQuery<AssessmentAppeal[]>({
    queryKey: [`/api/mass-appraisal/properties/${propertyId}/appeals`],
    enabled: !!propertyId, // Only run query if propertyId is provided
  });
}

/**
 * Create a new property assessment
 */
export function useCreateAssessment() {
  return useMutation({
    mutationFn: (assessment: Omit<PropertyAssessment, 'id'>) => {
      return apiRequest<PropertyAssessment>('/api/mass-appraisal/assessments', {
        method: 'POST',
        body: JSON.stringify(assessment),
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries when a new assessment is created
      queryClient.invalidateQueries({ queryKey: ['/api/mass-appraisal/properties'] });
    },
  });
}

/**
 * Update an existing property assessment
 */
export function useUpdateAssessment() {
  return useMutation({
    mutationFn: (assessment: PropertyAssessment) => {
      return apiRequest<PropertyAssessment>(`/api/mass-appraisal/assessments/${assessment.id}`, {
        method: 'PUT',
        body: JSON.stringify(assessment),
      });
    },
    onSuccess: (data) => {
      // Invalidate relevant queries when an assessment is updated
      queryClient.invalidateQueries({ 
        queryKey: [`/api/mass-appraisal/properties/${data.propertyId}/assessments`] 
      });
    },
  });
}

/**
 * Create a new assessment appeal
 */
export function useCreateAppeal() {
  return useMutation({
    mutationFn: (appeal: Omit<AssessmentAppeal, 'id'>) => {
      return apiRequest<AssessmentAppeal>('/api/mass-appraisal/appeals', {
        method: 'POST',
        body: JSON.stringify(appeal),
      });
    },
    onSuccess: (data) => {
      // Invalidate relevant queries when a new appeal is created
      queryClient.invalidateQueries({ 
        queryKey: [`/api/mass-appraisal/properties/${data.propertyId}/appeals`] 
      });
    },
  });
}