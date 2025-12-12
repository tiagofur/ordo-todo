'use client';

import { useEffect } from 'react';
import { initializePerformanceMonitoring } from '@/lib/performance-monitor';

interface DevToolsProviderProps {
  children: React.ReactNode;
}

export function DevToolsProvider({ children }: DevToolsProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring in development mode
    if (process.env.NODE_ENV === 'development') {
      initializePerformanceMonitoring();
    }
  }, []);

  return <>{children}</>;
}