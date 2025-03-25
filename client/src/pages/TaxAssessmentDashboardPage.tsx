import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Building, 
  Home, 
  TrendingUp, 
  Map, 
  Calculator, 
  Filter, 
  FileText, 
  Clock,
  Search,
  BarChart3,
  CalendarRange,
  Users,
  FileBarChart,
  DollarSign,
  Percent,
  Building2,
  ShieldAlert
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

import { PieChart, PieChartProps } from '../components/charts/PieChart';
import { TaxCalculatorWidget } from '../components/widgets/TaxCalculatorWidget';
import { Heading } from '../components/ui/heading';
import { StatisticCard } from '../components/dashboard/StatisticCard';

// Page component for the Tax Assessment Dashboard
const TaxAssessmentDashboardPage = () => {
  const [selectedArea, setSelectedArea] = useState('98930');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch tax assessment data for the selected area
  const { data: taxData, isLoading: taxDataLoading } = useQuery({
    queryKey: ['/api/tax-assessment/summary', selectedArea, selectedYear],
    queryFn: async () => {
      // Simulate API call
      return {
        totalProperties: 2485,
        assessedValue: 587923000,
        taxableValue: 512450000,
        taxRevenue: 8199200,
        exemptionTotal: 75473000,
        appealRate: 8.2,
        collectionRate: 96.3,
        yearOverYearGrowth: 5.7,
        propertyTypes: {
          residential: 72.6,
          commercial: 14.8,
          agricultural: 10.5,
          industrial: 2.1
        },
        topNeighborhoods: [
          { name: 'Downtown West', value: 125650000, growth: 6.8 },
          { name: 'Eastridge', value: 98750000, growth: 7.2 },
          { name: 'Country Heights', value: 87320000, growth: 4.5 },
          { name: 'Vineyard Estates', value: 76450000, growth: 8.1 },
          { name: 'Westfield', value: 58950000, growth: 3.4 }
        ],
        recentAppeals: [
          { id: 'AP2025-143', property: '2204 Hill Dr', type: 'Residential', status: 'Pending', date: '2025-03-15' },
          { id: 'AP2025-142', property: '156 Vine Ave', type: 'Commercial', status: 'Approved', date: '2025-03-12' },
          { id: 'AP2025-139', property: '1897 Eastland Rd', type: 'Residential', status: 'Denied', date: '2025-03-08' },
          { id: 'AP2025-137', property: '458 Cherry St', type: 'Residential', status: 'Pending', date: '2025-03-05' },
          { id: 'AP2025-135', property: '901 Industrial Way', type: 'Industrial', status: 'Approved', date: '2025-03-01' }
        ],
        upcomingDeadlines: [
          { name: 'Appeal Filing Deadline', date: '2025-04-30', daysRemaining: 36 },
          { name: 'Property Owner Notices', date: '2025-04-15', daysRemaining: 21 },
          { name: 'First Tax Payment Due', date: '2025-05-31', daysRemaining: 67 },
          { name: 'Exemption Applications', date: '2025-04-01', daysRemaining: 7 }
        ]
      };
    }
  });

  // Prepare pie chart data for property types
  const propertyTypesChartData: PieChartProps['data'] = taxData ? [
    { name: 'Residential', value: taxData.propertyTypes.residential, color: 'hsl(215, 70%, 60%)' },
    { name: 'Commercial', value: taxData.propertyTypes.commercial, color: 'hsl(145, 63%, 42%)' },
    { name: 'Agricultural', value: taxData.propertyTypes.agricultural, color: 'hsl(43, 89%, 60%)' },
    { name: 'Industrial', value: taxData.propertyTypes.industrial, color: 'hsl(0, 70%, 60%)' }
  ] : [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get color class based on growth value
  const getGrowthColorClass = (growth: number) => {
    if (growth >= 5) return 'text-green-600';
    if (growth >= 0) return 'text-green-500';
    if (growth >= -5) return 'text-orange-500';
    return 'text-red-600';
  };

  // Get status badge style
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'denied': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Heading 
        title="Tax Assessment Dashboard" 
        description="Comprehensive view of county tax assessment data"
        icon={<FileBarChart size={24} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-1 h-4 w-4" />
              Export Report
            </Button>
            <Button size="sm">
              <Clock className="mr-1 h-4 w-4" />
              Schedule Update
            </Button>
          </div>
        }
      />
      <div className="p-4 md:p-6 space-y-6">
        {/* Top controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="98930">Grandview (98930)</SelectItem>
                <SelectItem value="98932">Sunnyside (98932)</SelectItem>
                <SelectItem value="98935">Toppenish (98935)</SelectItem>
                <SelectItem value="98944">Yakima County (98944)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search properties..."
                className="pl-8 w-[200px] md:w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticCard
            title="Total Assessed Value"
            value={taxData ? formatCurrency(taxData.assessedValue) : '—'}
            icon={<DollarSign size={18} />}
            trend={taxData ? {
              value: taxData.yearOverYearGrowth,
              label: `${formatPercent(Math.abs(taxData.yearOverYearGrowth))} from previous year`
            } : undefined}
          />
          
          <StatisticCard
            title="Tax Revenue"
            value={taxData ? formatCurrency(taxData.taxRevenue) : '—'}
            icon={<Percent size={18} />}
            subtitle={`Collection Rate: ${taxData ? taxData.collectionRate : 0}%`}
          />
          
          <StatisticCard
            title="Total Properties"
            value={taxData ? taxData.totalProperties.toLocaleString() : '—'}
            icon={<Building2 size={18} />}
            subtitle={`Appeal Rate: ${taxData ? taxData.appealRate : 0}%`}
          />
          
          <StatisticCard
            title="Exemption Value"
            value={taxData ? formatCurrency(taxData.exemptionTotal) : '—'}
            icon={<ShieldAlert size={18} />}
            subtitle={taxData ? `${formatPercent(taxData.exemptionTotal / taxData.assessedValue * 100)} of total value` : '—'}
          />
        </div>
        
        {/* Main dashboard content tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="property-data" className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Property Data</span>
            </TabsTrigger>
            <TabsTrigger value="tax-calculator" className="flex items-center">
              <Calculator className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Tax Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="appeals" className="flex items-center">
              <FileBarChart className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Appeals</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Property Types Distribution */}
              <Card className="shadow-md lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Property Types</CardTitle>
                  <CardDescription>
                    Distribution of property types by assessed value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {propertyTypesChartData.length > 0 ? (
                    <div className="h-64">
                      <PieChart data={propertyTypesChartData} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">Loading data...</p>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    {propertyTypesChartData.map((item) => (
                      <div key={item.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{formatPercent(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Top Neighborhoods by Value */}
              <Card className="shadow-md lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Top Neighborhoods</CardTitle>
                  <CardDescription>
                    Highest assessed value neighborhoods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taxData ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Neighborhood</TableHead>
                          <TableHead>Assessed Value</TableHead>
                          <TableHead>YoY Growth</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taxData.topNeighborhoods.map((neighborhood) => (
                          <TableRow key={neighborhood.name}>
                            <TableCell className="font-medium">{neighborhood.name}</TableCell>
                            <TableCell>{formatCurrency(neighborhood.value)}</TableCell>
                            <TableCell className={getGrowthColorClass(neighborhood.growth)}>
                              {neighborhood.growth > 0 ? '↑' : '↓'} {formatPercent(Math.abs(neighborhood.growth))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">Loading data...</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Neighborhoods
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Appeals */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Appeals</CardTitle>
                  <CardDescription>
                    Recent property assessment appeals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taxData ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Appeal ID</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taxData.recentAppeals.map((appeal) => (
                          <TableRow key={appeal.id}>
                            <TableCell className="font-medium">{appeal.id}</TableCell>
                            <TableCell>{appeal.property}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(appeal.status)}>
                                {appeal.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(appeal.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <p className="text-muted-foreground">Loading data...</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Appeals
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Upcoming Deadlines */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                  <CardDescription>
                    Important dates and deadlines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taxData ? (
                    <div className="space-y-4">
                      {taxData.upcomingDeadlines.map((deadline) => (
                        <div key={deadline.name} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{deadline.name}</span>
                            <span className="text-sm">{new Date(deadline.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(deadline.daysRemaining / 90) * 100} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              {deadline.daysRemaining} days remaining
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <p className="text-muted-foreground">Loading data...</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    View Calendar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Property Data Tab */}
          <TabsContent value="property-data" className="space-y-4">
            {/* Property search/browse functionality would go here */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Property Lookup</AlertTitle>
              <AlertDescription>
                Search for specific properties by address, parcel ID, or owner name to view detailed assessment information.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="search"
                placeholder="Enter address, parcel ID, or owner name"
                className="md:w-1/2"
              />
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search Properties
              </Button>
            </div>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Recent Property Data</CardTitle>
                <CardDescription>
                  Recently updated property assessment data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Parcel ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Assessed Value</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">2204 Hill Dr</TableCell>
                      <TableCell>1032-754-002</TableCell>
                      <TableCell>Residential</TableCell>
                      <TableCell>$385,000</TableCell>
                      <TableCell>3/15/2025</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">156 Vine Ave</TableCell>
                      <TableCell>1032-652-114</TableCell>
                      <TableCell>Commercial</TableCell>
                      <TableCell>$975,000</TableCell>
                      <TableCell>3/12/2025</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">1897 Eastland Rd</TableCell>
                      <TableCell>1031-342-087</TableCell>
                      <TableCell>Residential</TableCell>
                      <TableCell>$425,000</TableCell>
                      <TableCell>3/10/2025</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">901 Industrial Way</TableCell>
                      <TableCell>1028-411-233</TableCell>
                      <TableCell>Industrial</TableCell>
                      <TableCell>$1,250,000</TableCell>
                      <TableCell>3/05/2025</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">458 Cherry St</TableCell>
                      <TableCell>1033-821-005</TableCell>
                      <TableCell>Residential</TableCell>
                      <TableCell>$315,000</TableCell>
                      <TableCell>3/01/2025</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing 5 of 2,485 properties
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tax Calculator Tab */}
          <TabsContent value="tax-calculator" className="space-y-4">
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertTitle>Tax Calculator</AlertTitle>
              <AlertDescription>
                Estimate property taxes based on assessed value and applicable tax rates.
              </AlertDescription>
            </Alert>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Property Tax Calculator</CardTitle>
                <CardDescription>
                  Calculate estimated property taxes based on assessed value
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for tax calculator widget */}
                <div className="border rounded-md p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Property Assessed Value</label>
                    <Input
                      type="number"
                      placeholder="Enter assessed value"
                      className="w-full"
                      defaultValue="425000"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Tax District</label>
                    <Select defaultValue="grandview">
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grandview">Grandview City</SelectItem>
                        <SelectItem value="sunnyside">Sunnyside</SelectItem>
                        <SelectItem value="toppenish">Toppenish</SelectItem>
                        <SelectItem value="yakima">Yakima County (Unincorporated)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Property Classification</label>
                    <Select defaultValue="residential">
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="agricultural">Agricultural</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full mt-2">Calculate Property Tax</Button>
                  
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-2">Estimated Tax Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">County Tax</span>
                        <span className="font-medium">$2,550.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">City Tax</span>
                        <span className="font-medium">$1,275.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">School District</span>
                        <span className="font-medium">$2,125.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Special Assessments</span>
                        <span className="font-medium">$850.00</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total Estimated Annual Tax</span>
                        <span className="text-lg">$6,800.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Note: This calculator provides estimates only. Actual tax amounts may vary.
              </CardFooter>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Tax Rates by District</CardTitle>
                <CardDescription>
                  Current tax rates for districts in {selectedArea}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>District</TableHead>
                      <TableHead>Millage Rate</TableHead>
                      <TableHead>Per $100,000 Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Yakima County</TableCell>
                      <TableCell>6.00</TableCell>
                      <TableCell>$600.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Grandview City</TableCell>
                      <TableCell>3.00</TableCell>
                      <TableCell>$300.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">School District #200</TableCell>
                      <TableCell>5.00</TableCell>
                      <TableCell>$500.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Hospital District</TableCell>
                      <TableCell>0.75</TableCell>
                      <TableCell>$75.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Library District</TableCell>
                      <TableCell>0.50</TableCell>
                      <TableCell>$50.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Fire District</TableCell>
                      <TableCell>0.75</TableCell>
                      <TableCell>$75.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium font-bold">Total</TableCell>
                      <TableCell className="font-bold">16.00</TableCell>
                      <TableCell className="font-bold">$1,600.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appeals Tab */}
          <TabsContent value="appeals" className="space-y-4">
            <Alert>
              <FileBarChart className="h-4 w-4" />
              <AlertTitle>Tax Appeals Process</AlertTitle>
              <AlertDescription>
                View and manage property tax appeals. Track status and submit new appeals.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Appeals Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Appeals</span>
                      <span className="font-medium">204</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span>Pending</span>
                        <span>86 (42%)</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span>Approved</span>
                        <span>73 (36%)</span>
                      </div>
                      <Progress value={36} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span>Denied</span>
                        <span>45 (22%)</span>
                      </div>
                      <Progress value={22} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-md md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Appeals Timeline</CardTitle>
                  <CardDescription>
                    Important dates in the appeals process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-primary/30 pl-6 space-y-6 py-2">
                    <div className="relative">
                      <div className="absolute w-4 h-4 bg-primary rounded-full -left-[30px] top-0"></div>
                      <h4 className="font-medium">Notices of Value Mailed</h4>
                      <p className="text-sm text-muted-foreground">March 15, 2025</p>
                      <p className="text-sm mt-1">County sends assessment notices to all property owners</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute w-4 h-4 bg-primary/80 rounded-full -left-[30px] top-0"></div>
                      <h4 className="font-medium">Appeal Filing Deadline</h4>
                      <p className="text-sm text-muted-foreground">April 30, 2025</p>
                      <p className="text-sm mt-1">Last day to file appeals for current assessment year</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute w-4 h-4 bg-primary/60 rounded-full -left-[30px] top-0"></div>
                      <h4 className="font-medium">Appeal Hearings Begin</h4>
                      <p className="text-sm text-muted-foreground">May 15, 2025</p>
                      <p className="text-sm mt-1">Board of Equalization begins hearing property appeals</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute w-4 h-4 bg-primary/40 rounded-full -left-[30px] top-0"></div>
                      <h4 className="font-medium">Appeal Decisions Due</h4>
                      <p className="text-sm text-muted-foreground">July 31, 2025</p>
                      <p className="text-sm mt-1">Final decisions on all appeals expected by this date</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Recent Appeal Decisions</CardTitle>
                <CardDescription>
                  Recent decisions on property assessment appeals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appeal ID</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Original Value</TableHead>
                      <TableHead>Appealed Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Decision Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">AP2025-142</TableCell>
                      <TableCell>156 Vine Ave</TableCell>
                      <TableCell>$975,000</TableCell>
                      <TableCell>$850,000</TableCell>
                      <TableCell>
                        <Badge variant="success">Approved</Badge>
                      </TableCell>
                      <TableCell>3/12/2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AP2025-139</TableCell>
                      <TableCell>1897 Eastland Rd</TableCell>
                      <TableCell>$425,000</TableCell>
                      <TableCell>$375,000</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Denied</Badge>
                      </TableCell>
                      <TableCell>3/08/2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AP2025-135</TableCell>
                      <TableCell>901 Industrial Way</TableCell>
                      <TableCell>$1,250,000</TableCell>
                      <TableCell>$1,050,000</TableCell>
                      <TableCell>
                        <Badge variant="success">Approved</Badge>
                      </TableCell>
                      <TableCell>3/01/2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AP2025-132</TableCell>
                      <TableCell>522 Main St</TableCell>
                      <TableCell>$725,000</TableCell>
                      <TableCell>$675,000</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Denied</Badge>
                      </TableCell>
                      <TableCell>2/25/2025</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AP2025-128</TableCell>
                      <TableCell>335 Orchard Way</TableCell>
                      <TableCell>$525,000</TableCell>
                      <TableCell>$475,000</TableCell>
                      <TableCell>
                        <Badge variant="success">Approved</Badge>
                      </TableCell>
                      <TableCell>2/18/2025</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  View All Appeals
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaxAssessmentDashboardPage;