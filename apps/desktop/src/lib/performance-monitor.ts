/**
 * Performance Monitoring Utilities
 *
 * Advanced performance tracking and optimization for bundle loading
 */

export interface PerformanceMetrics {
  // Navigation timing
  domContentLoaded: number;
  loadComplete: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;

  // Resource timing
  bundleLoadTime: number;
  chunkLoadTimes: Record<string, number>;
  resourceLoadTimes: Record<string, number>;

  // Memory usage
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };

  // Network timing
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'navigation' | 'resource' | 'measure' | 'mark';
}

export interface BundleLoadEvent {
  chunkName: string;
  size: number;
  loadTime: number;
  cached: boolean;
  priority: 'high' | 'low' | 'auto';
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    domContentLoaded: 0,
    loadComplete: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    bundleLoadTime: 0,
    chunkLoadTimes: {},
    resourceLoadTimes: {}
  };

  private entries: PerformanceEntry[] = [];
  private bundleLoadEvents: BundleLoadEvent[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.initializeObservers();
    }
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.mark('monitoring-start');

    // Collect initial navigation timing
    this.collectNavigationTiming();

    // Monitor resource loading
    this.monitorResourceLoading();

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Monitor memory usage (if available)
    this.monitorMemoryUsage();

    // Monitor network information (if available)
    this.monitorNetworkInfo();
  }

  // Stop monitoring and generate report
  stopMonitoring(): PerformanceMetrics {
    if (!this.isMonitoring) return this.metrics;

    this.isMonitoring = false;
    this.mark('monitoring-end');
    this.measure('monitoring-duration', 'monitoring-start', 'monitoring-end');

    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    return this.metrics;
  }

  // Record bundle loading event
  recordBundleLoad(event: BundleLoadEvent) {
    this.bundleLoadEvents.push(event);
    this.metrics.chunkLoadTimes[event.chunkName] = event.loadTime;

    // Update total bundle load time
    if (event.priority === 'high') {
      this.metrics.bundleLoadTime += event.loadTime;
    }

    // Log bundle loading performance
    this.logBundlePerformance(event);
  }

  // Create performance mark
  mark(name: string) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
      this.entries.push({
        name,
        startTime: performance.now(),
        duration: 0,
        type: 'mark'
      });
    }
  }

  // Create performance measure
  measure(name: string, startMark: string, endMark?: string) {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
          this.entries.push({
            name,
            startTime: measure.startTime,
            duration: measure.duration,
            type: 'measure'
          });
        }
      } catch (error) {
        console.warn(`Failed to create measure ${name}:`, error);
      }
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    metrics: PerformanceMetrics;
    score: number;
    recommendations: string[];
    warnings: string[];
  } {
    const score = this.calculatePerformanceScore();
    const recommendations = this.generateRecommendations();
    const warnings = this.generateWarnings();

    return {
      metrics: this.metrics,
      score,
      recommendations,
      warnings
    };
  }

  // Export performance data
  exportData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      entries: this.entries,
      bundleLoadEvents: this.bundleLoadEvents,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    return JSON.stringify(data, null, 2);
  }

  // Private methods

  private initializeObservers() {
    // Observe navigation entries
    try {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.processNavigationEntry(entry as PerformanceNavigationTiming);
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (error) {
      console.warn('Navigation observer not supported:', error);
    }

    // Observe resource entries
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.processResourceEntry(entry as PerformanceResourceTiming);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }

    // Observe paint entries
    try {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.processPaintEntry(entry as PerformancePaintTiming);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Paint observer not supported:', error);
    }

    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }

    // Observe first input delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'first-input') {
            this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }

    // Observe layout shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.metrics.cumulativeLayoutShift += clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  private collectNavigationTiming() {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
    }
  }

  private monitorResourceLoading() {
    // Track bundle and chunk loading
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          const loadTime = resource.responseEnd - resource.startTime;
          const resourceName = this.extractResourceName(resource.name);

          this.metrics.resourceLoadTimes[resourceName] = loadTime;

          // Check if it's a bundle chunk
          if (resource.name.includes('/assets/') && resource.name.includes('.js')) {
            this.metrics.chunkLoadTimes[resourceName] = loadTime;
          }
        }
      });
    }
  }

  private monitorCoreWebVitals() {
    // Core Web Vitals are already handled by observers
    // This method can be extended for additional vital tracking
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
  }

  private monitorNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection.effectiveType;
      this.metrics.effectiveType = connection.effectiveType;
      this.metrics.downlink = connection.downlink;
      this.metrics.rtt = connection.rtt;
    }
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming) {
    this.entries.push({
      name: 'navigation',
      startTime: entry.startTime,
      duration: entry.duration,
      type: 'navigation'
    });
  }

  private processResourceEntry(entry: PerformanceResourceTiming) {
    const resourceName = this.extractResourceName(entry.name);

    this.entries.push({
      name: resourceName,
      startTime: entry.startTime,
      duration: entry.responseEnd - entry.startTime,
      type: 'resource'
    });

    // Track specific bundle loading
    if (entry.name.includes('/assets/') && entry.name.includes('.js')) {
      this.metrics.bundleLoadTime = Math.max(
        this.metrics.bundleLoadTime,
        entry.responseEnd - entry.startTime
      );
    }
  }

  private processPaintEntry(entry: PerformancePaintTiming) {
    if (entry.name === 'first-contentful-paint') {
      this.metrics.firstContentfulPaint = entry.startTime;
    }
  }

  private extractResourceName(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  private logBundlePerformance(event: BundleLoadEvent) {
    const message = `Chunk ${event.chunkName} loaded in ${event.loadTime}ms (${event.cached ? 'cached' : 'network'})`;

    if (event.loadTime > 1000) {
      console.warn(`🐌 ${message}`);
    } else if (event.loadTime > 500) {
      console.info(`⚠️ ${message}`);
    } else {
      console.log(`✅ ${message}`);
    }
  }

  private calculatePerformanceScore(): number {
    let score = 100;

    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5s-4s, Poor: >4s)
    if (this.metrics.largestContentfulPaint > 4000) score -= 30;
    else if (this.metrics.largestContentfulPaint > 2500) score -= 15;

    // FID scoring (Good: <100ms, Needs Improvement: 100ms-300ms, Poor: >300ms)
    if (this.metrics.firstInputDelay > 300) score -= 25;
    else if (this.metrics.firstInputDelay > 100) score -= 10;

    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (this.metrics.cumulativeLayoutShift > 0.25) score -= 30;
    else if (this.metrics.cumulativeLayoutShift > 0.1) score -= 15;

    // Bundle load time scoring
    if (this.metrics.bundleLoadTime > 3000) score -= 20;
    else if (this.metrics.bundleLoadTime > 1500) score -= 10;

    // Memory usage scoring (if available)
    if (this.metrics.memoryUsage) {
      const usagePercent = (this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100;
      if (usagePercent > 80) score -= 15;
      else if (usagePercent > 60) score -= 5;
    }

    return Math.max(0, score);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.largestContentfulPaint > 2500) {
      recommendations.push('Optimize LCP by preloading critical resources and reducing server response time');
    }

    if (this.metrics.firstInputDelay > 100) {
      recommendations.push('Reduce FID by minimizing JavaScript execution time and splitting long tasks');
    }

    if (this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reduce CLS by including size attributes on images and videos and avoiding inserting content above existing content');
    }

    if (this.metrics.bundleLoadTime > 1500) {
      recommendations.push('Improve bundle load time with better code splitting and compression');
    }

    // Bundle-specific recommendations
    const slowChunks = Object.entries(this.metrics.chunkLoadTimes)
      .filter(([_, time]) => time > 1000)
      .map(([name, time]) => `${name} (${Math.round(time)}ms)`);

    if (slowChunks.length > 0) {
      recommendations.push(`Optimize slow loading chunks: ${slowChunks.join(', ')}`);
    }

    return recommendations;
  }

  private generateWarnings(): string[] {
    const warnings: string[] = [];

    if (this.metrics.largestContentfulPaint > 4000) {
      warnings.push('Largest Contentful Paint exceeds 4 seconds - poor user experience');
    }

    if (this.metrics.firstInputDelay > 300) {
      warnings.push('First Input Delay exceeds 300ms - sluggish interaction');
    }

    if (this.metrics.cumulativeLayoutShift > 0.25) {
      warnings.push('Cumulative Layout Shift exceeds 0.25 - layout instability');
    }

    if (this.metrics.memoryUsage && this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit > 0.9) {
      warnings.push('Memory usage is near limit - risk of browser crashes');
    }

    return warnings;
  }
}

