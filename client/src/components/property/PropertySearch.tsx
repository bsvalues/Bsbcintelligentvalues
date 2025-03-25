import React, { useState } from 'react';
import { 
  Search, 
  FileDown, 
  Filter, 
  MapPin, 
  Home, 
  SlidersHorizontal 
} from 'lucide-react';
import { usePropertySearch, PropertySearchParams, PropertyData } from '../../hooks/usePropertyData';
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
import { PropertyCard, PropertyCardSkeleton } from './PropertyCard';
import { DataLoadingState } from '../common/DataLoadingState';
import { useAppContext } from '../../context/AppContext';
import { Pagination } from '../ui/pagination';

export const PropertySearch: React.FC = () => {
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
    propertyType: '',
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
  
  // Apply filters and search
  const applySearchAndFilters = () => {
    const newParams: PropertySearchParams = {
      ...searchParams,
      ...advancedFilters,
      county: selectedCounty,
      page: 1, // Reset to first page when applying new filters
    };
    
    // Handle address search
    if (searchText) {
      if (searchText.match(/^[0-9]{3,}-[0-9]{3,}-[0-9]{3,}$/)) {
        // Looks like a parcel number format
        newParams.parcelNumber = searchText;
        newParams.address = undefined;
      } else {
        // Treat as address search
        newParams.address = searchText;
        newParams.parcelNumber = undefined;
      }
    } else {
      // Clear search if empty
      newParams.address = undefined;
      newParams.parcelNumber = undefined;
    }
    
    setSearchParams(newParams);
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
      propertyType: '',
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
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by address or parcel number..."
                  className="pl-9"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applySearchAndFilters();
                    }
                  }}
                />
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
                          <SelectItem value="">Any</SelectItem>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Value Range */}
                    <div className="space-y-4">
                      <Label>Value Range</Label>
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
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(advancedFilters.minValue)}</span>
                        <span>{formatCurrency(advancedFilters.maxValue)}</span>
                      </div>
                    </div>
                    
                    {/* Square Feet Range */}
                    <div className="space-y-4">
                      <Label>Square Feet</Label>
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
                      <div className="flex justify-between text-sm">
                        <span>{advancedFilters.minSquareFeet} sq ft</span>
                        <span>{advancedFilters.maxSquareFeet} sq ft</span>
                      </div>
                    </div>
                    
                    {/* Year Built Range */}
                    <div className="space-y-4">
                      <Label>Year Built</Label>
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
                      <div className="flex justify-between text-sm">
                        <span>{advancedFilters.minYearBuilt}</span>
                        <span>{advancedFilters.maxYearBuilt}</span>
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
          
          {data && data.properties.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {(searchParams.page - 1) * searchParams.pageSize + 1}-
                {Math.min(searchParams.page * searchParams.pageSize, data.total)} of {data.total} properties
              </div>
              
              <Pagination
                page={searchParams.page || 1}
                count={Math.ceil(data.total / searchParams.pageSize)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </DataLoadingState>
    </div>
  );
};