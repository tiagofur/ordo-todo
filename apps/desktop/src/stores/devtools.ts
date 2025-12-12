/**
 * Zustand DevTools Integration
 *
 * Provides enhanced debugging capabilities for all Zustand stores
 * with state inspection, time-travel debugging, and performance monitoring.
 */

import { StateCreator } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

interface DevToolsConfig {
  name: string;
  enabled?: boolean;
  trace?: boolean;
  anonymousActionType?: string;
}

interface StoreMetadata {
  lastAction?: string;
  actionCount: number;
  lastUpdate: number;
  performanceMetrics: {
    updateTimes: number[];
    averageUpdateTime: number;
    slowestUpdate: { time: number; action: string };
  };
}

// Global dev tools state
let globalDevToolsEnabled = false;
const storeMetadata = new Map<string, StoreMetadata>();

export function withDevTools<T>(
  stateCreator: StateCreator<T>,
  config: DevToolsConfig
): StateCreator<T> {
  const { name, enabled = process.env.NODE_ENV === 'development', trace = true } = config;

  if (!enabled) {
    return stateCreator;
  }

  return devtools(stateCreator, {
    name: `ordo-${name}`,
    enabled: true,
    trace,
    anonymousActionType: 'unknown',
  });
}

export function withPersistDevTools<T>(
  stateCreator: StateCreator<T>,
  config: DevToolsConfig & {
    persistName: string;
    version?: number;
    migrate?: (persistedState: unknown, version: number) => T | Promise<T>;
  }
): StateCreator<T> {
  const { name, persistName, version = 0, migrate, trace = true } = config;

  return withDevTools(
    persist(stateCreator, {
      name: `ordo-${persistName}`,
      version,
      migrate,
      onRehydrateStorage: () => (state) => {
        console.log(`[DevTools] Rehydrating ${name} store...`);
        return Promise.resolve(state);
      },
    }),
    { name, trace }
  );
}

// Enhanced dev tools with metadata tracking
export function withMetadata<T>(
  stateCreator: StateCreator<T>,
  config: DevToolsConfig
): StateCreator<T> {
  const { name, enabled = process.env.NODE_ENV === 'development' } = config;

  if (!enabled) {
    return stateCreator;
  }

  return (set, get, api) => {
    const enhancedSet: typeof set = (args, replace, action) => {
      const startTime = performance.now();
      const actionName = action?.type || 'unknown';

      // Update metadata
      const metadata = storeMetadata.get(name) || {
        actionCount: 0,
        performanceMetrics: {
          updateTimes: [],
          averageUpdateTime: 0,
          slowestUpdate: { time: 0, action: '' },
        },
      };

      const result = set(args, replace, {
        type: actionName,
        timestamp: Date.now(),
      });

      const updateTime = performance.now() - startTime;

      // Update performance metrics
      metadata.performanceMetrics.updateTimes.push(updateTime);
      if (metadata.performanceMetrics.updateTimes.length > 100) {
        metadata.performanceMetrics.updateTimes.shift();
      }

      metadata.performanceMetrics.averageUpdateTime =
        metadata.performanceMetrics.updateTimes.reduce((a, b) => a + b, 0) /
        metadata.performanceMetrics.updateTimes.length;

      if (updateTime > metadata.performanceMetrics.slowestUpdate.time) {
        metadata.performanceMetrics.slowestUpdate = { time: updateTime, action: actionName };
      }

      metadata.lastAction = actionName;
      metadata.actionCount++;
      metadata.lastUpdate = Date.now();

      storeMetadata.set(name, metadata);

      // Log slow updates
      if (updateTime > 16) { // > 1 frame (60fps)
        console.warn(`[DevTools] Slow update in ${name}: ${actionName} took ${updateTime.toFixed(2)}ms`);
      }

      return result;
    };

    return stateCreator(enhancedSet, get, api);
  };
}

// DevTools management functions
export function enableDevTools() {
  globalDevToolsEnabled = true;
  console.log('[DevTools] Enhanced debugging enabled');
}

export function disableDevTools() {
  globalDevToolsEnabled = false;
  console.log('[DevTools] Enhanced debugging disabled');
}

export function getStoreMetadata(storeName: string): StoreMetadata | undefined {
  return storeMetadata.get(storeName);
}

export function getAllStoreMetadata(): Record<string, StoreMetadata> {
  return Object.fromEntries(storeMetadata);
}

// Performance monitoring
export function getStorePerformanceReport(): Record<string, any> {
  const report: Record<string, any> = {};

  for (const [storeName, metadata] of storeMetadata) {
    report[storeName] = {
      ...metadata,
      performanceMetrics: {
        ...metadata.performanceMetrics,
        recentUpdates: metadata.performanceMetrics.updateTimes.slice(-10),
        updateRate: metadata.actionCount / (Date.now() - metadata.lastUpdate) * 1000,
      },
    };
  }

  return report;
}

// Store inspector utility
export function createStoreInspector() {
  return {
    getAllStores: () => getAllStoreMetadata(),
    getStoreInfo: (name: string) => getStoreMetadata(name),
    getPerformanceReport: () => getStorePerformanceReport(),
    exportState: () => {
      const stores: Record<string, any> = {};
      for (const [name, metadata] of storeMetadata) {
        stores[name] = {
          metadata,
          // Note: Actual state would need to be captured from each store
          // This would require store-specific implementation
        };
      }
      return stores;
    },
    clearMetadata: (storeName?: string) => {
      if (storeName) {
        storeMetadata.delete(storeName);
      } else {
        storeMetadata.clear();
      }
    },
  };
}

// React hook for dev tools management
export function useDevTools() {
  return {
    enabled: globalDevToolsEnabled,
    metadata: getAllStoreMetadata(),
    performanceReport: getStorePerformanceReport(),
    inspector: createStoreInspector(),
    enable: enableDevTools,
    disable: disableDevTools,
  };
}

// Export for usage in stores
export const createDevToolsStore = {
  withDevTools,
  withPersistDevTools,
  withMetadata,
  enable: enableDevTools,
  disable: disableDevTools,
  getMetadata: getStoreMetadata,
  getPerformance: getStorePerformanceReport,
};