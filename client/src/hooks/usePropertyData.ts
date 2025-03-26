import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Define Property interface
export interface Property {
  id: string;
  address: string;
  parcelNumber?: string;
  propertyType?: string;
  price?: number;  // Assessed value
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  lotSize?: number;
  description?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  features?: string[];
  lastSaleDate?: string;
  lastSalePrice?: number;
  garageSize?: number;
  taxRate?: number;
  zoning?: string;
  schoolDistrict?: string;
  floodZone?: string;
  assessmentYear?: number;
  assessmentRatio?: number;
  landValue?: number;
  improvementValue?: number;
  totalValue?: number;
  taxExemptions?: string[];
  isPending?: boolean;
  appealStatus?: 'none' | 'pending' | 'approved' | 'denied';
  appealHistory?: Array<{
    date: string;
    status: string;
    reason: string;
    outcome?: string;
  }>;
}

export interface PropertyFilter {
  county?: string;
  city?: string;
  zipCode?: string;
  neighborhood?: string;
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  squareFeetMin?: number;
  squareFeetMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// For now, returns mock data for demonstration purposes
export const usePropertyData = (filters: PropertyFilter = {}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      // For demo purposes, this would be a real API call in production
      // return await axios.get('/api/properties', { params: filters }).then(res => res.data);
      
      // Mock data generation
      return generateMockProperties(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// This function generates mock property data for development purposes
// In a real app, this would be replaced with actual API calls
function generateMockProperties(filters: PropertyFilter): Property[] {
  const mockProperties: Property[] = [];
  
  // Base property templates for different property types
  const propertyTemplates: Record<string, Partial<Property>> = {
    'Residential': {
      propertyType: 'Residential',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      features: ['Central Air', 'Garage', 'Yard'],
    },
    'Commercial': {
      propertyType: 'Commercial',
      squareFeet: 5000,
      features: ['HVAC', 'Parking Lot', 'Loading Dock'],
    },
    'Agricultural': {
      propertyType: 'Agricultural',
      lotSize: 100000, // in sq ft (approx 2.3 acres)
      features: ['Barn', 'Field', 'Well'],
    },
    'Industrial': {
      propertyType: 'Industrial',
      squareFeet: 10000,
      features: ['High Bay', '3-Phase Power', 'Warehouse'],
    },
    'Vacant Land': {
      propertyType: 'Vacant Land',
      lotSize: 50000, // in sq ft (approx 1.15 acres)
      features: ['Unimproved', 'Corner Lot'],
    }
  };
  
  // Generate random properties
  const count = filters.pageSize || 20;
  const startYear = 1950;
  const endYear = 2023;
  
  for (let i = 0; i < count; i++) {
    // Select a property type
    const propertyTypes = Object.keys(propertyTemplates);
    const propertyType = filters.propertyType && propertyTypes.includes(filters.propertyType) 
      ? filters.propertyType 
      : propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    
    // Get the template for this property type
    const template = propertyTemplates[propertyType];
    
    // Generate building year
    const yearBuilt = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    
    // Generate price based on property type and random factors
    const basePrice = propertyType === 'Residential' ? 250000 :
                     propertyType === 'Commercial' ? 750000 :
                     propertyType === 'Industrial' ? 1200000 :
                     propertyType === 'Agricultural' ? 500000 : 125000;
    
    const priceVariance = basePrice * 0.3; // 30% variance
    const randomPrice = Math.round((basePrice + (Math.random() * priceVariance * 2 - priceVariance)) / 1000) * 1000;
    
    // Generate square footage with some randomness
    const squareFeet = template.squareFeet 
      ? Math.round((template.squareFeet + (Math.random() * template.squareFeet * 0.4 - template.squareFeet * 0.2)) / 100) * 100
      : undefined;
    
    // Generate bedrooms and bathrooms for residential properties
    const bedrooms = propertyType === 'Residential'
      ? template.bedrooms! + Math.floor(Math.random() * 3) - 1 // -1 to +1 bedrooms from template
      : undefined;
    
    const bathrooms = propertyType === 'Residential'
      ? template.bathrooms! + (Math.floor(Math.random() * 3) - 1) * 0.5 // -0.5 to +1.0 bathrooms from template
      : undefined;
    
    // Neighborhoods
    const neighborhoods = ['Downtown', 'Northside', 'Westview', 'Eastwood', 'Southside', 'Riverside', 'Hillcrest'];
    
    // Generate address
    const streetNames = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Ave', 'Church St', 'Highland Dr'];
    const streetNumber = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const address = `${streetNumber} ${streetName}`;
    
    // Generate city - use filter city or random
    const cities = ['Grandview', 'Yakima', 'Sunnyside', 'Prosser', 'Zillah', 'Toppenish'];
    const city = filters.city || cities[Math.floor(Math.random() * cities.length)];
    
    // Generate zip code - use filter zip or random
    const zipCodes = ['98930', '98933', '98935', '98944', '98948', '98901', '98902', '98903'];
    const zipCode = filters.zipCode || zipCodes[Math.floor(Math.random() * zipCodes.length)];
    
    // Generate neighborhood
    const neighborhood = filters.neighborhood || neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    
    // Generate parcel number
    const parcelNumber = `${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
    
    // Generate property with unique ID
    const property: Property = {
      id: `PROP-${i + 1000}`,
      address,
      parcelNumber,
      propertyType,
      price: randomPrice,
      bedrooms,
      bathrooms,
      squareFeet,
      yearBuilt,
      lotSize: template.lotSize,
      description: `This ${propertyType.toLowerCase()} property is located in ${neighborhood} neighborhood of ${city}.`,
      neighborhood,
      city,
      state: 'WA',
      zipCode,
      county: filters.county || 'Yakima',
      features: template.features,
      lastSaleDate: `${2010 + Math.floor(Math.random() * 13)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      lastSalePrice: Math.round(randomPrice * (0.7 + Math.random() * 0.2)),
      garageSize: propertyType === 'Residential' ? Math.floor(Math.random() * 3) + 1 : undefined,
      taxRate: 0.0093 + Math.random() * 0.003,
      zoning: propertyType === 'Residential' ? 'R1' : 
              propertyType === 'Commercial' ? 'C2' : 
              propertyType === 'Industrial' ? 'I1' : 
              propertyType === 'Agricultural' ? 'A1' : 'UL',
      assessmentYear: 2023,
      assessmentRatio: 0.9 + Math.random() * 0.2,
      landValue: Math.round(randomPrice * (0.2 + Math.random() * 0.2)),
      improvementValue: Math.round(randomPrice * (0.6 + Math.random() * 0.2)),
    };
    
    // Calculate total value
    property.totalValue = (property.landValue || 0) + (property.improvementValue || 0);
    
    // Apply latitude and longitude for mapping (random around Yakima, WA)
    property.latitude = 46.6021 + (Math.random() * 0.08 - 0.04);
    property.longitude = -120.5059 + (Math.random() * 0.08 - 0.04);
    
    // Add mock photo URL (would be real property images in production)
    switch (property.propertyType) {
      case 'Residential':
        property.photos = [`https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&auto=format&fit=crop`];
        break;
      case 'Commercial':
        property.photos = [`https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop`];
        break;
      case 'Industrial':
        property.photos = [`https://images.unsplash.com/photo-1565636252850-1a36d8e22867?w=800&auto=format&fit=crop`];
        break;
      case 'Agricultural':
        property.photos = [`https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop`];
        break;
      case 'Vacant Land':
        property.photos = [`https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop`];
        break;
    }
    
    // Only add properties that match the filters
    if (
      (!filters.priceMin || property.price >= filters.priceMin) &&
      (!filters.priceMax || property.price <= filters.priceMax) &&
      (!filters.yearBuiltMin || (property.yearBuilt && property.yearBuilt >= filters.yearBuiltMin)) &&
      (!filters.yearBuiltMax || (property.yearBuilt && property.yearBuilt <= filters.yearBuiltMax)) &&
      (!filters.bedroomsMin || (property.bedrooms && property.bedrooms >= filters.bedroomsMin)) &&
      (!filters.bathroomsMin || (property.bathrooms && property.bathrooms >= filters.bathroomsMin)) &&
      (!filters.squareFeetMin || (property.squareFeet && property.squareFeet >= filters.squareFeetMin)) &&
      (!filters.squareFeetMax || (property.squareFeet && property.squareFeet <= filters.squareFeetMax))
    ) {
      mockProperties.push(property);
    }
  }
  
  // Sort properties if sortBy is specified
  if (filters.sortBy) {
    mockProperties.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof Property];
      const bValue = b[filters.sortBy as keyof Property];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Compare values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      } else {
        const aStr = String(aValue);
        const bStr = String(bValue);
        return filters.sortOrder === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
      }
    });
  }
  
  return mockProperties;
}