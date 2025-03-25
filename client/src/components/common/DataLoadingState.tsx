import React from 'react';
import { Loader2, AlertCircle, FileSearch } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export interface DataLoadingStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
  skeletonCount?: number;
  SkeletonComponent?: React.ComponentType;
}

export const DataLoadingState: React.FC<DataLoadingStateProps> = ({
  isLoading,
  isError,
  error,
  onRetry,
  loadingText = 'Loading data...',
  errorText,
  emptyText = 'No data available',
  isEmpty = false,
  children,
  skeletonCount = 3,
  SkeletonComponent,
}) => {
  // If loading, show loading state
  if (isLoading) {
    // If a custom skeleton component is provided, use it
    if (SkeletonComponent) {
      return (
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonComponent key={index} />
            ))}
          </div>
        </div>
      );
    }
    
    // Default loading skeleton
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{loadingText}</p>
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }
  
  // If there was an error, show error state
  if (isError) {
    const errorMessage = errorText || error?.message || 'An error occurred while loading data';
    
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 space-y-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium">Error Loading Data</h3>
          <p className="text-muted-foreground mt-1">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }
  
  // If there is no data, show empty state
  if (isEmpty) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 space-y-4">
        <div className="rounded-full bg-muted p-3">
          <FileSearch className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">{emptyText}</p>
      </div>
    );
  }
  
  // Otherwise, render the children
  return <>{children}</>;
};