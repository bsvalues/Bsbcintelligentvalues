import React, { useState, useEffect } from 'react';
import { 
  Check, 
  AlertTriangle, 
  Info, 
  X, 
  FileDown, 
  Loader2, 
  Database, 
  RefreshCcw, 
  SlidersHorizontal,
  Filter,
  ClipboardCheck
} from 'lucide-react';
import { Property } from '../../types/property';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { 
  propertyValidator, 
  batchProcessor, 
  ValidationResult, 
  ValidationSeverity 
} from '../../services/data-validation.service';

export interface BatchProcessingToolProps {
  properties: Property[];
  onPropertiesUpdated?: (updatedProperties: Property[]) => void;
  onSelectionChange?: (selectedProperties: Property[]) => void;
}

export const BatchProcessingTool: React.FC<BatchProcessingToolProps> = ({
  properties,
  onPropertiesUpdated,
  onSelectionChange
}) => {
  const { toast } = useToast();
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [isFixing, setIsFixing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [groupByOption, setGroupByOption] = useState<string | null>(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  // Computed values
  const hasSelection = selectedProperties.length > 0;
  const validProperties = validationResults
    .filter(result => result.isValid)
    .map(result => result.property);
    
  const propertiesWithWarnings = validationResults
    .filter(result => !result.isValid && !result.hasCriticalIssues)
    .map(result => result.property);
    
  const propertiesWithErrors = validationResults
    .filter(result => result.hasCriticalIssues)
    .map(result => result.property);
  
  // Handle filtering based on active tab
  const displayedProperties = React.useMemo(() => {
    switch (activeTab) {
      case 'valid':
        return validProperties;
      case 'warnings':
        return propertiesWithWarnings;
      case 'errors':
        return propertiesWithErrors;
      case 'selected':
        return selectedProperties;
      default:
        return properties;
    }
  }, [activeTab, properties, validProperties, propertiesWithWarnings, propertiesWithErrors, selectedProperties]);
  
  // Handle property groups
  const [propertyGroups, setPropertyGroups] = useState<Record<string, Property[]>>({});
  
  // Process property groups based on the selected grouping option
  const updatePropertyGroups = () => {
    if (!groupByOption) {
      setPropertyGroups({});
      return;
    }
    
    let keySelector: (property: Property) => string;
    
    switch (groupByOption) {
      case 'propertyType':
        keySelector = (p) => p.propertyType || 'Unknown';
        break;
      case 'zipCode':
        keySelector = (p) => p.zipCode || 'Unknown';
        break;
      case 'city':
        keySelector = (p) => p.city || 'Unknown';
        break;
      case 'yearBuiltDecade':
        keySelector = (p) => p.yearBuilt ? `${Math.floor(p.yearBuilt / 10) * 10}s` : 'Unknown';
        break;
      case 'priceRange':
        keySelector = (p) => {
          if (!p.price) return 'Unknown';
          if (p.price < 100000) return 'Under $100k';
          if (p.price < 250000) return '$100k-$250k';
          if (p.price < 500000) return '$250k-$500k';
          if (p.price < 1000000) return '$500k-$1M';
          return 'Over $1M';
        };
        break;
      default:
        keySelector = () => 'All';
    }
    
    const groups = batchProcessor.groupProperties(displayedProperties, keySelector);
    setPropertyGroups(groups);
  };
  
  // Update groups when grouping option or displayed properties change
  useEffect(() => {
    updatePropertyGroups();
  }, [groupByOption, displayedProperties]);
  
  // Update selection when displayed properties change
  useEffect(() => {
    const newSelectedProperties = properties.filter(p => 
      selectedIds[p.id || ''] === true
    );
    
    setSelectedProperties(newSelectedProperties);
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedProperties);
    }
  }, [properties, selectedIds, onSelectionChange]);
  
  // Handle selection change
  const handleSelectProperty = (property: Property, selected: boolean) => {
    if (!property.id) return;
    
    setSelectedIds(prev => ({ 
      ...prev, 
      [property.id || '']: selected 
    }));
  };
  
  // Handle select all for displayed properties
  const handleSelectAll = (selected: boolean) => {
    const newSelectedIds = { ...selectedIds };
    
    displayedProperties.forEach(property => {
      if (property.id) {
        newSelectedIds[property.id] = selected;
      }
    });
    
    setSelectedIds(newSelectedIds);
  };
  
  // Handle select group
  const handleSelectGroup = (groupName: string, selected: boolean) => {
    if (!propertyGroups[groupName]) return;
    
    const newSelectedIds = { ...selectedIds };
    
    propertyGroups[groupName].forEach(property => {
      if (property.id) {
        newSelectedIds[property.id] = selected;
      }
    });
    
    setSelectedIds(newSelectedIds);
  };
  
  // Run validation on all properties
  const validateAllProperties = async () => {
    setIsValidating(true);
    setValidationProgress(0);
    
    try {
      // Process in chunks to keep UI responsive
      const results = batchProcessor.processBatch(
        properties,
        property => propertyValidator.validate(property),
        {
          chunkSize: 50,
          onProgress: (processed, total) => {
            setValidationProgress(Math.round((processed / total) * 100));
          }
        }
      );
      
      setValidationResults(results);
      
      toast({
        title: 'Validation Complete',
        description: `${results.length} properties processed. ${results.filter(r => r.isValid).length} valid, ${results.filter(r => !r.isValid).length} with issues.`,
      });
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Error',
        description: 'An error occurred during validation.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
      setValidationProgress(100);
    }
  };
  
  // Fix all auto-fixable issues in selected properties
  const autoFixSelectedProperties = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: 'No Properties Selected',
        description: 'Please select properties to fix.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsFixing(true);
    
    try {
      const { fixed, unfixable, fixedIssueCount } = batchProcessor.autoFixBatch(
        selectedProperties
      );
      
      if (fixed.length > 0 && onPropertiesUpdated) {
        // Replace fixed properties in the original array
        const updatedProperties = [...properties];
        fixed.forEach(fixedProperty => {
          const index = updatedProperties.findIndex(p => p.id === fixedProperty.id);
          if (index !== -1) {
            updatedProperties[index] = fixedProperty;
          }
        });
        
        onPropertiesUpdated(updatedProperties);
        
        // Re-validate after fixing
        validateAllProperties();
      }
      
      toast({
        title: 'Auto-Fix Complete',
        description: `Fixed ${fixedIssueCount} issues in ${fixed.length} properties. ${unfixable.length} properties could not be automatically fixed.`,
      });
    } catch (error) {
      console.error('Auto-fix error:', error);
      toast({
        title: 'Auto-Fix Error',
        description: 'An error occurred during auto-fix.',
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  // Export selected properties to CSV
  const exportSelectedToCSV = () => {
    if (selectedProperties.length === 0) {
      toast({
        title: 'No Properties Selected',
        description: 'Please select properties to export.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Get all unique keys across all properties
      const allKeys = new Set<string>();
      selectedProperties.forEach(property => {
        Object.keys(property).forEach(key => allKeys.add(key));
      });
      
      // Convert Set to Array and sort for consistent column order
      const headers = Array.from(allKeys).sort();
      
      // Create CSV header row
      let csv = headers.join(',') + '\n';
      
      // Add data rows
      selectedProperties.forEach(property => {
        const row = headers.map(header => {
          const value = property[header as keyof Property];
          
          // Handle different types of values
          if (value === null || value === undefined) {
            return '';
          } else if (typeof value === 'string') {
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          } else if (Array.isArray(value)) {
            // Convert arrays to JSON strings
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          } else if (typeof value === 'object') {
            // Convert objects to JSON strings
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          
          // Numbers and booleans
          return value;
        }).join(',');
        
        csv += row + '\n';
      });
      
      // Create a download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: `${selectedProperties.length} properties exported to CSV.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Error',
        description: 'An error occurred during export.',
        variant: 'destructive',
      });
    }
  };
  
  // Get validation state for a property
  const getPropertyValidationState = (property: Property) => {
    const result = validationResults.find(r => r.property.id === property.id);
    
    if (!result) return 'unknown';
    if (result.isValid) return 'valid';
    if (result.hasCriticalIssues) return 'error';
    return 'warning';
  };
  
  // Get validation score for a property
  const getPropertyValidationScore = (property: Property) => {
    const result = validationResults.find(r => r.property.id === property.id);
    return result?.score || 0;
  };
  
  // Render validation indicator based on state
  const renderValidationIndicator = (property: Property) => {
    const state = getPropertyValidationState(property);
    
    switch (state) {
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Render property tables based on the current grouping
  const renderPropertyTables = () => {
    if (groupByOption && Object.keys(propertyGroups).length > 0) {
      return (
        <div className="space-y-6">
          {Object.entries(propertyGroups).map(([groupName, groupProperties]) => (
            <Card key={groupName} className={selectedGroup === groupName ? 'border-primary' : ''}>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge className="text-xs">{groupProperties.length}</Badge>
                    {groupName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectGroup(groupName, true)}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGroup(groupName === selectedGroup ? null : groupName)}
                    >
                      {groupName === selectedGroup ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {groupName === selectedGroup && (
                <CardContent>
                  {renderPropertyTable(groupProperties)}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      );
    }
    
    return renderPropertyTable(displayedProperties);
  };
  
  // Render the property table
  const renderPropertyTable = (displayProperties: Property[]) => {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      displayProperties.length > 0 &&
                      displayProperties.every(p => p.id && selectedIds[p.id])
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">Sq Ft</TableHead>
              <TableHead className="text-right">Year Built</TableHead>
              <TableHead className="w-[100px] text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No properties to display
                </TableCell>
              </TableRow>
            ) : (
              displayProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={property.id ? selectedIds[property.id] === true : false}
                      onChange={(e) => handleSelectProperty(property, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    {renderValidationIndicator(property)}
                  </TableCell>
                  <TableCell className="font-medium">{property.address}</TableCell>
                  <TableCell>{property.propertyType}</TableCell>
                  <TableCell className="text-right">
                    {property.price ? `$${property.price.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {property.squareFeet ? property.squareFeet.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">{property.yearBuilt || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress 
                        value={getPropertyValidationScore(property)} 
                        className="h-2 w-10" 
                      />
                      {getPropertyValidationScore(property)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Intelligent grouping dialog
  const renderGroupingDialog = () => (
    <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Intelligent Grouping</DialogTitle>
          <DialogDescription>
            Group properties by common characteristics to process them efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupBy">Group By</Label>
            <select
              id="groupBy"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={groupByOption || ''}
              onChange={(e) => setGroupByOption(e.target.value || null)}
            >
              <option value="">No Grouping</option>
              <option value="propertyType">Property Type</option>
              <option value="zipCode">Zip Code</option>
              <option value="city">City</option>
              <option value="yearBuiltDecade">Construction Decade</option>
              <option value="priceRange">Price Range</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="automatic-grouping" />
            <Label htmlFor="automatic-grouping">Suggest optimal grouping</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsGroupDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              updatePropertyGroups();
              setIsGroupDialogOpen(false);
            }}
          >
            Apply Grouping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Intelligent Batch Processing
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGroupDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Group
            </Button>
            {hasSelection && (
              <Badge variant="outline">{selectedProperties.length} selected</Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Process multiple properties efficiently with intelligent validation and batch operations.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              All ({properties.length})
            </TabsTrigger>
            <TabsTrigger value="valid" className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Valid ({validProperties.length})
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({propertiesWithWarnings.length})
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-1">
              <X className="h-4 w-4" />
              Errors ({propertiesWithErrors.length})
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex items-center gap-1">
              <ClipboardCheck className="h-4 w-4" />
              Selected ({selectedProperties.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {renderPropertyTables()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="valid" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {renderPropertyTables()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="warnings" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {renderPropertyTables()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="errors" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {renderPropertyTables()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="selected" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {renderPropertyTables()}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {isValidating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Validating properties...</span>
              <span>{validationProgress}%</span>
            </div>
            <Progress value={validationProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          <Button
            variant="outline"
            onClick={validateAllProperties}
            disabled={isValidating || properties.length === 0}
            className="flex items-center gap-1"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Validate All
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportSelectedToCSV}
            disabled={!hasSelection}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            Export Selected
          </Button>
          
          <Button
            onClick={autoFixSelectedProperties}
            disabled={isFixing || !hasSelection}
            className="flex items-center gap-1"
          >
            {isFixing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Auto-Fix Selected
          </Button>
        </div>
      </CardFooter>
      
      {renderGroupingDialog()}
    </Card>
  );
};

export default BatchProcessingTool;