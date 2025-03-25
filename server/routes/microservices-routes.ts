import { Router, Express } from 'express';
import microserviceClients from '../services/microservices-client';

const router = Router();

/**
 * Register all microservices routes to the Express app
 */
export function registerMicroservicesRoutes(app: Express) {
  // Mount the router at /api
  app.use('/api', router);
  console.log('Microservices routes registered');
}

/**
 * GET /api/microservices/health
 * Check the health of all microservices
 */
router.get('/health', async (req, res) => {
  try {
    // Check the health of each microservice
    const propertyStatus = await microserviceClients.propertyService.checkHealth();
    const marketStatus = await microserviceClients.marketService.checkHealth();
    const spatialStatus = await microserviceClients.spatialService.checkHealth();
    const analyticsStatus = await microserviceClients.analyticsService.checkHealth();

    // Determine overall status
    const services = {
      property: propertyStatus,
      market: marketStatus,
      spatial: spatialStatus,
      analytics: analyticsStatus
    };
    
    const servicesList = Object.values(services);
    const allHealthy = servicesList.every(status => status === true);
    const anyHealthy = servicesList.some(status => status === true);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'All services are operating normally.';
    
    if (!allHealthy) {
      if (anyHealthy) {
        status = 'degraded';
        message = 'Some services are experiencing issues.';
      } else {
        status = 'unhealthy';
        message = 'All services are down.';
      }
    }
    
    // Return the status of all microservices
    res.json({
      status,
      message,
      services
    });
  } catch (error) {
    console.error('Error checking microservices health:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Error checking microservices health',
      services: {
        property: false,
        market: false,
        spatial: false,
        analytics: false
      }
    });
  }
});

/**
 * POST /api/properties/search
 * Search for properties (POST)
 */
