import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

interface DataLoadingStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingContent?: React.ReactNode;
  errorContent?: React.ReactNode;
  children: React.ReactNode;
}

export const DataLoadingState: React.FC<DataLoadingStateProps> = ({
  isLoading,
  isError,
  error,
  onRetry,
  loadingContent,
  errorContent,
  children,
}) => {
  if (isLoading) {
    return loadingContent ? (
      <>{loadingContent}</>
    ) : (
      <Card className="w-full h-full">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Loading data...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the latest information.</p>
          </div>
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return errorContent ? (
      <>{errorContent}</>
    ) : (
      <Card className="w-full h-full">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Error loading data</h3>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'An unexpected error occurred while fetching data.'}
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};