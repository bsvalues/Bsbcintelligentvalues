/**
 * API Service
 * 
 * Central service for API interactions with microservices
 */
import { apiRequest } from '../lib/queryClient';
import type { PropertyListing, PropertyAssessment } from '../types/propertyTypes';
import type { MarketMetricsSnapshot, MarketTrend } from '../types/marketTypes';

/**
 * Property Service API
 */
export const propertyService = {
  // Fetch property listings with optional filters
  async getProperties(params: Record<string, any> = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const url = `/api/analytics/properties?${queryParams.toString()}`;
    return apiRequest<{ properties: PropertyListing[]; total: number }>(url);
  },
  
  // Fetch a single property by ID
  async getProperty(id: string) {
    return apiRequest<PropertyListing>(`/api/analytics/properties/${id}`);
  },
  
  // Fetch property assessments by property ID
  async getPropertyAssessments(propertyId: string) {
    return apiRequest<PropertyAssessment[]>(`/api/mass-appraisal/properties/${propertyId}/assessments`);
  },
  
  // Create a new assessment
  async createAssessment(assessment: Omit<PropertyAssessment, 'id'>) {
    return apiRequest<PropertyAssessment>('/api/mass-appraisal/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment),
    });
  },
  
  // Update an existing assessment
  async updateAssessment(assessment: PropertyAssessment) {
    return apiRequest<PropertyAssessment>(`/api/mass-appraisal/assessments/${assessment.id}`, {
      method: 'PUT',
      body: JSON.stringify(assessment),
    });
  },
};

/**
 * Market Service API
 */
export const marketService = {
  // Fetch market metrics for an area
  async getMarketMetrics(areaType: string, area: string) {
    return apiRequest<MarketMetricsSnapshot>(`/api/market/metrics/${areaType}/${area}`);
  },
  
  // Fetch market trends for an area
  async getMarketTrends(areaType: string, area: string, metric: string, timeframe: string) {
    return apiRequest<MarketTrend>(`/api/market/trends/${areaType}/${area}/${metric}/${timeframe}`);
  },
  
  // Fetch market predictions for an area
  async getMarketPredictions(areaType: string, area: string, predictionType: string) {
    return apiRequest<any>(`/api/market/predictions/${areaType}/${area}/${predictionType}`);
  },
  
  // Fetch market alerts with optional filters
  async getMarketAlerts(params: Record<string, any> = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const url = `/api/market/alerts?${queryParams.toString()}`;
    return apiRequest<any[]>(url);
  },
  
  // Mark a market alert as read
  async markAlertRead(alertId: string) {
    return apiRequest(`/api/market/alerts/${alertId}/read`, {
      method: 'POST',
    });
  },
};

/**
 * Spatial Service API
 */
export const spatialService = {
  // Fetch heat map data for visualization
  async getHeatMapData(areaType: string, area: string, metric: string) {
    return apiRequest<any>(`/api/spatial/heatmap/${areaType}/${area}/${metric}`);
  },
  
  // Geocode an address to coordinates
  async geocodeAddress(address: string) {
    return apiRequest<{ latitude: number; longitude: number }>('/api/spatial/geocode', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  },
  
  // Get geospatial data for neighborhoods in a county
  async getNeighborhoods(county: string) {
    return apiRequest<any>(`/api/spatial/neighborhoods/${county}`);
  },
};

/**
 * Analytics Service API
 */
export const analyticsService = {
  // Request a property valuation
  async getPropertyValuation(request: any) {
    return apiRequest<any>('/api/valuation-agent/valuation', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  // Get methodology recommendation for a property
  async getMethodologyRecommendation(request: any) {
    return apiRequest<any>('/api/valuation-agent/methodology', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  // Get valuation accuracy metrics
  async getValuationAccuracyMetrics(areaType: string, area: string) {
    return apiRequest<any>(`/api/analytics/valuation-metrics/${areaType}/${area}`);
  },
};