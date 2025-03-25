import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calculator, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaxRate {
  district: string;
  rate: number;
  description?: string;
}

interface TaxCalculatorProps {
  defaultAssessedValue?: number;
  defaultDistrict?: string;
  defaultClassification?: string;
}

export const TaxCalculatorWidget: React.FC<TaxCalculatorProps> = ({
  defaultAssessedValue = 425000,
  defaultDistrict = 'grandview',
  defaultClassification = 'residential'
}) => {
  const [assessedValue, setAssessedValue] = useState(defaultAssessedValue);
  const [district, setDistrict] = useState(defaultDistrict);
  const [classification, setClassification] = useState(defaultClassification);
  const [calculatedTaxes, setCalculatedTaxes] = useState<Record<string, number>>({});
  const [totalTax, setTotalTax] = useState(0);
  const [breakdownVisible, setBreakdownVisible] = useState(true);

  // Tax rates by district (millage rates)
  const taxRates: Record<string, TaxRate[]> = {
    grandview: [
      { district: 'County', rate: 6.00, description: 'Yakima County general operations' },
      { district: 'City', rate: 3.00, description: 'Grandview city services' },
      { district: 'School', rate: 5.00, description: 'Grandview School District #200' },
      { district: 'Hospital', rate: 0.75, description: 'Regional hospital district' },
      { district: 'Library', rate: 0.50, description: 'Yakima Library System' },
      { district: 'Fire', rate: 0.75, description: 'Grandview Fire District' }
    ],
    sunnyside: [
      { district: 'County', rate: 6.00, description: 'Yakima County general operations' },
      { district: 'City', rate: 3.25, description: 'Sunnyside city services' },
      { district: 'School', rate: 4.75, description: 'Sunnyside School District' },
      { district: 'Hospital', rate: 0.75, description: 'Regional hospital district' },
      { district: 'Library', rate: 0.50, description: 'Yakima Library System' },
      { district: 'Fire', rate: 0.80, description: 'Sunnyside Fire District' }
    ],
    toppenish: [
      { district: 'County', rate: 6.00, description: 'Yakima County general operations' },
      { district: 'City', rate: 2.85, description: 'Toppenish city services' },
      { district: 'School', rate: 4.90, description: 'Toppenish School District' },
      { district: 'Hospital', rate: 0.75, description: 'Regional hospital district' },
      { district: 'Library', rate: 0.50, description: 'Yakima Library System' },
      { district: 'Fire', rate: 0.70, description: 'Toppenish Fire District' }
    ],
    yakima: [
      { district: 'County', rate: 6.00, description: 'Yakima County general operations' },
      { district: 'Rural', rate: 1.50, description: 'Rural services' },
      { district: 'School', rate: 4.50, description: 'County School District' },
      { district: 'Hospital', rate: 0.75, description: 'Regional hospital district' },
      { district: 'Library', rate: 0.50, description: 'Yakima Library System' },
      { district: 'Fire', rate: 0.85, description: 'Rural Fire District' }
    ]
  };

  // Property classification modifiers
  const classificationModifiers: Record<string, number> = {
    residential: 1.0,
    commercial: 1.25,
    agricultural: 0.75,
    industrial: 1.35
  };

  // Calculate taxes when inputs change
  useEffect(() => {
    calculateTaxes();
  }, [assessedValue, district, classification]);

  const calculateTaxes = () => {
    const currentRates = taxRates[district] || [];
    const modifier = classificationModifiers[classification] || 1.0;
    
    const taxesByDistrict: Record<string, number> = {};
    let total = 0;
    
    currentRates.forEach(taxRate => {
      // Calculate tax: (assessed value / 1000) * millage rate * classification modifier
      const tax = (assessedValue / 1000) * taxRate.rate * modifier;
      taxesByDistrict[taxRate.district] = tax;
      total += tax;
    });
    
    setCalculatedTaxes(taxesByDistrict);
    setTotalTax(total);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="shadow-md w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary" />
            Property Tax Calculator
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {new Date().getFullYear()} Rates
          </Badge>
        </div>
        <CardDescription>
          Calculate estimated property taxes based on assessed value and jurisdiction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Assessed Value Input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="assessed-value">Property Assessed Value</Label>
              <span className="text-sm font-medium">{formatCurrency(assessedValue)}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Slider
                id="assessed-value"
                min={100000}
                max={2000000}
                step={5000}
                value={[assessedValue]}
                onValueChange={(value) => setAssessedValue(value[0])}
              />
              <div className="w-24">
                <Input
                  type="number"
                  value={assessedValue}
                  onChange={(e) => setAssessedValue(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Tax District Selection */}
          <div className="space-y-2">
            <Label htmlFor="tax-district">Tax District</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger id="tax-district">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grandview">Grandview City</SelectItem>
                <SelectItem value="sunnyside">Sunnyside</SelectItem>
                <SelectItem value="toppenish">Toppenish</SelectItem>
                <SelectItem value="yakima">Yakima County (Unincorporated)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Property Classification */}
          <div className="space-y-2">
            <Label htmlFor="property-class">Property Classification</Label>
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger id="property-class">
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Results */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Estimated Tax Breakdown</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBreakdownVisible(!breakdownVisible)}
              >
                {breakdownVisible ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            
            {breakdownVisible && (
              <div className="space-y-3 mb-4">
                {Object.entries(calculatedTaxes).map(([district, amount]) => (
                  <div key={district} className="flex justify-between items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm flex items-center">
                            {district}
                            <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{taxRates[district]?.find(r => r.district === district)?.description || district}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
                
                {/* Tax distribution visualization */}
                <div className="h-4 w-full flex rounded-full overflow-hidden mt-2">
                  {Object.entries(calculatedTaxes).map(([district, amount], index) => {
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-indigo-500'
                    ];
                    const percentage = (amount / totalTax) * 100;
                    return (
                      <div
                        key={district}
                        className={`${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    );
                  })}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(calculatedTaxes).map(([district, amount], index) => {
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-indigo-500'
                    ];
                    const percentage = (amount / totalTax) * 100;
                    return (
                      <div key={district} className="flex items-center text-xs">
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${colors[index % colors.length]}`}
                        ></div>
                        <span>{district}: {percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total Estimated Annual Tax</span>
              <span className="text-lg">{formatCurrency(totalTax)}</span>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Effective Tax Rate: {((totalTax / assessedValue) * 100).toFixed(3)}%
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        Note: This calculator provides estimates only. Actual tax amounts may vary based on 
        exemptions, special assessments, and other factors. Contact your county assessor for exact figures.
      </CardFooter>
    </Card>
  );
};