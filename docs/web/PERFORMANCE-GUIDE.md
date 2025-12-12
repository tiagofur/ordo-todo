# Ordo-Todo Web Performance Guide

## Overview

This guide covers performance optimization strategies, monitoring approaches, and best practices for the Ordo-Todo web application. Performance is critical for user experience and business success, especially for a productivity application.

## 🎯 Performance Goals

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|-------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | 1.8s - 3s | > 3s |
| **TTFB** (Time to First Byte) | < 800ms | 800ms - 1800ms | > 1800ms |

### Bundle Size Targets

- **Total Bundle**: < 2MB (gzipped)
- **Initial Load**: < 1MB (gzipped)
- **Largest Chunk**: < 250KB (gzipped)
- **Vendor Chunks**: < 1MB total (gzipped)
- **Images**: Optimized with WebP/AVIF formats

### Performance Scores

- **Lighthouse Performance**: > 90
- **Bundle Health Score**: > 80
- **Memory Usage**: < 100MB (typical usage)
- **First Paint**: < 1.5s

## 📊 Performance Monitoring

### Built-in Monitoring

The application includes comprehensive performance monitoring:

```typescript
// Automatic monitoring setup
import { initializePerformanceMonitoring } from '@/lib/performance-monitor';

// In development - automatically started
initializePerformanceMonitoring();

// Manual monitoring
const performanceMonitor = new WebPerformanceMonitor();
performanceMonitor.startMonitoring();

// Get performance summary
const summary = performanceMonitor.getPerformanceSummary();
console.log('Performance Score:', summary.score.overall);
```

### Metrics Collection

**Core Web Vitals**:
- LCP, FID, CLS tracking
- Real user monitoring (RUM)
- Performance scoring
- Threshold-based alerts

**Navigation Timing**:
- DOM content loaded time
- Full page load time
- Resource loading times
- Network latency measurements

**Bundle Performance**:
- Chunk load times
- Bundle size tracking
- Compression ratios
- Code splitting effectiveness

**Runtime Performance**:
- Memory usage monitoring
- Frame rate tracking
- Long task detection
- JavaScript execution time

### Performance Reports

```typescript
// Export performance data
const data = performanceMonitor.exportData();
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);

// Download performance report
const a = document.createElement('a');
a.href = url;
a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
a.click();
```

## 🚀 Optimization Strategies

### 1. Bundle Optimization

#### Code Splitting

```typescript
// Route-based splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));

// Feature-based splitting
const ChartComponents = lazy(() => import('@/components/charts'));
const AdminComponents = lazy(() => import('@/components/admin'));

// Component-based splitting
const HeavyComponent = lazy(() =>
  import('@/components/HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);
```

#### Tree Shaking

```typescript
// Import only what you need
import { Button, Card, Input } from '@ordo-todo/ui';
import { formatDistanceToNow } from 'date-fns';

// Use specific exports
import { debounce } from 'lodash-es/debounce';
import { cloneDeep } from 'lodash-es/cloneDeep';
```

#### Dynamic Imports

```typescript
// Load heavy dependencies on demand
const loadCharts = async () => {
  const { LineChart, BarChart } = await import('recharts');
  return { LineChart, BarChart };
};

// Conditional loading
const loadAdminPanel = () => {
  if (user.isAdmin) {
    return import('@/components/admin/AdminPanel');
  }
  return Promise.resolve({ default: () => null });
};
```

### 2. Image Optimization

#### Next.js Image Component

```typescript
import Image from 'next/image';

// Optimized image loading
<Image
  src="/api/og-image"
  alt="Task preview"
  width={1200}
  height={630}
  priority={isAboveFold} // Prioritize above-the-fold images
  placeholder="blur" // Add blur placeholder
  blurDataURL="data:image/jpeg;base64,..." // Low-res placeholder
  loading="lazy" // Lazy load below-the-fold images
  sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizing
/>
```

#### Image Formats

```typescript
// next.config.ts
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### 3. Performance APIs

#### Resource Hints

```typescript
// Preload critical resources
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin="" />
<link rel="preload" href="/critical.css" as="style" />

// Preconnect to external domains
<link rel="preconnect" href="https://api.ordo-todo.com" />
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />

// Prefetch likely navigation
<link rel="prefetch" href="/dashboard" />
```

#### Service Worker Caching

```typescript
// Cache strategies for different resource types
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Cache first for static assets
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request));
  }

  // Network first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
  }

  // Stale while revalidate for images
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
  }
});
```

### 4. Memory Management

#### React Optimization

```typescript
// Memoize expensive computations
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);

  return <div>{processedData}</div>;
});

