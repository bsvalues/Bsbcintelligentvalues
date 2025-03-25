import { useEffect, useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Building, 
  Map as MapIcon, 
  BarChart4, 
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { PropertySearchParams } from '../hooks/usePropertyData';

// Helper functions for analytics
const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};

// Generate value ranges for the bar chart
const generateValueRanges = (properties: Property[]): { min: number; max: number; count: number }[] => {
  // Get min and max values for scaling
  const values = properties.map(p => p.assessedValue || 0).filter(v => v > 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Create 6 buckets for the bar chart
  const bucketSize = Math.ceil((max - min) / 6);
  const buckets: { min: number; max: number; count: number }[] = [];
  
  for (let i = 0; i < 6; i++) {
    const bucketMin = min + (i * bucketSize);
    const bucketMax = i === 5 ? max : min + ((i + 1) * bucketSize);
    buckets.push({
      min: bucketMin,
      max: bucketMax,
      count: 0
    });
  }
  
  // Count properties in each bucket
  properties.forEach(property => {
    const value = property.assessedValue || 0;
    if (value <= 0) return;
    
    const bucketIndex = Math.min(5, Math.floor((value - min) / bucketSize));
    buckets[bucketIndex].count++;
  });
  
  return buckets;
};

// Generate property type distribution for pie chart
const generatePropertyTypeDistribution = (properties: Property[]): { type: string; count: number; percentage: number }[] => {
  const typeCounts = new Map<string, number>();
  
  // Count properties by type
  properties.forEach(property => {
    const type = property.propertyType || 'Unknown';
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });
  
  // Convert to array and calculate percentages
  const totalCount = properties.length;
  const result = Array.from(typeCounts.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / totalCount) * 100)
  }));
  
  // Sort by count descending
  return result.sort((a, b) => b.count - a.count);
};

// Calculate statistical values
const calculateAverage = (properties: Property[], field: 'assessedValue' | 'squareFeet' | 'yearBuilt'): number => {
  const values = properties.map(p => p[field] as number || 0).filter(v => v > 0);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
};

const calculateMedianValue = (properties: Property[], field: 'assessedValue' | 'squareFeet' | 'yearBuilt'): number => {
  const values = properties.map(p => p[field] as number || 0).filter(v => v > 0).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  return values.length % 2 !== 0 ? values[mid] : Math.round((values[mid - 1] + values[mid]) / 2);
};

const calculateMinValue = (properties: Property[], field: 'assessedValue' | 'squareFeet' | 'yearBuilt'): number => {
  const values = properties.map(p => p[field] as number || 0).filter(v => v > 0);
  return Math.min(...values);
};

const calculateMaxValue = (properties: Property[], field: 'assessedValue' | 'squareFeet' | 'yearBuilt'): number => {
  const values = properties.map(p => p[field] as number || 0).filter(v => v > 0);
  return Math.max(...values);
};

import { PropertySearch } from '../components/property/PropertySearch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AppProvider } from '../context/AppContext';
import { DataLoadingState } from '../components/common/DataLoadingState';
import { PropertyCard } from '../components/property/PropertyCard';
import { useSearchParams } from '../hooks/useSearchParams';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { usePropertyData } from '../hooks/usePropertyData';
import { Property } from '../types/property';

