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
    setSearchParamsState(prevParams => ({
      ...prevParams,
      ...newParams
    }));
  }, []);

  return [searchParams, setSearchParams];
}