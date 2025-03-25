/**
 * Valuation Agent Routes
 * 
 * These routes provide access to the valuation agent API.
 */

import { Router } from 'express';
import { 
  getValuationAgent,
  requestComprehensiveValuation,
  requestMethodologyRecommendation,
  requestValuationExplanation,
  requestValueReconciliation,
  askValuationQuestion,
  initializeValuationAgent
} from '../controllers/valuation-agent.controller';

/**
 * Register valuation agent routes
 */
export function registerValuationAgentRoutes(app: Router): void {
  console.log('[ValuationAgentRoutes] Registering valuation agent routes');
  
  // Initialize valuation agent on startup
  initializeValuationAgent().catch(error => {
    console.error('Error initializing valuation agent:', error);
  });
  
  // Create router
  const router = Router();
  
  // Agent information
  router.get('/', getValuationAgent);
  
  // Test routes that skip AI processing
  router.get('/skip-ai', (req, res) => {
    res.status(200).json({
      success: true,
      message: "This is a test route that bypasses AI processing",
      timestamp: new Date().toISOString()
    });
  });
  
  // POST version for testing with request body
  router.post('/skip-ai', (req, res) => {
    const requestData = req.body;
    res.status(200).json({
      success: true,
      message: "This is a test route that bypasses AI processing",
      received: requestData,
      timestamp: new Date().toISOString()
    });
  });
  
  // Test route for methodology recommendation without AI processing
  router.post('/test-methodology', (req, res) => {
    const requestData = req.body;
    res.status(200).json({
      taskId: "test-task-" + Date.now(),
      status: "completed",
      result: {
        recommendedMethodologies: [
          {
            name: "Income Approach",
            confidence: 0.95,
            reasoning: "Multi-family properties in Grandview, WA are primarily valued based on their income potential, especially for investment analysis."
          },
          {
            name: "Sales Comparison Approach",
            confidence: 0.75,
            reasoning: "Used as a secondary approach to validate the income approach results."
          },
          {
            name: "Cost Approach",
            confidence: 0.45,
            reasoning: "Less relevant for investment analysis of existing multi-family properties."
          }
        ],
        marketInsights: "Grandview, WA has shown steady rental demand for multi-family properties, with cap rates averaging 6-7%.",
        dataRequirements: [
          "Rent rolls for the past 12-24 months",
          "Operating expenses breakdown",
          "Recent comparable sales in the area",
          "Current vacancy rates for similar properties"
        ],
        analysisType: "investment",
        test: true
      },
      processingTime: 127,
      test: true
    });
  });
  
  // Test route for valuation question without AI processing
  router.post('/test-question', (req, res) => {
    const requestData = req.body;
    
    // Get the question from request data
    const question = requestData.question || "What factors affect cap rates in multi-family properties?";
    
    res.status(200).json({
      taskId: "test-task-" + Date.now(),
      status: "completed",
      result: {
        answer: `For your question: "${question}", here is a test response without AI processing:\n\nCap rates for multi-family properties in Grandview, WA are influenced by several factors including local rental demand, property condition, location quality, interest rates, expected rent growth, and overall market conditions. Currently, well-maintained multi-family properties in good neighborhoods are seeing cap rates between 5.5-7%, which is competitive for this market.`,
        relevantFactors: [
          "Local rental market strength",
          "Property condition and age",
          "Location and neighborhood quality",
          "Current interest rate environment",
          "Economic outlook for the region"
        ],
        dataReferences: [
          "Yakima County Market Report Q1 2025",
          "Grandview Rental Market Analysis"
        ],
        confidenceLevel: "high",
        test: true
      },
      processingTime: 89,
      test: true
    });
  });
  
  // Test route for comprehensive valuation without AI processing
  router.post('/test-comprehensive', (req, res) => {
    const requestData = req.body;
    
    // Get the address from request data
    const address = requestData.address || "2204 Hill Dr, Grandview, WA 98930";
    
    res.status(200).json({
      taskId: "test-task-" + Date.now(),
      status: "completed",
      result: {
        property: {
          address: address,
          propertyType: requestData.propertyType || "multi-family",
          yearBuilt: 1997,
          bedrooms: 12,
          bathrooms: 8,
          squareFeet: 5400,
          lotSize: 0.42,
          zoning: "R-3"
        },
        valuationApproaches: [
          {
            approach: "Sales Comparison",
            estimatedValue: 875000,
            confidence: 0.85,
            comparables: [
              {
                address: "1845 Jefferson St, Grandview, WA",
                salePrice: 850000,
                salesDate: "2024-12-15",
                adjustments: {
                  location: 15000,
                  condition: 5000,
                  size: -10000,
                  amenities: 0,
                  total: 10000
                },
                adjustedPrice: 860000
              },
              {
                address: "2310 Roosevelt Ave, Grandview, WA",
                salePrice: 910000,
                salesDate: "2024-11-05",
                adjustments: {
                  location: -20000,
                  condition: 10000,
                  size: 0,
                  amenities: -5000,
                  total: -15000
                },
                adjustedPrice: 895000
              }
            ],
            notes: "Limited recent sales of similar multi-family properties required adjustments for differences in property size and condition."
          },
          {
            approach: "Income",
            estimatedValue: 906000,
            confidence: 0.92,
            details: {
              grossScheduledIncome: 108000,
              vacancyRate: 0.05,
              operatingExpenses: 38880,
              netOperatingIncome: 63720,
              capRate: 0.07
            },
            notes: "Strong rental market in Grandview supports the income approach as primary valuation method for this property type."
          },
          {
            approach: "Cost",
            estimatedValue: 850000,
            confidence: 0.75,
            details: {
              replacementCost: 891000,
              depreciation: 178200,
              landValue: 137200
            },
            notes: "Cost approach considered less reliable due to difficulty estimating depreciation accurately."
          }
        ],
        finalValue: {
          reconciled: 895000,
          range: [870000, 915000],
          reliability: "high",
          weightings: {
            salesComparison: 0.35,
            income: 0.55,
            cost: 0.10
          }
        },
        marketConditions: "Stable multi-family market with moderate appreciation expected over the next 12-24 months.",
        test: true
      },
      processingTime: 312,
      test: true
    });
  });
  
  // Test route for valuation methodology explanation without AI processing
  router.post('/test-explanation', (req, res) => {
    const requestData = req.body;
    
    // Get the methodology from request data
    const methodology = requestData.methodology || "Income Approach";
    const audienceLevel = requestData.audienceLevel || "intermediate";
    
    res.status(200).json({
      taskId: "test-task-" + Date.now(),
      status: "completed",
      result: {
        methodology: methodology,
        explanation: `The ${methodology} to real estate valuation is ${methodology === "Income Approach" ? 
          "based on the property's ability to generate income and is particularly relevant for investment properties. It calculates value by capitalizing the property's net operating income (NOI) using an appropriate capitalization rate derived from market analysis." : 
          methodology === "Sales Comparison Approach" ? 
          "based on comparing the subject property to similar properties that have recently sold in the same market area. Adjustments are made for differences between the subject and comparable properties to arrive at an indicated value." :
          methodology === "Cost Approach" ? 
          "based on the principle that a buyer will pay no more for a property than it would cost to build an equivalent one. It calculates value by estimating the cost to construct the improvements, less depreciation, plus the value of the land." :
          "a standard valuation methodology used in real estate appraisal that considers multiple factors specific to this approach."
        }`,
        keyComponents: methodology === "Income Approach" ? [
          "Net Operating Income (NOI): Gross potential income minus vacancy and operating expenses",
          "Capitalization Rate: The expected rate of return on a real estate investment property",
          "Direct Capitalization: Value = NOI ÷ Cap Rate",
          "Discounted Cash Flow Analysis: For properties with varying income streams over time"
        ] : methodology === "Sales Comparison Approach" ? [
          "Comparable Selection: Finding recently sold properties similar to subject property",
          "Adjustment Process: Making dollar or percentage adjustments for differences",
          "Market Extraction: Deriving adjustment factors from paired sales analysis",
          "Reconciliation: Weighing the adjusted values to determine final value indication"
        ] : methodology === "Cost Approach" ? [
          "Reproduction or Replacement Cost: Estimating cost to build a replica or equivalent",
          "Depreciation: Physical deterioration, functional obsolescence, external obsolescence",
          "Land Value: Estimated separately using sales comparison or other methods",
          "Value = Cost New - Depreciation + Land Value"
        ] : [
          "Market Analysis: Understanding local market conditions",
          "Data Collection: Gathering relevant property data",
          "Analytical Techniques: Applying appropriate valuation methods",
          "Value Reconciliation: Determining final opinion of value"
        ],
        bestUseCase: methodology === "Income Approach" ? 
          "Most appropriate for income-producing properties such as apartment buildings, office buildings, shopping centers, and other commercial properties." : 
          methodology === "Sales Comparison Approach" ? 
          "Most appropriate for residential properties and properties in active markets with sufficient comparable sales data." :
          methodology === "Cost Approach" ? 
          "Most appropriate for new construction, special purpose properties, or when there is limited market data available." :
          "Depends on property type, market conditions, and available data.",
        limitations: methodology === "Income Approach" ? [
          "Requires accurate income and expense data",
          "Sensitive to cap rate selection",
          "May not account for property-specific issues",
          "Less reliable in volatile markets"
        ] : methodology === "Sales Comparison Approach" ? [
          "Requires sufficient comparable sales data",
          "Subjective adjustment process",
          "Difficult for unique properties",
          "Historical data may not reflect future market conditions"
        ] : methodology === "Cost Approach" ? [
          "Difficulty accurately estimating depreciation",
          "May not reflect market dynamics",
          "Building cost data may be outdated",
          "Less reliable for older properties"
        ] : [
          "Requires significant data collection",
          "May involve subjective judgments",
          "Accuracy depends on analyst experience",
          "Market conditions affect reliability"
        ],
        audienceLevel: audienceLevel,
        test: true
      },
      processingTime: 176,
      test: true
    });
  });
  
  // Valuation API endpoints
  router.post('/comprehensive', requestComprehensiveValuation);
  router.post('/methodology', requestMethodologyRecommendation);
  router.post('/explanation', requestValuationExplanation);
  router.post('/reconciliation', requestValueReconciliation);
  router.post('/question', askValuationQuestion);
  
  // Register routes
  app.use('/api/agents/valuation', router);
  
  console.log('[ValuationAgentRoutes] Valuation agent routes registered');
}