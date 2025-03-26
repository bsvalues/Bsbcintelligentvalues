import React from 'react';
import { Link } from 'wouter';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Ruler, 
  DollarSign, 
  Bed, 
  Bath, 
  Building, 
  Square,
  ArrowRight, 
  Edit, 
  Eye
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Property } from '../../hooks/usePropertyData';

export interface PropertyCardProps {
  property: Property;
  viewMode?: 'compact' | 'full';
  onEdit?: (property: Property) => void;
  onView?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  viewMode = 'full',
  onEdit,
  onView
}) => {
  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  if (viewMode === 'compact') {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">{property.address}</CardTitle>
            <Badge variant="outline">{property.propertyType}</Badge>
          </div>
          <CardDescription className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {property.city}, {property.state} {property.zipCode}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              {formatCurrency(property.price)}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              Built {property.yearBuilt || 'N/A'}
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1 text-muted-foreground" />
              {property.squareFeet?.toLocaleString() || 'N/A'} sq ft
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
              {property.bedrooms || 'N/A'} bed
              <Bath className="h-4 w-4 ml-2 mr-1 text-muted-foreground" />
              {property.bathrooms || 'N/A'} bath
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex w-full justify-end gap-2">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => onView(property)}
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => onEdit(property)}
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            )}
            {!onView && !onEdit && (
              <Link href={`/properties/${property.id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 w-full"
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
              </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      {property.photos && property.photos.length > 0 ? (
        <div 
          className="h-48 bg-cover bg-center" 
          style={{ backgroundImage: `url(${property.photos[0]})` }}
        />
      ) : (
        <div className="h-48 bg-muted flex items-center justify-center">
          <Home className="h-16 w-16 text-muted-foreground opacity-30" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{property.address}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {property.city}, {property.state} {property.zipCode}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-normal">
            {property.propertyType || 'Residential'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-y-3">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatCurrency(property.price)}</div>
              <div className="text-xs text-muted-foreground">Assessed Value</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <div className="font-medium">{property.yearBuilt || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Year Built</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Square className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <div className="font-medium">{property.squareFeet?.toLocaleString() || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Square Feet</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <div className="font-medium">{property.lotSize?.toLocaleString() || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Lot Size</div>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center">
            <div className="font-medium text-lg">{property.bedrooms || 'N/A'}</div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Bed className="h-3 w-3 mr-1" />
              Bedrooms
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="font-medium text-lg">{property.bathrooms || 'N/A'}</div>
            <div className="text-xs text-muted-foreground flex items-center">
              <Bath className="h-3 w-3 mr-1" />
              Bathrooms
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="font-medium text-lg">{property.garageSize || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Garage</div>
          </div>
        </div>
        
        {property.description && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {property.description.slice(0, 150)}
              {property.description.length > 150 ? '...' : ''}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        {property.parcelNumber && (
          <Badge variant="outline" className="font-normal">
            Parcel: {property.parcelNumber}
          </Badge>
        )}
        
        <div className="flex gap-2">
          {onEdit && (
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => onEdit(property)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          
          {onView ? (
            <Button 
              className="flex items-center gap-1"
              onClick={() => onView(property)}
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          ) : (
            <Link href={`/properties/${property.id}`}>
              <Button className="flex items-center gap-1">
                <ArrowRight className="h-4 w-4" />
                View Details
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;