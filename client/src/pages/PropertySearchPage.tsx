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
import { PropertySearch } from '../components/property/PropertySearch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AppProvider } from '../context/AppContext';
import { usePropertySearch, PropertySearchParams, Property } from '../hooks/usePropertyData';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PropertyCard } from '../components/property/PropertyCard';
import { DataLoadingState } from '../components/common/DataLoadingState';

/**
 * Enhanced Property Search Page
 * 
 * Provides an advanced search interface for county properties with
 * different view modes (list, grid, map), sorting, filtering, and export options.
 */
export default function PropertySearchPage() {
  // Search state
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    county: 'Yakima',
    page: 1,
    pageSize: 12,
    sortBy: 'address',
    sortOrder: 'asc'
  });

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map' | 'analytics'>('grid');
  
  // Selected properties for batch actions
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  
  // Fetch properties
  const { data, isLoading, isError, error, refetch } = usePropertySearch(searchParams);
  
  // Handle property selection for batch actions
  const handlePropertySelect = (propertyId: string, selected: boolean) => {
    if (selected) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };
  
  // Clear all selections
  const clearSelections = () => {
    setSelectedProperties([]);
  };
  
  // Handle export of selected properties
  const handleExport = (format: 'csv' | 'pdf') => {
    // Call export API endpoint with selected property IDs
    console.log(`Exporting ${selectedProperties.length} properties as ${format}`);
    // Implementation will connect to the export API endpoint
  };
  
  // Handle batch assessment operation
  const handleBatchAssessment = () => {
    // Navigate to batch assessment page or open modal
    console.log(`Starting batch assessment for ${selectedProperties.length} properties`);
    // Implementation will connect to the batch assessment feature
  };
  
  // Handle search parameters update
  const updateSearchParams = (newParams: Partial<PropertySearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      // Reset to first page when filters change
      page: newParams.page || 1
    }));
  };
  
  return (
    <AppProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Property Search</h1>
            <p className="text-muted-foreground mt-1">
              Search, filter, and manage county property records
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={selectedProperties.length === 0}
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="default" 
              size="sm"
              disabled={selectedProperties.length === 0}
              onClick={handleBatchAssessment}
            >
              <FileText className="h-4 w-4 mr-2" />
              Batch Assessment
            </Button>
          </div>
        </div>
        
        {/* Advanced search component */}
        <PropertySearch />
        
        {/* View mode selector */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {data ? (
              <>Showing {data.properties.length} of {data.total} properties</>
            ) : (
              <>Loading properties...</>
            )}
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
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                              <div className="font-medium">{property.address}</div>
                              <div className="text-xs text-muted-foreground">{property.city}, {property.state} {property.zipCode}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              ${property.assessedValue?.toLocaleString() || 'N/A'}
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
                          <td colSpan={6} className="px-4 py-8 text-center">
                            <p className="text-muted-foreground">No properties found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="map" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Property Map View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[50vh] bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Interactive Property Map</h3>
                    <p className="text-muted-foreground mt-1">
                      Map view will be implemented in the next phase using Leaflet or Google Maps API.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Property Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[50vh] bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <BarChart4 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Property Data Analytics</h3>
                    <p className="text-muted-foreground mt-1">
                      Analytics dashboard will be implemented in the next phase with interactive charts and data visualizations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </DataLoadingState>
      </div>
    </AppProvider>
  );
}