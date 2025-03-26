import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Eye, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Home, 
  Map, 
  Building, 
  Calendar, 
  DollarSign, 
  Percent,
  AlertCircle,
  Scale,
  Gavel
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Property } from '../../types/property';
import { 
  assessmentIntelligence, 
  PropertyAssessmentInsights, 
  PropertyOutlier, 
  MarketTrend, 
  AppealRisk, 
  ComparableProperty 
} from '../../services/assessment-intelligence.service';

export interface AssessmentIntelligenceDashboardProps {
  property: Property;
  comparableProperties: Property[];
}

export const AssessmentIntelligenceDashboard: React.FC<AssessmentIntelligenceDashboardProps> = ({
  property,
  comparableProperties
}) => {
  const [insights, setInsights] = useState<PropertyAssessmentInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('valuation');
  
  useEffect(() => {
    // Generate insights when property changes
    if (property && comparableProperties.length > 0) {
      setLoading(true);
      
      // Analysis takes time, so we'll simulate a delay
      const timer = setTimeout(() => {
        const generatedInsights = assessmentIntelligence.getPropertyAssessmentInsights(
          property, 
          [property, ...comparableProperties]
        );
        
        setInsights(generatedInsights);
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [property, comparableProperties]);
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Assessment Intelligence</CardTitle>
          <CardDescription>
            Analyzing property data and generating insights...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="space-y-4 text-center">
            <BarChart3 className="h-16 w-16 animate-pulse text-primary mx-auto" />
            <Progress value={65} className="w-64" />
            <p className="text-sm text-muted-foreground">
              Calculating market trends and assessment quality...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!insights) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Assessment Intelligence</CardTitle>
          <CardDescription>
            Unable to generate insights for this property
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p>
              Insufficient data available to analyze this property.
              Please ensure the property has complete information.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };
  
  // Render outlier alert if property is an outlier
  const renderOutlierAlert = () => {
    if (!insights.outlierStatus) return null;
    
    const outlier = insights.outlierStatus;
    const type = outlier.type === 'overassessed' ? 'Over-assessed' : 'Under-assessed';
    const severityClass = outlier.score > 70 
      ? 'bg-red-100 text-red-800 border-red-300' 
      : 'bg-amber-100 text-amber-800 border-amber-300';
    
    return (
      <div className={`rounded-md border p-4 mb-6 ${severityClass}`}>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">
              {type} Property Detected ({Math.abs(outlier.percentageDifference).toFixed(1)}% {outlier.percentageDifference > 0 ? 'Above' : 'Below'} Market)
            </h4>
            <p className="text-sm mt-1">{outlier.reason}</p>
            <div className="mt-3">
              <Button size="sm" variant="outline" className="mr-2">
                Review Assessment
              </Button>
              <Button size="sm" variant="outline">
                View Comparables
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render appeal risk alert
  const renderAppealRiskAlert = () => {
    if (!insights.appealRisk || insights.appealRisk.riskScore < 30) return null;
    
    const risk = insights.appealRisk;
    const severityClass = risk.riskScore > 70 
      ? 'bg-red-100 text-red-800 border-red-300' 
      : 'bg-amber-100 text-amber-800 border-amber-300';
    
    return (
      <div className={`rounded-md border p-4 mb-6 ${severityClass}`}>
        <div className="flex items-start">
          <Gavel className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">
              High Appeal Risk Detected ({risk.riskScore}% Risk Score)
            </h4>
            <p className="text-sm mt-1">
              {risk.factors.recentSale?.exists && risk.factors.recentSale.assessmentDifference && risk.factors.recentSale.assessmentDifference > 10 && 
                `Assessment ${Math.abs(risk.factors.recentSale.assessmentDifference).toFixed(1)}% higher than recent sale price. `
              }
              {risk.factors.assessmentChange?.isSignificant && 
                `Assessment increased by ${risk.factors.assessmentChange.percentage.toFixed(1)}%. `
              }
              {risk.factors.priorAppeals?.appealed && 
                `Owner has previously appealed assessments. `
              }
              Recommended action: <strong>{risk.recommendedAction.toUpperCase()}</strong>
            </p>
            <div className="mt-3">
              <Button size="sm" variant="outline" className="mr-2">
                {risk.recommendedAction === 'adjust' ? 'Adjust Value' : 
                  risk.recommendedAction === 'review' ? 'Review Property' : 
                  risk.recommendedAction === 'defend' ? 'Prepare Defense' : 'Set Reminder'}
              </Button>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render market trends
  const renderMarketTrends = () => {
    if (insights.neighborhoodTrends.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No significant market trends detected for this area</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {insights.neighborhoodTrends.map((trend, index) => {
          const isPositive = trend.trend > 0;
          
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{trend.areaName}</CardTitle>
                  <Badge variant={isPositive ? "default" : "destructive"} className="font-normal">
                    {isPositive ? '+' : ''}{trend.trend.toFixed(1)}%
                  </Badge>
                </div>
                <CardDescription>
                  {trend.areaType === 'neighborhood' ? 'Neighborhood' : 
                   trend.areaType === 'zipCode' ? 'ZIP Code' : 
                   trend.areaType === 'city' ? 'City' : 'County'} Trend 
                   ({trend.period === 'month' ? 'Monthly' : 
                     trend.period === 'quarter' ? 'Quarterly' : 'Annual'})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {isPositive ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Trend Confidence</span>
                      <span className="text-sm">{(trend.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={trend.confidence * 100} className="h-2" />
                  </div>
                </div>
                <p className="mt-4 text-sm">
                  {isPositive 
                    ? `Market values in this ${trend.areaType} are increasing.` 
                    : `Market values in this ${trend.areaType} are decreasing.`
                  }
                  {trend.isSignificant 
                    ? ' This trend is significant and should be considered in assessments.' 
                    : ' This trend is minor but worth monitoring.'
                  }
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  View All Properties in {trend.areaName}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Render comparable properties table
  const renderComparables = () => {
    const comps = insights.marketValueEstimate.approaches.sales.comparables;
    
    if (comps.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Home className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No comparable properties found</p>
        </div>
      );
    }
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Similarity</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Original Value</TableHead>
              <TableHead className="text-right">Adjusted Value</TableHead>
              <TableHead>Adjustments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comps.map((comp, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={comp.similarityScore} className="h-2 w-12" />
                    <span>{comp.similarityScore}%</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{comp.property.address}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(comp.property.price || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(comp.adjustedValue)}
                </TableCell>
                <TableCell>
                  {comp.adjustments.length > 0 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {comp.adjustments.length} {comp.adjustments.length === 1 ? 'item' : 'items'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="w-64">
                          <div className="space-y-2">
                            {comp.adjustments.map((adj, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <span className="capitalize">{adj.factor}</span>
                                <span className={adj.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {adj.amount >= 0 ? '+' : ''}{formatCurrency(adj.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Render assessment quality metrics
  const renderQualityMetrics = () => {
    const quality = insights.assessmentQuality;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Uniformity</CardTitle>
            <CardDescription>
              Comparison to similar properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold">{quality.uniformity}</span>
              <Scale className={`h-8 w-8 ${quality.uniformity >= 80 ? 'text-green-500' : quality.uniformity >= 60 ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            <Progress 
              value={quality.uniformity} 
              className="h-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {quality.uniformity >= 80 
                ? 'Assessment is consistent with similar properties' 
                : quality.uniformity >= 60 
                ? 'Some inconsistencies with similar properties'
                : 'Significant inconsistencies detected'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fairness</CardTitle>
            <CardDescription>
              Equity and appeal risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold">{quality.fairness}</span>
              <Gavel className={`h-8 w-8 ${quality.fairness >= 80 ? 'text-green-500' : quality.fairness >= 60 ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            <Progress 
              value={quality.fairness} 
              className="h-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {quality.fairness >= 80 
                ? 'Assessment is fair with low appeal risk' 
                : quality.fairness >= 60 
                ? 'Moderate appeal risk'
                : 'High risk of appeal'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Accuracy</CardTitle>
            <CardDescription>
              Alignment with market value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold">{quality.accuracy}</span>
              <CheckCircle className={`h-8 w-8 ${quality.accuracy >= 80 ? 'text-green-500' : quality.accuracy >= 60 ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            <Progress 
              value={quality.accuracy} 
              className="h-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {quality.accuracy >= 80 
                ? 'Assessment closely aligns with market value' 
                : quality.accuracy >= 60 
                ? 'Some deviation from market value'
                : 'Significant deviation from market value'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render valuation approaches
  const renderValuationApproaches = () => {
    const { approaches } = insights.marketValueEstimate;
    
    return (
      <div className="space-y-6">
        {/* Sales Comparison Approach */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Sales Comparison Approach</CardTitle>
              <Badge>Weight: {formatPercent(approaches.sales.weight * 100)}</Badge>
            </div>
            <CardDescription>
              Based on {approaches.sales.comparables.length} comparable properties
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">{formatCurrency(approaches.sales.value)}</span>
              <Home className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm">
              Value derived from recent sales of comparable properties in the area,
              adjusted for differences in features, location and time of sale.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="hover:bg-transparent hover:underline p-0 h-auto">
              View Comparable Analysis
            </Button>
          </CardFooter>
        </Card>
        
        {/* Cost Approach */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Cost Approach</CardTitle>
              <Badge>Weight: {formatPercent(approaches.cost.weight * 100)}</Badge>
            </div>
            <CardDescription>
              Based on replacement cost new less depreciation
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">{formatCurrency(approaches.cost.value)}</span>
              <Building className="h-6 w-6 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Replacement Cost:</span>
                <span className="text-right">{formatCurrency(approaches.cost.replacementCost)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Less Depreciation:</span>
                <span className="text-right text-red-500">
                  {formatPercent(approaches.cost.depreciation * 100)}
                </span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Land Value:</span>
                <span className="text-right">{formatCurrency(approaches.cost.landValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Income Approach */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Income Approach</CardTitle>
              <Badge>Weight: {formatPercent(approaches.income.weight * 100)}</Badge>
            </div>
            <CardDescription>
              Based on potential rental income capitalization
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">{formatCurrency(approaches.income.value)}</span>
              <DollarSign className="h-6 w-6 text-amber-500" />
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Net Annual Income:</span>
                <span className="text-right">{formatCurrency(approaches.income.netIncome)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-muted-foreground">Cap Rate:</span>
                <span className="text-right">
                  {formatPercent(approaches.income.capRate * 100)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Assessment Intelligence</span>
          <Badge 
            className={
              insights.assessmentQuality.overall >= 80 ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
              insights.assessmentQuality.overall >= 60 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
              'bg-red-100 text-red-800 hover:bg-red-100'
            }
          >
            Quality Score: {insights.assessmentQuality.overall}
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-powered property assessment analysis and recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Alert banners for high-priority issues */}
        {renderOutlierAlert()}
        {renderAppealRiskAlert()}
        
        {/* Value summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Current Assessment</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {formatCurrency(property.price || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Official assessed value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Market Value Estimate</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {formatCurrency(insights.marketValueEstimate.value)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPercent(insights.marketValueEstimate.confidence * 100)} confidence
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Value Range</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {formatCurrency(insights.marketValueEstimate.range[0])} - {formatCurrency(insights.marketValueEstimate.range[1])}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Reasonable value range
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Assessment Ratio</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {property.price && insights.marketValueEstimate.value 
                  ? formatPercent((property.price / insights.marketValueEstimate.value) * 100) 
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Assessment to market value
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed information in tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="valuation" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Valuation
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="comparables" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              Comparables
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Market Trends
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="valuation" className="mt-6">
            <ScrollArea className="h-[500px] pr-4">
              {renderValuationApproaches()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="quality" className="mt-6">
            <ScrollArea className="h-[500px] pr-4">
              {renderQualityMetrics()}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Quality Analysis</h3>
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Assessment Issues
                    </h4>
                    {insights.outlierStatus ? (
                      <div className="text-sm space-y-2">
                        <p>This property may be {insights.outlierStatus.type === 'overassessed' ? 'over-assessed' : 'under-assessed'} compared to similar properties in the area.</p>
                        <p className="text-muted-foreground">{insights.outlierStatus.reason}</p>
                      </div>
                    ) : insights.assessmentQuality.overall < 70 ? (
                      <div className="text-sm space-y-2">
                        <p>Some minor issues detected with assessment consistency.</p>
                        <p className="text-muted-foreground">Review comparable properties for potential adjustments.</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No significant issues detected.</p>
                    )}
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Gavel className="h-4 w-4 mr-2" />
                      Appeal Risk Analysis
                    </h4>
                    {insights.appealRisk && insights.appealRisk.riskScore > 30 ? (
                      <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span>Risk Score:</span>
                          <Progress value={insights.appealRisk.riskScore} className="h-2 w-24" />
                          <span>{insights.appealRisk.riskScore}%</span>
                        </div>
                        <p>This property has a {insights.appealRisk.riskScore < 50 ? 'moderate' : 'high'} risk of appeal.</p>
                        <ul className="list-disc list-inside text-sm pl-2">
                          {insights.appealRisk.factors.recentSale?.exists && insights.appealRisk.factors.recentSale.assessmentDifference && insights.appealRisk.factors.recentSale.assessmentDifference > 10 && (
                            <li>Recent sale price differs significantly from assessment</li>
                          )}
                          {insights.appealRisk.factors.assessmentChange?.isSignificant && (
                            <li>Assessment increased significantly ({insights.appealRisk.factors.assessmentChange.percentage.toFixed(1)}%)</li>
                          )}
                          {insights.appealRisk.factors.priorAppeals?.appealed && (
                            <li>Property owner has history of appeals</li>
                          )}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Low risk of appeal for this property.</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="comparables" className="mt-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Comparable Properties</h3>
                  <p className="text-sm text-muted-foreground">
                    Similar properties used to determine market value through the sales comparison approach.
                  </p>
                </div>
                
                {renderComparables()}
                
                <div className="rounded-md border p-4">
                  <h4 className="font-medium mb-2">Adjustment Methodology</h4>
                  <p className="text-sm text-muted-foreground">
                    Comparable properties are adjusted for differences in size, age, location, and features to 
                    determine the subject property's market value. Adjustments ensure an apples-to-apples comparison.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Market Trends Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Recent market trends affecting property values in this area.
                  </p>
                </div>
                
                {renderMarketTrends()}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          View Full Report
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Map className="h-4 w-4" />
            Show on Map
          </Button>
          <Button className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Update Assessment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AssessmentIntelligenceDashboard;