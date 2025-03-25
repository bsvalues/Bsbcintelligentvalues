/**
 * PropertyCard Component
 * 
 * Displays property information in a card format
 */
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyListing } from '../../types/propertyTypes';
import { Home, MapPin, Ruler, Calendar, DollarSign, Building } from 'lucide-react';
import { Link } from 'wouter';

interface PropertyCardProps {
  property: PropertyListing;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export function PropertyCard({ property, showActions = true, variant = 'default' }: PropertyCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (variant === 'compact') {
    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base truncate">{property.address}</CardTitle>
          <CardDescription className="flex items-center text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {property.neighborhood || property.city || 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <Home className="h-3 w-3 mr-1" />
              <span>{property.bedrooms} bd | {property.bathrooms} ba</span>
            </div>
            <div className="flex items-center">
              <Ruler className="h-3 w-3 mr-1" />
              <span>{property.squareFeet.toLocaleString()} sqft</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Built {property.yearBuilt || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Building className="h-3 w-3 mr-1" />
              <span>{property.propertyType || 'Residential'}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex justify-between items-center">
          <div className="font-semibold">{formatCurrency(property.price)}</div>
          {property.status && (
            <Badge variant={
              property.status === 'active' ? 'default' :
              property.status === 'pending' ? 'secondary' :
              property.status === 'sold' ? 'outline' : 'destructive'
            }>
              {property.status}
            </Badge>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // Default variant (full size)
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{property.address}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {[
                property.neighborhood,
                property.city,
                property.state,
                property.zipCode
              ].filter(Boolean).join(', ') || 'Location not available'}
            </CardDescription>
          </div>
          {property.status && (
            <Badge variant={
              property.status === 'active' ? 'default' :
              property.status === 'pending' ? 'secondary' :
              property.status === 'sold' ? 'outline' : 'destructive'
            }>
              {property.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-semibold text-lg">{formatCurrency(property.price)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Property Type</p>
            <p>{property.propertyType || 'Residential'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Year Built</p>
            <p>{property.yearBuilt || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Listing Date</p>
            <p>{formatDate(property.listingDate)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
            <Home className="h-5 w-5 mb-1" />
            <p className="text-xs text-muted-foreground">Bedrooms</p>
            <p className="font-semibold">{property.bedrooms}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
            <svg 
              className="h-5 w-5 mb-1" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M4 12h16M4 12a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1M4 12v6a1 1 0 001 1h14a1 1 0 001-1v-6" />
              <path d="M6 8v0m4 0v0" />
            </svg>
            <p className="text-xs text-muted-foreground">Bathrooms</p>
            <p className="font-semibold">{property.bathrooms}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
            <Ruler className="h-5 w-5 mb-1" />
            <p className="text-xs text-muted-foreground">Square Feet</p>
            <p className="font-semibold">{property.squareFeet.toLocaleString()}</p>
          </div>
        </div>
        
        {property.description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{property.description}</p>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/properties/${property.id}`}>
              View Details
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/properties/${property.id}/assessment`}>
              Assess Property
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}