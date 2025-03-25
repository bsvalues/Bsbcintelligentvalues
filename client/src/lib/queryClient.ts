import { QueryClient } from '@tanstack/react-query';
// Import the toast directly without using the module resolution
import { toast } from '@/components/ui/use-toast';

// Default options for fetch calls
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // disable refetch on window focus
      retry: 1, // retry failed queries once
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Function to make API requests with proper error handling
 * @param url The API endpoint to call
 * @param options Optional fetch options
 * @returns The API response
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Combine default and custom options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, fetchOptions);

    // Check if the response is OK
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        // Try to parse error details from the response
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new Error(errorMessage);
    }

    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    } else {
      return null as unknown as T;
    }
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Show a toast notification with the error
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
    
    throw error;
  }
}

/**
 * Function to make POST requests
 * @param url The API endpoint
 * @param data The data to send
 * @returns The API response
 */
export async function postRequest<T, R = any>(url: string, data: R): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Function to make PUT requests
 * @param url The API endpoint
 * @param data The data to send
 * @returns The API response
 */
export async function putRequest<T, R = any>(url: string, data: R): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Function to make PATCH requests
 * @param url The API endpoint
 * @param data The data to send
 * @returns The API response
 */
export async function patchRequest<T, R = any>(url: string, data: R): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Function to make DELETE requests
 * @param url The API endpoint
 * @returns The API response
 */
export async function deleteRequest<T>(url: string): Promise<T> {
  return apiRequest<T>(url, {
    method: 'DELETE',
  });
}

/**
 * Function to download a file
 * @param url The API endpoint
 * @param filename The name to save the file as
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download Error:', error);
    
    toast({
      title: 'Download Failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
    
    throw error;
  }
}

/**
 * Function to upload a file
 * @param url The API endpoint
 * @param file The file to upload
 * @param fieldName The name of the form field
 * @param additionalData Additional form data to include
 * @returns The API response
 */
export async function uploadFile<T>(
  url: string,
  file: File,
  fieldName: string = 'file',
  additionalData: Record<string, string> = {}
): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // Add any additional form data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return apiRequest<T>(url, {
    method: 'POST',
    body: formData,
    headers: {}, // Remove Content-Type header, browser will set it for FormData
  });
}