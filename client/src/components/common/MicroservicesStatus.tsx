import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from '../ui/use-toast';

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    property: boolean;
    market: boolean;
    spatial: boolean;
    analytics: boolean;
  };
  message?: string;
}

/**
 * Component to display the status of all microservices
 */
export function MicroservicesStatus() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<ServiceStatus>('/api/microservices/health');
        setStatus(response);
        
        // Show toast for degraded or unhealthy services
        if (response.status !== 'healthy') {
          toast({
            title: 'Service Status',
            description: response.message || 'Some services are not responding correctly',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Failed to check microservices status:', err);
        setError('Failed to check microservices status. Please try again later.');
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to microservices',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Check status every 5 minutes
    const intervalId = setInterval(checkStatus, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Microservices Status</CardTitle>
          <CardDescription>Checking the status of all services...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Microservices Status</CardTitle>
          <CardDescription>Error checking services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Microservices Status
          <Badge 
            variant={status?.status === 'healthy' ? 'default' : 
                  status?.status === 'degraded' ? 'warning' : 'destructive'}
          >
            {status?.status || 'Unknown'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Current status of all backend services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ServiceStatusBadge 
            name="Property" 
            isActive={status?.services.property || false} 
          />
          <ServiceStatusBadge 
            name="Market" 
            isActive={status?.services.market || false} 
          />
          <ServiceStatusBadge 
            name="Spatial" 
            isActive={status?.services.spatial || false} 
          />
          <ServiceStatusBadge 
            name="Analytics" 
            isActive={status?.services.analytics || false} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface ServiceStatusBadgeProps {
  name: string;
  isActive: boolean;
}

const ServiceStatusBadge = ({ name, isActive }: ServiceStatusBadgeProps) => (
  <div className="flex flex-col items-center bg-card text-card-foreground border rounded-lg p-3">
    <span className="text-sm font-medium mb-2">{name}</span>
    <Badge variant={isActive ? 'default' : 'destructive'}>
      {isActive ? 'Online' : 'Offline'}
    </Badge>
  </div>
);