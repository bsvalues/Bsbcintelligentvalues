import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Building, AlertTriangle, Search, FileText, Filter, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { PropertyCard } from '../components/property/PropertyCard';
import { usePropertyData, Property } from '../hooks/usePropertyData';
import BatchProcessingTool from '../components/property/BatchProcessingTool';
import AssessmentIntelligenceDashboard from '../components/assessment/AssessmentIntelligenceDashboard';

const AssessmentIntelligencePage: React.FC = () => {
  // Get sample property data
  const { data: properties, isLoading, isError } = usePropertyData({
    county: 'Yakima',
    page: 1,
    pageSize: 20
  });
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  
  // Filter properties based on search query
  useEffect(() => {
    if (!properties) {
      setFilteredProperties([]);
      return;
    }
    
    if (!searchQuery.trim()) {
      setFilteredProperties(properties);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    
    // Simple filtering logic
    const filtered = properties.filter(property => 
      property.address?.toLowerCase().includes(lowerQuery) ||
      property.parcelNumber?.toLowerCase().includes(lowerQuery) ||
      property.propertyType?.toLowerCase().includes(lowerQuery) ||
      property.neighborhood?.toLowerCase().includes(lowerQuery) ||
      property.zipCode?.includes(lowerQuery)
    );
    
    setFilteredProperties(filtered);
  }, [properties, searchQuery]);
  
  // Set first property as selected by default when data loads
  useEffect(() => {
    if (properties && properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0]);
    }
  }, [properties, selectedProperty]);
  
  // Handle property selection
  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
  };
  
  // Get comparable properties for the selected property
  const getComparableProperties = (): Property[] => {
    if (!selectedProperty || !properties) return [];
    
    // Filter out the selected property itself
    return properties
      .filter(p => p.id !== selectedProperty.id)
      // Sort by similarity (in a real app, would use more sophisticated matching)
      .sort((a, b) => {
        const aScore = getSimilarityScore(selectedProperty, a);
        const bScore = getSimilarityScore(selectedProperty, b);
        return bScore - aScore;
      })
      .slice(0, 5); // Get top 5 most similar
  };
  
  // Simple similarity function (would be more sophisticated in production)
  const getSimilarityScore = (property1: Property, property2: Property): number => {
    let score = 0;
    
    // Similar neighborhood (30% weight)
    if (property1.neighborhood === property2.neighborhood) {
      score += 30;
    }
    
    // Similar property type (20% weight)
    if (property1.propertyType === property2.propertyType) {
      score += 20;
    }
    
    // Similar year built (10% weight)
    if (property1.yearBuilt && property2.yearBuilt) {
      const yearDiff = Math.abs(property1.yearBuilt - property2.yearBuilt);
      if (yearDiff < 5) score += 10;
      else if (yearDiff < 10) score += 5;
    }
    
    // Similar square footage (20% weight)
    if (property1.squareFeet && property2.squareFeet) {
      const sqftDiff = Math.abs(property1.squareFeet - property2.squareFeet) / property1.squareFeet;
      if (sqftDiff < 0.1) score += 20; // within 10%
      else if (sqftDiff < 0.2) score += 10; // within 20%
      else if (sqftDiff < 0.3) score += 5; // within 30%
    }
    
    // Similar price range (20% weight)
    if (property1.price && property2.price) {
      const priceDiff = Math.abs(property1.price - property2.price) / property1.price;
      if (priceDiff < 0.1) score += 20; // within 10%
      else if (priceDiff < 0.2) score += 10; // within 20%
      else if (priceDiff < 0.3) score += 5; // within 30%
    }
    
    return score;
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Helmet>
          <title>Assessment Intelligence - BS County Values</title>
        </Helmet>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Database className="h-16 w-16 animate-pulse text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium">Loading property data...</h3>
            <p className="text-muted-foreground">Please wait while we retrieve the assessment data.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Helmet>
          <title>Assessment Intelligence - BS County Values</title>
        </Helmet>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium">Error Loading Data</h3>
            <p className="text-muted-foreground">There was a problem retrieving property data.</p>
            <Button variant="outline" className="mt-4">Retry</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <Helmet>
        <title>Assessment Intelligence - BS County Values</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Assessment Intelligence</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered tools for property assessment analysis, validation, and optimization.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property selection sidebar */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Properties
              </CardTitle>
              <CardDescription>
                Select a property to analyze
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search by address, parcel #, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <ScrollArea className="h-[400px]">
                <div className="px-6 divide-y">
                  {filteredProperties.length === 0 ? (
                    <div className="py-8 text-center">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                      <p className="text-muted-foreground">No properties found</p>
                    </div>
                  ) : (
                    filteredProperties.map((property) => (
                      <div 
                        key={property.id}
                        className={`py-3 cursor-pointer hover:bg-muted/50 ${
                          selectedProperty?.id === property.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleSelectProperty(property)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{property.address}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.propertyType} · {property.squareFeet} sq ft · Built {property.yearBuilt}
                            </div>
                          </div>
                          <Badge variant="outline">
                            ${property.price?.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="pt-3">
              <div className="text-sm text-muted-foreground w-full text-center">
                Showing {filteredProperties.length} of {properties?.length || 0} properties
              </div>
            </CardFooter>
          </Card>
          
          {selectedProperty && (
            <PropertyCard 
              property={selectedProperty}
              viewMode="compact"
            />
          )}
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="intelligence">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="intelligence" className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                Assessment Intelligence
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Batch Processing
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="intelligence">
              {selectedProperty ? (
                <AssessmentIntelligenceDashboard
                  property={selectedProperty}
                  comparableProperties={getComparableProperties()}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Intelligence</CardTitle>
                    <CardDescription>
                      Select a property to view assessment intelligence
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                      <p>No property selected</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="batch">
              {properties && properties.length > 0 ? (
                <BatchProcessingTool
                  properties={properties}
                  onPropertiesUpdated={(updatedProperties) => {
                    console.log('Properties updated', updatedProperties.length);
                  }}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Batch Processing</CardTitle>
                    <CardDescription>
                      No properties available for batch processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                      <p>No properties available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AssessmentIntelligencePage;