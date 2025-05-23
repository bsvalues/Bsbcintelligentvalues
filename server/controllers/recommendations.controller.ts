/**
 * Property Recommendations Controller
 * 
 * This controller provides endpoints for personalized property recommendations.
 */

import { Request, Response } from 'express';
import { IStorage } from '../storage';

/**
 * Get personalized property recommendations for a user
 * 
 * @param req The request object
 * @param res The response object
 */
export async function getPropertyRecommendations(req: Request, res: Response, storage: IStorage) {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const filterByTags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    
    // For now, we're using mock data for the property recommendations
    // In a production app, this would come from a recommendation engine
    // that analyzes user behavior and preferences
    const recommendations = [
      {
        id: "prop-1",
        address: "123 Main St, Grandview, WA 98930",
        price: 450000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1800,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=500&auto=format&fit=crop",
        insights: [
          {
            type: "valuation",
            title: "Cost Approach Analysis",
            description: "RCN of $175/sqft with 15% depreciation (age-life method), plus land value of $85,000 yields a total value of $400,000. Marshall & Swift cost manual index: 1.06.",
            score: 82
          },
          {
            type: "comparable",
            title: "Comparable Sales Method",
            description: "5 similar properties (adjusted for GLA, quality, condition) with time adjustment of +0.5%/month yield $445,000 reconciled value. COV: 0.05.",
            score: 95
          },
          {
            type: "assessment",
            title: "Assessment Ratio Study",
            description: "Current assessment ratio: 0.92, PRD: 1.03, COD: 12.4, within IAAO standards (0.90-1.10, <1.10, <15.0). Vertical equity regression p-value: 0.58.",
            score: 88
          }
        ],
        matchScore: 92,
        tags: ["Equitably Assessed", "Single Family Residential", "Construction Quality: Average", "Horizontal Equity Compliant", "Sales Comparison Primary", "Economic Life Remaining: 50-75%"],
        latitude: 46.2529,
        longitude: -119.9021
      },
      {
        id: "prop-2",
        address: "456 Oak Ave, Grandview, WA 98930",
        price: 385000,
        bedrooms: 4,
        bathrooms: 2.5,
        squareFeet: 2200,
        imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=500&auto=format&fit=crop",
        insights: [
          {
            type: "mass-appraisal",
            title: "Multiple Regression Analysis",
            description: "MRA model (adj-R²: 0.87, p-value: <0.001) with 72 market sales predicts $388,400 value. Confidence interval: $375,000-$395,000.",
            score: 91
          },
          {
            type: "market",
            title: "Market Approach Analysis",
            description: "Time-adjusted market approach with 6 comps (time adj: +0.4%/month) yields $382,000. Comp grid variance: 5.2%. Reconciled value: $385,000.",
            score: 94
          },
          {
            type: "assessment",
            title: "Price-Related Statistics",
            description: "PRD: 1.03, PRB: -0.021, COD: 9.8. Statistical analysis indicates slight vertical regressivity in neighborhood assessments.",
            score: 85
          }
        ],
        matchScore: 88,
        tags: ["Market Value Aligned", "Single Family Residential", "Construction Quality: Good", "Vertical Equity Compliant", "Sales Comparison Primary", "Economic Life Remaining: >75%"],
        latitude: 46.2550,
        longitude: -119.9100
      },
      {
        id: "prop-3",
        address: "789 Pine Ln, Grandview, WA 98930",
        price: 325000,
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1500,
        imageUrl: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?q=80&w=500&auto=format&fit=crop",
        insights: [
          {
            type: "appraisal",
            title: "Income Capitalization Approach",
            description: "Direct capitalization method employed. Market rent survey from 8 comparables indicates $2,650/mo PGI. Vacancy & collection loss: 5%. EGI: $30,210. Operating expenses ratio: 38% of EGI. NOI: $18,730. Market-derived cap rate: 6.2% (band of investment method). Value indication via direct capitalization: $302,097. Value via GRM method (derived GRM: 128): $339,200. Reconciled income approach value estimate: $335,000.",
            score: 87
          },
          {
            type: "mass-appraisal",
            title: "CAMA Model Specification",
            description: "Hybrid model with log-transformation on dependent variable, 23 location variables, and response surface modeling. Model fit metrics: R²: 0.83, Adj-R²: 0.81, RMSE: 5.4%, AIC: 892, BIC: 923. Model validated with holdout sample method. Value prediction: $332,500.",
            score: 90
          },
          {
            type: "comparable",
            title: "Sales Comparison Grid Analysis",
            description: "Paired sales analysis with 4 comparables. Adjustments: GLA (+$60/sf), condition (-5%), bath count (+$8,000 per full). Adjusted value: $328,000.",
            score: 95
          }
        ],
        matchScore: 85,
        tags: ["Income Approach Candidate", "Market Value Aligned", "Construction Quality: Average", "Direct Capitalization Applicable", "Gross Rent Multiplier Applicable", "Economic Life Remaining: 50-75%"],
        latitude: 46.2510,
        longitude: -119.9050
      },
      {
        id: "prop-4",
        address: "101 Cedar Ct, Grandview, WA 98930",
        price: 510000,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2800,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=500&auto=format&fit=crop",
        insights: [
          {
            type: "valuation",
            title: "Cost Approach Valuation",
            description: "Class 3 construction quality using Marshall & Swift with 8% entrepreneurial profit. RCN: $215/sqft × 2,800 sqft = $602,000 + land $120,000 = $722,000.",
            score: 94
          },
          {
            type: "assessment",
            title: "Assessment Equity Analysis",
            description: "Current assessed value ($420,000) is 18% below market evidence ($510,000). Assessment-to-sales ratio (0.82) outside IAAO standard range (0.90-1.10).",
            score: 65
          },
          {
            type: "mass-appraisal",
            title: "Ratio Study Statistics",
            description: "Neighborhood ratio statistics: Median ratio: 0.95, COD: 12.8, PRD: 1.02, COV: 14.3%. Meets IAAO residential standard thresholds (<15.0, 0.98-1.03, <20%).",
            score: 85
          }
        ],
        matchScore: 80,
        tags: ["Under-assessed", "Construction Quality: Excellent", "Minimal Depreciation", "Assessment Appeal Candidate", "Cost Approach Primary", "Land-to-Building Ratio: Low"],
        latitude: 46.2600,
        longitude: -119.9000
      },
      {
        id: "prop-5",
        address: "202 Maple Dr, Grandview, WA 98930",
        price: 295000,
        bedrooms: 3,
        bathrooms: 1.5,
        squareFeet: 1600,
        imageUrl: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?q=80&w=500&auto=format&fit=crop",
        insights: [
          {
            type: "comparable",
            title: "Sales Comparison Grid Analysis",
            description: "Qualitative and quantitative paired sales analysis. Key adjustments: condition (-15% = -$45,000), lot size (+5% = +$14,750), bathrooms (-$12,000). Reconciled value: $275,000.",
            score: 88
          },
          {
            type: "appraisal",
            title: "Accrued Depreciation Analysis",
            description: "Physical deterioration (curable: 4%, incurable: 6%) + functional obsolescence (8%, non-conforming layout) + external obsolescence (3%, proximity to commercial). Total: 21%.",
            score: 72
          },
          {
            type: "assessment",
            title: "Mass Appraisal Cyclical Review",
            description: "Property in assessment cycle year 3 of 3-year rotation. Assessed value: $310,000. Current coefficient of price-related bias (PRB): -0.032 suggests vertical inequity.",
            score: 82
          }
        ],
        matchScore: 78,
        tags: ["Needs Reassessment", "Functional Obsolescence", "Substantial Depreciation", "Construction Quality: Fair", "Physical Deterioration: Incurable", "Economic Life Remaining: 25-50%"],
        latitude: 46.2520,
        longitude: -119.9120
      }
    ];
    
    // Filter by tags if provided
    let filteredRecommendations = recommendations;
    if (filterByTags && filterByTags.length > 0) {
      filteredRecommendations = recommendations.filter(property => 
        property.tags.some(tag => filterByTags.includes(tag))
      );
    }
    
    // Apply limit
    const limitedRecommendations = filteredRecommendations.slice(0, limit);
    
    return res.status(200).json(limitedRecommendations);
  } catch (error) {
    console.error('Error getting property recommendations:', error);
    return res.status(500).json({ error: 'Failed to get property recommendations' });
  }
}

