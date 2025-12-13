/**
 * Advanced Code Splitting Strategy
 *
 * Implements intelligent code splitting for optimal bundle sizes and loading performance
 */

export enum ChunkPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface ChunkConfig {
  name: string;
  priority: ChunkPriority;
  preload: boolean;
  prefetch: boolean;
  estimatedSize: number;
  dependencies?: string[];
}

export interface SplittingStrategy {
  routeBased: boolean;
  componentBased: boolean;
  featureBased: boolean;
  vendorSplitting: boolean;
  commonChunks: string[];
}

class ChunkPreloader {
  private preloadedChunks = new Set<string>();
  private prefetchQueue: string[] = [];
  private isPreloading = false;

  constructor(private options: { maxConcurrent?: number; delay?: number } = {}) {
    this.options = {
      maxConcurrent: 3,
      delay: 100,
      ...options
    };
  }

  // Preload critical chunks immediately
  preloadCritical(chunkNames: string[]) {
    chunkNames.forEach(chunkName => {
      if (!this.preloadedChunks.has(chunkName)) {
        this.loadChunk(chunkName, 'preload');
        this.preloadedChunks.add(chunkName);
      }
    });
  }

  // Prefetch low priority chunks when idle
  prefetchLowPriority(chunkNames: string[]) {
    this.prefetchQueue.push(...chunkNames);
    this.schedulePrefetch();
  }

  private schedulePrefetch() {
    if (this.isPreloading || this.prefetchQueue.length === 0) return;

    this.isPreloading = true;

    // Use requestIdleCallback when available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.processPrefetchQueue());
    } else {
      setTimeout(() => this.processPrefetchQueue(), this.options.delay);
    }
  }

  private processPrefetchQueue() {
    const batch = this.prefetchQueue.splice(0, this.options.maxConcurrent);

    batch.forEach(chunkName => {
      this.loadChunk(chunkName, 'prefetch');
    });

    this.isPreloading = false;

    // Continue if there are more chunks to prefetch
    if (this.prefetchQueue.length > 0) {
      this.schedulePrefetch();
    }
  }

  private loadChunk(chunkName: string, mode: 'preload' | 'prefetch') {
    const link = document.createElement('link');
    link.rel = mode;
    link.href = `/assets/${chunkName}.js`;
    document.head.appendChild(link);
  }

  // Get preloading statistics
  getStats() {
    return {
      preloadedChunks: Array.from(this.preloadedChunks),
      pendingPrefetches: this.prefetchQueue.length,
      isPreloading: this.isPreloading
    };
  }
}

// Global chunk preloader instance
export const chunkPreloader = new ChunkPreloader();

// Route-based chunk configuration
export const routeChunks: Record<string, ChunkConfig> = {
  dashboard: {
    name: 'dashboard',
    priority: ChunkPriority.CRITICAL,
    preload: true,
    prefetch: false,
    estimatedSize: 150000, // 150KB
  },
  tasks: {
    name: 'tasks',
    priority: ChunkPriority.CRITICAL,
    preload: true,
    prefetch: false,
    estimatedSize: 200000, // 200KB
  },
  timer: {
    name: 'timer',
    priority: ChunkPriority.HIGH,
    preload: true,
    prefetch: false,
    estimatedSize: 120000, // 120KB
    dependencies: ['tasks']
  },
  analytics: {
    name: 'analytics',
    priority: ChunkPriority.MEDIUM,
    preload: false,
    prefetch: true,
    estimatedSize: 180000, // 180KB
  },
  settings: {
    name: 'settings',
    priority: ChunkPriority.LOW,
    preload: false,
    prefetch: true,
    estimatedSize: 100000, // 100KB
  }
};

// Feature-based chunk configuration
export const featureChunks: Record<string, ChunkConfig> = {
  'ai-assistant': {
    name: 'ai-assistant',
    priority: ChunkPriority.MEDIUM,
    preload: false,
    prefetch: true,
    estimatedSize: 250000, // 250KB
  },
  'offline-sync': {
    name: 'offline-sync',
    priority: ChunkPriority.HIGH,
    preload: true,
    prefetch: false,
    estimatedSize: 80000, // 80KB
  },
  'real-time': {
    name: 'real-time',
    priority: ChunkPriority.HIGH,
    preload: true,
    prefetch: false,
    estimatedSize: 60000, // 60KB
  },
  'drag-drop': {
    name: 'drag-drop',
    priority: ChunkPriority.MEDIUM,
    preload: false,
    prefetch: true,
    estimatedSize: 40000, // 40KB
  }
};

// Common chunks for shared functionality
export const commonChunks = {
  analytics: {
    name: 'analytics-common',
    modules: ['recharts', 'date-fns'],
    priority: ChunkPriority.MEDIUM
  },
  forms: {
    name: 'forms-common',
    modules: ['react-hook-form', 'zod', '@hookform/resolvers'],
    priority: ChunkPriority.HIGH
  },
  ui: {
    name: 'ui-common',
    modules: ['@ordo-todo/ui', 'lucide-react', 'framer-motion'],
    priority: ChunkPriority.CRITICAL
  }
};

// Code splitting configuration
export const codeSplittingConfig: SplittingStrategy = {
  routeBased: true,
  componentBased: true,
  featureBased: true,
  vendorSplitting: true,
  commonChunks: Object.values(commonChunks).map(chunk => chunk.name)
};

