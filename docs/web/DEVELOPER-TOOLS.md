# Ordo-Todo Web Developer Tools

## Overview

The Ordo-Todo web application includes a comprehensive suite of developer tools designed for debugging, performance monitoring, and optimization during development. These tools are inspired by desktop IDE capabilities and are specifically adapted for web browser environments.

## 🛠️ Available Tools

### 1. Performance Monitor (Ctrl+Shift+P)

**Purpose**: Monitor Core Web Vitals and runtime performance metrics

**Features**:
- Real-time Core Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
- Navigation timing analysis
- Bundle loading performance
- Memory usage monitoring (when available)
- Network information tracking
- Performance scoring (0-100)
- Actionable recommendations
- Export performance data

**Metrics Tracked**:
- **LCP** (Largest Contentful Paint): Loading performance
- **FID** (First Input Delay): Interactivity
- **CLS** (Cumulative Layout Shift): Visual stability
- **FCP** (First Contentful Paint): First paint
- **TTFB** (Time to First Byte): Server response time
- **DOM Content Loaded**: DOM ready state
- **Load Complete**: Full page load
- **Bundle Load Time**: JavaScript bundle loading
- **Chunk Load Times**: Individual chunk loading times
- **Memory Usage**: JavaScript heap usage (Chrome only)

**Performance Targets**:
- LCP < 2.5s (Good), < 4s (Needs Improvement)
- FID < 100ms (Good), < 300ms (Needs Improvement)
- CLS < 0.1 (Good), < 0.25 (Needs Improvement)
- Bundle Size < 2MB total, < 250KB per chunk

### 2. Bundle Analyzer (Ctrl+Shift+B)

**Purpose**: Analyze JavaScript bundle size and composition

**Features**:
- Interactive bundle visualization
- Chunk size analysis and sorting
- Dependency breakdown
- Compression analysis (gzip/brotli)
- Health score calculation
- Optimization recommendations
- Bundle export functionality

**Analysis Categories**:
- **Vendor Chunks**: Third-party dependencies
- **App Chunks**: Application code
- **CSS Assets**: Stylesheets
- **Other Assets**: Images, fonts, etc.

**Health Score Factors**:
- Total bundle size
- Individual chunk sizes
- Compression ratio
- Vendor chunk separation
- Code splitting effectiveness

### 3. State Inspector (Ctrl+Shift+I)

**Purpose**: Inspect application state and data stores

**Features**:
- Zustand store inspection
- React Query cache monitoring
- LocalStorage/SessionStorage analysis
- Memory state tracking
- Real-time state updates
- State history and changes
- Search and filtering capabilities

**Supported Stores**:
- **Zustand**: Global application state
- **React Query**: Server state and caching
- **LocalStorage**: Persistent browser storage
- **SessionStorage**: Session-based storage
- **Memory**: In-memory data structures

**State Information**:
- Store size and keys
- Current state data
- Last updated timestamps
- Change tracking
- Storage usage statistics

### 4. Analytics Logger (Ctrl+Shift+A)

**Purpose**: View and debug analytics events and user behavior

**Features**:
- Real-time event streaming
- Event categorization and filtering
- Severity level tracking
- Session analysis
- Performance metrics dashboard
- Event export capabilities
- Search and filter functionality

**Event Categories**:
- **User Actions**: User interactions
- **Performance**: Performance metrics
- **Errors**: Application errors
- **Feature Usage**: Feature adoption
- **System**: System events
- **Business**: Business metrics

**Severity Levels**:
- **Critical**: System failures
- **High**: Major issues
- **Medium**: Moderate issues
- **Low**: Informational events

## ⌨️ Keyboard Shortcuts

| Shortcut | Tool | Action |
|----------|------|--------|
| `Ctrl+Shift+P` | Performance Monitor | Open/Close |
| `Ctrl+Shift+B` | Bundle Analyzer | Open/Close |
| `Ctrl+Shift+I` | State Inspector | Open/Close |
| `Ctrl+Shift+A` | Analytics Logger | Open/Close |
| `Ctrl+Shift+D` | DevTools Panel | Toggle All Tools |
| `Ctrl+Shift+H` | Help | Show shortcuts |
| `Escape` | Any Tool | Close current tool |

## 🚀 Getting Started

### Automatic Setup

The DevTools are automatically initialized in development mode:

1. **Performance Monitor** auto-starts after 2 seconds
2. **DevTools Panel** appears in the top-right corner
3. **Keyboard shortcuts** are enabled
4. **Development indicator** shows in bottom-left

### Manual Activation

```typescript
// Import and use the hook
import { useDevTools } from '@/hooks/useDevTools';

function MyComponent() {
  const devtools = useDevTools({
    autoStartPerformanceMonitor: true,
    enableKeyboardShortcuts: true,
    showDevModeIndicator: true,
    logActions: false
  });

  // Open specific tools
  devtools.openPerformanceReport();
  devtools.openBundleAnalysis();

  return <div>My App</div>;
}
```

### Programmatic Control

```typescript
// Access tools directly
import {
  usePerformanceMonitor,
  useBundleAnalyzer,
  useStateInspector,
  useAnalyticsLogger
} from '@/components/devtools';

function Component() {
  const performance = usePerformanceMonitor();
  const bundle = useBundleAnalyzer();
  const state = useStateInspector();
  const analytics = useAnalyticsLogger();

  // Control tools programmatically
  performance.open();
  bundle.open();
  state.open();
  analytics.open();
}
```