router.post('/properties/search', async (req, res) => {
  try {
    const searchParams = req.body;
    const properties = await microserviceClients.propertyService.getProperties(searchParams);
    res.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ 
      error: 'Error searching properties', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/properties/search
 * Enhanced search for properties with intelligent query processing
 */
router.get('/properties/search', async (req, res) => {
  try {
    // Convert query string parameters to search params object
    const searchParams: any = {};
    
    // Extract and handle pagination parameters
    if (req.query.page) searchParams.page = parseInt(req.query.page as string);
    if (req.query.pageSize) searchParams.pageSize = parseInt(req.query.pageSize as string);
    
    // Extract and handle sorting parameters
    if (req.query.sortBy) searchParams.sortBy = req.query.sortBy as string;
    if (req.query.sortOrder) searchParams.sortOrder = req.query.sortOrder as string;
    
    // Extract and handle filter parameters
    if (req.query.county) searchParams.county = req.query.county as string;
    if (req.query.zipCode) searchParams.zipCode = req.query.zipCode as string;
    if (req.query.neighborhood) searchParams.neighborhood = req.query.neighborhood as string;
    if (req.query.propertyType) searchParams.propertyType = req.query.propertyType as string;
    
    // Enhanced address and parcel number handling with fuzzy search capability
    if (req.query.address) {
      const addressQuery = req.query.address as string;
      
      // If it looks like just a house number, add a wildcard for flexible matching
      if (/^\d+$/.test(addressQuery)) {
        searchParams.addressWildcard = `${addressQuery}%`; // Will match house numbers that start with this
        // We'll also want partial address matching (helpful for house numbers)
        searchParams.address = addressQuery;
        searchParams.fuzzyMatch = true; // Signal to use fuzzy matching in the microservice
      } else {
        // Regular address search, but enable partial matching
        searchParams.address = addressQuery;
        
        // Check if it's a partial address (no street suffix)
        if (!/\b(st|ave|rd|blvd|dr|ln|way|pl|ct)\b/i.test(addressQuery)) {
          searchParams.fuzzyMatch = true;
        }
      }
    }
    
    // Enhanced parcel number handling
    if (req.query.parcelNumber) {
      // Normalize parcel number formats by removing spaces and dashes
      searchParams.parcelNumber = (req.query.parcelNumber as string).replace(/[\s-]/g, '');
    }
    
    // Extract and parse numeric filter parameters with validation
    if (req.query.minValue) {
      const value = parseInt(req.query.minValue as string);
      if (!isNaN(value) && value >= 0) searchParams.minValue = value;
    }
    
    if (req.query.maxValue) {
      const value = parseInt(req.query.maxValue as string);
      if (!isNaN(value) && value > 0) searchParams.maxValue = value;
    }
    
    if (req.query.minSquareFeet) {
      const value = parseInt(req.query.minSquareFeet as string);
      if (!isNaN(value) && value >= 0) searchParams.minSquareFeet = value;
    }
    
    if (req.query.maxSquareFeet) {
      const value = parseInt(req.query.maxSquareFeet as string);
      if (!isNaN(value) && value > 0) searchParams.maxSquareFeet = value;
    }
    
    if (req.query.minYearBuilt) {
      const value = parseInt(req.query.minYearBuilt as string);
      // Reasonable year built range
      if (!isNaN(value) && value >= 1800 && value <= new Date().getFullYear()) 
        searchParams.yearBuiltMin = value;
    }
    
    if (req.query.maxYearBuilt) {
      const value = parseInt(req.query.maxYearBuilt as string);
      if (!isNaN(value) && value >= 1800 && value <= new Date().getFullYear()) 
        searchParams.yearBuiltMax = value;
    }
    
    if (req.query.minBedrooms) {
      const value = parseInt(req.query.minBedrooms as string);
      if (!isNaN(value) && value >= 0) searchParams.minBedrooms = value;
    }
    
    if (req.query.minBathrooms) {
      const value = parseFloat(req.query.minBathrooms as string);
      if (!isNaN(value) && value >= 0) searchParams.minBathrooms = value;
    }
    
    // Handle array parameters (like neighborhoods)
    if (req.query.neighborhoods) {
      if (Array.isArray(req.query.neighborhoods)) {
        searchParams.neighborhoods = req.query.neighborhoods;
      } else {
        searchParams.neighborhoods = [req.query.neighborhoods];
      }
    }
    
    // Log search parameters for debugging and analytics
    console.log('Property search parameters:', searchParams);
    
    // Execute the search with enhanced parameters
    const properties = await microserviceClients.propertyService.getProperties(searchParams);
    
    // Return the search results
    res.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Error searching properties', message: (error as Error).message });
  }
});

/**
 * GET /api/properties/:id
 * Get a property by ID
 */
router.get('/properties/:id', async (req, res) => {
  try {
    const property = await microserviceClients.propertyService.getProperty(parseInt(req.params.id));
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error getting property:', error);
    res.status(500).json({ 
      error: 'Error getting property', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/properties/:id/valuations
 * Get valuations for a property
 */
router.get('/properties/:id/valuations', async (req, res) => {
  try {
    const valuations = await microserviceClients.propertyService.getPropertyValuations(parseInt(req.params.id));
    res.json(valuations);
  } catch (error) {
    console.error('Error getting property valuations:', error);
    res.status(500).json({ 
      error: 'Error getting property valuations', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * POST /api/geocode
 * Geocode an address
 */
router.post('/geocode', async (req, res) => {
  try {
    const result = await microserviceClients.spatialService.geocodeAddress(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error geocoding address:', error);
    res.status(500).json({ 
      error: 'Error geocoding address', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * POST /api/predict-property-value
 * Predict a property value
 */
router.post('/predict-property-value', async (req, res) => {
  try {
    const result = await microserviceClients.analyticsService.predictPropertyValue(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error predicting property value:', error);
    res.status(500).json({ 
      error: 'Error predicting property value', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/market/:county/metrics
 * Get market metrics for a county
 */
router.get('/market/:county/metrics', async (req, res) => {
  try {
    const metrics = await microserviceClients.marketService.getMarketOverview('county', req.params.county);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting market metrics:', error);
    res.status(500).json({ 
      error: 'Error getting market metrics', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * POST /api/predict-market-trend
 * Predict market trends
 */
router.post('/predict-market-trend', async (req, res) => {
  try {
    const result = await microserviceClients.analyticsService.predictMarketTrend(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error predicting market trend:', error);
    res.status(500).json({ 
      error: 'Error predicting market trend', 
      message: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;