// Memoize event handlers
const ParentComponent = ({ items }) => {
  const handleClick = useCallback((id) => {
    console.log('Item clicked:', id);
  }, []);

  return (
    <div>
      {items.map(item => (
        <ChildComponent
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  );
};

// Virtualize long lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        {data[index].content}
      </div>
    )}
  </List>
);
```

#### State Management

```typescript
// Optimize Zustand stores
const useTaskStore = create((set, get) => ({
  tasks: [],
  filteredTasks: [],

  // Computed selectors
  getCompletedTasks: () => get().tasks.filter(task => task.completed),
  getTasksByProject: (projectId) => get().tasks.filter(task => task.projectId === projectId),

  // Batch updates
  updateMultipleTasks: (updates) => set((state) => ({
    tasks: state.tasks.map(task => {
      const update = updates.find(u => u.id === task.id);
      return update ? { ...task, ...update } : task;
    })
  })),
}));

// Use shallow comparison for selectors
const tasks = useTaskStore(state => state.tasks, shallow);
const completedCount = useTaskStore(state => state.getCompletedTasks().length);
```

### 5. Network Optimization

#### API Caching

```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Retry on network errors, not on 4xx errors
        return failureCount < 3 && error.status >= 500;
      },
    },
  },
});

// Strategic cache invalidation
const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

#### Request Optimization

```typescript
// Batch API requests
const batchRequests = async (requests: Request[]) => {
  const batchEndpoint = '/api/batch';
  const response = await fetch(batchEndpoint, {
    method: 'POST',
    body: JSON.stringify({ requests }),
  });
  return response.json();
};

// Request deduplication
const debouncedSearch = debounce(async (query: string) => {
  const results = await searchTasks(query);
  return results;
}, 300);

// Optimistic updates
const updateTaskOptimistically = async (taskId: string, updates: any) => {
  // Update UI immediately
  queryClient.setQueryData(['tasks'], (old: any) =>
    old.map((task: any) =>
      task.id === taskId ? { ...task, ...updates } : task
    )
  );

  try {
    // Sync with server
    await updateTask(taskId, updates);
  } catch (error) {
    // Rollback on error
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }
};
```

## 🔍 Performance Analysis

### Bundle Analysis

```bash
# Analyze bundle composition
npm run build:analyze

# Generate detailed bundle report
npm run build:report

# Check bundle size impact
npm run build -- --analyze
```

### Performance Testing

```typescript
// Performance testing utilities
export const measureRenderTime = (componentName: string) => {
  return (WrappedComponent: React.ComponentType) => {
    return function MeasuredComponent(props: any) {
      useEffect(() => {
        const startTime = performance.now();

        return () => {
          const endTime = performance.now();
          console.log(`${componentName} render time:`, endTime - startTime);
        };
      });

      return <WrappedComponent {...props} />;
    };
  };
};

// Long task detection
const observeLongTasks = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('Long task detected:', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }
};
```

### Memory Profiling

```typescript
// Memory usage tracking
const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;

    setInterval(() => {
      const usage = {
        used: memory.usedJSHeapSize / 1024 / 1024,
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024,
      };

      if (usage.used > 100) { // Alert if using > 100MB
        console.warn('High memory usage detected:', usage);
      }
    }, 30000); // Check every 30 seconds
  }
};

// Detect memory leaks
const detectMemoryLeaks = () => {
  let previousMemory = 0;

  const checkMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const currentMemory = memory.usedJSHeapSize;

      if (previousMemory > 0) {
        const growth = currentMemory - previousMemory;
        const growthPercent = (growth / previousMemory) * 100;

        if (growthPercent > 20) { // 20% growth threshold
          console.warn('Potential memory leak detected:', {
            previousMemory: previousMemory / 1024 / 1024,
            currentMemory: currentMemory / 1024 / 1024,
            growth: growthPercent,
          });
        }
      }

      previousMemory = currentMemory;
    }
  };

  // Check memory every minute
  setInterval(checkMemory, 60000);
};
```

## 📈 Performance Budgets

### Setting Budgets

```typescript
// next.config.ts
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 250000, // 250KB per asset
        maxEntrypointSize: 500000, // 500KB per entry point
        hints: 'warning', // Show warnings for budget violations
      };
    }

    return config;
  },
};
```

### Bundle Budget Rules

- **Initial chunks**: < 500KB uncompressed
- **Individual chunks**: < 250KB uncompressed
- **Vendor chunks**: < 1MB total uncompressed
- **CSS chunks**: < 100KB each
- **Images**: < 100KB each, optimized format

### Performance Budget Monitoring

