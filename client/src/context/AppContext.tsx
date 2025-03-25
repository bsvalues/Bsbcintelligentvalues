import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { format, subMonths, endOfMonth } from 'date-fns';

// Types of areas that can be selected
export type AreaType = 'county' | 'city' | 'neighborhood' | 'zipCode';

// Date range periods
export type DatePeriod = '1m' | '3m' | '6m' | '1y' | '3y' | '5y' | 'custom';

// Context interface
export interface AppContextProps {
  // County selection
  selectedCounty: string;
  setSelectedCounty: (county: string) => void;
  availableCounties: string[];
  isLoadingCounties: boolean;
  
  // Area selection
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  selectedAreaType: AreaType;
  setSelectedAreaType: (type: AreaType) => void;
  availableAreas: string[];
  isLoadingAreas: boolean;
  
  // Date range selection
  datePeriod: DatePeriod;
  setDatePeriod: (period: DatePeriod) => void;
  customDateRange: [Date | null, Date | null];
  setCustomDateRange: (range: [Date | null, Date | null]) => void;
  getDateRange: () => [Date, Date];
  
  // Property type selection
  propertyTypes: string[];
  isLoadingPropertyTypes: boolean;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create the context
const AppContext = createContext<AppContextProps | undefined>(undefined);

// Provider props
interface AppProviderProps {
  children: React.ReactNode;
}

// AppProvider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // County state
  const [selectedCounty, setSelectedCounty] = useState<string>('Yakima');
  
  // Area state
  const [selectedArea, setSelectedArea] = useState<string>('Grandview');
  const [selectedAreaType, setSelectedAreaType] = useState<AreaType>('city');
  
  // Date range state
  const [datePeriod, setDatePeriod] = useState<DatePeriod>('1y');
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  // Fetch counties
  const { 
    data: countiesData,
    isLoading: isLoadingCounties
  } = useQuery({
    queryKey: ['/api/geography/counties'],
    queryFn: async () => {
      const response = await apiRequest<string[]>('/api/geography/counties');
      return response;
    }
  });
  
  // Fetch areas of selected type
  const {
    data: areasData,
    isLoading: isLoadingAreas
  } = useQuery({
    queryKey: ['/api/geography/areas', selectedAreaType, selectedCounty],
    queryFn: async () => {
      const response = await apiRequest<string[]>(
        `/api/geography/areas?type=${selectedAreaType}&county=${selectedCounty}`
      );
      return response;
    },
    enabled: !!selectedCounty
  });
  
  // Fetch property types
  const { 
    data: propertyTypesData,
    isLoading: isLoadingPropertyTypes
  } = useQuery({
    queryKey: ['/api/property/types'],
    queryFn: async () => {
      const response = await apiRequest<string[]>('/api/property/types');
      return response;
    }
  });
  
  // Listen for OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Update document class for theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };
  
  // Get current date range based on selected period
  const getDateRange = (): [Date, Date] => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (datePeriod) {
      case '1m':
        startDate = subMonths(endDate, 1);
        break;
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '6m':
        startDate = subMonths(endDate, 6);
        break;
      case '1y':
        startDate = subMonths(endDate, 12);
        break;
      case '3y':
        startDate = subMonths(endDate, 36);
        break;
      case '5y':
        startDate = subMonths(endDate, 60);
        break;
      case 'custom':
        if (customDateRange[0] && customDateRange[1]) {
          return [customDateRange[0], customDateRange[1]];
        }
        // Default to 1 year if custom range is not properly set
        startDate = subMonths(endDate, 12);
        break;
      default:
        startDate = subMonths(endDate, 12);
    }
    
    return [startDate, endDate];
  };
  
  // Create the context value
  const contextValue: AppContextProps = {
    selectedCounty,
    setSelectedCounty,
    availableCounties: countiesData || ['Yakima'],
    isLoadingCounties,
    
    selectedArea,
    setSelectedArea,
    selectedAreaType,
    setSelectedAreaType,
    availableAreas: areasData || ['Grandview'],
    isLoadingAreas,
    
    datePeriod,
    setDatePeriod,
    customDateRange,
    setCustomDateRange,
    getDateRange,
    
    propertyTypes: propertyTypesData || [
      'Single Family',
      'Multi-Family',
      'Condominium',
      'Townhouse',
      'Commercial',
      'Industrial',
      'Agricultural',
      'Vacant Land'
    ],
    isLoadingPropertyTypes,
    
    isDarkMode,
    toggleDarkMode
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};