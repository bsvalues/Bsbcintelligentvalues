/**
 * App Component - BS Values Tax Assessment SaaS
 * 
 * Main application component with routing configuration
 */
import { Route, Switch } from 'wouter';
import { Suspense, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import Footer from './components/layout/Footer';
import { Building2, Search, BarChart4, Home, Map, FileText, Settings, HelpCircle, Bell, AlertCircle, PieChart, TrendingUp, Server } from 'lucide-react';
import ToastTest from './components/common/ToastTest';

// Import our microservices test page
import { MicroservicesTestPage } from './pages/MicroservicesTestPage';

// Simple mock of QueryClient until we properly configure it
const queryClient = {
  setDefaultOptions: () => {},
  isFetching: 0,
  isMutating: 0,
  // Mock the necessary methods and properties
  mount: () => {},
  unmount: () => {},
  getQueryCache: () => ({}),
  getMutationCache: () => ({}),
  getDefaultOptions: () => ({}),
} as any; // Type assertion to avoid TypeScript errors

// Simple LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// NavBar component with dropdown menus
const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <span className="text-xl font-bold">BS Values</span>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-6">
            <NavLink href="/" icon={<Home className="h-4 w-4" />} label="Home" />
            <NavLink href="/tax-assessment-dashboard" icon={<Building2 className="h-4 w-4" />} label="Assessment" />
            <NavLink href="/property-search" icon={<Search className="h-4 w-4" />} label="Search" />
            <NavLink href="/market-analysis" icon={<BarChart4 className="h-4 w-4" />} label="Market" />
            <NavLink href="/map" icon={<Map className="h-4 w-4" />} label="Map" />
            <NavLink href="/reports" icon={<FileText className="h-4 w-4" />} label="Reports" />
          </div>
          
          {/* User section */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-slate-700">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-700">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-700">
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Mobile menu toggle */}
            <button 
              className="md:hidden p-2 rounded-md hover:bg-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-700">
            <div className="flex flex-col space-y-3">
              <MobileNavLink href="/" icon={<Home className="h-5 w-5" />} label="Home" />
              <MobileNavLink href="/tax-assessment-dashboard" icon={<Building2 className="h-5 w-5" />} label="Assessment Dashboard" />
              <MobileNavLink href="/property-search" icon={<Search className="h-5 w-5" />} label="Property Search" />
              <MobileNavLink href="/market-analysis" icon={<BarChart4 className="h-5 w-5" />} label="Market Analysis" />
              <MobileNavLink href="/map" icon={<Map className="h-5 w-5" />} label="Map View" />
              <MobileNavLink href="/reports" icon={<FileText className="h-5 w-5" />} label="Reports" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// NavLink component for desktop nav
const NavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a 
    href={href} 
    className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </a>
);

// NavLink component for mobile nav
const MobileNavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a 
    href={href} 
    className="flex items-center space-x-3 px-3 py-3 rounded-md hover:bg-slate-700 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </a>
);

// Page components directly in this file
const HomePage = () => {
  // Use import statement at the top of the file instead of require
  return (
    <div className="container mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4">BS Values - Tax Assessment Platform</h1>
        <p className="text-lg text-gray-600">Welcome to the county's comprehensive tax assessment system</p>
      </header>
      
      {/* Toast Test Component */}
      <div className="mb-8">
        <ToastTest />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <DashboardCard 
          icon={<Building2 className="h-8 w-8 text-blue-500" />}
          title="Property Assessment"
          description="Manage and review property valuations with advanced tools."
          linkText="Open Assessment Dashboard"
          linkHref="/tax-assessment-dashboard"
        />
        <DashboardCard 
          icon={<BarChart4 className="h-8 w-8 text-green-500" />}
          title="Market Analysis"
          description="Analyze real estate market trends and comparable properties."
          linkText="View Market Data"
          linkHref="/market-analysis"
        />
        <DashboardCard 
          icon={<FileText className="h-8 w-8 text-purple-500" />}
          title="Reports & Analytics"
          description="Generate custom reports and data exports for your county."
          linkText="Access Reports"
          linkHref="/reports"
        />
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-xl font-semibold mb-3 text-blue-800">Quick Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatusCard label="Properties" value="24,521" change="+12" />
          <StatusCard label="Assessments" value="22,830" change="+65" />
          <StatusCard label="Appeals" value="142" change="-8" />
          <StatusCard label="Valuation Total" value="$4.2B" change="+5.2%" />
        </div>
      </div>
    </div>
  );
};