export default function PropertySearchPage() {
  const [searchParams, setSearchParams] = useSearchParams({
    page: 1,
    pageSize: 12,
    sortBy: 'address',
    sortOrder: 'asc',
    county: 'Yakima'
  });
  
  const { data, isLoading, isError, error, refetch } = usePropertyData(searchParams);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map' | 'analytics'>('grid');
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  
  const updateSearchParams = (newParams: Record<string, any>) => {
    setSearchParams({ ...searchParams, ...newParams });
  };
  
  const handlePropertySelect = (id: string | number, selected: boolean) => {
    // Convert id to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (selected) {
      setSelectedProperties([...selectedProperties, numericId]);
    } else {
      setSelectedProperties(selectedProperties.filter(propId => propId !== numericId));
    }
  };
  
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting in ${format} format`, selectedProperties.length > 0 ? selectedProperties : 'all properties');
    // Export implementation would go here
  };
  
  useEffect(() => {
    // Reset selection when search params change
    setSelectedProperties([]);
  }, [searchParams]);

  return (
    <AppProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Property Search</h1>
            <p className="text-muted-foreground">
              Search, filter, and analyze property assessment data across the county
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => viewMode === 'list' ? setViewMode('grid') : setViewMode('list')}>
              {viewMode === 'list' ? <Building className="h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              {viewMode === 'list' ? 'Grid View' : 'List View'}
            </Button>
          </div>
        </div>
        
        <PropertySearch onSearch={updateSearchParams} />
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {data?.total} properties found
            {selectedProperties.length > 0 && (
              <> • <span className="font-medium">{selectedProperties.length} selected</span> </>
            )}
          </div>
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="grid">
                <Building className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <FileText className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapIcon className="h-4 w-4 mr-2" />
                Map
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart4 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Properties display */}
        <DataLoadingState
          isLoading={isLoading}
          isError={isError}
          error={error as Error}
          onRetry={refetch}
        >
          <Tabs value={viewMode} className="mt-4">
            <TabsContent value="grid" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data?.properties && data.properties.length > 0 ? (
                  data.properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property as any}
                      showCompareButton
                      showAppealButton={false}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center p-8">
                    <h3 className="text-lg font-medium">No properties found</h3>
                    <p className="text-muted-foreground mt-1">
                      Try adjusting your search criteria or filters.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="m-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Property Data Grid</h3>
                    <p className="text-muted-foreground text-sm">Detailed property information in tabular format</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filters
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Grid
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-6">
                              <div className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-border h-4 w-4"
                                  onChange={(e) => {
                                    if (e.target.checked && data?.properties) {
                                      // Convert string IDs to numbers
                                      setSelectedProperties(data.properties.map(p => typeof p.id === 'string' ? parseInt(p.id, 10) : p.id as number));
                                    } else {
                                      setSelectedProperties([]);
                                    }
                                  }}
                                  checked={data?.properties && data.properties.length > 0 && selectedProperties.length === data.properties.length}
                                />
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Address
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 ml-1"
                                  onClick={() => updateSearchParams({ 
                                    sortBy: 'address', 
                                    sortOrder: searchParams.sortBy === 'address' && searchParams.sortOrder === 'asc' ? 'desc' : 'asc' 
                                  })}
                                >
                                  {searchParams.sortBy === 'address' ? (
                                    searchParams.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : null}
                                </Button>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Parcel ID
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Assessed Value
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 ml-1"
                                  onClick={() => updateSearchParams({ 
                                    sortBy: 'assessedValue', 
                                    sortOrder: searchParams.sortBy === 'assessedValue' && searchParams.sortOrder === 'asc' ? 'desc' : 'asc' 
                                  })}
                                >
                                  {searchParams.sortBy === 'assessedValue' ? (
                                    searchParams.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : null}
                                </Button>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Land Value
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Improvement Value
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Type
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 ml-1"
                                  onClick={() => updateSearchParams({ 
                                    sortBy: 'propertyType', 
                                    sortOrder: searchParams.sortBy === 'propertyType' && searchParams.sortOrder === 'asc' ? 'desc' : 'asc' 
                                  })}
                                >
                                  {searchParams.sortBy === 'propertyType' ? (
                                    searchParams.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : null}
                                </Button>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Built
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 ml-1"
                                  onClick={() => updateSearchParams({ 
                                    sortBy: 'yearBuilt', 
                                    sortOrder: searchParams.sortBy === 'yearBuilt' && searchParams.sortOrder === 'asc' ? 'desc' : 'asc' 
                                  })}
                                >
                                  {searchParams.sortBy === 'yearBuilt' ? (
                                    searchParams.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : null}
                                </Button>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                              <div className="flex items-center">
                                Sq Ft
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5 ml-1"
                                  onClick={() => updateSearchParams({ 
                                    sortBy: 'squareFeet', 
                                    sortOrder: searchParams.sortBy === 'squareFeet' && searchParams.sortOrder === 'asc' ? 'desc' : 'asc' 
                                  })}
                                >
                                  {searchParams.sortBy === 'squareFeet' ? (
                                    searchParams.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  ) : null}
                                </Button>
                              </div>
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {data?.properties && data.properties.length > 0 ? (
                            data.properties.map((property) => (
                              <tr key={property.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-border h-4 w-4"
                                    onChange={(e) => handlePropertySelect(property.id, e.target.checked)}
                                    checked={selectedProperties.includes(typeof property.id === 'string' ? parseInt(property.id, 10) : property.id as number)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="font-medium">{property.address}</div>
                                  <div className="text-xs text-muted-foreground">{property.city}, {property.state} {property.zipCode}</div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {property.parcelId}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium">
                                  ${property.assessedValue?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  ${property.landValue?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  ${property.improvementValue?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {property.propertyType || 'Unknown'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {property.yearBuilt || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {property.squareFeet?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-center">
                                  <div className="flex justify-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      asChild
                                    >
                                      <a href={`/property/${property.id}`}>
                                        <Search className="h-4 w-4" />
                                      </a>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={10} className="px-4 py-8 text-center">
                                <p className="text-muted-foreground">No properties found</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                
                {data?.properties && data.properties.length > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Showing {data.properties ? data.properties.length : 0} of {data.total} properties
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={(searchParams.page || 1) <= 1}
                        onClick={() => updateSearchParams({ page: Math.max(1, (searchParams.page || 1) - 1) })}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center text-sm">
                        Page {searchParams.page || 1} of {Math.ceil(data.total / (searchParams.pageSize || 10))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={(searchParams.page || 1) >= Math.ceil(data.total / (searchParams.pageSize || 10))}
                        onClick={() => updateSearchParams({ page: (searchParams.page || 1) + 1 })}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="map" className="m-0">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Interactive Property Map</h3>
                    <p className="text-muted-foreground text-sm">Visualize property locations and assessment data geographically</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MapIcon className="h-4 w-4 mr-2" />
                      Toggle Heatmap
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Map Filters
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="h-[60vh] bg-muted rounded-md flex items-center justify-center">
                      <div className="max-w-md text-center p-6">
                        <MapIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium">Interactive Map Coming Soon</h3>
                        <p className="text-muted-foreground mt-2 mb-6">
                          The enhanced map view will include property clustering, heatmap visualization for property values, 
                          and geographic filtering options.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="bg-background rounded-md p-3 border border-border">
                            <h4 className="font-medium text-sm">Property Clustering</h4>
                            <p className="text-xs text-muted-foreground mt-1">Group properties by location for better visualization</p>
                          </div>
                          <div className="bg-background rounded-md p-3 border border-border">
                            <h4 className="font-medium text-sm">Value Heatmap</h4>
                            <p className="text-xs text-muted-foreground mt-1">Color-coded visualization of property values by area</p>
                          </div>
                          <div className="bg-background rounded-md p-3 border border-border">
                            <h4 className="font-medium text-sm">Geographic Filtering</h4>
                            <p className="text-xs text-muted-foreground mt-1">Filter properties by drawing areas on the map</p>
                          </div>
                          <div className="bg-background rounded-md p-3 border border-border">
                            <h4 className="font-medium text-sm">Spatial Analysis</h4>
                            <p className="text-xs text-muted-foreground mt-1">Analyze property trends by geographic location</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="m-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Property Value Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[40vh] bg-muted rounded-md p-4">
                      {data?.properties && data.properties.length > 0 ? (
                        <div className="h-full w-full">
                          <div className="flex h-full items-end justify-between gap-2">
                            {/* Value distribution chart */}
                            {generateValueRanges(data.properties).map((range, index) => (
                              <div key={index} className="relative flex flex-col items-center">
                                <div 
                                  className="w-12 bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                                  style={{ 
                                    height: `${(range.count / Math.max(...generateValueRanges(data.properties).map(r => r.count))) * 100}%`,
                                    minHeight: '20px'
                                  }}
                                >
                                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                                    {range.count}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-top-left">
                                  {formatCurrency(range.min)} - {formatCurrency(range.max)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <BarChart4 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <h3 className="text-lg font-medium">No Data Available</h3>
                            <p className="text-muted-foreground mt-1">
                              Search for properties to see analytics.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Property Type Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data?.properties && data.properties.length > 0 ? (
                        <div className="space-y-4">
                          {generatePropertyTypeDistribution(data.properties).map((type, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{type.type || 'Unknown'}</span>
                                <span className="font-medium">{type.percentage}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${type.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Statistical Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data?.properties && data.properties.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">Avg. Assessed Value</div>
                              <div className="text-lg font-medium">
                                {formatCurrency(calculateAverage(data.properties, 'assessedValue'))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Avg. Sq Footage</div>
                              <div className="text-lg font-medium">
                                {Math.round(calculateAverage(data.properties, 'squareFeet'))} sq ft
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Minimum Value</span>
                              <span className="font-medium">
                                {formatCurrency(calculateMinValue(data.properties, 'assessedValue'))}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Maximum Value</span>
                              <span className="font-medium">
                                {formatCurrency(calculateMaxValue(data.properties, 'assessedValue'))}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Median Value</span>
                              <span className="font-medium">
                                {formatCurrency(calculateMedianValue(data.properties, 'assessedValue'))}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-border">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleExport('csv')}
                              disabled={!data || data.properties.length === 0}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Export Full Analysis
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DataLoadingState>
      </div>
    </AppProvider>
  );
}