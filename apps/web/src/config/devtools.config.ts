/**
 * DevTools Configuration for Ordo-Todo Web App
 *
 * Centralized configuration for all developer tools and monitoring
 */

export interface DevToolsConfig {
  // Global settings
  enabled: boolean;
  autoStart: boolean;
  keyboardShortcuts: boolean;
  showDevModeIndicator: boolean;
  logActions: boolean;

  // Performance Monitor settings
  performanceMonitor: {
    enabled: boolean;
    autoStart: boolean;
    collectMetrics: boolean;
    sampleInterval: number; // ms
    maxDataPoints: number;
    trackCoreWebVitals: boolean;
    trackMemoryUsage: boolean;
    trackBundleLoad: boolean;
    thresholds: {
      lcp: number; // Largest Contentful Paint (ms)
      fid: number; // First Input Delay (ms)
      cls: number; // Cumulative Layout Shift
      fcp: number; // First Contentful Paint (ms)
      ttfb: number; // Time to First Byte (ms)
      bundleSize: number; // Bundle size limit (bytes)
    };
  };

  // Bundle Analyzer settings
  bundleAnalyzer: {
    enabled: boolean;
    autoAnalyze: boolean;
    showDetailed: boolean;
    compressionAnalysis: boolean;
    dependencyAnalysis: boolean;
    chunkAnalysis: boolean;
    thresholds: {
      totalSize: number; // Total bundle size limit (bytes)
      chunkSize: number; // Individual chunk size limit (bytes)
      compressionRatio: number; // Compression ratio target
      healthScore: number; // Minimum health score
    };
  };

  // State Inspector settings
  stateInspector: {
    enabled: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // ms
    captureState: boolean;
    showDetails: boolean;
    trackChanges: boolean;
    maxHistory: number;
    stores: {
      zustand: boolean;
      reactQuery: boolean;
      localStorage: boolean;
      sessionStorage: boolean;
      memory: boolean;
    };
  };

  // Analytics Logger settings
  analyticsLogger: {
    enabled: boolean;
    autoStart: boolean;
    recordEvents: boolean;
    showRealtime: boolean;
    maxEvents: number;
    categories: {
      userAction: boolean;
      performance: boolean;
      error: boolean;
      featureUsage: boolean;
      system: boolean;
      business: boolean;
    };
    retention: {
      memory: number; // hours
      localStorage: number; // hours
      indexedDB: number; // hours
    };
  };
}

// Default configuration
export const defaultDevToolsConfig: DevToolsConfig = {
  // Global settings
  enabled: process.env.NODE_ENV === 'development',
  autoStart: true,
  keyboardShortcuts: true,
  showDevModeIndicator: true,
  logActions: false,

  // Performance Monitor settings
  performanceMonitor: {
    enabled: true,
    autoStart: true,
    collectMetrics: true,
    sampleInterval: 1000, // 1 second
    maxDataPoints: 100,
    trackCoreWebVitals: true,
    trackMemoryUsage: true,
    trackBundleLoad: true,
    thresholds: {
      lcp: 2500, // 2.5s
      fid: 100, // 100ms
      cls: 0.1,
      fcp: 1800, // 1.8s
      ttfb: 800, // 800ms
      bundleSize: 2 * 1024 * 1024, // 2MB
    },
  },

  // Bundle Analyzer settings
  bundleAnalyzer: {
    enabled: true,
    autoAnalyze: false,
    showDetailed: true,
    compressionAnalysis: true,
    dependencyAnalysis: true,
    chunkAnalysis: true,
    thresholds: {
      totalSize: 2 * 1024 * 1024, // 2MB
      chunkSize: 250 * 1024, // 250KB
      compressionRatio: 0.4, // 40% of original
      healthScore: 80, // Minimum 80/100
    },
  },

  // State Inspector settings
  stateInspector: {
    enabled: true,
    autoRefresh: true,
    refreshInterval: 5000, // 5 seconds
    captureState: true,
    showDetails: false,
    trackChanges: true,
    maxHistory: 50,
    stores: {
      zustand: true,
      reactQuery: true,
      localStorage: true,
      sessionStorage: true,
      memory: true,
    },
  },

  // Analytics Logger settings
  analyticsLogger: {
    enabled: true,
    autoStart: true,
    recordEvents: true,
    showRealtime: true,
    maxEvents: 1000,
    categories: {
      userAction: true,
      performance: true,
      error: true,
      featureUsage: true,
      system: true,
      business: true,
    },
    retention: {
      memory: 1, // 1 hour
      localStorage: 24, // 24 hours
      indexedDB: 168, // 1 week
    },
  },
};