## 🔧 Configuration

### Default Configuration

```typescript
// src/config/devtools.config.ts
export const defaultDevToolsConfig = {
  enabled: process.env.NODE_ENV === 'development',
  autoStart: true,
  keyboardShortcuts: true,
  showDevModeIndicator: true,
  logActions: false,

  performanceMonitor: {
    enabled: true,
    autoStart: true,
    collectMetrics: true,
    sampleInterval: 1000,
    thresholds: {
      lcp: 2500,    // 2.5s
      fid: 100,     // 100ms
      cls: 0.1,     // 0.1
      bundleSize: 2 * 1024 * 1024, // 2MB
    }
  },
  // ... other tool configurations
};
```

### Environment Override

```bash
# .env.local
NEXT_PUBLIC_DEVTOOLS_CONFIG='{"logActions":true,"autoStart":false}'
```

### Custom Configuration

```typescript
import { getDevToolsConfig } from '@/config/devtools.config';

// Customize configuration
const config = getDevToolsConfig();
config.performanceMonitor.thresholds.lcp = 3000;
config.bundleAnalyzer.autoAnalyze = true;
```

## 🏗️ Architecture

### Tool Structure

Each tool follows a consistent pattern:

```typescript
// Tool Component
export function ToolComponent({ isOpen = true, className }: ToolProps) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tool implementation

  return (
    <Modal isOpen={isOpen}>
      {/* Tool UI */}
    </Modal>
  );
}

// Tool Hook
export function useTool() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}
```

### Integration Points

- **Performance Monitor**: Uses Web Performance APIs
- **Bundle Analyzer**: Reads webpack stats and build artifacts
- **State Inspector**: Connects to store instances via window object
- **Analytics Logger**: Integrates with existing analytics system

## 📊 Performance Impact

### Development Mode Only

- DevTools are completely disabled in production
- No bundle size impact in production builds
- Zero runtime overhead in production

### Memory Usage

- Tools use lazy loading patterns
- Data is periodically cleaned up
- Maximum limits enforced:
  - Performance data points: 100
  - Analytics events: 1000
  - State history: 50 entries

### Performance Monitoring Overhead

- Minimal impact on application performance
- Sampling interval: 1 second (configurable)
- Async data collection
- Non-blocking operations

## 🐛 Troubleshooting

### Common Issues

**DevTools not appearing**:
- Ensure `NODE_ENV=development`
- Check console for initialization errors
- Verify providers are properly configured

**Keyboard shortcuts not working**:
- Check if shortcuts are enabled in config
- Ensure no other extensions are conflicting
- Try refreshing the page

**Performance monitor showing no data**:
- Wait a few seconds for initial data collection
- Check browser supports Performance APIs
- Verify no ad-blockers are interfering

**State inspector not showing stores**:
- Ensure stores are accessible via window object
- Check if stores are properly initialized
- Verify store naming conventions

**Bundle analyzer showing empty data**:
- Run `npm run build` first
- Check if build artifacts exist in `.next/`
- Verify bundle analysis script completed successfully

### Debug Mode

Enable detailed logging:

```typescript
const devtools = useDevTools({
  logActions: true,  // Console log all actions
  autoStart: true,  // Auto-start all tools
});
```

### Reset DevTools

```javascript
// Reset to default state
localStorage.removeItem('ordo-devtools-config');
sessionStorage.clear();
location.reload();
```

## 🔍 Advanced Usage

### Custom Metrics

```typescript
// Add custom performance metrics
import { performanceMonitor } from '@/lib/performance-monitor';

// Mark custom performance points
performanceMonitor.mark('feature-start');
// ... feature code
performanceMonitor.mark('feature-end');
performanceMonitor.measure('feature-duration', 'feature-start', 'feature-end');
```

### Analytics Events

```typescript
// Track custom analytics events
if (typeof window !== 'undefined' && window.__ANALYTICS_EVENTS__) {
  window.__ANALYTICS_EVENTS__.push({
    event: 'custom_feature_used',
    timestamp: Date.now(),
    data: { feature: 'advanced-search', duration: 1200 },
    category: 'feature_usage',
    severity: 'low'
  });
}
```

### Store Integration

```typescript
// Expose stores for inspection
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__MY_STORE__ = useMyStore(); // Zustand store
  window.__QUERY_CLIENT__ = queryClient; // React Query
}
```

## 📚 Best Practices

### Development Workflow

1. **Start with Performance Monitor** to establish baselines
2. **Use Bundle Analyzer** after significant code changes
3. **Check State Inspector** when debugging state issues
4. **Monitor Analytics Logger** during user testing
5. **Export data** before major releases for comparison

### Performance Optimization

1. **Monitor bundle size** regularly
2. **Track Core Web Vitals** during development
3. **Watch memory usage** for leaks
4. **Analyze state patterns** for optimization opportunities
5. **Review analytics** for performance bottlenecks

### Code Organization

1. **Keep DevTools imports** in development-only code paths
2. **Use lazy loading** for heavy tool components
3. **Implement proper cleanup** in useEffect hooks
4. **Follow consistent naming** conventions for stores
5. **Document custom metrics** for team reference

## 🔗 External Resources

- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Bundle Analyzer](https://github.com/nextjs/bundle-analyzer)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Note**: These tools are designed for development purposes only and are automatically disabled in production builds to ensure optimal performance for end users.