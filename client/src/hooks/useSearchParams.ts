import { useState, useCallback } from 'react';

/**
 * Custom hook to manage search parameters
 * @param initialParams Initial parameter values
 * @returns Object containing params and a function to update them
 */
export function useSearchParams<T extends Record<string, any>>(initialParams: T) {
  const [params, setParams] = useState<T>(initialParams);

  const updateParams = useCallback((newParams: Partial<T>) => {
    setParams(prevParams => ({
      ...prevParams,
      ...newParams
    }));
  }, []);

  return [params, updateParams] as const;
}