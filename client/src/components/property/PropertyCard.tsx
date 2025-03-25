import React from 'react';
import { Link } from 'wouter';
import { 
  Home, 
  MapPin, 
  Calendar, 
  Ruler, 
  DollarSign, 
  BadgePercent, 
  Layers, 
  ChevronRight,
  Building2,
  Bath,
  Bed,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { PropertyData } from '../../hooks/usePropertyData';
import { useAppContext } from '../../context/AppContext';

interface PropertyCardProps {
  property: PropertyData;
  isCompact?: boolean;
  showCompareButton?: boolean;
}

export const PropertyCardSkeleton: React.FC<{ isCompact?: boolean }> = ({ isCompact }) => {
  return (
    <Card className={`overflow-hidden ${isCompact ? 'h-[15rem]' : ''}`}>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-4 w-1/2 mb-3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  isCompact = false,
  showCompareButton = false
}) => {
  const { compareMode, addCompareItem, compareItems } = useAppContext();
  
  const isInCompareList = compareItems.includes(property.id);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className={`overflow-hidden ${isCompact ? 'h-[15rem]' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {property.address}
        </CardTitle>
        <div className="text-sm text-muted-foreground flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          {property.neighborhood}, {property.city}, {property.county} County
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-sm flex items-center">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-primary" />
            <span className="font-medium">{formatCurrency(property.assessedValue)}</span>
          </div>
          <div className="text-sm flex items-center">
            <Ruler className="h-3.5 w-3.5 mr-1 text-primary" />
            <span>{property.squareFeet.toLocaleString()} sq ft</span>
          </div>
          <div className="text-sm flex items-center">
            <Bed className="h-3.5 w-3.5 mr-1 text-primary" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="text-sm flex items-center">
            <Bath className="h-3.5 w-3.5 mr-1 text-primary" />
            <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <div className="text-sm flex items-center">
            <Building2 className="h-3.5 w-3.5 mr-1 text-primary" />
            <span>{property.propertyType}</span>
          </div>
          <div className="text-sm flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
            <span>Built {property.yearBuilt}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm font-medium">
          <BadgePercent className="h-3.5 w-3.5 mr-1 text-primary" />
          Assessment Ratio: {((property.assessedValue / property.marketValue) * 100).toFixed(1)}%
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="outline" size="sm">
          <Link to={`/property/${property.id}`}>
            <span className="mr-1">Details</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        
        {(showCompareButton && compareMode) && (
          <Button 
            variant={isInCompareList ? "secondary" : "outline"} 
            size="sm"
            onClick={() => addCompareItem(property.id)}
            disabled={isInCompareList || (compareItems.length >= 5 && !isInCompareList)}
          >
            <Layers className="h-4 w-4 mr-1" />
            {isInCompareList ? "Added" : "Compare"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};