import { QueryClient } from '@tanstack/react-query';
import { toast } from '../components/ui/use-toast';

// Define the base API URL
const API_BASE_URL = '';

// Interface for apiRequest options
interface ApiRequestOptions extends RequestInit {
  data?: any;
}

// Create a new QueryClient instance with default settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Generic API request function for making fetch requests
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    const { data, ...fetchOptions } = options;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    // Set up default headers
    const headers = new Headers(fetchOptions.headers);
    
    // If not already set and we have data, set the content type
    if (data && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Create the fetch request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: data ? JSON.stringify(data) : fetchOptions.body,
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Ignore JSON parsing errors in the error response
      }
      
      // Create and throw an error
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }
    
    // For 204 No Content, return null
    if (response.status === 204) {
      return null as unknown as T;
    }
    
    // Parse the JSON response
    return await response.json();
  } catch (error) {
    // Display a toast notification for the error
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An unknown error occurred',
      variant: 'destructive',
    });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
}

// Set up the default queryFn that can be used by the useQuery hook
queryClient.setDefaultOptions({
  queries: {
    queryFn: async ({ queryKey }) => {
      // The first element of the query key should be the endpoint
      const endpoint = Array.isArray(queryKey) ? queryKey[0] : queryKey;
      
      if (typeof endpoint !== 'string') {
        throw new Error('Invalid query key: endpoint must be a string');
      }
      
      return apiRequest(endpoint);
    },
  },
});