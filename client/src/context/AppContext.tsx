import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextProps {
  selectedCounty: string;
  setSelectedCounty: (county: string) => void;
  selectedNeighborhood: string | null;
  setSelectedNeighborhood: (neighborhood: string | null) => void;
  dateRange: { startDate: string | null; endDate: string | null };
  setDateRange: (range: { startDate: string | null; endDate: string | null }) => void;
  propertyTypes: string[];
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  compareItems: string[];
  addCompareItem: (id: string) => void;
  removeCompareItem: (id: string) => void;
  clearCompareItems: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [selectedCounty, setSelectedCounty] = useState<string>('Yakima');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null,
  });
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareItems, setCompareItems] = useState<string[]>([]);

  const propertyTypes = [
    'Residential',
    'Commercial',
    'Industrial',
    'Agricultural',
    'Vacant Land',
    'Multi-Family',
  ];

  const addCompareItem = (id: string) => {
    if (compareItems.length < 5 && !compareItems.includes(id)) {
      setCompareItems([...compareItems, id]);
    }
  };

  const removeCompareItem = (id: string) => {
    setCompareItems(compareItems.filter(item => item !== id));
  };

  const clearCompareItems = () => {
    setCompareItems([]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedCounty,
        setSelectedCounty,
        selectedNeighborhood,
        setSelectedNeighborhood,
        dateRange,
        setDateRange,
        propertyTypes,
        compareMode,
        setCompareMode,
        compareItems,
        addCompareItem,
        removeCompareItem,
        clearCompareItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};