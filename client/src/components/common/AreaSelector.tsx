/**
 * AreaSelector Component
 * 
 * A reusable component for selecting geographical areas and area types.
 */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppContext } from '../../context/AppContext';
import { DataLoadingState } from './DataLoadingState';

interface AreaSelectorProps {
  showCounty?: boolean;
  showAreaType?: boolean;
  showArea?: boolean;
  className?: string;
  label?: boolean;
}

export function AreaSelector({
  showCounty = true,
  showAreaType = true,
  showArea = true,
  className = '',
  label = true,
}: AreaSelectorProps) {
  const {
    selectedCounty,
    setSelectedCounty,
    selectedArea,
    setSelectedArea,
    selectedAreaType,
    setSelectedAreaType,
    availableCounties,
    isLoadingCounties,
    availableAreas,
    isLoadingAreas,
  } = useAppContext();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* County Selector */}
      {showCounty && (
        <div className="space-y-2">
          {label && <Label htmlFor="county-select">County</Label>}
          <DataLoadingState
            isLoading={isLoadingCounties}
            isError={false}
            isEmpty={availableCounties.length === 0}
            loadingText="Loading counties..."
            emptyText="No counties available"
            skeletonCount={1}
          >
            <Select
              value={selectedCounty}
              onValueChange={setSelectedCounty}
            >
              <SelectTrigger id="county-select" className="w-full">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {availableCounties.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DataLoadingState>
        </div>
      )}

      {/* Area Type Selector */}
      {showAreaType && (
        <div className="space-y-2">
          {label && <Label htmlFor="area-type-select">Area Type</Label>}
          <Select
            value={selectedAreaType}
            onValueChange={(value) => setSelectedAreaType(value as any)}
          >
            <SelectTrigger id="area-type-select" className="w-full">
              <SelectValue placeholder="Select area type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="county">County</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="neighborhood">Neighborhood</SelectItem>
              <SelectItem value="zip">ZIP Code</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Area Selector */}
      {showArea && (
        <div className="space-y-2">
          {label && <Label htmlFor="area-select">Area</Label>}
          <DataLoadingState
            isLoading={isLoadingAreas}
            isError={false}
            isEmpty={availableAreas.length === 0}
            loadingText="Loading areas..."
            emptyText="No areas available"
            skeletonCount={1}
          >
            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
            >
              <SelectTrigger id="area-select" className="w-full">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {availableAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DataLoadingState>
        </div>
      )}
    </div>
  );
}