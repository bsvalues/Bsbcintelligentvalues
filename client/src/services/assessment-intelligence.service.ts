/**
 * Assessment Intelligence Service
 * 
 * This service provides advanced analysis capabilities for property assessments,
 * including outlier detection, market trend analysis, and appeal risk prediction.
 */

import { Property } from '../types/property';

// Types for assessment intelligence features

export interface PropertyOutlier {
  property: Property;
  score: number; // 0-100 outlier score (higher = more anomalous)
  type: 'overassessed' | 'underassessed' | 'other';
  reason: string;
  similarProperties: Property[];
  percentageDifference: number;
}

export interface MarketTrend {
  areaId: string;
  areaName: string;
  areaType: 'neighborhood' | 'zipCode' | 'city' | 'county';
  trend: number; // percentage change (positive or negative)
  period: 'month' | 'quarter' | 'year';
  isSignificant: boolean;
  confidence: number; // 0-1 confidence score
  properties: Property[];
}

export interface AppealRisk {
  property: Property;
  riskScore: number; // 0-100 risk score
  factors: {
    recentSale?: {
      exists: boolean;
      salePrice?: number;
      saleDate?: string;
      assessmentDifference?: number;
    };
    comparableAssessments?: {
      count: number;
      averageValue: number;
      difference: number;
    };
    priorAppeals?: {
      appealed: boolean;
      successful?: boolean;
      date?: string;
    };
    assessmentChange?: {
      amount: number;
      percentage: number;
      isSignificant: boolean;
    };
    ownerFactors?: {
      priorAppealsCount: number;
      successRate: number;
    }
  };
  recommendedAction: 'review' | 'adjust' | 'defend' | 'monitor';
}

export interface ComparableProperty {
  property: Property;
  similarityScore: number; // 0-100 similarity score
  adjustments: {
    factor: string;
    amount: number;
    reason: string;
  }[];
  adjustedValue: number;
}

export interface PropertyAssessmentInsights {
  property: Property;
  marketValueEstimate: {
    value: number;
    range: [number, number]; // min-max range
    confidence: number; // 0-1 confidence score
    approaches: {
      sales: {
        value: number;
        comparables: ComparableProperty[];
        weight: number;
      };
      cost: {
        value: number;
        replacementCost: number;
        depreciation: number;
        landValue: number;
        weight: number;
      };
      income: {
        value: number;
        netIncome: number;
        capRate: number;
        weight: number;
      };
    };
  };
  assessmentQuality: {
    uniformity: number; // 0-100 score
    fairness: number; // 0-100 score
    accuracy: number; // 0-100 score
    overall: number; // 0-100 score
  };
  outlierStatus: PropertyOutlier | null;
  appealRisk: AppealRisk | null;
  neighborhoodTrends: MarketTrend[];
}

