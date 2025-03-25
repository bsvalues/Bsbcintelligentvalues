/**
 * Property Trend Visualizer Page
 * 
 * This page provides an animated visualization of property market trends over time,
 * allowing users to see how property prices, inventory, and other metrics have
 * changed through an interactive animated map.
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet';
import Footer from '@/components/layout/Footer';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import AnimatedTrendMap from '@/components/mapping/AnimatedTrendMap';
import { 
  BarChart4, 
  Map, 
  PlayCircle,
  LineChart 
} from 'lucide-react';

/**
 * Property Trend Visualizer Page Component
 */
export default function PropertyTrendVisualizerPage() {
  const [activeTab, setActiveTab] = useState('map');
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <Helmet>
        <title>Animated Property Trends | IntelligentEstate</title>
        <meta name="description" content="Visualize property market trends over time with our interactive animated map." />
      </Helmet>
      
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center animate-in slide-in-from-left-5 duration-500">
            <PlayCircle className="h-6 w-6 mr-2 text-primary animate-pulse-glow" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">IntelligentEstate</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <PlayCircle className="h-8 w-8 text-primary" />
              Property Trend Visualizer
            </h1>
            <p className="text-muted-foreground">
              Watch how the real estate market evolves over time with our animated visualization tools
            </p>
          </div>
          <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  <span>Animated Map</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <BarChart4 className="h-4 w-4" />
                  <span>Market Charts</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>Trend Analysis</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="map" className="mt-0">
              <AnimatedTrendMap />
            </TabsContent>
            
            <TabsContent value="charts" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Market Charts</CardTitle>
                  <CardDescription>
                    Visual analysis of market metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Price Trends</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 flex items-center justify-center bg-muted/40">
                        <div className="text-muted-foreground text-sm">
                          Price trend chart will appear here
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Inventory Levels</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 flex items-center justify-center bg-muted/40">
                        <div className="text-muted-foreground text-sm">
                          Inventory chart will appear here
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Days on Market</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 flex items-center justify-center bg-muted/40">
                        <div className="text-muted-foreground text-sm">
                          Days on market chart will appear here
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Price per Square Foot</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 flex items-center justify-center bg-muted/40">
                        <div className="text-muted-foreground text-sm">
                          Price per sq ft chart will appear here
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription>
                    Deep insights into market movements and future predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Market Cycle Position</CardTitle>
                        <CardDescription>Analysis of where we are in the market cycle</CardDescription>
                      </CardHeader>
                      <CardContent className="min-h-[200px] flex items-center justify-center bg-muted/40">
                        <div className="text-muted-foreground text-center max-w-md">
                          <p className="mb-2">Market cycle visualization will appear here</p>
                          <p className="text-xs">The market cycle shows the current position of the market in relation to historical cycles</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Predictive Trends</CardTitle>
                        <CardDescription>AI-powered market predictions for the next 6-12 months</CardDescription>
                      </CardHeader>
                      <CardContent className="min-h-[300px] flex items-center justify-center bg-muted/40">
                        <div className="text-muted-foreground text-center max-w-md">
                          <p className="mb-2">AI prediction charts will appear here</p>
                          <p className="text-xs">Our AI models analyze hundreds of data points to predict future market movements</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}