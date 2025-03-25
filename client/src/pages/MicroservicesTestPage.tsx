import React, { useState } from 'react';
import { MicroservicesStatus } from '../components/common/MicroservicesStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { usePropertySearch } from '../hooks/usePropertyData';
import { useMarketMetrics } from '../hooks/useMarketData';
import { PropertySearchParams } from '../hooks/usePropertyData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/use-toast';
import { apiRequest } from '../lib/queryClient';

/**
 * Test page to verify the connections to all microservices
 */
export function MicroservicesTestPage() {
  const [county, setCounty] = useState<string>('Grandview');
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    county: 'Grandview',
    page: 1,
    pageSize: 5
  });
  const [geocodeAddress, setGeocodeAddress] = useState<string>('');
  const [geocodeResult, setGeocodeResult] = useState<any>(null);
  const [valuationPropertyId, setValuationPropertyId] = useState<string>('');
  const [valuationResult, setValuationResult] = useState<any>(null);

  // Fetch data from property service
  const propertyQuery = usePropertySearch(searchParams);
  
  // Fetch data from market service
  const marketQuery = useMarketMetrics(county);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    propertyQuery.refetch();
  };

  const handleGeocodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!geocodeAddress.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an address to geocode',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await apiRequest('/api/geocode', {
        method: 'POST',
        body: JSON.stringify({ address: geocodeAddress }),
      });
      
      setGeocodeResult(result);
      toast({
        title: 'Success',
        description: 'Address geocoded successfully',
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to geocode address',
        variant: 'destructive',
      });
    }
  };

  const handleValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valuationPropertyId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a property ID',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await apiRequest(`/api/predict-property-value`, {
        method: 'POST',
        body: JSON.stringify({ propertyId: valuationPropertyId }),
      });
      
      setValuationResult(result);
      toast({
        title: 'Success',
        description: 'Property valuation completed',
      });
    } catch (error) {
      console.error('Valuation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get property valuation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Microservices Integration Test</h1>
      <p className="text-gray-600 mb-8">
        This page tests the connectivity to all microservices and verifies data flow.
      </p>
      
      <div className="mb-8">
        <MicroservicesStatus />
      </div>
      
      <Tabs defaultValue="property">
        <TabsList className="mb-4">
          <TabsTrigger value="property">Property Service</TabsTrigger>
          <TabsTrigger value="market">Market Service</TabsTrigger>
          <TabsTrigger value="spatial">Spatial Service</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Service</TabsTrigger>
        </TabsList>
        
        {/* Property Service Testing */}
        <TabsContent value="property">
          <Card>
            <CardHeader>
              <CardTitle>Property Search</CardTitle>
              <CardDescription>
                Test property search functionality from the Property Microservice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchSubmit} className="space-y-4 mb-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="county">County</Label>
                    <Input 
                      id="county" 
                      value={searchParams.county || ''} 
                      onChange={(e) => setSearchParams({...searchParams, county: e.target.value})}
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </div>
              </form>
              
              <div className="mt-4">
                {propertyQuery.isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : propertyQuery.isError ? (
                  <div className="text-destructive p-4 border border-destructive rounded">
                    Error loading property data: {(propertyQuery.error as Error).message}
                  </div>
                ) : propertyQuery.data ? (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Results ({propertyQuery.data.total || 0} properties)</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Address</th>
                            <th className="px-4 py-2 text-right">Value</th>
                            <th className="px-4 py-2 text-right">Square Feet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {propertyQuery.data.properties?.map((property) => (
                            <tr key={property.id} className="border-t">
                              <td className="px-4 py-2">{property.id}</td>
                              <td className="px-4 py-2">{property.address}</td>
                              <td className="px-4 py-2 text-right">
                                ${property.marketValue?.toLocaleString() || property.assessedValue?.toLocaleString() || 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-right">{property.squareFeet?.toLocaleString() || 'N/A'}</td>
                            </tr>
                          ))}
                          {(!propertyQuery.data.properties || propertyQuery.data.properties.length === 0) && (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                No properties found. Try adjusting your search criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-8">
                    No property data available. Click Search to load properties.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Market Service Testing */}
        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Market Metrics</CardTitle>
              <CardDescription>
                Test market metrics functionality from the Market Microservice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4 mb-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="market-county">County</Label>
                    <Input 
                      id="market-county" 
                      value={county} 
                      onChange={(e) => setCounty(e.target.value)}
                    />
                  </div>
                  <Button type="button" onClick={() => marketQuery.refetch()}>
                    Load Metrics
                  </Button>
                </div>
              </form>
              
              <div className="mt-4">
                {marketQuery.isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : marketQuery.isError ? (
                  <div className="text-destructive p-4 border border-destructive rounded">
                    Error loading market data: {(marketQuery.error as Error).message}
                  </div>
                ) : marketQuery.data ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricCard 
                      title="Median Sale Price" 
                      value={marketQuery.data.medianSalePrice} 
                      format="currency"
                    />
                    <MetricCard 
                      title="Average Sale Price" 
                      value={marketQuery.data.averageSalePrice} 
                      format="currency"
                    />
                    <MetricCard 
                      title="Total Sales" 
                      value={marketQuery.data.totalSales} 
                      format="number"
                    />
                    <MetricCard 
                      title="Days on Market" 
                      value={marketQuery.data.daysOnMarket} 
                      format="number"
                      suffix="days"
                    />
                    <MetricCard 
                      title="Price per Square Foot" 
                      value={marketQuery.data.pricePerSquareFoot} 
                      format="currency"
                      suffix="/sq.ft"
                    />
                    <MetricCard 
                      title="Assessment Ratio" 
                      value={marketQuery.data.assessmentRatio * 100} 
                      format="percentage"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-8">
                    No market data available. Click Load Metrics to fetch data.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Spatial Service Testing */}
        <TabsContent value="spatial">
          <Card>
            <CardHeader>
              <CardTitle>Geocoding Address</CardTitle>
              <CardDescription>
                Test geocoding functionality from the Spatial Microservice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeocodeSubmit} className="space-y-4 mb-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      value={geocodeAddress} 
                      onChange={(e) => setGeocodeAddress(e.target.value)}
                      placeholder="Enter a full address"
                    />
                  </div>
                  <Button type="submit">Geocode</Button>
                </div>
              </form>
              
              <div className="mt-4">
                {geocodeResult ? (
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-2">Geocoded Result</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Latitude</p>
                        <p className="font-medium">{geocodeResult.latitude}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Longitude</p>
                        <p className="font-medium">{geocodeResult.longitude}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Formatted Address</p>
                        <p className="font-medium">{geocodeResult.formattedAddress || geocodeAddress}</p>
                      </div>
                      {geocodeResult.confidence && (
                        <div>
                          <p className="text-sm text-gray-500">Confidence</p>
                          <p className="font-medium">{geocodeResult.confidence}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-8">
                    Enter an address and click Geocode to see the results.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Service Testing */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Property Valuation</CardTitle>
              <CardDescription>
                Test valuation functionality from the Analytics Microservice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleValuationSubmit} className="space-y-4 mb-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="property-id">Property ID</Label>
                    <Input 
                      id="property-id" 
                      value={valuationPropertyId} 
                      onChange={(e) => setValuationPropertyId(e.target.value)}
                      placeholder="Enter a property ID"
                    />
                  </div>
                  <Button type="submit">Predict Value</Button>
                </div>
              </form>
              
              <div className="mt-4">
                {valuationResult ? (
                  <div className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-2">Valuation Result</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Property</p>
                        <p className="font-medium">{valuationResult.address || 'Property #' + valuationPropertyId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Value</p>
                        <p className="font-medium text-lg">${valuationResult.estimatedValue?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Confidence</p>
                        <div className="flex items-center">
                          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${(valuationResult.confidenceScore || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-medium">
                            {Math.round((valuationResult.confidenceScore || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      {valuationResult.factors && (
                        <div className="col-span-2 mt-4">
                          <p className="text-sm text-gray-500 mb-2">Value Factors</p>
                          <div className="space-y-2">
                            {Object.entries(valuationResult.factors).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="font-medium">
                                  {typeof value.contribution === 'number' 
                                    ? `$${value.contribution.toLocaleString()} (${value.percentageContribution.toFixed(1)}%)`
                                    : (typeof value === 'number' ? value.toLocaleString() : JSON.stringify(value))
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-8">
                    Enter a property ID and click Predict Value to see the results.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  suffix?: string;
}

const MetricCard = ({ title, value, format, suffix }: MetricCardProps) => {
  const formattedValue = () => {
    if (format === 'currency') {
      return `$${value.toLocaleString()}`;
    } else if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold">
        {formattedValue()} {suffix && <span className="text-sm font-normal">{suffix}</span>}
      </p>
    </div>
  );
};

export default MicroservicesTestPage;