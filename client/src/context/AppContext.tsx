/**
 * Application Context
 * 
 * Provides global state and settings for the application
 */
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AppContextProps {
  // Current county/area selection
  selectedCounty: string;
  setSelectedCounty: (county: string) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  selectedAreaType: 'city' | 'neighborhood' | 'county' | 'zip';
  setSelectedAreaType: (areaType: 'city' | 'neighborhood' | 'county' | 'zip') => void;
  
  // Available options
  availableCounties: string[];
  isLoadingCounties: boolean;
  availableAreas: string[];
  isLoadingAreas: boolean;
  
  // View settings
  datePeriod: 'lastMonth' | 'lastQuarter' | 'lastYear' | 'last3Years' | 'last5Years' | 'custom';
  setDatePeriod: (period: 'lastMonth' | 'lastQuarter' | 'lastYear' | 'last3Years' | 'last5Years' | 'custom') => void;
  customDateRange: [Date | null, Date | null];
  setCustomDateRange: (range: [Date | null, Date | null]) => void;
  
  // Preferences
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Get date range based on period
  getDateRange: () => [Date, Date];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Current selection state
  const [selectedCounty, setSelectedCounty] = useState<string>('Yakima');
  const [selectedArea, setSelectedArea] = useState<string>('Yakima');
  const [selectedAreaType, setSelectedAreaType] = useState<'city' | 'neighborhood' | 'county' | 'zip'>('county');
  
  // Date range settings
  const [datePeriod, setDatePeriod] = useState<'lastMonth' | 'lastQuarter' | 'lastYear' | 'last3Years' | 'last5Years' | 'custom'>('lastYear');
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
  
  // User preferences
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  
  // Fetch available counties
  const { 
    data: availableCounties = [], 
    isLoading: isLoadingCounties 
  } = useQuery<string[]>({
    queryKey: ['/api/market/areas/county'],
  });
  
  // Fetch available areas based on selected area type
  const { 
    data: availableAreas = [], 
    isLoading: isLoadingAreas 
  } = useQuery<string[]>({
    queryKey: ['/api/market/areas/' + selectedAreaType, selectedCounty],
  });
  
  // If selected county isn't in available counties, set to first available
  useEffect(() => {
    if (availableCounties.length > 0 && !availableCounties.includes(selectedCounty)) {
      setSelectedCounty(availableCounties[0]);
    }
  }, [availableCounties, selectedCounty]);
  
  // If selected area isn't in available areas, set to first available
  useEffect(() => {
    if (availableAreas.length > 0 && !availableAreas.includes(selectedArea)) {
      setSelectedArea(availableAreas[0]);
    }
  }, [availableAreas, selectedArea]);
  
  // Function to get date range based on selected period
  const getDateRange = (): [Date, Date] => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch(datePeriod) {
      case 'lastMonth':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'lastQuarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'lastYear':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'last3Years':
        startDate.setFullYear(endDate.getFullYear() - 3);
        break;
      case 'last5Years':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      case 'custom':
        return [
          customDateRange[0] || new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate()),
          customDateRange[1] || endDate
        ];
    }
    
    return [startDate, endDate];
  };
  
  const value: AppContextProps = {
    selectedCounty,
    setSelectedCounty,
    selectedArea,
    setSelectedArea,
    selectedAreaType,
    setSelectedAreaType,
    availableCounties,
    isLoadingCounties,
    availableAreas,
    isLoadingAreas,
    datePeriod,
    setDatePeriod,
    customDateRange,
    setCustomDateRange,
    theme,
    setTheme,
    getDateRange,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}