/**
 * PropertySearch Component
 * 
 * A search interface for filtering and finding properties
 */
import { useState } from 'react';
import { useProperties } from '../../hooks/usePropertyData';
import { PropertyListing, PropertySearchFilters } from '../../types/propertyTypes';
import { useAppContext } from '../../context/AppContext';
import { DataLoadingState } from '../common/DataLoadingState';
import { PropertyCard } from './PropertyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';

interface PropertySearchProps {
  className?: string;
  initialFilters?: PropertySearchFilters;
  showAdvancedFilters?: boolean;
  resultsPerPage?: number;
}

export function PropertySearch({ 
  className = '', 
  initialFilters = {}, 
  showAdvancedFilters = true,
  resultsPerPage = 10
}: PropertySearchProps) {
  // State for search filters, pagination
  const [filters, setFilters] = useState<PropertySearchFilters>(initialFilters);
  const [tempFilters, setTempFilters] = useState<PropertySearchFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  
  // Get county/area from context
  const { selectedCounty, selectedArea, selectedAreaType } = useAppContext();
  
  // Fetch properties with filters
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useProperties(page, resultsPerPage, { 
    ...filters,
    county: selectedCounty,
  });
  
  // Apply filters
  const applyFilters = () => {
    setFilters(tempFilters);
    setPage(1); // Reset to first page when filters change
    setFiltersOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setTempFilters({});
    setFilters({});
    setPage(1);
  };
  
  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Handle pagination change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address, neighborhood, or parcel ID"
              className="pl-9"
              value={tempFilters.address || ''}
              onChange={(e) => setTempFilters({ ...tempFilters, address: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <Button onClick={applyFilters}>
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn("gap-1", getActiveFilterCount() > 0 ? "bg-primary/10" : "")}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">{getActiveFilterCount()}</Badge>
            )}
          </Button>
        </div>
        
        {/* Advanced filters */}
        {showAdvancedFilters && (
          <Collapsible 
            open={filtersOpen} 
            onOpenChange={setFiltersOpen}
            className="border rounded-md p-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Filters</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {filtersOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="pt-4">
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {/* Property Type */}
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select 
                    value={tempFilters.propertyType || ''} 
                    onValueChange={(value) => setTempFilters({ ...tempFilters, propertyType: value })}
                  >
                    <SelectTrigger id="propertyType">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="Single Family">Single Family</SelectItem>
                      <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="Townhouse">Townhouse</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Neighborhood */}
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Enter neighborhood"
                    value={tempFilters.neighborhood || ''}
                    onChange={(e) => setTempFilters({ ...tempFilters, neighborhood: e.target.value })}
                  />
                </div>
                
                {/* Bedrooms */}
                <div className="space-y-2">
                  <Label htmlFor="beds">Minimum Bedrooms</Label>
                  <Select 
                    value={tempFilters.minBeds?.toString() || ''} 
                    onValueChange={(value) => setTempFilters({ ...tempFilters, minBeds: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger id="beds">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Bathrooms */}
                <div className="space-y-2">
                  <Label htmlFor="baths">Minimum Bathrooms</Label>
                  <Select 
                    value={tempFilters.minBaths?.toString() || ''} 
                    onValueChange={(value) => setTempFilters({ ...tempFilters, minBaths: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger id="baths">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Price Range */}
                <div className="space-y-2 col-span-2">
                  <div className="flex justify-between">
                    <Label>Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(tempFilters.minValue || 0)} - {formatPrice(tempFilters.maxValue || 1000000)}
                    </span>
                  </div>
                  <Slider 
                    defaultValue={[tempFilters.minValue || 0, tempFilters.maxValue || 1000000]} 
                    max={2000000}
                    step={10000}
                    onValueChange={(values) => {
                      setTempFilters({
                        ...tempFilters,
                        minValue: values[0],
                        maxValue: values[1]
                      });
                    }}
                  />
                </div>
                
                {/* Square Footage */}
                <div className="space-y-2">
                  <Label htmlFor="minSqFt">Min Square Feet</Label>
                  <Input
                    id="minSqFt"
                    type="number"
                    placeholder="Min"
                    value={tempFilters.minSqFt?.toString() || ''}
                    onChange={(e) => setTempFilters({ 
                      ...tempFilters, 
                      minSqFt: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
                
                {/* Year Built */}
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built Range</Label>
                  <div className="flex gap-2">
                    <Input
                      id="yearBuiltStart"
                      type="number"
                      placeholder="From"
                      value={tempFilters.yearBuiltStart?.toString() || ''}
                      onChange={(e) => setTempFilters({ 
                        ...tempFilters, 
                        yearBuiltStart: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                    <Input
                      id="yearBuiltEnd"
                      type="number"
                      placeholder="To"
                      value={tempFilters.yearBuiltEnd?.toString() || ''}
                      onChange={(e) => setTempFilters({ 
                        ...tempFilters, 
                        yearBuiltEnd: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
      
      {/* Search Results */}
      <DataLoadingState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!data || data.properties.length === 0}
        error={error as Error}
        onRetry={() => refetch()}
        emptyText="No properties found matching your search criteria."
      >
        {data && (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Found {data.total} properties in {selectedCounty} County
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.properties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  variant="compact"
                />
              ))}
            </div>
            
            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={data.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </DataLoadingState>
    </div>
  );
}