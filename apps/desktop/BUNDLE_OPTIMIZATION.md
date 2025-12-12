# Bundle Optimization Guide

This document explains the bundle optimization features implemented for the Ordo-Todo desktop application.

## Overview

Bundle optimization is crucial for improving application performance, reducing load times, and enhancing user experience. This implementation includes:

- **Bundle Analysis**: Comprehensive bundle size analysis and visualization
- **Code Splitting**: Intelligent splitting of code into manageable chunks
- **Tree Shaking**: Elimination of unused code and dependencies
- **Performance Monitoring**: Real-time performance tracking and optimization
- **Automated Optimization**: Configuration-driven optimization strategies

## Features

### 1. Bundle Analyzer

Visualizes bundle composition and identifies optimization opportunities.

**Usage:**
```bash
# Build with bundle analysis
npm run build:analyze

# Generate bundle report
npm run build:report

# Analyze existing bundle
npm run analyze:bundle

# Build and analyze in one command
npm run bundle:check
```

**Output:**
- Interactive HTML report (`dist/bundle-analysis.html`)
- Text-based analysis reports (`bundle-analysis/`)
- Performance score and recommendations

### 2. Code Splitting Strategy

Automatic code splitting based on module types and usage patterns.

**Splitting Rules:**
- **Vendor Chunks**: External libraries grouped by category
- **Feature Chunks**: Application components grouped by feature
- **Route Chunks**: Page-specific code split by route
- **Utility Chunks**: Shared utilities and hooks

**Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@ordo-todo/ui', 'lucide-react'],

          // Feature-based chunks
          'feature-tasks': /\/components\/task\//,
          'feature-timer': /\/components\/timer\//,
        }
      }
    }
  }
});
```

### 3. Performance Monitoring

Real-time performance tracking during development.

**Development Tools:**
- Performance monitoring (Ctrl+Shift+P for report)
- Bundle analysis in browser console
- Chunk loading time tracking
- Core Web Vitals monitoring

**API:**
```typescript
// Access performance monitor
window.__PERFORMANCE_MONITOR__

// Get performance summary
const summary = performanceMonitor.getPerformanceSummary();