// Performance monitoring utilities
export function measureBundleLoad(chunkName: string, loadFn: () => Promise<void>): Promise<void> {
  const startTime = performance.now();

  return loadFn().then(() => {
    const loadTime = performance.now() - startTime;

    // Record the bundle load event
    if (typeof window !== 'undefined' && (window as any).__PERFORMANCE_MONITOR__) {
      (window as any).__PERFORMANCE_MONITOR__.recordBundleLoad({
        chunkName,
        size: 0, // Would be calculated from actual bundle size
        loadTime,
        cached: false, // Would be determined from headers
        priority: 'auto'
      });
    }
  });
}

// Create performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize monitoring in development
export function initializePerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Expose monitor to window for debugging
    (window as any).__PERFORMANCE_MONITOR__ = performanceMonitor;

    // Start monitoring automatically
    performanceMonitor.startMonitoring();

    // Add keyboard shortcut for performance report (Ctrl+Shift+P)
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        const summary = performanceMonitor.getPerformanceSummary();
        console.group('🚀 Performance Report');
        console.table(summary.metrics);
        console.log(`Performance Score: ${summary.score}/100`);
        if (summary.recommendations.length > 0) {
          console.log('Recommendations:', summary.recommendations);
        }
        if (summary.warnings.length > 0) {
          console.warn('Warnings:', summary.warnings);
        }
        console.groupEnd();
      }
    });

    console.log('⚡ Performance monitoring enabled. Press Ctrl+Shift+P for performance report.');
  }
}