export class AssessmentIntelligenceService {
  /**
   * Detect outliers in property assessments compared to similar properties
   */
  public detectOutliers(
    properties: Property[],
    options: {
      threshold?: number; // percentage threshold for determining outliers
      method?: 'statistical' | 'comparative' | 'hybrid';
      groupBy?: 'neighborhood' | 'propertyType' | 'both';
    } = {}
  ): PropertyOutlier[] {
    const { 
      threshold = 15, // default 15% difference
      method = 'hybrid',
      groupBy = 'both'
    } = options;
    
    const outliers: PropertyOutlier[] = [];
    
    // Group properties for comparison
    const groupedProperties: Record<string, Property[]> = {};
    
    properties.forEach(property => {
      let groupKey = '';
      
      if (groupBy === 'neighborhood' || groupBy === 'both') {
        groupKey += property.neighborhood || 'unknown';
      }
      
      if (groupBy === 'propertyType' || groupBy === 'both') {
        groupKey += '_' + (property.propertyType || 'unknown');
      }
      
      if (!groupedProperties[groupKey]) {
        groupedProperties[groupKey] = [];
      }
      
      groupedProperties[groupKey].push(property);
    });
    
    // Process each group to find outliers
    Object.values(groupedProperties).forEach(group => {
      if (group.length < 3) return; // Need at least 3 properties for comparison
      
      // Calculate values per square foot for better comparison
      const valuesPerSqFt = group
        .filter(p => p.price && p.squareFeet && p.squareFeet > 0)
        .map(p => ({
          property: p,
          valuePerSqFt: p.price! / p.squareFeet!
        }));
      
      if (valuesPerSqFt.length < 3) return;
      
      // Calculate median and standard deviation
      const values = valuesPerSqFt.map(v => v.valuePerSqFt).sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)];
      
      // Mean absolute deviation (more robust than standard deviation)
      const mad = values.reduce((sum, val) => sum + Math.abs(val - median), 0) / values.length;
      
      // Check each property for outlier status
      valuesPerSqFt.forEach(({ property, valuePerSqFt }) => {
        const percentDiff = ((valuePerSqFt - median) / median) * 100;
        const absDiff = Math.abs(percentDiff);
        
        // Statistical measure of how unusual this property is
        const zScore = mad > 0 ? Math.abs(valuePerSqFt - median) / mad : 0;
        
        // Determine if it's an outlier
        let isOutlier = false;
        
        if (method === 'statistical') {
          isOutlier = zScore > 2.5; // Statistical threshold
        } else if (method === 'comparative') {
          isOutlier = absDiff > threshold; // Simple percentage threshold
        } else { // hybrid
          isOutlier = (zScore > 1.5 && absDiff > threshold); // Both conditions
        }
        
        if (isOutlier) {
          // Find similar properties for comparison
          const similarProperties = group
            .filter(p => 
              p.id !== property.id && 
              p.squareFeet && 
              p.price &&
              p.squareFeet > 0 &&
              // Similar size (within 25%)
              p.squareFeet >= property.squareFeet! * 0.75 &&
              p.squareFeet <= property.squareFeet! * 1.25
            )
            .sort((a, b) => {
              // Sort by similarity in square footage
              const aDiff = Math.abs((a.squareFeet! - property.squareFeet!) / property.squareFeet!);
              const bDiff = Math.abs((b.squareFeet! - property.squareFeet!) / property.squareFeet!);
              return aDiff - bDiff;
            })
            .slice(0, 5); // Top 5 most similar
          
          outliers.push({
            property,
            score: Math.min(100, Math.round(zScore * 25)), // Convert to 0-100 scale
            type: percentDiff > 0 ? 'overassessed' : 'underassessed',
            reason: `Property value per sq ft ($${valuePerSqFt.toFixed(2)}) differs from median ($${median.toFixed(2)}) by ${Math.abs(percentDiff).toFixed(1)}%`,
            similarProperties,
            percentageDifference: percentDiff
          });
        }
      });
    });
    
    // Sort outliers by score (most extreme first)
    return outliers.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Analyze market trends by area
   */
  public analyzeMarketTrends(
    properties: Property[],
    options: {
      period?: 'month' | 'quarter' | 'year';
      areaType?: 'neighborhood' | 'zipCode' | 'city' | 'county';
      significanceThreshold?: number;
    } = {}
  ): MarketTrend[] {
    const {
      period = 'year',
      areaType = 'neighborhood',
      significanceThreshold = 5 // 5% change is significant
    } = options;
    
    const trends: MarketTrend[] = [];
    
    // Group properties by area
    const groupedProperties: Record<string, Property[]> = {};
    
    properties.forEach(property => {
      let areaId = '';
      let areaName = '';
      
      switch (areaType) {
        case 'neighborhood':
          areaId = property.neighborhood || 'unknown';
          areaName = property.neighborhood || 'Unknown Neighborhood';
          break;
        case 'zipCode':
          areaId = property.zipCode || 'unknown';
          areaName = property.zipCode || 'Unknown Zip Code';
          break;
        case 'city':
          areaId = property.city || 'unknown';
          areaName = property.city || 'Unknown City';
          break;
        case 'county':
          areaId = property.county || 'unknown';
          areaName = property.county || 'Unknown County';
          break;
      }
      
      if (!groupedProperties[areaId]) {
        groupedProperties[areaId] = [];
      }
      
      groupedProperties[areaId].push(property);
    });
    
    // Process each area to analyze trends
    Object.entries(groupedProperties).forEach(([areaId, areaProperties]) => {
      if (areaProperties.length < 5) return; // Need sufficient properties for analysis
      
      // For a real implementation, we would use historical data over time
      // For this demo, we'll simulate a market trend using random data
      // In production, this would be replaced with real time-series analysis
      
      // Simulate a trend value based on the area
      // Using deterministic approach based on area ID to ensure consistency
      const areaIdSum = areaId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const baseTrend = ((areaIdSum % 20) - 10) / 2; // Range from -5% to +5%
      
      // Add some consistency using the first digit of the majority of property values
      const valueTrend = areaProperties
        .filter(p => p.price)
        .map(p => Math.floor(Math.log10(p.price!)))
        .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
      
      // Combine for final trend
      const trendValue = baseTrend + (valueTrend % 5) - 2; // final range approximately -7% to +7%
      
      const isSignificant = Math.abs(trendValue) >= significanceThreshold;
      
      // Confidence based on sample size
      const confidence = Math.min(0.95, 0.5 + (areaProperties.length / 20));
      
      trends.push({
        areaId,
        areaName,
        areaType,
        trend: trendValue,
        period,
        isSignificant,
        confidence,
        properties: areaProperties
      });
    });
    
    // Sort by significance of trend (most significant first)
    return trends.sort((a, b) => 
      (Math.abs(b.trend) * b.confidence) - (Math.abs(a.trend) * a.confidence)
    );
  }
  
  /**
   * Predict appeal risk for a property or properties
   */
  public predictAppealRisk(
    properties: Property[], 
    assessmentHistory?: Record<string, any[]>
  ): AppealRisk[] {
    const risks: AppealRisk[] = [];
    
    properties.forEach(property => {
      // These are the factors that typically influence appeal risk
      // In a real implementation, these would be calculated from historical data
      
      // 1. Recent sale price vs assessment
      const hasRecentSale = property.lastSoldDate && property.lastSoldPrice;
      let saleDifference = 0;
      
      if (hasRecentSale && property.price && property.lastSoldPrice) {
        saleDifference = ((property.price - property.lastSoldPrice) / property.lastSoldPrice) * 100;
      }
      
      // 2. Assessment change amount
      // Simulate an assessment change (in production, use real historical data)
      const assessmentChangePct = property.id ? 
        (parseInt(property.id.slice(-2), 10) / 2) - 10 : 
        0; // -10% to +40%
      
      // 3. Simulate prior appeals existence based on property ID
      const hasPriorAppeals = property.id ? 
        parseInt(property.id.slice(-1), 10) > 7 : 
        false;
      
      // 4. Generate risk score based on these factors
      let riskScore = 0;
      
      // Higher assessment increases compared to market values create higher risk
      if (saleDifference > 10) {
        riskScore += Math.min(40, saleDifference); // Up to 40 points
      }
      
      // Large increases in assessment create higher appeal risk
      if (assessmentChangePct > 10) {
        riskScore += Math.min(30, assessmentChangePct); // Up to 30 points
      }
      
      // Prior appeals indicate higher risk
      if (hasPriorAppeals) {
        riskScore += 20;
      }
      
      // Cap at 100
      riskScore = Math.min(100, Math.max(0, riskScore));
      
      // Determine recommended action based on risk score
      let recommendedAction: 'review' | 'adjust' | 'defend' | 'monitor';
      
      if (riskScore >= 75) {
        recommendedAction = 'adjust';
      } else if (riskScore >= 50) {
        recommendedAction = 'review';
      } else if (riskScore >= 25) {
        recommendedAction = 'monitor';
      } else {
        recommendedAction = 'defend';
      }
      
      risks.push({
        property,
        riskScore,
        factors: {
          recentSale: {
            exists: hasRecentSale,
            salePrice: property.lastSoldPrice,
            saleDate: property.lastSoldDate,
            assessmentDifference: saleDifference
          },
          assessmentChange: {
            amount: property.price ? property.price * (assessmentChangePct / 100) : 0,
            percentage: assessmentChangePct,
            isSignificant: Math.abs(assessmentChangePct) > 10
          },
          priorAppeals: {
            appealed: hasPriorAppeals,
            successful: hasPriorAppeals ? Math.random() > 0.5 : undefined,
            date: hasPriorAppeals ? 
              new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
              undefined
          },
          ownerFactors: {
            priorAppealsCount: hasPriorAppeals ? Math.floor(Math.random() * 3) + 1 : 0,
            successRate: hasPriorAppeals ? Math.random() : 0
          }
        },
        recommendedAction
      });
    });
    
    // Sort by risk score (highest risk first)
    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }
  
  /**
   * Find comparable properties for assessment
   */
  public findComparableProperties(
    property: Property,
    candidateProperties: Property[],
    options: {
      count?: number;
      maxDistance?: number; // miles
      adjustForTime?: boolean;
      adjustForFeatures?: boolean;
    } = {}
  ): ComparableProperty[] {
    const {
      count = 5,
      maxDistance = 1, // mile
      adjustForTime = true,
      adjustForFeatures = true
    } = options;
    
    if (!property.latitude || !property.longitude) {
      // Cannot do geographic comparison without coordinates
      return [];
    }
    
    // Filter out the subject property itself
    const potentialComps = candidateProperties.filter(p => p.id !== property.id);
    
    // Score each potential comparable property
    const scoredComps = potentialComps
      .filter(p => p.latitude && p.longitude && p.price && p.squareFeet)
      .map(comp => {
        // Calculate distance (simplified for demo)
        const distance = this.calculateDistance(
          property.latitude!,
          property.longitude!,
          comp.latitude!,
          comp.longitude!
        );
        
        // Too far away
        if (distance > maxDistance) {
          return null;
        }
        
        // Calculate similarity score based on multiple factors
        let similarityScore = 100;
        const adjustments = [];
        
        // Distance factor (closer is better)
        const distanceFactor = Math.max(0, 100 - (distance * 100));
        similarityScore = (similarityScore * 0.7) + (distanceFactor * 0.3);
        
        // Size difference
        if (property.squareFeet && comp.squareFeet) {
          const sizeDiff = Math.abs(property.squareFeet - comp.squareFeet) / property.squareFeet;
          similarityScore -= sizeDiff * 50; // Penalize size difference
          
          // Apply size adjustment to value
          if (adjustForFeatures) {
            const pricePerSqFt = comp.price! / comp.squareFeet;
            const sizeDifference = property.squareFeet - comp.squareFeet;
            const sizeAdjustment = sizeDifference * pricePerSqFt;
            
            adjustments.push({
              factor: 'size',
              amount: sizeAdjustment,
              reason: `Subject property is ${Math.abs(sizeDifference)} sq ft ${sizeDifference > 0 ? 'larger' : 'smaller'}`
            });
          }
        }
        
        // Year built difference
        if (property.yearBuilt && comp.yearBuilt) {
          const ageDiff = Math.abs(property.yearBuilt - comp.yearBuilt);
          similarityScore -= Math.min(30, ageDiff * 2); // Penalize age difference
          
          // Apply age adjustment to value
          if (adjustForFeatures && comp.price) {
            const yearDifference = property.yearBuilt - comp.yearBuilt;
            // Approximately 0.5% value per year of age
            const ageAdjustment = (yearDifference / 100) * 0.5 * comp.price;
            
            if (Math.abs(ageAdjustment) > 1000) {
              adjustments.push({
                factor: 'age',
                amount: ageAdjustment,
                reason: `Subject property is ${Math.abs(yearDifference)} years ${yearDifference > 0 ? 'newer' : 'older'}`
              });
            }
          }
        }
        
        // Time adjustment for sale date
        if (adjustForTime && comp.lastSoldDate && comp.price) {
          const saleDate = new Date(comp.lastSoldDate);
          const now = new Date();
          const monthsDiff = (now.getFullYear() - saleDate.getFullYear()) * 12 + 
                            (now.getMonth() - saleDate.getMonth());
          
          if (monthsDiff > 0) {
            // Assume 0.5% appreciation per month (6% annually) - this would be market-specific in production
            const timeAdjustment = comp.price * (0.005 * monthsDiff);
            
            adjustments.push({
              factor: 'time',
              amount: timeAdjustment,
              reason: `Sale occurred ${monthsDiff} months ago`
            });
          }
        }
        
        // Additional feature adjustments (garages, pools, etc.)
        // In production, these would be more comprehensive
        if (adjustForFeatures && comp.price) {
          // Example: Garage adjustment
          if ('garage' in property && 'garage' in comp) {
            const garageDiff = (property as any).garage - (comp as any).garage;
            if (garageDiff !== 0) {
              // Assume $10,000 per garage space
              const garageAdjustment = garageDiff * 10000;
              
              adjustments.push({
                factor: 'garage',
                amount: garageAdjustment,
                reason: `Subject property has ${garageDiff > 0 ? 'more' : 'fewer'} garage spaces`
              });
            }
          }
          
          // Example: Pool adjustment
          if ('pool' in property && 'pool' in comp) {
            const hasPool = (property as any).pool;
            const compHasPool = (comp as any).pool;
            
            if (hasPool && !compHasPool) {
              // Assume $25,000 for a pool
              adjustments.push({
                factor: 'pool',
                amount: 25000,
                reason: 'Subject property has a pool, comparable does not'
              });
            } else if (!hasPool && compHasPool) {
              adjustments.push({
                factor: 'pool',
                amount: -25000,
                reason: 'Comparable has a pool, subject property does not'
              });
            }
          }
        }
        
        // Calculate adjusted value
        const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.amount, 0);
        const adjustedValue = comp.price! + totalAdjustment;
        
        // Cap similarity score to reasonable range
        similarityScore = Math.max(0, Math.min(100, similarityScore));
        
        return {
          property: comp,
          similarityScore,
          adjustments,
          adjustedValue
        };
      })
      .filter((comp): comp is ComparableProperty => comp !== null)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, count);
    
    return scoredComps;
  }
  
  /**
   * Get comprehensive assessment insights for a property
   */
  public getPropertyAssessmentInsights(
    property: Property,
    allProperties: Property[]
  ): PropertyAssessmentInsights {
    // Find comparables
    const comparables = this.findComparableProperties(property, allProperties);
    
    // Detect if property is an outlier
    const outliers = this.detectOutliers([property, ...comparables.map(c => c.property)]);
    const outlier = outliers.find(o => o.property.id === property.id) || null;
    
    // Predict appeal risk
    const appealRisks = this.predictAppealRisk([property]);
    const appealRisk = appealRisks.length > 0 ? appealRisks[0] : null;
    
    // Analyze market trends for the property's area
    const trends = this.analyzeMarketTrends(allProperties);
    const propertyAreaTrends = trends.filter(trend => {
      if (trend.areaType === 'neighborhood' && property.neighborhood) {
        return trend.areaId === property.neighborhood;
      } else if (trend.areaType === 'zipCode' && property.zipCode) {
        return trend.areaId === property.zipCode;
      }
      return false;
    });
    
    // Calculate market value estimate
    const salesComparison = {
      value: comparables.length > 0 
        ? comparables.reduce((sum, comp) => sum + comp.adjustedValue, 0) / comparables.length
        : (property.price || 0),
      comparables,
      weight: 0.7 // 70% weight for sales comparison approach
    };
    
    // Simplified cost approach (in production this would be more sophisticated)
    const costApproach = {
      value: property.price ? property.price * 1.05 : 0, // Simple example
      replacementCost: property.squareFeet ? property.squareFeet * 150 : 0, // $150 per sq ft
      depreciation: property.yearBuilt 
        ? (new Date().getFullYear() - property.yearBuilt) * 0.5 / 100 // 0.5% per year
        : 0.2, // 20% default
      landValue: property.price ? property.price * 0.3 : 0, // 30% land value
      weight: 0.2 // 20% weight for cost approach
    };
    
    // Simplified income approach (in production this would use actual rental data)
    const incomeApproach = {
      value: property.price ? property.price * 0.95 : 0, // Simple example
      netIncome: property.price ? property.price * 0.06 : 0, // 6% cap rate
      capRate: 0.06,
      weight: 0.1 // 10% weight for income approach
    };
    
    // Weighted average value
    const weightedValue = (
      salesComparison.value * salesComparison.weight +
      costApproach.value * costApproach.weight +
      incomeApproach.value * incomeApproach.weight
    );
    
    // Value range (±10%)
    const valueRange: [number, number] = [
      weightedValue * 0.9,
      weightedValue * 1.1
    ];
    
    // Confidence based on number of comparables
    const confidence = Math.min(0.95, 0.5 + (comparables.length * 0.1));
    
    // Assessment quality metrics
    const variationFromEstimate = property.price 
      ? Math.abs((property.price - weightedValue) / weightedValue)
      : 0;
    
    const assessmentQuality = {
      uniformity: 100 - (outlier ? outlier.score : 0),
      fairness: 100 - (appealRisk ? appealRisk.riskScore : 0),
      accuracy: 100 - (variationFromEstimate * 100),
      overall: 0 // Will calculate
    };
    
    // Overall quality score
    assessmentQuality.overall = Math.round(
      (assessmentQuality.uniformity + assessmentQuality.fairness + assessmentQuality.accuracy) / 3
    );
    
    return {
      property,
      marketValueEstimate: {
        value: weightedValue,
        range: valueRange,
        confidence,
        approaches: {
          sales: salesComparison,
          cost: costApproach,
          income: incomeApproach
        }
      },
      assessmentQuality,
      outlierStatus: outlier,
      appealRisk,
      neighborhoodTrends: propertyAreaTrends
    };
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in miles
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3958.8; // Earth radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const assessmentIntelligence = new AssessmentIntelligenceService();