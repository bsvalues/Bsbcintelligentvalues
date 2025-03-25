/**
 * Animated Trend Map Component
 * 
 * This component provides an animated visualization of property market trends over time,
 * using Leaflet to display geospatial data. It shows changes in property prices, days on market,
 * and other metrics through a time-based animation with interactive controls.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  ZoomControl,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Slider 
} from '@/components/ui/slider';
import {
  Button
} from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  FastForward,
  BarChart2,
  Activity
} from 'lucide-react';
import type { 
  PropertyTimeseriesData, 
  PropertyTimeseriesPoint, 
  AnimationControlState,
  MapDisplayOptions,
  PropertyPoint
} from '@/types/animated-map';

const DEFAULT_CENTER: [number, number] = [46.2310811, -119.9071703]; // Grandview, WA
const DEFAULT_ZOOM = 13;

/**
 * Animated Trend Map Component
 */
export default function AnimatedTrendMap() {
  // State for map and animation
  const [timeseriesData, setTimeseriesData] = useState<PropertyTimeseriesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState<string>('1yr');
  const [currentMarketArea, setCurrentMarketArea] = useState<string>('grandview');
  
  // Animation controls state
  const [animationState, setAnimationState] = useState<AnimationControlState>({
    isPlaying: false,
    currentIndex: 0,
    speed: 1000, // ms between animation frames
    loop: true
  });
  
  // Map display options
  const [displayOptions, setDisplayOptions] = useState<MapDisplayOptions>({
    colorBy: 'price',
    sizeBy: 'squareFeet',
    showSold: true,
    showActive: true,
    showPending: true,
    clusterPoints: false,
    heatmapEnabled: false
  });
  
  // References
  const animationRef = useRef<number | null>(null);
  
  // Fetch the timeseries data from the API
  useEffect(() => {
    const fetchTimeseriesData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('/api/analytics/property-timeseries', {
          params: {
            timeframe: currentTimeframe,
            area: currentMarketArea,
            propertyType: 'all'
          }
        });
        
        setTimeseriesData(response.data);
      } catch (err) {
        console.error('Error fetching property timeseries data:', err);
        setError('Failed to load property trend data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeseriesData();
    
    // Clean up any running animations when the component unmounts
    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTimeframe, currentMarketArea]);
  
  // Animation logic
  const playAnimation = useCallback(() => {
    if (!timeseriesData || !timeseriesData.timeseries.length) return;
    
    const animate = () => {
      setAnimationState(prev => {
        // Calculate next index
        const nextIndex = prev.currentIndex + 1;
        
        // If we've reached the end
        if (nextIndex >= (timeseriesData?.timeseries.length || 0)) {
          if (prev.loop) {
            // Restart from the beginning if looping
            return { ...prev, currentIndex: 0 };
          } else {
            // Stop animation if not looping
            return { ...prev, isPlaying: false };
          }
        }
        
        return { ...prev, currentIndex: nextIndex };
      });
      
      // Continue animation if playing
      if (animationState.isPlaying) {
        animationRef.current = window.setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, animationState.speed);
      }
    };
    
    // Start the animation
    setAnimationState(prev => ({ ...prev, isPlaying: true }));
    animationRef.current = requestAnimationFrame(animate);
    
    // Clean-up function
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        clearTimeout(animationRef.current);
      }
    };
  }, [timeseriesData, animationState.isPlaying, animationState.speed, animationState.loop]);
  
  // Pause animation
  const pauseAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  // Skip to next frame
  const nextFrame = useCallback(() => {
    if (!timeseriesData || !timeseriesData.timeseries.length) return;
    
    setAnimationState(prev => {
      const nextIndex = (prev.currentIndex + 1) % timeseriesData.timeseries.length;
      return { ...prev, currentIndex: nextIndex };
    });
  }, [timeseriesData]);
  
  // Skip to previous frame
  const prevFrame = useCallback(() => {
    if (!timeseriesData || !timeseriesData.timeseries.length) return;
    
    setAnimationState(prev => {
      const prevIndex = prev.currentIndex === 0 
        ? timeseriesData.timeseries.length - 1 
        : prev.currentIndex - 1;
      return { ...prev, currentIndex: prevIndex };
    });
  }, [timeseriesData]);
  
  // Handle slider change
  const handleSliderChange = useCallback((value: number[]) => {
    if (!timeseriesData || !timeseriesData.timeseries.length) return;
    
    setAnimationState(prev => ({
      ...prev,
      currentIndex: value[0]
    }));
  }, [timeseriesData]);
  
  // Toggle animation loop
  const toggleLoop = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      loop: !prev.loop
    }));
  }, []);
  
  // Change animation speed
  const changeSpeed = useCallback((multiplier: number) => {
    setAnimationState(prev => ({
      ...prev,
      speed: Math.max(100, Math.min(3000, prev.speed / multiplier))
    }));
  }, []);
  
  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (animationState.isPlaying) {
      pauseAnimation();
    } else {
      playAnimation();
    }
  }, [animationState.isPlaying, pauseAnimation, playAnimation]);
  
  // Get the current frame data
  const currentFrame = timeseriesData?.timeseries[animationState.currentIndex];
  
  // Function to determine circle color based on property data
  const getCircleColor = useCallback((property: PropertyPoint) => {
    if (displayOptions.colorBy === 'price') {
      // Color based on price
      const maxPrice = 1000000; // $1M benchmark
      const normalizedPrice = Math.min(1, property.price / maxPrice);
      
      // Green for lower prices, yellow for middle, red for high
      const r = Math.floor(normalizedPrice * 255);
      const g = Math.floor((1 - Math.abs(normalizedPrice - 0.5) * 2) * 255);
      const b = Math.floor((1 - normalizedPrice) * 150);
      
      return `rgb(${r}, ${g}, ${b})`;
    } else if (displayOptions.colorBy === 'daysOnMarket') {
      // Color based on days on market (red for higher DOM)
      const maxDOM = 120; // 4 months benchmark
      const normalizedDOM = Math.min(1, property.daysOnMarket / maxDOM);
      
      // Green for quick sales, yellow for medium, red for slow
      const r = Math.floor(normalizedDOM * 255);
      const g = Math.floor((1 - normalizedDOM) * 255);
      const b = 50;
      
      return `rgb(${r}, ${g}, ${b})`;
    } else if (displayOptions.colorBy === 'priceChange') {
      if (property.priceChange === undefined) return '#888888';
      
      // Color based on price change (green for increase, red for decrease)
      const normalizedChange = Math.min(0.2, Math.max(-0.2, property.priceChange)) / 0.2;
      
      if (normalizedChange > 0) {
        // Green for positive change
        return `rgb(0, ${Math.floor(150 + normalizedChange * 105)}, 0)`;
      } else {
        // Red for negative change
        return `rgb(${Math.floor(150 + Math.abs(normalizedChange) * 105)}, 0, 0)`;
      }
    } else {
      // Default color
      return '#3388ff';
    }
  }, [displayOptions.colorBy]);
  
  // Function to determine circle size based on property data
  const getCircleSize = useCallback((property: PropertyPoint) => {
    if (displayOptions.sizeBy === 'squareFeet') {
      // Size based on square footage (min 5, max 20)
      return Math.max(5, Math.min(20, property.squareFeet / 200));
    } else if (displayOptions.sizeBy === 'price') {
      // Size based on price (min 5, max 20)
      return Math.max(5, Math.min(20, property.price / 50000));
    } else {
      // Fixed size
      return 8;
    }
  }, [displayOptions.sizeBy]);
  
  // Function to format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Function to format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading property trend data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-destructive/10 p-3 rounded-full">
              <Activity className="h-8 w-8 text-destructive" />
            </div>
            <p className="font-medium">Error Loading Data</p>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setCurrentTimeframe(currentTimeframe)}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render the map component if data is available
  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Property Market Animation</CardTitle>
            <CardDescription>
              {currentFrame && formatDate(currentFrame.date)}
              {timeseriesData && ` | ${timeseriesData.marketArea} Market Area`}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Select value={currentTimeframe} onValueChange={setCurrentTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1yr">1 Year</SelectItem>
                <SelectItem value="3yr">3 Years</SelectItem>
                <SelectItem value="5yr">5 Years</SelectItem>
                <SelectItem value="10yr">10 Years</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={displayOptions.colorBy} onValueChange={(value) => setDisplayOptions(prev => ({ ...prev, colorBy: value as any }))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Color By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="daysOnMarket">Days on Market</SelectItem>
                <SelectItem value="priceChange">Price Change</SelectItem>
                <SelectItem value="pricePerSqFt">Price per Sq Ft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Map container */}
        <div className="rounded-md overflow-hidden border border-border mb-4">
          {currentFrame && (
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '500px', width: '100%' }}
              whenReady={(map) => {
                // Initialize map
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ZoomControl position="bottomright" />
              
              {/* Render property markers */}
              {currentFrame.properties.map(property => {
                // Filter based on display options
                if (!displayOptions.showActive && property.status === 'active') return null;
                if (!displayOptions.showSold && property.status === 'sold') return null;
                if (!displayOptions.showPending && property.status === 'pending') return null;
                
                return (
                  <CircleMarker
                    key={property.id}
                    center={[property.latitude, property.longitude]}
                    radius={getCircleSize(property)}
                    pathOptions={{
                      fillColor: getCircleColor(property),
                      fillOpacity: 0.7,
                      color: property.status === 'sold' ? '#000' : '#fff',
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-semibold">{property.address}</h3>
                        <p className="font-bold text-md">{formatPrice(property.price)}</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                          <div>Beds: {property.bedrooms}</div>
                          <div>Baths: {property.bathrooms}</div>
                          <div>Sq Ft: {property.squareFeet.toLocaleString()}</div>
                          <div>Built: {property.yearBuilt}</div>
                          <div>DOM: {property.daysOnMarket}</div>
                          <div>Status: {property.status}</div>
                        </div>
                        {property.priceChange !== undefined && (
                          <p className={`mt-1 font-medium ${property.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Price Change: {(property.priceChange * 100).toFixed(1)}%
                          </p>
                        )}
                        {property.lastSoldDate && (
                          <p className="mt-1">
                            Last Sold: {formatPrice(property.lastSoldPrice || 0)} on {formatDate(property.lastSoldDate)}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>
        
        {/* Market stats summary */}
        {currentFrame && (
          <div className="mb-4">
            <Tabs defaultValue="summary">
              <TabsList className="mb-2">
                <TabsTrigger value="summary">Market Summary</TabsTrigger>
                <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Median Price</div>
                    <div className="text-xl font-bold">{formatPrice(currentFrame.medianPrice)}</div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Days on Market</div>
                    <div className="text-xl font-bold">{currentFrame.medianDOM} days</div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Active Listings</div>
                    <div className="text-xl font-bold">{currentFrame.activeListings}</div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Price/Sq Ft</div>
                    <div className="text-xl font-bold">
                      ${currentFrame.medianPricePerSqft?.toFixed(2) || "N/A"}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stats">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">New Listings</div>
                    <div className="text-xl font-bold">{currentFrame.newListings}</div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Sold Listings</div>
                    <div className="text-xl font-bold">{currentFrame.soldListings}</div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="text-xl font-bold">{currentFrame.pendingListings}</div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Price Change</div>
                    <div className={`text-xl font-bold ${currentFrame.marketStats.averagePriceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(currentFrame.marketStats.averagePriceChange * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Inventory Change</div>
                    <div className={`text-xl font-bold ${currentFrame.marketStats.inventoryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(currentFrame.marketStats.inventoryChange * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Absorption Rate</div>
                    <div className="text-xl font-bold">
                      {currentFrame.marketStats.absorptionRate.toFixed(1)} mo
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">Market Health</div>
                    <div className="text-xl font-bold">
                      {currentFrame.marketStats.marketHealth.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* Animation controls */}
        {timeseriesData && timeseriesData.timeseries.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={prevFrame}
                  disabled={animationState.isPlaying}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  variant={animationState.isPlaying ? "outline" : "default"}
                  size="icon" 
                  onClick={togglePlay}
                >
                  {animationState.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={nextFrame}
                  disabled={animationState.isPlaying}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant={animationState.loop ? "default" : "outline"}
                size="icon"
                className="mr-2"
                onClick={toggleLoop}
              >
                <Repeat className="h-4 w-4" />
              </Button>
              
              <Slider
                className="w-full max-w-xs"
                min={0}
                max={timeseriesData.timeseries.length - 1}
                step={1}
                value={[animationState.currentIndex]}
                onValueChange={handleSliderChange}
                disabled={animationState.isPlaying}
              />
              
              <div className="ml-auto flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => changeSpeed(0.5)}
                  disabled={animationState.speed >= 3000}
                >
                  Slower
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => changeSpeed(2)}
                  disabled={animationState.speed <= 100}
                >
                  Faster
                </Button>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground flex justify-between">
              <span>{timeseriesData.dateRange.start.split('T')[0]}</span>
              <span>Date: {currentFrame?.date}</span>
              <span>{timeseriesData.dateRange.end.split('T')[0]}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}