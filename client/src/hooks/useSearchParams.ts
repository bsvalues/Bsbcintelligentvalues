import { useState, useCallback } from 'react';

/**
 * A custom hook that provides state management for search parameters
 * 
 * @param initialParams - The initial search parameters
 * @returns A tuple containing the current search parameters and a function to update them
 */
export function useSearchParams<T extends Record<string, any>>(initialParams: T): [T, (newParams: Partial<T>) => void] {
  const [searchParams, setSearchParamsState] = useState<T>(initialParams);

  const setSearchParams = useCallback((newParams: Partial<T>) => {
    // Handle special case for sortOrder to ensure proper typing
    if ('sortOrder' in newParams && typeof newParams.sortOrder === 'string') {
      // Ensure sortOrder is 'asc' or 'desc' only
      const sortOrder = newParams.sortOrder.toLowerCase();
      if (sortOrder === 'asc' || sortOrder === 'desc') {
        // Valid value - keep as is
        newParams = { ...newParams, sortOrder: sortOrder as any };
      } else {
        // Default to 'asc' if invalid value
        newParams = { ...newParams, sortOrder: 'asc' as any };
      }
    }
    
    setSearchParamsState(prevParams => ({
      ...prevParams,
      ...newParams
    }));
  }, []);

  return [searchParams, setSearchParams];
}