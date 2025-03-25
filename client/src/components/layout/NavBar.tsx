import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Building, 
  BarChart2, 
  TrendingUp, 
  Map, 
  Calculator, 
  FileText, 
  Menu,
  X,
  Home,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-card shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-xl">BS Values</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2 items-center">
              <Link href="/">
                <div className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${isActive('/') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </div>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/valuation') || isActive('/property-valuation-demo') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>Property</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Property Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/valuation">
                      <div className="w-full cursor-pointer">Valuation</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/property-valuation-demo">
                      <div className="w-full cursor-pointer">Valuation Demo</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/property-enrichment">
                      <div className="w-full cursor-pointer">Enrichment</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/property-comparison">
                      <div className="w-full cursor-pointer">Comparison</div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/market-trends') || isActive('/market-heat-map') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                    <div className="flex items-center gap-1">
                      <BarChart2 className="h-4 w-4" />
                      <span>Market</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Market Analysis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/market-trends">
                      <div className="w-full cursor-pointer">Market Trends</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/market-heat-map">
                      <div className="w-full cursor-pointer">Heat Map</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/property-trend-visualizer">
                      <div className="w-full cursor-pointer">Trend Visualizer</div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/tax-assessment-dashboard') || isActive('/mass-appraisal') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                    <div className="flex items-center gap-1">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Assessments</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Assessment Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/tax-assessment-dashboard">
                      <div className="w-full cursor-pointer">Tax Assessment Dashboard</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mass-appraisal">
                      <div className="w-full cursor-pointer">Mass Appraisal</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/valuation-assistant">
                      <div className="w-full cursor-pointer">Valuation Assistant</div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-primary/10 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive('/') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </div>
              </div>
            </Link>
            
            <div className="border-t border-muted my-2"></div>
            <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">Property</div>
            
            <Link href="/valuation">
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive('/valuation') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>Valuation</span>
                </div>
              </div>
            </Link>
            
            <Link href="/property-valuation-demo">
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive('/property-valuation-demo') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <span>Valuation Demo</span>
                </div>
              </div>
            </Link>
            
            <div className="border-t border-muted my-2"></div>
            <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">Market</div>
            
            <Link href="/market-trends">
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive('/market-trends') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Market Trends</span>
                </div>
              </div>
            </Link>
            
            <Link href="/market-heat-map">
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive('/market-heat-map') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  <span>Heat Map</span>
                </div>
              </div>
            </Link>
            
            <div className="border-t border-muted my-2"></div>
            <div className="px-3 py-1 text-sm font-semibold text-muted-foreground">Assessment</div>
            
            <Link href="/tax-assessment-dashboard">
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive('/tax-assessment-dashboard') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Tax Assessment Dashboard</span>
                </div>
              </div>
            </Link>
            
            <Link href="/mass-appraisal">
              <div className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${isActive('/mass-appraisal') ? 'bg-primary text-white' : 'text-foreground hover:bg-primary/10'}`}>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Mass Appraisal</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};