/**
 * Performance Monitoring Utilities for Web
 *
 * Adapted from desktop version for web environment
 */

export interface WebPerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte

  // Navigation Timing
  domContentLoaded: number;
  loadComplete: number;

  // Resource Timing
  bundleLoadTime: number;
  chunkLoadTimes: Record<string, number>;

  // Runtime Metrics
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };

  // Network Information
  connection?: {
    type: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'navigation' | 'resource' | 'measure' | 'paint' | 'largest-contentful-paint' | 'first-input' | 'layout-shift';
}

export interface PerformanceScore {
  overall: number; // 0-100
  vitals: {
    lcp: number; // 0-100
    fid: number; // 0-100
    cls: number; // 0-100
  };
  recommendations: string[];
  warnings: string[];
}

class WebPerformanceMonitor {
  private metrics: Partial<WebPerformanceMetrics> = {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    bundleLoadTime: 0,
    chunkLoadTimes: {}
  };

  private entries: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  private vitalsObservers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.initializeObservers();
    }
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.isMonitoring || typeof window === 'undefined') return;

    this.isMonitoring = true;
    this.mark('monitoring-start');

    // Collect initial navigation timing
    this.collectNavigationTiming();

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Monitor bundle loading
    this.monitorBundleLoading();

    // Monitor memory usage (if available)
    this.monitorMemoryUsage();

    // Monitor network information (if available)
    this.monitorNetworkInfo();

    // Monitor resource loading
    this.monitorResourceLoading();
  }

  // Stop monitoring and return metrics
  stopMonitoring(): WebPerformanceMetrics {
    if (!this.isMonitoring) {
      return this.metrics as WebPerformanceMetrics;
    }

    this.isMonitoring = false;
    this.mark('monitoring-end');
    this.measure('monitoring-duration', 'monitoring-start', 'monitoring-end');

    // Disconnect all observers
    this.disconnectAllObservers();

    return this.metrics as WebPerformanceMetrics;
  }

  // Get current performance summary
  getPerformanceSummary(): {
    metrics: Partial<WebPerformanceMetrics>;
    score: PerformanceScore;
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

  // Export performance data for analysis
  exportData(): string {
    const summary = this.getPerformanceSummary();
    const data = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      metrics: summary.metrics,
      score: summary.score,
      recommendations: summary.recommendations,
      warnings: summary.warnings,
      entries: this.entries
    };

    return JSON.stringify(data, null, 2);
  }

  // Private methods

  private initializeObservers() {
    // No initialization needed for web - observers are created when needed
  }

  private collectNavigationTiming() {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
      this.metrics.ttfb = timing.responseStart - timing.navigationStart;
    }
  }

  private monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeVital('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.metrics.lcp = lastEntry.startTime;
        this.entries.push({
          name: 'LCP',
          startTime: lastEntry.startTime,
          duration: 0,
          type: 'largest-contentful-paint'
        });
      }
    });

    // First Input Delay (FID)
    this.observeVital('first-input', (entries) => {
      entries.forEach(entry => {
        const fid = (entry as any).processingStart - entry.startTime;
        if (this.metrics.fid === 0 || fid > this.metrics.fid) {
          this.metrics.fid = fid;
        }
        this.entries.push({
          name: 'FID',
          startTime: entry.startTime,
          duration: fid,
          type: 'first-input'
        });
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observeVital('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      this.metrics.cls += clsValue;
      this.entries.push({
        name: 'CLS',
        startTime: 0,
        duration: clsValue,
        type: 'layout-shift'
      });
    });

    // First Contentful Paint (FCP)
    this.observeVital('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.entries.push({
          name: 'FCP',
          startTime: fcpEntry.startTime,
          duration: 0,
          type: 'paint'
        });
      }
    });
  }

  private observeVital(type: string, callback: (entries: any[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ entryTypes: [type] });
      this.vitalsObservers.set(type, observer);
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  private monitorBundleLoading() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            if (resource.name.includes('.js') || resource.name.includes('.css')) {
              const loadTime = resource.responseEnd - resource.startTime;
              const resourceName = this.extractResourceName(resource.name);

              if (resource.name.includes('/assets/') && resource.name.includes('.js')) {
                this.metrics.chunkLoadTimes[resourceName] = loadTime;
                this.metrics.bundleLoadTime = Math.max(
                  this.metrics.bundleLoadTime,
                  loadTime
                );
              }

              this.entries.push({
                name: resourceName,
                startTime: resource.startTime,
                duration: loadTime,
                type: 'resource'
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }
  }

  private monitorResourceLoading() {
    // This is handled in monitorBundleLoading for now
    // Can be extended for more detailed resource monitoring
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
      this.metrics.connection = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }
  }

  private extractResourceName(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  private mark(name: string) {
    if (typeof performance !== 'undefined' && 'mark' in performance) {
      try {
        performance.mark(name);
        this.entries.push({
          name,
          startTime: performance.now(),
          duration: 0,
          type: 'measure'
        });
      } catch (error) {
        console.warn(`Failed to create mark ${name}:`, error);
      }
    }
  }

  private measure(name: string, startMark?: string, endMark?: string) {
    if (typeof performance !== 'undefined' && 'measure' in performance) {
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

  private disconnectAllObservers() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect observer:', error);
      }
    });
    this.observers = [];
    this.vitalsObservers.clear();
  }

  private calculatePerformanceScore(): PerformanceScore {
    let lcpScore = 100;
    let fidScore = 100;
    let clsScore = 100;

    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5s-4s, Poor: >4s)
    if (this.metrics.lcp > 4000) lcpScore = 0;
    else if (this.metrics.lcp > 2500) lcpScore = 50;
    else lcpScore = 100;

    // FID scoring (Good: <100ms, Needs Improvement: 100ms-300ms, Poor: >300ms)
    if (this.metrics.fid > 300) fidScore = 0;
    else if (this.metrics.fid > 100) fidScore = 50;
    else fidScore = 100;

    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (this.metrics.cls > 0.25) clsScore = 0;
    else if (this.metrics.cls > 0.1) clsScore = 50;
    else clsScore = 100;

    const overall = Math.round((lcpScore + fidScore + clsScore) / 3);

    return {
      overall,
      vitals: {
        lcp: lcpScore,
        fid: fidScore,
        cls: clsScore
      },
      recommendations: [],
      warnings: []
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const score = this.calculatePerformanceScore();

    if (score.vitals.lcp < 50) {
      recommendations.push('Improve LCP by optimizing server response time and reducing render-blocking resources');
      recommendations.push('Consider preload for critical resources and optimize images');
    }

    if (score.vitals.fid < 50) {
      recommendations.push('Reduce FID by minimizing JavaScript execution time and splitting long tasks');
      recommendations.push('Use web workers for heavy computations and optimize third-party scripts');
    }

    if (score.vitals.cls < 50) {
      recommendations.push('Reduce CLS by including size attributes on images and videos');
      recommendations.push('Avoid dynamically inserted content above existing content');
    }

    // Bundle-specific recommendations
    if (this.metrics.bundleLoadTime > 2000) {
      recommendations.push(`Bundle loading time is slow (${Math.round(this.metrics.bundleLoadTime)}ms). Consider code splitting`);
    }

    // Memory usage recommendations
    if (this.metrics.memoryUsage) {
      const usagePercent = (this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100;
      if (usagePercent > 80) {
        recommendations.push('Memory usage is high. Consider optimizing memory leaks and reducing object allocations');
      }
    }

    return recommendations;
  }

  private generateWarnings(): string[] {
    const warnings: string[] = [];
    const score = this.calculatePerformanceScore();

    if (score.vitals.lcp < 50) {
      warnings.push('Largest Contentful Paint exceeds 4 seconds - poor user experience');
    }

    if (score.vitals.fid < 50) {
      warnings.push('First Input Delay exceeds 300ms - sluggish interaction');
    }

    if (score.vitals.cls < 50) {
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
export const performanceMonitor = new WebPerformanceMonitor();

// Initialize performance monitoring in development
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
        console.log(`Performance Score: ${summary.score.overall}/100`);
        console.log(`LCP: ${summary.score.vitals.lcp}/100`);
        console.log(`FID: ${summary.score.vitals.fid}/100`);
        console.log(`CLS: ${summary.score.vitals.cls}/100`);

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

// Web Vitals scoring utilities
export const webVitalsThresholds = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 }
};

export function getVitalRating(value: number, vital: keyof typeof webVitalsThresholds): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = webVitalsThresholds[vital];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

export default performanceMonitor;