```typescript
// Budget monitoring utility
const performanceBudget = {
  maxBundleSize: 2 * 1024 * 1024, // 2MB
  maxChunkSize: 250 * 1024, // 250KB
  maxLCP: 2500, // 2.5s
  maxFID: 100, // 100ms
  maxCLS: 0.1,
};

const checkPerformanceBudgets = () => {
  const metrics = performanceMonitor.getPerformanceSummary();

  Object.entries(performanceBudget).forEach(([metric, limit]) => {
    const value = metrics[metric];
    if (value > limit) {
      console.warn(`Performance budget exceeded for ${metric}:`, {
        value,
        limit,
        excess: value - limit,
      });
    }
  });
};
```

## 🛠️ Development Best Practices

### Code Patterns

#### Efficient Rendering

```typescript
// ✅ Good: Use memo and useMemo
const ExpensiveList = memo(({ items }) => {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.priority - b.priority),
    [items]
  );

  return (
    <ul>
      {sortedItems.map(item => (
        <TaskItem key={item.id} task={item} />
      ))}
    </ul>
  );
});

// ❌ Bad: Re-sort on every render
const BadList = ({ items }) => {
  const sortedItems = items.sort((a, b) => a.priority - b.priority);

  return (
    <ul>
      {sortedItems.map(item => (
        <TaskItem key={item.id} task={item} />
      ))}
    </ul>
  );
};
```

#### State Management

```typescript
// ✅ Good: Granular state selection
const tasks = useTaskStore(state => state.tasks);
const filters = useTaskStore(state => state.filters);
const filteredTasks = useMemo(
  () => tasks.filter(task => matchesFilters(task, filters)),
  [tasks, filters]
);

// ❌ Bad: Selecting entire store
const store = useTaskStore();
const filteredTasks = store.tasks.filter(task =>
  matchesFilters(task, store.filters)
);
```

#### Event Handling

```typescript
// ✅ Good: Debounced event handlers
const SearchInput = () => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      searchTasks(searchQuery);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return debouncedSearch.cancel;
  }, [query, debouncedSearch]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search tasks..."
    />
  );
};

// ❌ Bad: Search on every keystroke
const BadSearchInput = () => {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchTasks(newQuery); // API call on every keystroke
  };

  return (
    <input
      value={query}
      onChange={handleChange}
      placeholder="Search tasks..."
    />
  );
};
```

### Asset Optimization

#### Image Loading

```typescript
// ✅ Good: Progressive image loading
const ProgressiveImage = ({ src, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={imageSrc || src}
        alt={alt}
        loading="lazy"
        {...props}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};
```

#### Font Loading

```typescript
// ✅ Good: Optimize font loading
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Font display optimization */}
        <style>
          {`
            @font-face {
              font-family: 'Inter';
              src: url('/fonts/inter-var.woff2') format('woff2');
              font-display: swap;
            }
          `}
        </style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 🚨 Performance Alerts

### Setup Alerts

```typescript
// Performance alert system
const performanceAlerts = {
  lcp: { threshold: 2500, severity: 'high' },
  fid: { threshold: 100, severity: 'medium' },
  cls: { threshold: 0.1, severity: 'medium' },
  bundleSize: { threshold: 2 * 1024 * 1024, severity: 'high' },
  memoryUsage: { threshold: 100 * 1024 * 1024, severity: 'low' },
};

const checkPerformanceAlerts = () => {
  const metrics = performanceMonitor.getPerformanceSummary();

  Object.entries(performanceAlerts).forEach(([metric, config]) => {
    const value = metrics[metric];
    if (value > config.threshold) {
      // Send alert to monitoring service
      sendAlert({
        metric,
        value,
        threshold: config.threshold,
        severity: config.severity,
        timestamp: Date.now(),
      });
    }
  });
};
```

### Alert Notifications

```typescript
// Development-time alerts
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = performanceMonitor.getPerformanceSummary();

    if (metrics.lcp > 3000) {
      console.warn('⚠️ Slow LCP detected:', metrics.lcp);
    }

    if (metrics.bundleSize > 3 * 1024 * 1024) {
      console.warn('⚠️ Large bundle size:', formatBytes(metrics.bundleSize));
    }
  }, 10000);
}
```

## 📚 Performance Resources

### Tools and Libraries

- **Lighthouse**: Automated performance auditing
- **WebPageTest**: Real-world performance testing
- **Chrome DevTools**: Performance profiling
- **Bundle Analyzer**: Bundle size analysis
- **React DevTools Profiler**: Component performance

### Documentation

- [Web Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Performance Best Practices](https://developers.google.com/web/fundamentals/performance)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

### Monitoring Services

- Google PageSpeed Insights
- Web Vitals Chrome Extension
- Real User Monitoring (RUM) services
- Performance monitoring platforms

---

Regular performance monitoring and optimization should be part of your development workflow. Use the built-in developer tools to track performance metrics and identify optimization opportunities.