/**
 * Get popular property tags for filtering
 * 
 * @param req The request object
 * @param res The response object
 */
export async function getPropertyTags(req: Request, res: Response) {
  try {
    // In a real app, this would come from analyzing property data
    const tags = [
      // Assessment-related tags
      "Equitably Assessed",
      "Market Value Aligned",
      "Under-assessed",
      "Needs Reassessment",
      "Within Statutory Level Tolerance",
      "Vertical Equity Compliant",
      "Horizontal Equity Compliant",
      "Assessment Appeal Candidate",
      
      // Property type and quality tags
      "Single Family Residential",
      "Single Family Resort/Recreational",
      "Multi-Family Residential",
      "Construction Quality: Excellent",
      "Construction Quality: Good",
      "Construction Quality: Average",
      "Construction Quality: Fair",
      "Construction Quality: Low",
      
      // Depreciation and obsolescence
      "Minimal Depreciation",
      "Substantial Depreciation",
      "Physical Deterioration: Curable",
      "Physical Deterioration: Incurable",
      "Functional Obsolescence",
      "External Obsolescence",
      "Economic Life Remaining: >75%",
      "Economic Life Remaining: 50-75%",
      "Economic Life Remaining: 25-50%",
      "Economic Life Remaining: <25%",
      
      // Valuation approach indicators
      "Income Approach Candidate",
      "Direct Capitalization Applicable",
      "Gross Rent Multiplier Applicable", 
      "Cost Approach Primary",
      "Sales Comparison Primary",
      
      // Use and zoning
      "Highest & Best Use Conforming",
      "Non-Conforming Use",
      "Legal Non-Conforming Use",
      "Transitional Use",
      "Land-to-Building Ratio: High",
      "Land-to-Building Ratio: Low"
    ];
    
    return res.status(200).json(tags);
  } catch (error) {
    console.error('Error getting property tags:', error);
    return res.status(500).json({ error: 'Failed to get property tags' });
  }
}

