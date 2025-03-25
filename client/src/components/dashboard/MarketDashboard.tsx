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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Market Overview - {selectedArea}</CardTitle>
        </CardHeader>
        <CardContent>
          {marketData && (
            <LineChart width={600} height={300} data={marketData.trends}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
          )}
        </CardContent>
      </Card>

      <TrendPredictionWidget area={selectedArea} />
    </div>
  );
}