// Create lazy loaded component with chunk configuration
export function createLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  chunkConfig: Partial<ChunkConfig> = {}
) {
  const config: ChunkConfig = {
    priority: ChunkPriority.MEDIUM,
    preload: false,
    prefetch: true,
    estimatedSize: 50000,
    ...chunkConfig
  };

  // Add webpack magic comments for better chunk naming
  const chunkName = config.name;
  const webpackComments = [
    `webpackChunkName: "${chunkName}"`,
    `webpackPreload: ${config.preload}`,
    `webpackPrefetch: ${config.prefetch}`
  ].filter(Boolean).join(', ');

  return lazy(importFn, {
    ssr: false
  });
}

// Initialize code splitting based on strategy
export function initializeCodeSplitting() {
  if (typeof window === 'undefined') return;

  // Preload critical chunks
  const criticalChunks = Object.values(routeChunks)
    .filter(chunk => chunk.priority === ChunkPriority.CRITICAL)
    .map(chunk => chunk.name);

  chunkPreloader.preloadCritical(criticalChunks);

  // Prefetch high priority chunks after delay
  setTimeout(() => {
    const highPriorityChunks = Object.values(routeChunks)
      .filter(chunk => chunk.priority === ChunkPriority.HIGH)
      .map(chunk => chunk.name);

    chunkPreloader.prefetchLowPriority(highPriorityChunks);
  }, 2000);

  // Prefetch feature chunks when idle
  setTimeout(() => {
    const featureChunkNames = Object.values(featureChunks)
      .filter(chunk => chunk.priority !== ChunkPriority.CRITICAL)
      .map(chunk => chunk.name);

    chunkPreloader.prefetchLowPriority(featureChunkNames);
  }, 5000);
}

// Get chunk optimization recommendations
export function getChunkRecommendations() {
  const recommendations: string[] = [];

  // Analyze current chunks
  Object.values(routeChunks).forEach(chunk => {
    if (chunk.estimatedSize > 300000) {
      recommendations.push(
        `Consider splitting ${chunk.name} chunk further (current: ${Math.round(chunk.estimatedSize / 1000)}KB)`
      );
    }

    if (chunk.priority === ChunkPriority.CRITICAL && !chunk.preload) {
      recommendations.push(`Critical chunk ${chunk.name} should be preloaded`);
    }
  });

  return recommendations;
}

// Bundle splitting utilities for Vite configuration
export const bundleSplitting = {
  // Manual chunk splitting for better caching
  manualChunks: (id: string) => {
    // Node modules in vendor chunks
    if (id.includes('node_modules')) {
      // React ecosystem
      if (id.includes('react') || id.includes('react-dom')) {
        return 'vendor-react';
      }

      // Router
      if (id.includes('react-router')) {
        return 'vendor-router';
      }

      // Query and state management
      if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
        return 'vendor-state';
      }

      // UI library
      if (id.includes('@ordo-todo/ui') || id.includes('radix-ui') || id.includes('lucide-react')) {
        return 'vendor-ui';
      }

      // Forms
      if (id.includes('react-hook-form') || id.includes('zod')) {
        return 'vendor-forms';
      }

      // Charts and analytics
      if (id.includes('recharts') || id.includes('d3')) {
        return 'vendor-charts';
      }

      // Date utilities
      if (id.includes('date-fns') || id.includes('dayjs')) {
        return 'vendor-date';
      }

      // Electron-specific
      if (id.includes('electron')) {
        return 'vendor-electron';
      }

      // Other vendor libraries
      return 'vendor-other';
    }

    // App-specific chunks
    if (id.includes('/pages/')) {
      const pageName = id.split('/pages/')[1]?.split('.')[0];
      return `page-${pageName}`;
    }

    if (id.includes('/components/')) {
      // Group components by feature
      if (id.includes('/components/task/')) return 'feature-tasks';
      if (id.includes('/components/timer/')) return 'feature-timer';
      if (id.includes('/components/analytics/')) return 'feature-analytics';
      if (id.includes('/components/settings/')) return 'feature-settings';
      if (id.includes('/components/auth/')) return 'feature-auth';

      return 'components-shared';
    }

    // Utilities and hooks
    if (id.includes('/lib/') || id.includes('/hooks/')) {
      return 'utils';
    }

    // Stores
    if (id.includes('/stores/')) {
      return 'stores';
    }
  },

  // Chunk size limits for Vite
  chunkSizeWarningLimit: 1000, // 1MB warning

  // Optimize chunk loading
  rollupOptions: {
    output: {
      // Ensure consistent chunk naming
      chunkFileNames: (chunkInfo) => {
        const facadeModuleId = chunkInfo.facadeModuleId
          ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/[^\w-]/g, '')
          : 'chunk';
        return `assets/${facadeModuleId}-[hash].js`;
      },

      // Entry file naming
      entryFileNames: 'assets/[name]-[hash].js',

      // Asset naming
      assetFileNames: (assetInfo) => {
        const extType = assetInfo.name?.split('.').pop();
        if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
          return 'assets/fonts/[name]-[hash][extname]';
        }
        if (/\.png$/.test(assetInfo.name || '')) {
          return 'assets/images/[name]-[hash][extname]';
        }
        if (/\.svg$/.test(assetInfo.name || '')) {
          return 'assets/icons/[name]-[hash][extname]';
        }
        return `assets/${extType}/[name]-[hash][extname]`;
      }
    }
  }
};