// Dashboard card for homepage
const DashboardCard = ({ 
  icon, 
  title, 
  description, 
  linkText, 
  linkHref 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  linkText: string; 
  linkHref: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
    <div className="mb-4">{icon}</div>
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <p className="text-gray-600 mb-4">{description}</p>
    <a 
      href={linkHref} 
      className="inline-flex items-center text-blue-600 hover:text-blue-800"
    >
      {linkText}
      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </a>
  </div>
);

// Status card for dashboard
const StatusCard = ({ label, value, change }: { label: string; value: string; change: string }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </div>
    </div>
  );
};

// Import Tax Assessment Dashboard Page
import TaxAssessmentDashboardPage from './pages/TaxAssessmentDashboardPage';

// Helper component for statistics
const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

// Property Search Page
const PropertySearchPage = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Property Search</h1>
    <p className="text-gray-600 mb-8">Search for properties in the county database.</p>
    
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <input 
            type="text" 
            placeholder="Search by address, owner name, or parcel ID..." 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
            Search
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-500 mb-2">Advanced Filters</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="agricultural">Agricultural</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value Range</label>
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Min" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
              <span>-</span>
              <input 
                type="text" 
                placeholder="Max" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Status</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Statuses</option>
              <option value="complete">Complete</option>
              <option value="pending">Pending</option>
              <option value="appealed">Appealed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Assessment Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            />
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Search Results</h2>
        <div className="text-sm text-gray-500">Showing 3 results</div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessed Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">PR-10542</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">123 Main St, Grandview, WA</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">John Smith</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Residential</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$320,500</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Mar 20, 2025</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <a href="#" className="text-blue-600 hover:text-blue-800 mr-3">View</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Edit</a>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">PR-10543</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">456 Oak Ave, Grandview, WA</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Jane Doe</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Residential</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$455,000</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Mar 21, 2025</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <a href="#" className="text-blue-600 hover:text-blue-800 mr-3">View</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Edit</a>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">PR-10544</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">789 Elm St, Grandview, WA</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Robert Johnson</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Commercial</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$275,200</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Mar 22, 2025</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <a href="#" className="text-blue-600 hover:text-blue-800 mr-3">View</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Edit</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <div className="text-sm text-gray-700">
            Page 1 of 1
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Market Analysis Page
const MarketAnalysisPage = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Market Analysis</h1>
    <p className="text-gray-600 mb-8">Analyze real estate market trends and data for the county.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Average Property Value</h2>
        <div className="text-3xl font-bold text-blue-600 mb-1">$342,800</div>
        <div className="text-sm text-green-600">+5.2% from last year</div>
        <div className="mt-4 h-32 bg-gray-100 rounded">
          [Chart Placeholder]
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Sales Volume</h2>
        <div className="text-3xl font-bold text-blue-600 mb-1">1,245</div>
        <div className="text-sm text-red-600">-2.3% from last year</div>
        <div className="mt-4 h-32 bg-gray-100 rounded">
          [Chart Placeholder]
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Days on Market</h2>
        <div className="text-3xl font-bold text-blue-600 mb-1">28</div>
        <div className="text-sm text-green-600">-12 days from last year</div>
        <div className="mt-4 h-32 bg-gray-100 rounded">
          [Chart Placeholder]
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Property Value Trends (5 Years)</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            [Property Value Trend Chart]
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Market Activity by Neighborhood</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neighborhood</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">YoY Change</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. DOM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Downtown</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$425,210</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">+6.8%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">86</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">24</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Westside</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$385,500</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">+4.2%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">124</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">32</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Eastside</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$318,750</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">+3.5%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">95</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">29</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Northridge</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">$540,200</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">+7.2%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">64</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">22</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Market Indicators</h2>
          <div className="space-y-4">
            <MarketIndicator label="Median Sale Price" value="$345,000" change="+5.4%" />
            <MarketIndicator label="Price Per Sq Ft" value="$185" change="+3.2%" />
            <MarketIndicator label="Inventory" value="342 listings" change="-8.5%" />
            <MarketIndicator label="New Listings" value="125" change="+12.4%" />
            <MarketIndicator label="Closed Sales" value="86" change="-2.3%" />
            <MarketIndicator label="Months Supply" value="2.4" change="-0.8" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Property Type Distribution</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center mb-4">
            [Property Type Chart]
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Residential</span>
              <span className="font-medium">76%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commercial</span>
              <span className="font-medium">12%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Agricultural</span>
              <span className="font-medium">8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Industrial</span>
              <span className="font-medium">4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Market indicator component
