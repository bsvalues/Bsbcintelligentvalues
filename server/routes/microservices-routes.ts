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
 * Search for properties
 */
router.post('/properties/search', async (req, res) => {
  try {
    const searchParams = req.body;
    const properties = await microserviceClients.propertyService.getProperties(searchParams);
    res.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Error searching properties', message: error.message });
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
    res.status(500).json({ error: 'Error getting property', message: error.message });
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
    res.status(500).json({ error: 'Error getting property valuations', message: error.message });
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
    res.status(500).json({ error: 'Error geocoding address', message: error.message });
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
    res.status(500).json({ error: 'Error predicting property value', message: error.message });
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
    res.status(500).json({ error: 'Error getting market metrics', message: error.message });
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
    res.status(500).json({ error: 'Error predicting market trend', message: error.message });
  }
});

export default router;