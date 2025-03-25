/**
 * MarketDashboard Component
 * 
 * This component displays market analytics, trends, and metrics for real estate data.
 * It includes various charts and visualizations for market analysis.
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import TrendPredictionWidget from './TrendPredictionWidget';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Types
interface MarketMetric {
  date: string;
  value: number;
}

interface MarketTrend {
  metric: string;
  area_type: string;
  area_value: string;
  timeframe: string;
  data_points: MarketMetric[];
  change_pct: number;
  trend_direction: string;
}

interface MarketOverview {
  area_type: string;
  area_value: string;
  current_condition: string;
  median_price: number;
  average_price: number;
  price_per_sqft: number;
  total_active_listings: number;
  new_listings_last_30_days: number;
  avg_days_on_market: number;
  price_trends: Record<string, MarketTrend>;
  inventory_level: string;
  affordability_index: number;
}

interface MarketHotspot {
  area_type: string;
  area_value: string;
  price_growth_pct: number;
  median_price: number;
  avg_days_on_market: number;
  total_sales: number;
  score: number;
  latitude: number;
  longitude: number;
}


export default function MarketDashboard() {
  const [selectedArea, setSelectedArea] = useState('Grandview');
  const { toast } = useToast();

  const { data: marketData } = useQuery({
    queryKey: ['marketData', selectedArea],
    queryFn: async () => {
      const response = await fetch(`/api/market/analysis/${selectedArea}`);
      if (!response.ok) throw new Error('Failed to fetch market data');
      return response.json();
    }
  });

  return (
    <div className="space-y-6 p-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Median Property Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marketData?.median_price?.toLocaleString() || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {marketData?.price_trends?.median_price?.change_pct > 0 
                ? `↑ ${marketData?.price_trends?.median_price?.change_pct}% from last year` 
                : marketData?.price_trends?.median_price?.change_pct < 0 
                  ? `↓ ${Math.abs(marketData?.price_trends?.median_price?.change_pct)}% from last year`
                  : 'No change from last year'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData?.total_active_listings?.toLocaleString() || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {marketData?.new_listings_last_30_days} new in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Days on Market</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData?.avg_days_on_market || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {marketData?.current_condition || 'Analyzing market conditions'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price per Sq. Ft.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${marketData?.price_per_sqft || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Affordability Index: {marketData?.affordability_index || 'Calculating...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Market Trends - {selectedArea}</CardTitle>
        </CardHeader>
        <CardContent>
          {marketData ? (
            <LineChart width={600} height={300} data={marketData.trends}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="volume" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Widget and Area Comparisons in a 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Forecasted Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendPredictionWidget selectedArea={selectedArea} selectedAreaType="zip" />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Area Comparisons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Median Home Price</span>
                <span className="font-medium">{selectedArea} vs. County Average</span>
              </div>
              <div className="w-full bg-muted h-4 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${marketData?.affordability_index ? Math.min(marketData.affordability_index * 100, 100) : 50}%` }}></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {marketData?.affordability_index && marketData.affordability_index > 1 
                  ? `${selectedArea} is ${Math.round((marketData.affordability_index - 1) * 100)}% higher than county average` 
                  : marketData?.affordability_index 
                    ? `${selectedArea} is ${Math.round((1 - marketData.affordability_index) * 100)}% lower than county average`
                    : 'Comparing with county average...'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}