const MarketIndicator = ({ label, value, change }: { label: string; value: string; change: string }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
      <span className="text-gray-600">{label}</span>
      <div className="text-right">
        <div className="font-medium">{value}</div>
        <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </div>
      </div>
    </div>
  );
};

// Not Found Page
const NotFoundPage = () => (
  <div className="container mx-auto p-8 text-center">
    <div className="max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-6">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a 
        href="/" 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
      >
        Return to Home
      </a>
    </div>
  </div>
);

/**
 * Main App component
 * Sets up the routing and base layout structure for the application
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <NavBar />
          <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner />}>
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/tax-assessment-dashboard" component={TaxAssessmentDashboardPage} />
                <Route path="/property-search" component={PropertySearchPage} />
                <Route path="/market-analysis" component={MarketAnalysisPage} />
                <Route path="/map" component={() => (
                  <div className="container mx-auto p-8">
                    <h1 className="text-3xl font-bold mb-6">Property Map</h1>
                    <p className="text-gray-600 mb-8">Interactive map of all properties in the county.</p>
                    <div className="bg-white h-96 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Interactive property map will be displayed here</p>
                      </div>
                    </div>
                  </div>
                )} />
                <Route path="/reports" component={() => (
                  <div className="container mx-auto p-8">
                    <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
                    <p className="text-gray-600 mb-8">Generate custom reports and analytics for your county.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ReportCard 
                        title="Assessment Summary" 
                        description="Overview of all property assessments with totals and averages"
                        icon={<FileText className="h-8 w-8 text-blue-500" />}
                      />
                      <ReportCard 
                        title="Neighborhood Analysis" 
                        description="Compare property values across different neighborhoods"
                        icon={<BarChart4 className="h-8 w-8 text-green-500" />}
                      />
                      <ReportCard 
                        title="Appeals Report" 
                        description="Summary of all active appeals and their current status"
                        icon={<AlertCircle className="h-8 w-8 text-orange-500" />}
                      />
                      <ReportCard 
                        title="Tax Revenue Forecast" 
                        description="Projected tax revenue based on current assessments"
                        icon={<TrendingUp className="h-8 w-8 text-purple-500" />}
                      />
                      <ReportCard 
                        title="Property Type Distribution" 
                        description="Breakdown of properties by type across the county"
                        icon={<PieChart className="h-8 w-8 text-indigo-500" />}
                      />
                      <ReportCard 
                        title="Custom Report" 
                        description="Create a custom report with specific parameters"
                        icon={<Settings className="h-8 w-8 text-gray-500" />}
                      />
                    </div>
                  </div>
                )} />
                <Route component={NotFoundPage} />
              </Switch>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster />
      </ToastProvider>
    </QueryClientProvider>
  );
};

// Report card component for the reports page
const ReportCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
      Generate Report
      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
);

// Use the imported icons from lucide-react
const MapIcon = Map;

export default App;