// Export performance data
const data = performanceMonitor.exportData();
```

### 4. Bundle Optimizer Utilities

Advanced optimization utilities for runtime analysis.

**Key Components:**
- `BundleAnalyzer`: Comprehensive bundle analysis
- `TreeShakingOptimizer`: Unused code elimination
- `CodeSplittingOptimizer`: Splitting strategy optimization
- `PerformanceMonitor`: Real-time performance tracking

## Development Workflow

### 1. Initial Setup

The bundle optimization tools are automatically initialized in development mode:

```typescript
// main.tsx
if (process.env.NODE_ENV === "development") {
  initializePerformanceMonitoring();
  enableBundleAnalysis();
  initializeCodeSplitting();
}
```

### 2. Bundle Analysis

During development, use the following workflow:

1. **Build and Analyze:**
   ```bash
   npm run build:analyze
   ```

2. **Review Report:**
   - Open `dist/bundle-analysis.html` in browser
   - Check bundle size and composition
   - Identify large chunks and dependencies

3. **Optimize:**
   - Implement code splitting for large components
   - Remove unused dependencies
   - Configure better chunking strategy

### 3. Performance Monitoring

Monitor performance during development:

- **Keyboard Shortcuts:**
  - `Ctrl+Shift+P`: Show performance report
  - Browser console: Check bundle loading times

- **Console API:**
  ```javascript
  // Analyze current bundle
  window.analyzeBundle()

  // Export performance report
  window.exportBundleReport()
  ```

## Configuration

### Bundle Analysis Configuration

```typescript
// src/lib/bundle-optimizer.ts
const config = {
  level: 'standard', // minimal, standard, aggressive
  enableTreeShaking: true,
  enableCodeSplitting: true,
  enableCompression: true,
  chunkSizeLimit: 250000, // 250KB
  dependencyAnalysis: true
};
```

### Code Splitting Configuration

```typescript
// src/lib/code-splitting.ts
export const routeChunks = {
  dashboard: {
    name: 'dashboard',
    priority: ChunkPriority.CRITICAL,
    preload: true,
    estimatedSize: 150000
  },
  analytics: {
    name: 'analytics',
    priority: ChunkPriority.MEDIUM,
    preload: false,
    prefetch: true,
    estimatedSize: 180000
  }
};
```

## Performance Targets

### Bundle Size Goals

- **Total Bundle Size**: < 2MB
- **JavaScript Size**: < 1.5MB
- **Largest Chunk**: < 250KB
- **Compression Ratio**: < 40% of original

### Core Web Vitals

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## Optimization Recommendations

### 1. Code Splitting

- Implement route-based splitting for large pages
- Use dynamic imports for conditional features
- Preload critical chunks, prefetch non-critical

### 2. Tree Shaking

- Use ES module imports instead of CommonJS
- Avoid importing entire libraries
- Configure sideEffects in package.json

### 3. Bundle Analysis

- Regular bundle audits
- Monitor bundle size changes
- Identify and remove unused dependencies

### 4. Performance Monitoring

- Track Core Web Vitals
- Monitor chunk loading times
- Optimize based on real user data

## Troubleshooting

### Common Issues

1. **Large Bundle Size:**
   - Check for unused dependencies
   - Implement better code splitting
   - Use bundle analyzer to identify large modules

2. **Slow Chunk Loading:**
   - Enable preloading for critical chunks
   - Check network performance
   - Optimize chunk priorities

3. **Bundle Analysis Errors:**
   - Ensure build directory exists
   - Check Vite configuration
   - Verify manifest.json generation

### Debug Tools

- Browser DevTools: Network panel for chunk loading
- Console: Performance monitor output
- Bundle Analyzer: Visual bundle composition

## API Reference

### BundleAnalyzer

```typescript
class BundleAnalyzer {
  async analyzeBundle(): Promise<BundleMetrics>
  generateHealthScore(metrics: BundleMetrics): BundleHealthScore
  getOptimizationSuggestions(): string[]
  exportReport(): string
}
```

### PerformanceMonitor

```typescript
class PerformanceMonitor {
  startMonitoring(): void
  stopMonitoring(): PerformanceMetrics
  recordBundleLoad(event: BundleLoadEvent): void
  getPerformanceSummary(): PerformanceSummary
  exportData(): string
}
```

### CodeSplittingOptimizer

```typescript
interface ChunkConfig {
  name: string;
  priority: ChunkPriority;
  preload: boolean;
  prefetch: boolean;
  estimatedSize: number;
}

function createLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  chunkConfig?: Partial<ChunkConfig>
): React.LazyExoticComponent<T>
```

## Best Practices

1. **Regular Bundle Audits**: Analyze bundle size after major changes
2. **Performance Budgets**: Set and monitor bundle size limits
3. **Progressive Enhancement**: Load critical features first
4. **Lazy Loading**: Implement for non-critical features
5. **Monitoring**: Track real-world performance metrics

## Scripts Reference

- `npm run build:analyze`: Build with bundle analysis visualization
- `npm run build:report`: Generate detailed bundle report
- `npm run analyze:bundle`: Analyze existing bundle
- `npm run bundle:check`: Build and analyze in one command

## Related Files

- `vite.config.ts`: Bundle optimization configuration
- `src/lib/bundle-optimizer.ts`: Bundle analysis utilities
- `src/lib/code-splitting.ts`: Code splitting strategy
- `src/lib/performance-monitor.ts`: Performance monitoring
- `src/lib/optimized-imports.ts`: Import optimization
- `scripts/analyze-bundle.mjs`: Bundle analysis script

## Future Enhancements

1. **Automated CI/CD Integration**: Bundle size checks in CI
2. **Real-time Monitoring**: Production performance tracking
3. **Advanced Splitting**: AI-powered code splitting
4. **Compression Optimization**: Better compression strategies
5. **Edge Optimization**: CDN and edge computing integration