/**
 * Save a property as favorite for a user
 * 
 * @param req The request object
 * @param res The response object
 */
export async function savePropertyFavorite(req: Request, res: Response) {
  try {
    const { userId, propertyId } = req.body;
    
    if (!userId || !propertyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a real app, this would save the favorite in the database
    
    return res.status(200).json({ success: true, message: 'Property saved as favorite' });
  } catch (error) {
    console.error('Error saving property favorite:', error);
    return res.status(500).json({ error: 'Failed to save property as favorite' });
  }
}

/**
 * Remove a property from favorites for a user
 * 
 * @param req The request object
 * @param res The response object
 */
export async function removePropertyFavorite(req: Request, res: Response) {
  try {
    const { userId, propertyId } = req.body;
    
    if (!userId || !propertyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a real app, this would remove the favorite from the database
    
    return res.status(200).json({ success: true, message: 'Property removed from favorites' });
  } catch (error) {
    console.error('Error removing property favorite:', error);
    return res.status(500).json({ error: 'Failed to remove property from favorites' });
  }
}

/**
 * Get personalized insights for a property
 * 
 * @param req The request object
 * @param res The response object
 */
export async function getPropertyInsights(req: Request, res: Response) {
  try {
    const propertyId = req.params.propertyId;
    
    if (!propertyId) {
      return res.status(400).json({ error: 'Missing property ID' });
    }
    
    // In a real app, this would fetch insights from an AI-powered analysis engine
    const insights = [
      {
        type: "valuation",
        title: "Cost Approach Valuation",
        description: "Marshall & Swift cost manual Section 1301: Class D, Good quality residence. RCN: $180/sqft × 1,800 sqft = $324,000. Accrued depreciation analysis: Physical 14.5% (age-life method, effective age 10 years, economic life 69 years), Functional 0% (modern floor plan), External 0% (stable neighborhood). Land value from allocation method: $95,000 (23% of total property value). Contributory site improvements: $11,000. Total cost approach value indication after entrepreneurial profit (10%): $430,000.",
        score: 91
      },
      {
        type: "comparable",
        title: "Sales Comparison Grid Analysis",
        description: "5 comparable sales (bracketing subject) analyzed with quantitative adjustments: market conditions (+0.5%/month), location (±5-10%), GLA ($55/sf), quality (±5-10%), condition (±5-15%), and site improvements. Qualitative adjustments for view and functional utility. Matched pairs analysis for bedroom and bathroom contribution. Net adjustments range: 2.5%-12.4% (compliant with FNMA guidelines). Unadjusted price range: $425,000-$460,000. Adjusted price range: $432,000-$458,000. Reconciled point value estimate: $442,500.",
        score: 94
      },
      {
        type: "mass-appraisal",
        title: "CAMA System Value Estimate",
        description: "Multiplicative model with location factor (1.12), time adjustment (1.085), physical index (1.03), and economic index (0.97). Model diagnostics: R²: 0.86, COV: 7.2%, COD: 8.5%. IAAO Standard on Mass Appraisal (2017) compliant. Model calibration follows IAAO Standard on Ratio Studies (2013). Quality rating: Good. Indicated value: $438,000.",
        score: 92
      },
      {
        type: "appraisal",
        title: "Reconciliation & Final Value Opinion",
        description: "Correlation and weighted reconciliation of approaches: Sales comparison (reliability: high, weight: 60%, $442,500), Cost approach (reliability: moderate, weight: 25%, $430,000), Income approach (reliability: moderate-low, weight: 15%, $435,000). Final market value opinion as of March 15, 2025: $440,000. Exposure time: 30-45 days. Marketing time: 30-60 days. USPAP Standards Rule 1-6 compliant. Extraordinary assumptions: None. Hypothetical conditions: None.",
        score: 95
      },
      {
        type: "assessment",
        title: "Assessment Ratio Study",
        description: "Current assessment: $415,000. Assessment ratio: 0.94 (within IAAO Standard on Ratio Studies target: 0.90-1.10). Horizontal equity measures: COD: 10.2 (IAAO standard for improved residential: <15.0), COV: 11.8% (standard: <20%). Vertical equity measures: PRD: 1.01 (IAAO standard: 0.98-1.03), PRB: -0.012 (IAAO standard: -0.05 to 0.05). Subject property falls within statistically supportable range per IAAO Standards.",
        score: 90
      }
    ];
    
    return res.status(200).json(insights);
  } catch (error) {
    console.error('Error getting property insights:', error);
    return res.status(500).json({ error: 'Failed to get property insights' });
  }
}