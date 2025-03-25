/**
 * Property Timeseries Controller
 * 
 * Provides API endpoints for retrieving property time-series data
 * used in the animated property trend visualization feature.
 */

import { Request, Response } from 'express';
import { RealEstateAnalyticsService } from '../services/real-estate-analytics.service';
import { handleError, NotFoundError, ServiceError } from '../errors';

const analyticsService = RealEstateAnalyticsService.getInstance();

/**
 * Get property timeseries data for a specified timeframe and area
 * 
 * @param req Request object with query parameters
 * @param res Response object
 */
export async function getPropertyTimeseries(req: Request, res: Response) {
  try {
    const { 
      timeframe = '1yr', 
      area = 'grandview',
      propertyType = 'all'
    } = req.query;

    // Validate timeframe parameter
    const validTimeframes = ['1yr', '3yr', '5yr', '10yr'];
    if (!validTimeframes.includes(timeframe as string)) {
      return res.status(400).json({
        error: 'Invalid timeframe parameter',
        message: 'Timeframe must be one of: 1yr, 3yr, 5yr, 10yr'
      });
    }

    // Validate area parameter
    const validAreas = ['grandview', 'sunnyside', 'yakima', 'toppenish', 'richland'];
    if (!validAreas.includes(area as string)) {
      return res.status(400).json({
        error: 'Invalid area parameter',
        message: 'Area must be one of: grandview, sunnyside, yakima, toppenish, richland'
      });
    }

    // Validate property type parameter
    const validPropertyTypes = ['all', 'residential', 'commercial', 'multi-family', 'land'];
    if (!validPropertyTypes.includes(propertyType as string)) {
      return res.status(400).json({
        error: 'Invalid propertyType parameter',
        message: 'Property type must be one of: all, residential, commercial, multi-family, land'
      });
    }

    const timeseriesData = await analyticsService.getPropertyTimeseries(
      timeframe as string,
      area as string,
      propertyType as string
    );

    if (!timeseriesData) {
      throw new NotFoundError('Timeseries data not found for the specified parameters');
    }

    return res.json(timeseriesData);
  } catch (error: unknown) {
    // Safely cast error to Error type for handling
    const err = error instanceof Error ? error : new Error(String(error));
    handleError(err);
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        error: 'Not Found',
        message: err.message
      });
    }
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unknown error occurred'
    });
  }
}

/**
 * Get available timeframes for property timeseries data
 * 
 * @param req Request object
 * @param res Response object
 */
export async function getTimeframeOptions(req: Request, res: Response) {
  try {
    const timeframes = analyticsService.getTimeframeOptions();
    return res.json(timeframes);
  } catch (error: unknown) {
    // Safely cast error to Error type for handling
    const err = error instanceof Error ? error : new Error(String(error));
    handleError(err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unknown error occurred'
    });
  }
}

/**
 * Get available market areas for property timeseries data
 * 
 * @param req Request object
 * @param res Response object
 */
export async function getMarketAreaOptions(req: Request, res: Response) {
  try {
    // Use the analytics service to get market areas dynamically
    const marketAreas = await analyticsService.getMarketAreaOptions();
    return res.json(marketAreas);
  } catch (error: unknown) {
    // Safely cast error to Error type for handling
    const err = error instanceof Error ? error : new Error(String(error));
    handleError(err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unknown error occurred'
    });
  }
}