// Environment-specific configurations
export const environmentConfigs = {
  development: {
    ...defaultDevToolsConfig,
    enabled: true,
    autoStart: true,
    logActions: true,
    performanceMonitor: {
      ...defaultDevToolsConfig.performanceMonitor,
      autoStart: true,
      collectMetrics: true,
    },
    bundleAnalyzer: {
      ...defaultDevToolsConfig.bundleAnalyzer,
      autoAnalyze: false,
    },
    stateInspector: {
      ...defaultDevToolsConfig.stateInspector,
      autoRefresh: true,
      trackChanges: true,
    },
    analyticsLogger: {
      ...defaultDevToolsConfig.analyticsLogger,
      recordEvents: true,
      showRealtime: true,
    },
  },

  test: {
    ...defaultDevToolsConfig,
    enabled: false,
    autoStart: false,
    logActions: false,
    performanceMonitor: {
      ...defaultDevToolsConfig.performanceMonitor,
      autoStart: false,
      collectMetrics: false,
    },
    bundleAnalyzer: {
      ...defaultDevToolsConfig.bundleAnalyzer,
      enabled: false,
    },
    stateInspector: {
      ...defaultDevToolsConfig.stateInspector,
      autoRefresh: false,
      trackChanges: false,
    },
    analyticsLogger: {
      ...defaultDevToolsConfig.analyticsLogger,
      recordEvents: false,
      showRealtime: false,
    },
  },

  production: {
    ...defaultDevToolsConfig,
    enabled: false,
    autoStart: false,
    logActions: false,
    performanceMonitor: {
      ...defaultDevToolsConfig.performanceMonitor,
      autoStart: false,
      collectMetrics: false,
    },
    bundleAnalyzer: {
      ...defaultDevToolsConfig.bundleAnalyzer,
      enabled: false,
    },
    stateInspector: {
      ...defaultDevToolsConfig.stateInspector,
      autoRefresh: false,
      trackChanges: false,
    },
    analyticsLogger: {
      ...defaultDevToolsConfig.analyticsLogger,
      recordEvents: false,
      showRealtime: false,
    },
  },
};

// Get configuration for current environment
export function getDevToolsConfig(): DevToolsConfig {
  const env = process.env.NODE_ENV || 'development';

  // Allow environment override
  const customConfig = process.env.NEXT_PUBLIC_DEVTOOLS_CONFIG;
  if (customConfig) {
    try {
      return {
        ...environmentConfigs[env as keyof typeof environmentConfigs],
        ...JSON.parse(customConfig),
      };
    } catch (error) {
      console.warn('Invalid NEXT_PUBLIC_DEVTOOLS_CONFIG, using defaults:', error);
    }
  }

  return environmentConfigs[env as keyof typeof environmentConfigs] || defaultDevToolsConfig;
}

// Validate configuration
export function validateDevToolsConfig(config: DevToolsConfig): boolean {
  try {
    // Basic validation
    if (typeof config.enabled !== 'boolean') return false;
    if (typeof config.autoStart !== 'boolean') return false;
    if (typeof config.keyboardShortcuts !== 'boolean') return false;

    // Performance Monitor validation
    if (config.performanceMonitor.enabled && config.performanceMonitor.sampleInterval <= 0) return false;
    if (config.performanceMonitor.thresholds.lcp <= 0) return false;
    if (config.performanceMonitor.thresholds.fid <= 0) return false;

    // Bundle Analyzer validation
    if (config.bundleAnalyzer.enabled && config.bundleAnalyzer.thresholds.totalSize <= 0) return false;
    if (config.bundleAnalyzer.thresholds.chunkSize <= 0) return false;

    // State Inspector validation
    if (config.stateInspector.enabled && config.stateInspector.refreshInterval <= 0) return false;
    if (config.stateInspector.maxHistory <= 0) return false;

    // Analytics Logger validation
    if (config.analyticsLogger.enabled && config.analyticsLogger.maxEvents <= 0) return false;

    return true;
  } catch (error) {
    console.warn('DevTools configuration validation failed:', error);
    return false;
  }
}

// Export default configuration for convenience
export default defaultDevToolsConfig;