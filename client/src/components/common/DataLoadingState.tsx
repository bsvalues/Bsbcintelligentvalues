/**
 * DataLoadingState Component
 * 
 * A reusable component for displaying loading, error, and empty states
 * for data fetching operations.
 */
import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataLoadingStateProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  error?: Error | null;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  children: ReactNode;
  onRetry?: () => void;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  retryText?: string;
  skeletonCount?: number;
}

export function DataLoadingState({
  isLoading,
  isError,
  isEmpty = false,
  error = null,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  onRetry,
  loadingText = 'Loading data...',
  errorText = 'There was an error loading the data.',
  emptyText = 'No data available.',
  retryText = 'Try Again',
  skeletonCount = 3,
}: DataLoadingStateProps) {
  // Handle loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        </div>
        {Array(skeletonCount).fill(0).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  
  // Handle error state
  if (isError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorText}
          {error && <div className="mt-2 text-sm opacity-80">{error.message}</div>}
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={onRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {retryText}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Handle empty state
  if (isEmpty) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border rounded-md">
        <p className="text-muted-foreground">{emptyText}</p>
      </div>
    );
  }
  
  // Render children when data is available
  return <>{children}</>;
}