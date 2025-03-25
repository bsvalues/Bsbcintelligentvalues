import { ReactNode } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  footer?: ReactNode;
  className?: string;
}

export function StatisticCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  footer,
  className = ''
}: StatisticCardProps) {
  
  // Get trend color
  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-green-600';
    if (trendValue < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };
  
  // Get trend badge variant
  const getTrendBadgeVariant = (trendValue: number) => {
    if (trendValue > 5) return 'success';
    if (trendValue > 0) return 'outline';
    if (trendValue > -5) return 'secondary';
    return 'destructive';
  };
  
  return (
    <Card className={`shadow-md transition-all hover:shadow-lg ${className}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-3">
        <div className="flex flex-col">
          <div className="text-2xl font-bold flex items-center gap-2">
            {value}
            {trend && (
              <Badge 
                variant={getTrendBadgeVariant(trend.value)} 
                className="text-xs font-normal h-5"
              >
                {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '–'} {Math.abs(trend.value)}%
              </Badge>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">
              {subtitle}
            </div>
          )}
          {trend && !trend.label && (
            <div className={`text-xs ${getTrendColor(trend.value)} mt-1`}>
              {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '–'} {Math.abs(trend.value)}% from previous period
            </div>
          )}
          {trend && trend.label && (
            <div className={`text-xs ${getTrendColor(trend.value)} mt-1`}>
              {trend.label}
            </div>
          )}
        </div>
      </CardContent>
      {footer && (
        <CardFooter className="p-2 pt-0 border-t border-muted">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}