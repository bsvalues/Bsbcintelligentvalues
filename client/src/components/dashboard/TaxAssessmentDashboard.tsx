/**
 * TaxAssessmentDashboard Component
 * 
 * The main dashboard for tax assessment users
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaSelector } from '../common/AreaSelector';
import { DateRangeSelector } from '../common/DateRangeSelector';
import { MarketMetricsCard } from '../market/MarketMetricsCard';
import { MarketTrendChart } from '../market/MarketTrendChart';
import { PropertySearch } from '../property/PropertySearch';
import { useAppContext } from '../../context/AppContext';

export function TaxAssessmentDashboard() {
  const { selectedCounty, selectedArea, selectedAreaType } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Assessment Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage property assessments for {selectedCounty} County
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <AreaSelector showArea={false} />
          <DateRangeSelector />
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="appeals">Appeals</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24,568</div>
                <p className="text-xs text-muted-foreground">
                  Updated daily
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessed Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4.2B</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last year
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessment Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">93.8%</div>
                <p className="text-xs text-muted-foreground">
                  Of properties assessed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Appeals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">186</div>
                <p className="text-xs text-muted-foreground">
                  +42 this month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <MarketMetricsCard area={selectedCounty} areaType="county" />
            
            <Card>
              <CardHeader>
                <CardTitle>Assessment Distribution</CardTitle>
                <CardDescription>Distribution of property assessments by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
          
          <MarketTrendChart area={selectedCounty} areaType="county" />
        </TabsContent>
        
        {/* Properties Tab */}
        <TabsContent value="properties">
          <PropertySearch />
        </TabsContent>
        
        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>Analysis of property market trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <MarketTrendChart area={selectedCounty} areaType="county" />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Property Type Distribution</CardTitle>
                <CardDescription>Breakdown by property category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Chart will be displayed here
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Neighborhood Comparison</CardTitle>
                <CardDescription>Value comparison across neighborhoods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Recently completed property assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                Assessment data will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appeals Tab */}
        <TabsContent value="appeals">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Appeals</CardTitle>
              <CardDescription>Manage and track assessment appeals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                Appeals data will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}