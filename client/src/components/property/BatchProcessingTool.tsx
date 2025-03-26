import React, { useState, useEffect } from 'react';
import { 
  Filter,
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Building, 
  Database, 
  Download, 
  UploadCloud
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip';
import { Property } from '../../hooks/usePropertyData';

export interface BatchProcessingToolProps {
  properties: Property[];
  onPropertiesUpdated?: (updatedProperties: Property[]) => void;
}

type BatchOperation = 
  | 'applyInflation' 
  | 'adjustByNeighborhood' 
  | 'normalizeValues' 
  | 'fixOutliers'
  | 'updateTaxRates'
  | 'bulkReclassify';

interface BatchOperationConfig {
  id: BatchOperation;
  name: string;
  description: string;
  requiresConfirmation: boolean;
  icon: React.ReactNode;
  configOptions?: React.ReactNode;
}

interface BatchJob {
  id: string;
  operation: BatchOperation;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  affectedCount: number;
  totalCount: number;
  config: Record<string, any>;
  results?: {
    updated: Property[];
    errors?: string[];
  };
  startTime?: Date;
  endTime?: Date;
}

const BatchProcessingTool: React.FC<BatchProcessingToolProps> = ({
  properties,
  onPropertiesUpdated
}) => {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BatchOperation | null>(null);
  const [operationConfig, setOperationConfig] = useState<Record<string, any>>({});
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [activeJob, setActiveJob] = useState<BatchJob | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState('');
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  
  // Get unique neighborhoods and property types for filtering
  const neighborhoods = Array.from(new Set(properties.map(p => p.neighborhood).filter(Boolean) as string[]));
  const propertyTypes = Array.from(new Set(properties.map(p => p.propertyType).filter(Boolean) as string[]));
  
  // Filter properties based on search and filter criteria
  const filteredProperties = properties.filter(property => {
    // Text search
    const searchMatch = !propertyFilter || 
      property.address.toLowerCase().includes(propertyFilter.toLowerCase()) ||
      property.parcelNumber?.toLowerCase().includes(propertyFilter.toLowerCase()) ||
      property.id.toString().includes(propertyFilter);
    
    // Neighborhood filter
    const neighborhoodMatch = selectedNeighborhoods.length === 0 || 
      (property.neighborhood && selectedNeighborhoods.includes(property.neighborhood));
    
    // Property type filter
    const propertyTypeMatch = selectedPropertyTypes.length === 0 || 
      (property.propertyType && selectedPropertyTypes.includes(property.propertyType));
    
    return searchMatch && neighborhoodMatch && propertyTypeMatch;
  });
  
  // Toggle select all properties
  useEffect(() => {
    if (selectAll) {
      setSelectedProperties(filteredProperties);
    } else {
      setSelectedProperties([]);
    }
  }, [selectAll, filteredProperties]);
  
  // Reset operation config when operation changes
  useEffect(() => {
    setOperationConfig({});
  }, [selectedOperation]);
  
  // Define the available batch operations
  const batchOperations: BatchOperationConfig[] = [
    {
      id: 'applyInflation',
      name: 'Apply Inflation Adjustment',
      description: 'Apply a percentage increase/decrease to property values',
      requiresConfirmation: true,
      icon: <Building className="h-5 w-5" />,
      configOptions: (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="percentage">Adjustment Percentage</Label>
              <div className="flex items-center mt-1.5">
                <Input 
                  id="percentage"
                  type="number"
                  step="0.1"
                  value={operationConfig.percentage || ''}
                  onChange={(e) => setOperationConfig({
                    ...operationConfig,
                    percentage: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
                <span className="ml-2">%</span>
              </div>
            </div>
            <div>
              <Label htmlFor="roundTo">Round To Nearest</Label>
              <Select
                value={operationConfig.roundTo || '100'}
                onValueChange={(value) => setOperationConfig({
                  ...operationConfig,
                  roundTo: value
                })}
              >
                <SelectTrigger id="roundTo">
                  <SelectValue placeholder="Round to nearest..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">$1</SelectItem>
                  <SelectItem value="10">$10</SelectItem>
                  <SelectItem value="100">$100</SelectItem>
                  <SelectItem value="1000">$1,000</SelectItem>
                  <SelectItem value="10000">$10,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="applyToLandValue"
                checked={operationConfig.applyToLandValue || false}
                onCheckedChange={(checked) => setOperationConfig({
                  ...operationConfig,
                  applyToLandValue: checked === true
                })}
              />
              <Label htmlFor="applyToLandValue">Apply to Land Value</Label>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="applyToImprovementValue"
                checked={operationConfig.applyToImprovementValue || false}
                onCheckedChange={(checked) => setOperationConfig({
                  ...operationConfig,
                  applyToImprovementValue: checked === true
                })}
              />
              <Label htmlFor="applyToImprovementValue">Apply to Improvement Value</Label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'adjustByNeighborhood',
      name: 'Adjust Values by Neighborhood',
      description: 'Apply different adjustments based on neighborhood market trends',
      requiresConfirmation: true,
      icon: <Database className="h-5 w-5" />,
      configOptions: (
        <div className="space-y-4 py-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Neighborhood</TableHead>
                  <TableHead>Adjustment (%)</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {neighborhoods.map(neighborhood => {
                  // Generate a pseudo-random trend based on the neighborhood name
                  // This is just for demonstration; in production, would use real market data
                  const trendSeed = neighborhood.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const trend = ((trendSeed % 15) - 5) / 10; // Range from -0.5% to +1.0%
                  const adjustmentValue = operationConfig[`adjustment_${neighborhood}`] !== undefined 
                    ? operationConfig[`adjustment_${neighborhood}`]
                    : (trend * 100).toFixed(1);
                  
                  return (
                    <TableRow key={neighborhood}>
                      <TableCell>{neighborhood}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Input 
                            type="number" 
                            step="0.1"
                            value={adjustmentValue}
                            onChange={(e) => setOperationConfig({
                              ...operationConfig,
                              [`adjustment_${neighborhood}`]: e.target.value
                            })}
                            className="w-20"
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={trend >= 0 ? "default" : "destructive"}
                          className="font-normal"
                        >
                          {trend >= 0 ? '+' : ''}{(trend * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="pt-2 flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const newConfig = {...operationConfig};
                neighborhoods.forEach(neighborhood => {
                  const trendSeed = neighborhood.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const trend = ((trendSeed % 15) - 5) / 10;
                  newConfig[`adjustment_${neighborhood}`] = (trend * 100).toFixed(1);
                });
                setOperationConfig(newConfig);
              }}
            >
              Use Suggested Values
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const newConfig = {...operationConfig};
                neighborhoods.forEach(neighborhood => {
                  newConfig[`adjustment_${neighborhood}`] = "0.0";
                });
                setOperationConfig(newConfig);
              }}
            >
              Reset All
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'normalizeValues',
      name: 'Normalize Property Values',
      description: 'Adjust property values to consistent market value to assessment ratios',
      requiresConfirmation: true,
      icon: <CheckCircle className="h-5 w-5" />,
      configOptions: (
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="targetRatio">Target Assessment Ratio</Label>
            <div className="flex items-center mt-1.5">
              <Input 
                id="targetRatio"
                type="number"
                step="0.01"
                min="0.1"
                max="1.5"
                value={operationConfig.targetRatio || '0.90'}
                onChange={(e) => setOperationConfig({
                  ...operationConfig,
                  targetRatio: parseFloat(e.target.value)
                })}
                className="w-full"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p>The assessment ratio is the ratio of assessed value to market value. A ratio of 0.9 means properties are assessed at 90% of their market value.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div>
            <Label htmlFor="maxAdjustment">Maximum Adjustment (%)</Label>
            <div className="flex items-center mt-1.5">
              <Input 
                id="maxAdjustment"
                type="number"
                step="1"
                min="0"
                max="50"
                value={operationConfig.maxAdjustment || '20'}
                onChange={(e) => setOperationConfig({
                  ...operationConfig,
                  maxAdjustment: parseFloat(e.target.value)
                })}
                className="w-full"
              />
              <span className="ml-2">%</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="excludeOutliers"
              checked={operationConfig.excludeOutliers || false}
              onCheckedChange={(checked) => setOperationConfig({
                ...operationConfig,
                excludeOutliers: checked
              })}
            />
            <Label htmlFor="excludeOutliers">Exclude Statistical Outliers</Label>
          </div>
        </div>
      )
    },
    {
      id: 'fixOutliers',
      name: 'Fix Statistical Outliers',
      description: 'Identify and correct properties with values outside statistical norms',
      requiresConfirmation: true,
      icon: <AlertTriangle className="h-5 w-5" />,
      configOptions: (
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="detectionMethod">Detection Method</Label>
            <Select
              value={operationConfig.detectionMethod || 'zscore'}
              onValueChange={(value) => setOperationConfig({
                ...operationConfig,
                detectionMethod: value
              })}
            >
              <SelectTrigger id="detectionMethod">
                <SelectValue placeholder="Select detection method..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zscore">Z-Score</SelectItem>
                <SelectItem value="iqr">Interquartile Range (IQR)</SelectItem>
                <SelectItem value="percentile">Percentile Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="threshold">Detection Threshold</Label>
            <div className="flex items-center mt-1.5">
              <Input 
                id="threshold"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={operationConfig.threshold || '2.5'}
                onChange={(e) => setOperationConfig({
                  ...operationConfig,
                  threshold: parseFloat(e.target.value)
                })}
                className="w-full"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p>For Z-Score: Values above this standard deviation from the mean.</p>
                    <p>For IQR: Values more than this factor times the IQR from the quartiles.</p>
                    <p>For Percentile: Values outside this percentage from the median.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div>
            <Label htmlFor="fixMethod">Correction Method</Label>
            <Select
              value={operationConfig.fixMethod || 'median'}
              onValueChange={(value) => setOperationConfig({
                ...operationConfig,
                fixMethod: value
              })}
            >
              <SelectTrigger id="fixMethod">
                <SelectValue placeholder="Select correction method..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="median">Adjust to Median Value</SelectItem>
                <SelectItem value="capping">Cap at Threshold Value</SelectItem>
                <SelectItem value="winsorize">Winsorize (Limit Extreme Values)</SelectItem>
                <SelectItem value="comparable">Use Comparable Properties</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="groupByNeighborhood"
              checked={operationConfig.groupByNeighborhood || false}
              onCheckedChange={(checked) => setOperationConfig({
                ...operationConfig,
                groupByNeighborhood: checked
              })}
            />
            <Label htmlFor="groupByNeighborhood">Group Analysis by Neighborhood</Label>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="reviewBeforeFix"
              checked={operationConfig.reviewBeforeFix || false}
              onCheckedChange={(checked) => setOperationConfig({
                ...operationConfig,
                reviewBeforeFix: checked
              })}
            />
            <Label htmlFor="reviewBeforeFix">Review Outliers Before Fixing</Label>
          </div>
        </div>
      )
    },
    {
      id: 'updateTaxRates',
      name: 'Update Tax Rates',
      description: 'Update tax rates across selected properties',
      requiresConfirmation: true,
      icon: <FileText className="h-5 w-5" />,
      configOptions: (
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="newTaxRate">New Tax Rate (%)</Label>
            <div className="flex items-center mt-1.5">
              <Input 
                id="newTaxRate"
                type="number"
                step="0.001"
                min="0.001"
                max="10"
                value={operationConfig.newTaxRate || '0.953'}
                onChange={(e) => setOperationConfig({
                  ...operationConfig,
                  newTaxRate: parseFloat(e.target.value)
                })}
                className="w-full"
              />
              <span className="ml-2">%</span>
            </div>
          </div>
          {operationConfig.newTaxRate && (
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm font-medium">Tax Impact Preview</div>
              <div className="text-sm mt-1">
                For a $300,000 property:
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <div>Old Annual Tax:</div>
                  <div className="text-right">${Math.round(300000 * 0.01)}</div>
                  <div>New Annual Tax:</div>
                  <div className="text-right">${Math.round(300000 * operationConfig.newTaxRate / 100)}</div>
                  <Separator className="col-span-2 my-1" />
                  <div>Difference:</div>
                  <div className={`text-right ${operationConfig.newTaxRate > 1 ? 'text-red-500' : 'text-green-500'}`}>
                    ${Math.round(300000 * (operationConfig.newTaxRate - 1) / 100)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="effectiveNextYear"
              checked={operationConfig.effectiveNextYear || false}
              onCheckedChange={(checked) => setOperationConfig({
                ...operationConfig,
                effectiveNextYear: checked
              })}
            />
            <Label htmlFor="effectiveNextYear">Effective Next Tax Year</Label>
          </div>
        </div>
      )
    },
    {
      id: 'bulkReclassify',
      name: 'Bulk Reclassify Properties',
      description: 'Reclassify multiple properties at once',
      requiresConfirmation: true,
      icon: <Filter className="h-5 w-5" />,
      configOptions: (
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="newClassification">New Classification</Label>
            <Select
              value={operationConfig.newClassification || ''}
              onValueChange={(value) => setOperationConfig({
                ...operationConfig,
                newClassification: value
              })}
            >
              <SelectTrigger id="newClassification">
                <SelectValue placeholder="Select new classification..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Agricultural">Agricultural</SelectItem>
                <SelectItem value="Vacant Land">Vacant Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="reclassificationReason">Reason for Reclassification</Label>
            <Select
              value={operationConfig.reclassificationReason || ''}
              onValueChange={(value) => setOperationConfig({
                ...operationConfig,
                reclassificationReason: value
              })}
            >
              <SelectTrigger id="reclassificationReason">
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoning_change">Zoning Change</SelectItem>
                <SelectItem value="use_change">Change in Use</SelectItem>
                <SelectItem value="correction">Data Correction</SelectItem>
                <SelectItem value="development">New Development</SelectItem>
                <SelectItem value="special_designation">Special Designation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {operationConfig.newClassification && (
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm">
                <span className="font-medium">Impact:</span> Changing property type to {operationConfig.newClassification} may affect:
                <ul className="list-disc list-inside mt-1">
                  <li>Tax rates and exemptions</li>
                  <li>Assessment methodology</li>
                  <li>Reporting classifications</li>
                </ul>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="autoUpdateZoning"
              checked={operationConfig.autoUpdateZoning || false}
              onCheckedChange={(checked) => setOperationConfig({
                ...operationConfig,
                autoUpdateZoning: checked
              })}
            />
            <Label htmlFor="autoUpdateZoning">Auto-update Zoning</Label>
          </div>
        </div>
      )
    }
  ];
  
  // Check if the selected operation is valid
  const selectedOperationConfig = selectedOperation 
    ? batchOperations.find(op => op.id === selectedOperation) 
    : null;
  
  // Handle property selection toggle
  const togglePropertySelection = (property: Property) => {
    if (selectedProperties.find(p => p.id === property.id)) {
      setSelectedProperties(selectedProperties.filter(p => p.id !== property.id));
    } else {
      setSelectedProperties([...selectedProperties, property]);
    }
  };
  
  // Handle neighborhood filter toggle
  const toggleNeighborhoodFilter = (neighborhood: string) => {
    if (selectedNeighborhoods.includes(neighborhood)) {
      setSelectedNeighborhoods(selectedNeighborhoods.filter(n => n !== neighborhood));
    } else {
      setSelectedNeighborhoods([...selectedNeighborhoods, neighborhood]);
    }
  };
  
  // Handle property type filter toggle
  const togglePropertyTypeFilter = (propertyType: string) => {
    if (selectedPropertyTypes.includes(propertyType)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== propertyType));
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, propertyType]);
    }
  };
  
  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Create a new batch job with the selected operation and properties
  const createBatchJob = () => {
    if (!selectedOperation || selectedProperties.length === 0) return;
    
    const newJob: BatchJob = {
      id: `job-${Date.now()}`,
      operation: selectedOperation,
      status: 'pending',
      progress: 0,
      affectedCount: 0,
      totalCount: selectedProperties.length,
      config: {...operationConfig},
      startTime: new Date()
    };
    
    setJobs([...jobs, newJob]);
    setActiveJob(newJob);
    setConfirmDialogOpen(false);
    
    // Start the job
    runBatchJob(newJob);
  };
  
  // Simulate running a batch job
  const runBatchJob = (job: BatchJob) => {
    const updatedJob: BatchJob = {...job, status: 'running'};
    updateJob(updatedJob);
    
    // In a real implementation, this would call an API endpoint
    // For demo purposes, we'll simulate progress with a timer
    
    const progressInterval = setInterval(() => {
      // Update job progress
      updateJob(currentJob => {
        if (currentJob.id !== job.id) return currentJob;
        
        const newProgress = Math.min(100, currentJob.progress + Math.random() * 10);
        const isComplete = newProgress >= 100;
        
        // Simulate errors in 5% of jobs
        const hasError = isComplete && Math.random() < 0.05;
        
        if (isComplete) {
          clearInterval(progressInterval);
          
          // If job completed, create updated properties
          if (!hasError) {
            const updatedProperties = simulatePropertyUpdates(
              selectedProperties, 
              job.operation, 
              job.config
            );
            
            // Notify parent of updated properties
            if (onPropertiesUpdated) {
              onPropertiesUpdated(updatedProperties);
            }
            
            return {
              ...currentJob,
              progress: 100,
              status: 'completed',
              affectedCount: updatedProperties.length,
              endTime: new Date(),
              results: {
                updated: updatedProperties
              }
            };
          }
          
          // If job failed
          return {
            ...currentJob,
            progress: Math.floor(newProgress),
            status: 'failed',
            endTime: new Date(),
            results: {
              updated: [],
              errors: ['Operation failed due to server error. Please try again.']
            }
          };
        }
        
        // If job is still running
        return {
          ...currentJob,
          progress: Math.floor(newProgress),
          affectedCount: Math.floor((newProgress / 100) * currentJob.totalCount)
        };
      });
    }, 200);
  };
  
  // Simulate property updates based on operation type
  const simulatePropertyUpdates = (
    properties: Property[], 
    operation: BatchOperation, 
    config: Record<string, any>
  ): Property[] => {
    // This is a simplified simulation. In production, this would be handled by the server.
    return properties.map(property => {
      const updatedProperty = {...property};
      
      switch (operation) {
        case 'applyInflation':
          if (property.price) {
            const percentage = config.percentage || 0;
            const roundTo = parseInt(config.roundTo || '100');
            const newPrice = property.price * (1 + percentage / 100);
            updatedProperty.price = Math.round(newPrice / roundTo) * roundTo;
          }
          
          if (config.applyToLandValue && property.landValue) {
            const percentage = config.percentage || 0;
            const roundTo = parseInt(config.roundTo || '100');
            const newValue = property.landValue * (1 + percentage / 100);
            updatedProperty.landValue = Math.round(newValue / roundTo) * roundTo;
          }
          
          if (config.applyToImprovementValue && property.improvementValue) {
            const percentage = config.percentage || 0;
            const roundTo = parseInt(config.roundTo || '100');
            const newValue = property.improvementValue * (1 + percentage / 100);
            updatedProperty.improvementValue = Math.round(newValue / roundTo) * roundTo;
          }
          break;
          
        case 'adjustByNeighborhood':
          if (property.price && property.neighborhood) {
            const adjustment = parseFloat(config[`adjustment_${property.neighborhood}`] || '0');
            updatedProperty.price = Math.round(property.price * (1 + adjustment / 100));
          }
          break;
          
        case 'normalizeValues':
          if (property.price) {
            const targetRatio = config.targetRatio || 0.9;
            const maxAdjustment = config.maxAdjustment || 20;
            
            // Simulate some randomness in current ratio
            const currentRatio = property.assessmentRatio || (0.85 + Math.random() * 0.3);
            
            // Calculate adjustment needed
            const adjustmentNeeded = (targetRatio / currentRatio) - 1;
            
            // Cap adjustment at max
            const cappedAdjustment = Math.max(
              Math.min(adjustmentNeeded, maxAdjustment / 100),
              -maxAdjustment / 100
            );
            
            // Apply adjustment
            updatedProperty.price = Math.round(property.price * (1 + cappedAdjustment));
            updatedProperty.assessmentRatio = targetRatio;
          }
          break;
          
        case 'fixOutliers':
          // This would involve complex statistical analysis
          // For demo purposes, we'll just make a small random adjustment to some properties
          if (property.price && Math.random() < 0.3) {
            // Apply a small correction (±5%)
            const correction = (Math.random() * 10 - 5) / 100;
            updatedProperty.price = Math.round(property.price * (1 + correction));
          }
          break;
          
        case 'updateTaxRates':
          // Update tax rate
          updatedProperty.taxRate = config.newTaxRate / 100;
          break;
          
        case 'bulkReclassify':
          // Update property type
          updatedProperty.propertyType = config.newClassification;
          
          // Update zoning if enabled
          if (config.autoUpdateZoning) {
            switch (config.newClassification) {
              case 'Residential':
                updatedProperty.zoning = 'R1';
                break;
              case 'Commercial':
                updatedProperty.zoning = 'C2';
                break;
              case 'Industrial':
                updatedProperty.zoning = 'I1';
                break;
              case 'Agricultural':
                updatedProperty.zoning = 'A1';
                break;
              case 'Vacant Land':
                updatedProperty.zoning = 'UL';
                break;
            }
          }
          break;
      }
      
      return updatedProperty;
    });
  };
  
  // Update a job in the jobs array
  const updateJob = (updater: BatchJob | ((job: BatchJob) => BatchJob)) => {
    setJobs(currentJobs => 
      currentJobs.map(job => {
        if (typeof updater === 'function') {
          return job.id === activeJob?.id ? updater(job) : job;
        }
        return job.id === updater.id ? updater : job;
      })
    );
    
    if (typeof updater !== 'function' && updater.id === activeJob?.id) {
      setActiveJob(updater);
    } else if (typeof updater === 'function' && activeJob) {
      setActiveJob(updater(activeJob));
    }
  };
  
  // Reset all selections and configs
  const resetSelections = () => {
    setSelectedProperties([]);
    setSelectAll(false);
    setSelectedOperation(null);
    setOperationConfig({});
    setActiveJob(null);
    setConfirmDialogOpen(false);
  };
  
  // Get status badge variant based on job status
  const getStatusBadgeVariant = (status: BatchJob['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'running': return 'default';
      case 'completed': return 'success';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Batch Processing Tool
          </CardTitle>
          <CardDescription>
            Process multiple properties simultaneously with AI-assisted intelligence
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Property Selection */}
            <div className="md:col-span-2">
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Property Selection</h3>
                  <Badge variant="outline">
                    {selectedProperties.length} of {filteredProperties.length} selected
                  </Badge>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1">
                    <Input 
                      placeholder="Search properties..." 
                      value={propertyFilter}
                      onChange={(e) => setPropertyFilter(e.target.value)}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex-shrink-0">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <div className="p-2">
                        <h4 className="font-medium mb-1">Neighborhoods</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {neighborhoods.map(neighborhood => (
                            <div key={neighborhood} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`neighborhood-${neighborhood}`}
                                checked={selectedNeighborhoods.includes(neighborhood)}
                                onCheckedChange={() => toggleNeighborhoodFilter(neighborhood)}
                              />
                              <Label 
                                htmlFor={`neighborhood-${neighborhood}`}
                                className="text-sm cursor-pointer"
                              >
                                {neighborhood}
                              </Label>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <h4 className="font-medium mb-1">Property Types</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {propertyTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`type-${type}`}
                                checked={selectedPropertyTypes.includes(type)}
                                onCheckedChange={() => togglePropertyTypeFilter(type)}
                              />
                              <Label 
                                htmlFor={`type-${type}`}
                                className="text-sm cursor-pointer"
                              >
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectAll} 
                          onCheckedChange={setSelectAll}
                          aria-label="Select all properties"
                        />
                      </TableHead>
                      <TableHead>Address / Parcel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Neighborhood</TableHead>
                      <TableHead className="text-right">Assessed Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <FileText className="h-8 w-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                          <p className="text-muted-foreground">No properties found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <ScrollArea className="h-[300px]">
                        {filteredProperties.map((property) => (
                          <TableRow key={property.id} className="group">
                            <TableCell>
                              <Checkbox 
                                checked={selectedProperties.some(p => p.id === property.id)}
                                onCheckedChange={() => togglePropertySelection(property)}
                                aria-label={`Select ${property.address}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{property.address}</div>
                              <div className="text-xs text-muted-foreground">
                                Parcel: {property.parcelNumber}
                              </div>
                            </TableCell>
                            <TableCell>{property.propertyType}</TableCell>
                            <TableCell>{property.neighborhood}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(property.price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </ScrollArea>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Operation Selection */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium">Select Operation</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an operation to perform on the selected properties
                </p>
              </div>
              
              <div className="space-y-2">
                {batchOperations.map((operation) => (
                  <div
                    key={operation.id}
                    className={`border rounded-md p-3 cursor-pointer transition-colors ${
                      selectedOperation === operation.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedOperation(operation.id)}
                  >
                    <div className="flex items-center">
                      <div className={`mr-3 ${selectedOperation === operation.id ? 'text-primary' : 'text-muted-foreground'}`}>
                        {operation.icon}
                      </div>
                      <div>
                        <div className="font-medium">{operation.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {operation.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={resetSelections}
          >
            Reset
          </Button>
          
          <Button 
            disabled={!selectedOperation || selectedProperties.length === 0}
            onClick={() => setConfirmDialogOpen(true)}
          >
            Process {selectedProperties.length} Properties
          </Button>
        </CardFooter>
      </Card>
      
      {/* Operation Configuration & Execution */}
      {selectedOperationConfig && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {selectedOperationConfig.icon && (
                    <span className="mr-2">{selectedOperationConfig.icon}</span>
                  )}
                  {selectedOperationConfig.name}
                </CardTitle>
                <CardDescription>
                  {selectedOperationConfig.description}
                </CardDescription>
              </div>
              
              <Badge variant="outline">
                {selectedProperties.length} properties selected
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {selectedOperationConfig.configOptions}
          </CardContent>
          
          <CardFooter className="flex justify-end border-t pt-6">
            <Button 
              disabled={selectedProperties.length === 0}
              onClick={() => setConfirmDialogOpen(true)}
            >
              Process {selectedProperties.length} Properties
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Recent Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Batch Jobs</CardTitle>
            <CardDescription>
              History of batch operations performed on properties
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {jobs.map((job, index) => (
                <AccordionItem key={job.id} value={job.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 items-center">
                      <div className="mr-4">
                        {job.status === 'running' ? (
                          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                        ) : job.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : job.status === 'failed' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {batchOperations.find(op => op.id === job.operation)?.name || job.operation}
                          </span>
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {job.startTime && (
                            <span>
                              Started: {job.startTime.toLocaleTimeString()} · 
                              {job.status === 'running' 
                                ? ` ${job.affectedCount} of ${job.totalCount} processed`
                                : job.status === 'completed'
                                ? ` ${job.affectedCount} properties updated`
                                : job.status === 'failed'
                                ? ' Operation failed'
                                : ' Pending'
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="pt-2 space-y-4">
                      {job.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Progress: {job.progress}%</span>
                            <span>{job.affectedCount} of {job.totalCount} properties</span>
                          </div>
                          <Progress value={job.progress} />
                        </div>
                      )}
                      
                      {job.status === 'completed' && job.results?.updated && (
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Successfully updated {job.results.updated.length} properties
                          </div>
                          
                          <div className="flex justify-between">
                            <div>
                              <div className="text-sm font-medium">Operation Config</div>
                              <pre className="text-xs bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                                {JSON.stringify(job.config, null, 2)}
                              </pre>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export Results
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {job.status === 'failed' && job.results?.errors && (
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-red-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Operation failed
                          </div>
                          
                          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3">
                            <div className="font-medium">Error Details</div>
                            <ul className="mt-1 pl-5 list-disc">
                              {job.results.errors.map((error, i) => (
                                <li key={i} className="text-sm">{error}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <Button variant="outline" size="sm">
                            Retry Operation
                          </Button>
                        </div>
                      )}
                      
                      {job.endTime && (
                        <div className="text-xs text-muted-foreground">
                          Completed: {job.endTime.toLocaleTimeString()} · 
                          Duration: {Math.round((job.endTime.getTime() - job.startTime!.getTime()) / 1000)}s
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Batch Operation</DialogTitle>
            <DialogDescription>
              You are about to apply <strong>{selectedOperationConfig?.name}</strong> to {selectedProperties.length} properties.
              This operation will modify property data and cannot be automatically undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="confirmBackup" />
              <Label htmlFor="confirmBackup">I have a backup of property data</Label>
            </div>
            
            <div className="bg-amber-50 text-amber-800 rounded-md p-3 text-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Warning:</span> This operation will modify property data.
                  Make sure you have reviewed your selection and configuration.
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={createBatchJob}>Proceed with Batch Operation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchProcessingTool;