/**
 * DateRangeSelector Component
 * 
 * A reusable component for selecting date ranges with preset options
 * and custom date range selection.
 */
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '../../context/AppContext';

interface DateRangeSelectorProps {
  className?: string;
  label?: boolean;
}

export function DateRangeSelector({ className = '', label = true }: DateRangeSelectorProps) {
  const { 
    datePeriod, 
    setDatePeriod,
    customDateRange,
    setCustomDateRange,
    getDateRange
  } = useAppContext();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: customDateRange[0] || undefined,
    to: customDateRange[1] || undefined,
  });
  
  // Handle preset period change
  const handlePeriodChange = (value: string) => {
    setDatePeriod(value as any);
  };
  
  // Handle custom date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      setCustomDateRange([range.from, range.to || null]);
      
      // If both dates are selected, automatically apply the custom range
      if (range.from && range.to) {
        setDatePeriod('custom');
      }
    }
  };
  
  // Get formatted date range string
  const getFormattedDateRange = () => {
    const [startDate, endDate] = getDateRange();
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Period Selector */}
      <div className="space-y-2">
        {label && <Label htmlFor="date-period-select">Time Period</Label>}
        <Select value={datePeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger id="date-period-select" className="w-full">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="lastQuarter">Last Quarter</SelectItem>
            <SelectItem value="lastYear">Last Year</SelectItem>
            <SelectItem value="last3Years">Last 3 Years</SelectItem>
            <SelectItem value="last5Years">Last 5 Years</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Custom Date Range Selector */}
      {datePeriod === 'custom' && (
        <div className="space-y-2">
          {label && <Label>Custom Date Range</Label>}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {/* Current Date Range Display */}
      <div className="text-sm text-muted-foreground">
        Current range: {getFormattedDateRange()}
      </div>
    </div>
  );
}