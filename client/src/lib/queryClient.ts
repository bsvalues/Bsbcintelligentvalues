/**
 * QueryClient Configuration
 * 
 * Centralized configuration for React Query
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * Custom fetch function for API requests
 * Handles standard error responses and JSON parsing
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  // Handle non-200 responses
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || `API Error: ${response.status}`);
    } catch (e) {
      // If can't parse JSON, use status text
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }

  // For 204 No Content responses, return empty object
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Default query function for React Query
 * Uses our apiRequest function to fetch data
 */
async function defaultQueryFn<T>({ queryKey }: { queryKey: string[] }): Promise<T> {
  // Use the first element of the query key as the endpoint
  const endpoint = queryKey[0];
  return apiRequest<T>(endpoint);
}

/**
 * QueryClient instance with default configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;