/**
 * TaxAssessmentDashboard Component
 * 
 * Main dashboard for the tax assessment section showing property distributions,
 * recent assessments, and key statistics.
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search, FileText, Map, BarChart4, Calendar, Filter } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Type definitions
interface PropertyStats {
  totalProperties: number;
  assessedThisYear: number;
  appeals: number;
  reassessments: number;
  totalValue: string;
  avgValue: string;
}

interface RecentAssessment {
  id: string;
  address: string;
  value: string;
  date: string;
  status: 'completed' | 'in-progress' | 'review-needed';
}

interface PropertyTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface NeighborhoodStats {
  neighborhood: string;
  avgValue: string;
  changePercent: number;
  totalProperties: number;
}

// Dashboard component
export function TaxAssessmentDashboard() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [selectedView, setSelectedView] = useState('overview');

  // Fetch data with React Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/assessment/stats', selectedYear],
    select: (data) => data as PropertyStats,
  });

  const { data: recentAssessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/assessment/recent'],
    select: (data) => data as RecentAssessment[],
  });

  const { data: propertyTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['/api/properties/types/distribution', selectedYear],
    select: (data) => data as PropertyTypeDistribution[],
  });

  const { data: neighborhoods, isLoading: neighborhoodsLoading } = useQuery({
    queryKey: ['/api/properties/neighborhoods', selectedYear],
    select: (data) => data as NeighborhoodStats[],
  });

  // Fallback data for development (will be removed when API is complete)
  const fallbackStats: PropertyStats = {
    totalProperties: 24521,
    assessedThisYear: 5842,
    appeals: 142,
    reassessments: 783,
    totalValue: '$4.2B',
    avgValue: '$342,000'
  };

  const fallbackAssessments: RecentAssessment[] = [
    {
      id: 'PR-10542',
      address: '123 Main St, Grandview',
      value: '$320,500',
      date: 'Mar 20, 2025',
      status: 'completed'
    },
    {
      id: 'PR-10543',
      address: '456 Oak Ave, Grandview',
      value: '$455,000',
      date: 'Mar 21, 2025',
      status: 'in-progress'
    },
    {
      id: 'PR-10544',
      address: '789 Elm St, Grandview',
      value: '$275,200',
      date: 'Mar 22, 2025',
      status: 'review-needed'
    }
  ];

  const fallbackPropertyTypes: PropertyTypeDistribution[] = [
    { type: 'Residential', count: 18650, percentage: 76 },
    { type: 'Commercial', count: 2943, percentage: 12 },
    { type: 'Agricultural', count: 1962, percentage: 8 },
    { type: 'Industrial', count: 966, percentage: 4 }
  ];

  const fallbackNeighborhoods: NeighborhoodStats[] = [
    { neighborhood: 'Downtown', avgValue: '$425,210', changePercent: 6.8, totalProperties: 1250 },
    { neighborhood: 'Westside', avgValue: '$385,500', changePercent: 4.2, totalProperties: 3420 },
    { neighborhood: 'Eastside', avgValue: '$318,750', changePercent: 3.5, totalProperties: 2870 },
    { neighborhood: 'Northridge', avgValue: '$540,200', changePercent: 7.2, totalProperties: 1680 }
  ];

  // Use API data or fallback data
  const currentStats = stats || fallbackStats;
  const currentAssessments = recentAssessments || fallbackAssessments;
  const currentPropertyTypes = propertyTypes || fallbackPropertyTypes;
  const currentNeighborhoods = neighborhoods || fallbackNeighborhoods;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tax Assessment Dashboard</h1>
          <p className="text-gray-600 mt-1">View and manage property assessments across the county</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1</SelectItem>
              <SelectItem value="Q2">Q2</SelectItem>
              <SelectItem value="Q3">Q3</SelectItem>
              <SelectItem value="Q4">Q4</SelectItem>
              <SelectItem value="All">All</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="appeals">Appeals</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Properties" 
              value={statsLoading ? "-" : currentStats.totalProperties.toLocaleString()} 
              icon={<Building2 className="h-5 w-5 text-blue-600" />}
              loading={statsLoading}
            />
            <StatCard 
              title="Assessed This Year" 
              value={statsLoading ? "-" : currentStats.assessedThisYear.toLocaleString()} 
              icon={<Calendar className="h-5 w-5 text-green-600" />}
              loading={statsLoading}
            />
            <StatCard 
              title="Appeals" 
              value={statsLoading ? "-" : currentStats.appeals.toLocaleString()} 
              icon={<FileText className="h-5 w-5 text-orange-600" />}
              loading={statsLoading}
            />
            <StatCard 
              title="Total Valuation" 
              value={statsLoading ? "-" : currentStats.totalValue} 
              icon={<BarChart4 className="h-5 w-5 text-purple-600" />}
              loading={statsLoading}
            />
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Assessment Overview Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Progress</CardTitle>
                  <CardDescription>Yearly assessment progress by property type</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="h-64">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                      {/* Replace with actual chart component when available */}
                      <div className="text-center text-gray-500">
                        <BarChart4 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Assessment Progress Chart</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Assessments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assessments</CardTitle>
                  <CardDescription>Latest property assessments in the county</CardDescription>
                </CardHeader>
                <CardContent>
                  {assessmentsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {currentAssessments.map((assessment) => (
                            <tr key={assessment.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{assessment.id}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{assessment.address}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{assessment.value}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{assessment.date}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                <StatusBadge status={assessment.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Property Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Types</CardTitle>
                  <CardDescription>Distribution by property classification</CardDescription>
                </CardHeader>
                <CardContent>
                  {typesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-48 bg-gray-100 rounded flex items-center justify-center mb-4">
                        {/* Replace with actual chart component when available */}
                        <div className="text-center text-gray-500">
                          <BarChart4 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>Property Type Distribution</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {currentPropertyTypes.map((item) => (
                          <div key={item.type} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${getTypeColor(item.type)}`}></div>
                              <span className="text-sm text-gray-600">{item.type}</span>
                            </div>
                            <span className="text-sm font-medium">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Search Properties
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Building2 className="mr-2 h-4 w-4" />
                      New Assessment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Map className="mr-2 h-4 w-4" />
                      View Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Neighborhood Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Neighborhood Analysis</CardTitle>
              <CardDescription>Assessment data by neighborhood</CardDescription>
            </CardHeader>
            <CardContent>
              {neighborhoodsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neighborhood</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YoY Change</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentNeighborhoods.map((neighborhood) => (
                        <tr key={neighborhood.neighborhood}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{neighborhood.neighborhood}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{neighborhood.avgValue}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={neighborhood.changePercent > 0 ? 'text-green-600' : 'text-red-600'}>
                              {neighborhood.changePercent > 0 ? '+' : ''}{neighborhood.changePercent}%
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{neighborhood.totalProperties.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Properties Tab */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Properties Overview</CardTitle>
              <CardDescription>Detailed property data and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Properties Management</h3>
                <p className="text-gray-500 mb-4">This section will contain detailed property management interfaces</p>
                <Button>View All Properties</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessments Overview</CardTitle>
              <CardDescription>Manage and track assessment progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Assessment Management</h3>
                <p className="text-gray-500 mb-4">This section will contain detailed assessment tracking and management tools</p>
                <Button>View All Assessments</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appeals Tab */}
        <TabsContent value="appeals">
          <Card>
            <CardHeader>
              <CardTitle>Appeals Dashboard</CardTitle>
              <CardDescription>Track and manage assessment appeals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Appeals Management</h3>
                <p className="text-gray-500 mb-4">This section will contain detailed appeals tracking and resolution tools</p>
                <Button>View All Appeals</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper components

const StatCard = ({ 
  title, 
  value, 
  icon,
  loading = false
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  loading?: boolean;
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {icon}
        </div>
        {loading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let color = '';
  switch (status) {
    case 'completed':
      color = 'bg-green-100 text-green-800';
      break;
    case 'in-progress':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'review-needed':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }
  
  const displayText = status.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
      {displayText}
    </span>
  );
};

// Helper function to get color for property type
function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'residential':
      return 'bg-blue-500';
    case 'commercial':
      return 'bg-green-500';
    case 'agricultural':
      return 'bg-yellow-500';
    case 'industrial':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}