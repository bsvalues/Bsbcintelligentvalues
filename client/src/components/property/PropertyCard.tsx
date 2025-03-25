import React from 'react';
import { Link } from 'wouter';
import { PropertyData } from '../../hooks/usePropertyData';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { 
  Home, 
  MapPin, 
  CalendarDays, 
  Square, 
  Ruler, 
  Bath, 
  Bed, 
  DollarSign,
  PenSquare, 
  Scale,
  FileText,
  PlusCircle
} from 'lucide-react';

export interface PropertyCardProps {
  property: PropertyData;
  showCompareButton?: boolean;
  showAppealButton?: boolean;
  showDetailsButton?: boolean;
  onCompare?: (property: PropertyData) => void;
  onAppeal?: (property: PropertyData) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  showCompareButton = false,
  showAppealButton = false,
  showDetailsButton = true,
  onCompare,
  onAppeal
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Determine status badge color
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'warning';
      case 'sold': return 'success';
      case 'off-market': return 'secondary';
      default: return 'outline';
    }
  };

  // Handle compare button click
  const handleCompare = () => {
    if (onCompare) {
      onCompare(property);
    }
  };

  // Handle appeal button click
  const handleAppeal = () => {
    if (onAppeal) {
      onAppeal(property);
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="h-48 bg-muted flex items-center justify-center">
          {property.photos && property.photos.length > 0 ? (
            <img
              src={property.photos[0]}
              alt={`Property at ${property.address}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Home className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
        {property.status && (
          <Badge 
            variant={getStatusBadgeVariant(property.status) as any}
            className="absolute top-2 right-2"
          >
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="pt-4 pb-2 flex-grow">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {property.address}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>
                {[property.city, property.state, property.zipCode].filter(Boolean).join(', ')}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span className="font-medium">{formatCurrency(property.assessedValue)}</span>
            </div>
            <div className="flex items-center">
              <Scale className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span className="font-medium">{formatCurrency(property.marketValue)}</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{property.bedrooms} bd</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{property.bathrooms} ba</span>
            </div>
            <div className="flex items-center">
              <Square className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{property.squareFeet} sqft</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span>{property.yearBuilt}</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-muted-foreground pb-1">
              <span>Tax Year: {property.taxYear}</span>
              <span>Parcel: {property.parcelNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Tax Amount</div>
                <div className="font-medium">{formatCurrency(property.taxAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last Sale</div>
                <div className="font-medium">
                  {property.lastSalePrice 
                    ? formatCurrency(property.lastSalePrice) 
                    : 'No sale data'}
                </div>
                {property.lastSaleDate && (
                  <div className="text-xs text-muted-foreground">
                    {formatDate(property.lastSaleDate)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        {showDetailsButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            asChild
          >
            <Link href={`/property/${property.id}`}>
              <FileText className="h-3.5 w-3.5 mr-1" />
              Details
            </Link>
          </Button>
        )}
        
        {showCompareButton && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={handleCompare}
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Compare
          </Button>
        )}
        
        {showAppealButton && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={handleAppeal}
          >
            <PenSquare className="h-3.5 w-3.5 mr-1" />
            Appeal
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-48 bg-muted" />
      
      <CardContent className="pt-4 pb-2 flex-grow">
        <div className="space-y-3">
          <div>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          
          <div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-full mt-1" />
              </div>
              <div>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-full mt-1" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  );
};