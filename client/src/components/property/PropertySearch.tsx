import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileDown, 
  Filter, 
  MapPin, 
  Home, 
  Mail,
  FileText,
  SlidersHorizontal 
} from 'lucide-react';
import { usePropertySearch, PropertySearchParams, Property } from '../../hooks/usePropertyData';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetFooter, 
  SheetClose 
} from '../ui/sheet';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { DataLoadingState } from '../common/DataLoadingState';
import { useAppContext } from '../../context/AppContext';
import { Pagination } from '../ui/pagination';

export interface PropertySearchProps {
  onSearch?: (params: PropertySearchParams) => void;
}

export const PropertySearch: React.FC<PropertySearchProps> = ({ onSearch }) => {
  const { selectedCounty, propertyTypes } = useAppContext();
  
  // Search state
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    county: selectedCounty,
    page: 1,
    pageSize: 10,
    sortBy: 'address',
    sortOrder: 'asc'
  });
  
  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState({
    propertyType: 'any',
    minValue: 0,
    maxValue: 2000000,
    minSquareFeet: 0,
    maxSquareFeet: 10000,
    minYearBuilt: 1900,
    maxYearBuilt: new Date().getFullYear(),
    minBedrooms: 0,
    minBathrooms: 0,
    neighborhoods: [] as string[]
  });
  
  // Text search state
  const [searchText, setSearchText] = useState('');
  
  // Fetch properties based on search params
  const { data, isLoading, isError, error, refetch } = usePropertySearch(searchParams);
  
  // Search types for visual indicators
  const SearchType = {
    NONE: 'none',
    ADDRESS: 'address',
    PARCEL_NUMBER: 'parcel',
    HOUSE_NUMBER: 'house',
    STREET_NAME: 'street',
    ZIP_CODE: 'zip',
    GENERAL: 'general'
  };
  
  // State for detected search type (for UI indicators)
  const [detectedSearchType, setDetectedSearchType] = useState(SearchType.NONE);
  
  // Get description of search type for tooltip
  const getSearchTypeDescription = (type: string) => {
    switch (type) {
      case SearchType.PARCEL_NUMBER:
        return 'Searching by Parcel Number';
      case SearchType.HOUSE_NUMBER:
        return 'Searching by House Number';
      case SearchType.STREET_NAME:
        return 'Searching by Street Name';
      case SearchType.ZIP_CODE:
        return 'Searching by ZIP Code';
      case SearchType.ADDRESS:
        return 'Searching by Address';
      case SearchType.GENERAL:
        return 'General Text Search';
      default:
        return '';
    }
  };

  // Get icon for search type
  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case SearchType.PARCEL_NUMBER:
        return <FileText className="h-4 w-4" />;
      case SearchType.HOUSE_NUMBER:
        return <Home className="h-4 w-4" />;
      case SearchType.STREET_NAME:
        return <MapPin className="h-4 w-4" />;
      case SearchType.ZIP_CODE:
        return <Mail className="h-4 w-4" />;
      case SearchType.ADDRESS:
        return <MapPin className="h-4 w-4" />;
      case SearchType.GENERAL:
        return <Search className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Detect search type as user types
  useEffect(() => {
    if (!searchText) {
      setDetectedSearchType(SearchType.NONE);
      return;
    }
    
    // Check for parcel number format (000-000-000 or similar)
    if (searchText.match(/^[0-9]{3,}[-\s]?[0-9]{3,}([-\s]?[0-9]{3,})?$/)) {
      setDetectedSearchType(SearchType.PARCEL_NUMBER);
    } 
    // Check if it's just a number (e.g., house number)
    else if (/^\d+$/.test(searchText)) {
      setDetectedSearchType(SearchType.HOUSE_NUMBER);
    }
    // Check if it contains street suffix indicators
    else if (/\b(st|ave|rd|blvd|dr|ln|way|pl|ct)\b/i.test(searchText)) {
      setDetectedSearchType(SearchType.STREET_NAME);
    }
    // Check if it's a zip code
    else if (/^\d{5}(-\d{4})?$/.test(searchText)) {
      setDetectedSearchType(SearchType.ZIP_CODE);
    }
    // Default case - general search term
    else {
      setDetectedSearchType(SearchType.GENERAL);
    }
  }, [searchText]);
  
  // Apply filters and search with intelligent parsing
  const applySearchAndFilters = () => {
    const newParams: PropertySearchParams = {
      ...searchParams,
      ...advancedFilters,
      county: selectedCounty,
      page: 1, // Reset to first page when applying new filters
    };
    
    // Handle intelligent address search
    if (searchText) {
      // Advanced pattern recognition based on previously detected type
      switch (detectedSearchType) {
        case SearchType.PARCEL_NUMBER:
          // Looks like a parcel number format - normalize by removing spaces
          newParams.parcelNumber = searchText.replace(/\s+/g, '');
          newParams.address = undefined;
          newParams.zipCode = undefined;
          break;
          
        case SearchType.HOUSE_NUMBER:
          // It's just a number - search in both address and parcel with wildcards
          newParams.address = searchText; // Will match house numbers
          newParams.parcelNumber = undefined;
          newParams.zipCode = undefined;
          break;
          
        case SearchType.STREET_NAME:
        case SearchType.ADDRESS:
          // Looks like a street name with suffix
          newParams.address = searchText;
          newParams.parcelNumber = undefined;
          newParams.zipCode = undefined;
          break;
          
        case SearchType.ZIP_CODE:
          newParams.zipCode = searchText;
          newParams.address = undefined;
          newParams.parcelNumber = undefined;
          break;
          
        case SearchType.GENERAL:
        default:
          // Treat as address search with wildcards for partial matching
          newParams.address = searchText;
          newParams.parcelNumber = undefined;
          newParams.zipCode = undefined;
          break;
      }
    } else {
      // Clear search if empty
      newParams.address = undefined;
      newParams.parcelNumber = undefined;
      newParams.zipCode = undefined;
    }
    
    // Map advanced filter parameters to API parameters
    newParams.yearBuiltMin = advancedFilters.minYearBuilt;
    newParams.yearBuiltMax = advancedFilters.maxYearBuilt;
    
    // Log the search parameters for debugging
    console.log('Property search parameters:', newParams);
    
    // Update internal state
    setSearchParams(newParams);
    
    // Call the external onSearch handler if provided
    if (onSearch) {
      onSearch(newParams);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };
  
  // Handle sort change
  const handleSortChange = (field: string) => {
    const newSortOrder = 
      field === searchParams.sortBy && searchParams.sortOrder === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSearchParams({ 
      ...searchParams, 
      sortBy: field,
      sortOrder: newSortOrder,
      page: 1 // Reset to first page on sort change
    });
  };
  
  const resetFilters = () => {
    setAdvancedFilters({
      propertyType: 'any',
      minValue: 0,
      maxValue: 2000000,
      minSquareFeet: 0,
      maxSquareFeet: 10000,
      minYearBuilt: 1900,
      maxYearBuilt: new Date().getFullYear(),
      minBedrooms: 0,
      minBathrooms: 0,
      neighborhoods: []
    });
    setSearchText('');
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Property Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                {/* Left icon changes based on detected search type */}
                <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                  {detectedSearchType !== SearchType.NONE 
                    ? getSearchTypeIcon(detectedSearchType)
                    : <Search className="h-4 w-4" />
                  }
                </div>
                
                <Input
                  type="text"
                  placeholder="Search by address or parcel number..."
                  className={`pl-9 ${detectedSearchType !== SearchType.NONE ? 'pr-9' : ''}`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applySearchAndFilters();
                    }
                  }}
                />
                
                {/* Right search type indicator with tooltip */}
                {detectedSearchType !== SearchType.NONE && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute right-2.5 top-2.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary-foreground flex items-center cursor-help">
                          {detectedSearchType === SearchType.PARCEL_NUMBER && 'Parcel'}
                          {detectedSearchType === SearchType.HOUSE_NUMBER && 'House #'}
                          {detectedSearchType === SearchType.STREET_NAME && 'Street'}
                          {detectedSearchType === SearchType.ZIP_CODE && 'ZIP'}
                          {detectedSearchType === SearchType.ADDRESS && 'Address'}
                          {detectedSearchType === SearchType.GENERAL && 'Text'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-sm">
                        <p>{getSearchTypeDescription(detectedSearchType)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Search will be optimized for this content type
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={applySearchAndFilters} className="min-w-24">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Refine your property search with detailed filters.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    {/* Property Type */}
                    <div className="space-y-2">
                      <Label>Property Type</Label>
                      <Select 
                        value={advancedFilters.propertyType}
                        onValueChange={(value) => setAdvancedFilters({
                          ...advancedFilters,
                          propertyType: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Value Range */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label>Assessed Value Range</Label>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(advancedFilters.minValue)} - {formatCurrency(advancedFilters.maxValue)}
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          defaultValue={[advancedFilters.minValue, advancedFilters.maxValue]}
                          max={2000000}
                          step={10000}
                          onValueChange={(value) => setAdvancedFilters({
                            ...advancedFilters,
                            minValue: value[0],
                            maxValue: value[1]
                          })}
                        />
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="minValue" className="text-xs whitespace-nowrap">Min Value</Label>
                          <Input 
                            id="minValue"
                            type="number" 
                            className="w-24 h-8"
                            value={advancedFilters.minValue}
                            onChange={(e) => setAdvancedFilters({
                              ...advancedFilters,
                              minValue: Number(e.target.value)
                            })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="maxValue" className="text-xs whitespace-nowrap">Max Value</Label>
                          <Input 
                            id="maxValue"
                            type="number" 
                            className="w-24 h-8"
                            value={advancedFilters.maxValue}
                            onChange={(e) => setAdvancedFilters({
                              ...advancedFilters,
                              maxValue: Number(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Square Feet Range */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label>Square Feet</Label>
                        <div className="text-xs text-muted-foreground">
                          {advancedFilters.minSquareFeet} - {advancedFilters.maxSquareFeet} sq ft
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          defaultValue={[advancedFilters.minSquareFeet, advancedFilters.maxSquareFeet]}
                          max={10000}
                          step={100}
                          onValueChange={(value) => setAdvancedFilters({
                            ...advancedFilters,
                            minSquareFeet: value[0],
                            maxSquareFeet: value[1]
                          })}
                        />
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="minSqFt" className="text-xs whitespace-nowrap">Min Sq Ft</Label>
                          <Input 
                            id="minSqFt"
                            type="number" 
                            className="w-24 h-8"
                            value={advancedFilters.minSquareFeet}
                            onChange={(e) => setAdvancedFilters({
                              ...advancedFilters,
                              minSquareFeet: Number(e.target.value)
                            })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="maxSqFt" className="text-xs whitespace-nowrap">Max Sq Ft</Label>
                          <Input 
                            id="maxSqFt"
                            type="number" 
                            className="w-24 h-8"
                            value={advancedFilters.maxSquareFeet}
                            onChange={(e) => setAdvancedFilters({
                              ...advancedFilters,
                              maxSquareFeet: Number(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Year Built Range */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label>Year Built</Label>
                        <div className="text-xs text-muted-foreground">
                          {advancedFilters.minYearBuilt} - {advancedFilters.maxYearBuilt}
                        </div>
                      </div>
                      <div className="px-2">
                        <Slider
                          defaultValue={[advancedFilters.minYearBuilt, advancedFilters.maxYearBuilt]}
                          min={1900}
                          max={new Date().getFullYear()}
                          step={1}
                          onValueChange={(value) => setAdvancedFilters({
                            ...advancedFilters,
                            minYearBuilt: value[0],
                            maxYearBuilt: value[1]
                          })}
                        />
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="minYear" className="text-xs whitespace-nowrap">Min Year</Label>
                          <Input 
                            id="minYear"
                            type="number" 
                            className="w-24 h-8"
                            value={advancedFilters.minYearBuilt}
                            onChange={(e) => setAdvancedFilters({
                              ...advancedFilters,
                              minYearBuilt: Number(e.target.value)
                            })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="maxYear" className="text-xs whitespace-nowrap">Max Year</Label>
                          <Input 
                            id="maxYear"
                            type="number" 
                            className="w-24 h-8"
                            value={advancedFilters.maxYearBuilt}
                            onChange={(e) => setAdvancedFilters({
                              ...advancedFilters,
                              maxYearBuilt: Number(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Bedrooms</Label>
                        <Select 
                          value={advancedFilters.minBedrooms.toString()}
                          onValueChange={(value) => setAdvancedFilters({
                            ...advancedFilters,
                            minBedrooms: parseInt(value)
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Any</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Bathrooms</Label>
                        <Select 
                          value={advancedFilters.minBathrooms.toString()}
                          onValueChange={(value) => setAdvancedFilters({
                            ...advancedFilters,
                            minBathrooms: parseInt(value)
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Any</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="1.5">1.5+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="2.5">2.5+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Neighborhoods section */}
                    <div className="space-y-4 border-t pt-4">
                      <Label className="text-base">Neighborhoods</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {['Eastside', 'Westside', 'Downtown', 'North Hills', 'South Valley', 'Harrison Heights'].map((neighborhood) => (
                          <div key={neighborhood} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`neighborhood-${neighborhood}`}
                              checked={advancedFilters.neighborhoods.includes(neighborhood)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAdvancedFilters({
                                    ...advancedFilters,
                                    neighborhoods: [...advancedFilters.neighborhoods, neighborhood]
                                  });
                                } else {
                                  setAdvancedFilters({
                                    ...advancedFilters,
                                    neighborhoods: advancedFilters.neighborhoods.filter(n => n !== neighborhood)
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`neighborhood-${neighborhood}`}
                              className="text-sm font-normal"
                            >
                              {neighborhood}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional property features section */}
                    <div className="space-y-4 border-t pt-4">
                      <Label className="text-base">Property Features</Label>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="feature-garage" />
                          <Label htmlFor="feature-garage" className="text-sm font-normal">Garage</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="feature-pool" />
                          <Label htmlFor="feature-pool" className="text-sm font-normal">Pool</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="feature-fireplace" />
                          <Label htmlFor="feature-fireplace" className="text-sm font-normal">Fireplace</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="feature-basement" />
                          <Label htmlFor="feature-basement" className="text-sm font-normal">Basement</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="feature-waterfront" />
                          <Label htmlFor="feature-waterfront" className="text-sm font-normal">Waterfront</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="feature-view" />
                          <Label htmlFor="feature-view" className="text-sm font-normal">View</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Assessment Status */}
                    <div className="space-y-2 border-t pt-4">
                      <Label className="text-base">Assessment Status</Label>
                      <RadioGroup defaultValue="all">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="status-all" />
                          <Label htmlFor="status-all" className="text-sm font-normal">All Properties</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="current" id="status-current" />
                          <Label htmlFor="status-current" className="text-sm font-normal">Current Assessment Year</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="outdated" id="status-outdated" />
                          <Label htmlFor="status-outdated" className="text-sm font-normal">Needs Reassessment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="appealed" id="status-appealed" />
                          <Label htmlFor="status-appealed" className="text-sm font-normal">Appealed Assessments</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <SheetFooter className="flex justify-between">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset
                    </Button>
                    <SheetClose asChild>
                      <Button onClick={applySearchAndFilters}>
                        Apply Filters
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DataLoadingState
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.properties && data.properties.length > 0 ? (
              data.properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showCompareButton
                />
              ))
            ) : (
              <div className="col-span-full p-8 text-center">
                <h3 className="text-lg font-medium">No properties found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </div>
          
          {data && data.properties && data.properties.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {((searchParams.page || 1) - 1) * (searchParams.pageSize || 10) + 1}-
                {Math.min((searchParams.page || 1) * (searchParams.pageSize || 10), data.total)} of {data.total} properties
              </div>
              
              <Pagination
                page={searchParams.page || 1}
                count={Math.ceil(data.total / (searchParams.pageSize || 10))}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </DataLoadingState>
    </div>
  );
};