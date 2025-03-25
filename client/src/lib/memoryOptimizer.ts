/**
 * Memory Optimizer Utility
 * 
 * This utility provides client-side memory optimization functions
 * that help manage server memory usage by periodically triggering
 * memory optimization routines when necessary.
 */

import { apiRequest } from './queryClient';

// Interface for system health response
interface SystemHealth {
  cpu: {
    loadAverage: {
      '1m': string;
      '5m': string;
      '15m': string;
    }
  };
  memory: {
    total: string;
    free: string;
    usage: string;
  };
  system: {
    platform: string;
    uptime: string;
  };
  scheduler: {
    jobs: any[];
  };
}

// Interface for memory stats response
interface MemoryStats {
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    formatted: {
      heapUsed: string;
      heapTotal: string;
      rss: string;
      external: string;
    }
  };
  vectorMemory: {
    count: number;
    approximate_size: string;
  } | null;
  logs: {
    totalCount: number;
    countByLevel: Record<string, number>;
    countByCategory: Record<string, number>;
  };
  timestamp: string;
}

// Interface for optimization result
interface OptimizationResult {
  status: 'success' | 'error';
  message?: string;
  optimization?: {
    initialMemory: any;
    finalMemory: any;
    improvements: {
      heapReduction: string;
      rssReduction: string;
      percentReduction: string;
    }
  };
}

/**
 * Check system health to determine if optimization is needed
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiRequest<SystemHealth>('/api/system/health', {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Failed to check system health:', error);
    throw error;
  }
}

/**
 * Get detailed memory statistics
 */
export async function getMemoryStats(): Promise<MemoryStats> {
  try {
    const response = await apiRequest<MemoryStats>('/api/memory/stats', {
      method: 'GET'
    });
    return response;
  } catch (error) {
    console.error('Failed to get memory stats:', error);
    throw error;
  }
}

/**
 * Run standard memory optimization
 */
export async function optimizeMemory(): Promise<OptimizationResult> {
  try {
    const response = await apiRequest<OptimizationResult>('/api/memory/optimize', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Failed to optimize memory:', error);
    throw error;
  }
}

/**
 * Run enhanced memory optimization (more aggressive)
 */
export async function runEnhancedMemoryOptimization(): Promise<OptimizationResult> {
  try {
    const response = await apiRequest<OptimizationResult>('/api/system/enhanced-cleanup-memory', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error('Failed to run enhanced memory optimization:', error);
    throw error;
  }
}

/**
 * Check memory usage and automatically optimize if needed
 * @param options Configuration options
 */
export async function autoOptimizeMemory(options: {
  thresholdPercent?: number;
  useEnhanced?: boolean;
  onComplete?: (result: OptimizationResult) => void;
} = {}): Promise<boolean> {
  try {
    // Default options
    const opts = {
      thresholdPercent: 85, // Optimize when usage exceeds 85%
      useEnhanced: false,   // Use standard optimization by default
      onComplete: undefined,
      ...options
    };
    
    // Get memory stats
    const stats = await getMemoryStats();
    
    // Calculate memory usage percentage
    const usagePercent = (stats.memoryUsage.heapUsed / stats.memoryUsage.heapTotal) * 100;
    
    // Check if optimization is needed
    if (usagePercent > opts.thresholdPercent) {
      console.log(`Memory usage is high (${usagePercent.toFixed(1)}%). Running ${opts.useEnhanced ? 'enhanced' : 'standard'} optimization...`);
      
      // Run optimization
      const result = opts.useEnhanced 
        ? await runEnhancedMemoryOptimization()
        : await optimizeMemory();
      
      // Call onComplete callback if provided
      if (opts.onComplete) {
        opts.onComplete(result);
      }
      
      return true; // Optimization was performed
    }
    
    return false; // Optimization was not needed
  } catch (error) {
    console.error('Auto-optimization failed:', error);
    return false;
  }
}

/**
 * Start periodic memory optimization checks
 * @param interval Check interval in milliseconds (default: 5 minutes)
 * @param options Optimization options
 * @returns Cleanup function to stop the periodic checks
 */
export function startPeriodicOptimization(
  interval: number = 5 * 60 * 1000,
  options: Parameters<typeof autoOptimizeMemory>[0] = {}
): () => void {
  const timer = setInterval(async () => {
    try {
      await autoOptimizeMemory(options);
    } catch (error) {
      console.error('Periodic optimization failed:', error);
    }
  }, interval);
  
  // Return a cleanup function
  return () => clearInterval(timer);
}