# Ordo-Todo Web Troubleshooting Guide

## Overview

This guide provides solutions to common issues, debugging techniques, and troubleshooting steps for the Ordo-Todo web application. It covers both development and production issues.

## 🚨 Quick Fixes

### Common Development Issues

#### Application Won't Start
```bash
# Issue: Next.js development server fails to start
# Solution: Clean and reinstall dependencies

# 1. Clear all caches
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 2. Reinstall dependencies
npm install

# 3. Restart development server
npm run dev
```

#### Database Connection Issues
```bash
# Issue: Cannot connect to PostgreSQL database
# Solution: Check database connection and configuration

# 1. Verify database is running
docker ps | grep postgres

# 2. Test connection
npx prisma db push

# 3. Check environment variables
echo $DATABASE_URL

# 4. Regenerate Prisma client
npx prisma generate
```

#### Build Failures
```bash
# Issue: Build fails with TypeScript errors
# Solution: Fix type errors and rebuild

# 1. Check TypeScript errors
npm run check-types

# 2. Fix linting issues
npm run lint:fix

# 3. Clean build
npm run build:clean

# 4. Rebuild
npm run build
```

### Performance Issues

#### Slow Page Load Times
```bash
# Issue: First Contentful Paint (FCP) > 3 seconds
# Solution: Analyze and optimize bundle

# 1. Run bundle analysis
npm run build:analyze

# 2. Check Core Web Vitals
npm run performance:check

# 3. Optimize images
npm run images:optimize

# 4. Enable compression in next.config.ts
```

#### High Memory Usage
```bash
# Issue: Memory usage exceeds 100MB in development
# Solution: Check for memory leaks

# 1. Profile memory usage
npm run memory:profile

# 2. Check React component unmounting
npm run memory:check-cleanup

# 3. Review state management usage
npm run memory:check-stores
```

## 🔧 Debugging Techniques

### Browser DevTools

#### Performance Tab
1. **Record Performance**
   - Open Chrome DevTools (F12)
   - Go to Performance tab
   - Click "Record"
   - Perform actions that are slow
   - Stop recording and analyze

2. **Analyze Results**
   - Look for long tasks (red bars)
   - Check Main thread activity
   - Review network requests
   - Identify rendering bottlenecks

#### Network Tab
```javascript
// Monitor API calls in console
// Add to browser console for debugging
const originalFetch = window.fetch;
window.fetch = (...args) => {
  console.log('API Call:', args[0], args[1]);
  return originalFetch.apply(window, args).then(response => {
    console.log('API Response:', response.status, response.url);
    return response;
  });
};
```

#### Memory Tab
1. **Heap Snapshot**
   - Take snapshot before and after actions
   - Compare snapshots for memory leaks
   - Look for detached DOM nodes

2. **Allocation Timeline**
   - Record allocation over time
   - Identify high-frequency allocations
   - Find memory leak sources

### React DevTools

#### Component Profiling
```typescript
// Add performance marks to components
const TaskCard = ({ task }) => {
  useEffect(() => {
    performance.mark('TaskCard-render-start');
    return () => {
      performance.mark('TaskCard-render-end');
      performance.measure('TaskCard-render', 'TaskCard-render-start', 'TaskCard-render-end');
    };
  });

  return <div>{task.title}</div>;
};
```

#### State Inspection
```typescript
// Debug Zustand store changes
const useTaskStore = create((set, get) => ({
  tasks: [],

  addTask: (task) => {
    console.log('Adding task:', task);
    console.log('Previous state:', get());

    set((state) => {
      const newState = { tasks: [...state.tasks, task] };
      console.log('New state:', newState);
      return newState;
    });
  }
}));
```

### Console Debugging

#### Error Boundary Logging
```typescript
// Enhanced error boundary for development
class DevelopmentErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();

      // Display error in UI
      this.setState({
        error: error,
        errorInfo: errorInfo
      });
    }
  }

  render() {
    if (this.state.error && process.env.NODE_ENV === 'development') {
      return (
        <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
          <h2>Development Error</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error.stack}</pre>
            <pre>{this.state.errorInfo.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🔍 Common Problems & Solutions

### State Management Issues

#### Zustand Store Not Updating
```typescript
// Problem: Store state changes not reflecting in components
// Solution: Ensure proper state immutability

// ❌ Wrong - Direct mutation
const store = create((set) => ({
  tasks: [],
  addTask: (task) => {
    set((state) => {
      state.tasks.push(task); // Wrong!
      return state;
    });
  }
}));

// ✅ Correct - Immutable update
const store = create((set) => ({
  tasks: [],
  addTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, task] // Correct!
    }));
  }
}));
```

#### React Query Stale Data
```typescript
// Problem: Data not refreshing after mutations
// Solution: Proper cache invalidation

const useCreateTask = () => {
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate queries that should refresh
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // If task affects projects
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
    }
  });
};
```

### Performance Issues

#### Bundle Size Too Large
```typescript
// Problem: Bundle size exceeds 2MB limit
// Solution: Implement code splitting

// ❌ Wrong - Import heavy library at top level
import * as recharts from 'recharts';
const Dashboard = () => <LineChart data={data} />;

// ✅ Correct - Lazy load heavy components
const Dashboard = () => {
  const [LineChart, setLineChart] = React.useState(null);

  React.useEffect(() => {
    import('recharts').then((charts) => {
      setLineChart(() => charts.LineChart);
    });
  }, []);

  return LineChart ? <LineChart data={data} /> : <div>Loading...</div>;
};
```

#### React Re-renders
```typescript
// Problem: Components re-rendering unnecessarily
// Solution: Memoize expensive components and computations

// ❌ Wrong - Function created on every render
const TaskList = ({ tasks }) => {
  const filteredTasks = tasks.filter(task => task.completed);

  return (
    <div>
      {filteredTasks.map(task => (
        <TaskItem key={task.id} task={task} onUpdate={() => {}} />
      ))}
    </div>
  );
};

// ✅ Correct - Memoize computations and callbacks
const TaskList = React.memo(({ tasks }) => {
  const filteredTasks = React.useMemo(
    () => tasks.filter(task => task.completed),
    [tasks]
  );

  const handleUpdate = React.useCallback((taskId, updates) => {
    updateTask(taskId, updates);
  }, []);

  return (
    <div>
      {filteredTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
});
```

### API Issues

#### Network Request Failures
```typescript
// Problem: API calls failing intermittently
// Solution: Implement proper error handling and retries

// ❌ Wrong - No error handling
const fetchTasks = async () => {
  const response = await fetch('/api/tasks');
  return response.json();
};

// ✅ Correct - Proper error handling and retries
const fetchTasks = async (retries = 3): Promise<Task[]> => {
  try {
    const response = await fetch('/api/tasks', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying fetchTasks, ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchTasks(retries - 1);
    }
    throw error;
  }
};
```

#### Authentication Issues
```typescript
// Problem: Users getting logged out unexpectedly
// Solution: Proper token management and refresh

// ✅ Correct - Token refresh logic
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const { token: newToken } = await response.json();
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (token) {
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [token]);

  return { user, token, refreshToken, logout };
};
```

## 🐛 Error Analysis

### Common Error Types

#### TypeScript Errors
```typescript
// Error: Type 'string' is not assignable to type 'never'
// Problem: Array type inference issue
// Solution: Explicit typing

// ❌ Problematic code
const items = [];
items.push('string'); // Error: string is not assignable to never

// ✅ Correct code
const items: string[] = [];
items.push('string'); // Works fine

// Or use generic typing
const items = [] as string[];
```

#### Next.js Errors
```typescript
// Error: Text content does not match server-rendered HTML
// Problem: Hydration mismatch
// Solution: Ensure client and server render the same content

// ❌ Problematic code
const Timer = () => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>Current time: {time}</div>; // Mismatch between server and client
};

// ✅ Correct code
const Timer = () => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    // Only set time on client
    setTime(Date.now());
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      Current time: {time || <span>Loading...</span>}
    </div>
  );
};
```

#### Prisma Errors
```typescript
// Error: Unique constraint failed on field
// Problem: Database constraint violation
// Solution: Handle conflicts properly

// ❌ Problematic code
const createTask = async (data: TaskData) => {
  const task = await prisma.task.create({
    data: {
      ...data,
      id: data.id // Might conflict with existing ID
    }
  });
  return task;
};

// ✅ Correct code
const createTask = async (data: TaskData) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...data,
        // Let database generate ID or handle conflicts
        id: data.id || undefined
      }
    });
    return task;
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      throw new Error('Task with this ID already exists');
    }
    throw error;
  }
};
```

## 🔧 Development Tools Troubleshooting

### DevTools Not Working

#### DevTools Panel Not Visible
```typescript
// Problem: DevTools not showing in development
// Solution: Check configuration and environment

// 1. Verify environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DevTools enabled:', process.env.NODE_ENV === 'development');

// 2. Check providers
// Ensure DevToolsProvider is wrapping the app
// Check that DevToolsPanel is included

// 3. Debug DevTools initialization
if (typeof window !== 'undefined') {
  console.log('DevTools available:', !!window.__DEVTOOLS__);
  console.log('Performance monitor available:', !!window.__PERFORMANCE_MONITOR__);
}
```

#### Performance Monitor Issues
```typescript
// Problem: Performance metrics not updating
// Solution: Ensure Performance APIs are available

// Check browser support
const checkPerformanceSupport = () => {
  const features = {
    performanceObserver: 'PerformanceObserver' in window,
    navigationTiming: 'performance' in window && 'timing' in performance,
    memory: 'performance' in window && 'memory' in performance,
  };

  console.log('Performance API support:', features);

  if (!features.performanceObserver) {
    console.warn('PerformanceObserver not supported - metrics may be limited');
  }

  if (!features.memory) {
    console.warn('Memory API not supported - Chrome only feature');
  }
};

// Call in development
if (process.env.NODE_ENV === 'development') {
  checkPerformanceSupport();
}
```

### Bundle Analyzer Issues

#### Bundle Analysis Not Working
```bash
# Problem: Bundle analyzer shows empty data
# Solution: Ensure build artifacts exist

# 1. Build the application first
npm run build

# 2. Check if .next directory exists
ls -la .next/

# 3. Run bundle analysis
npm run build:analyze

# 4. If still not working, clean and rebuild
rm -rf .next
npm run build
npm run build:analyze
```

## 📱 Mobile-Specific Issues

### Touch Interaction Problems

#### Scrolling Issues
```css
/* Problem: Poor scrolling performance on mobile */
/* Solution: Optimize touch handling */

/* ❌ Problematic CSS */
.task-list {
  height: 100vh;
  overflow: auto;
}

/* ✅ Optimized CSS */
.task-list {
  height: 100vh;
  overflow: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  touch-action: pan-y; /* Optimize for vertical scrolling */
}

/* Use hardware acceleration */
.task-item {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform; /* Hint browser about animations */
}
```

#### Zoom Issues
```html
<!-- Problem: Unwanted zoom on input focus -->
<!-- Solution: Prevent zoom on mobile input -->

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

<!-- Or prevent zoom specifically on input focus -->
<style>
  input[type="text"], input[type="email"], textarea {
    font-size: 16px; /* Prevents zoom on iOS */
  }
</style>
```

## 🔒 Security Troubleshooting

### Authentication Issues

#### CORS Problems
```typescript
// Problem: CORS errors when making API calls
// Solution: Proper CORS configuration

// next.config.ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
};
```

#### Session Issues
```typescript
// Problem: Sessions expiring unexpectedly
// Solution: Proper session management

// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Custom middleware logic
    console.log('Session check:', req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Custom authorization logic
        return !!token && token.expiresAt > Date.now();
      },
    },
  }
);

export const config = {
  matcher: ["/api/tasks/:path*", "/dashboard/:path*"]
};
```

## 📊 Performance Debugging

### Profiling Tools

#### Chrome DevTools Performance Profiling
```javascript
// Add custom performance marks for debugging
const debugPerformance = {
  markStart: (name) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${name}-start`);
      console.log(`🏁 Started: ${name}`);
    }
  },

  markEnd: (name) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(name, 'measure')[0];
      console.log(`🏁 Finished: ${name} (${measure.duration.toFixed(2)}ms)`);
    }
  }
};

// Usage in components
const TaskComponent = ({ task }) => {
  useEffect(() => {
    debugPerformance.markStart('TaskComponent-render');

    return () => {
      debugPerformance.markEnd('TaskComponent-render');
    };
  });

  // Component logic...
};
```

#### Memory Leak Detection
```javascript
// Debug memory leaks in development
const detectMemoryLeaks = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;

    setInterval(() => {
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;

      console.log(`🧠 Memory: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);

      if (usedMB > 100) {
        console.warn('⚠️ High memory usage detected!');
      }
    }, 10000);
  }
};

// Call in app initialization
detectMemoryLeaks();
```

## 🚀 Production Debugging

### Remote Debugging

#### Error Logging
```typescript
// Production error logging service
class ProductionLogger {
  private logEndpoint = '/api/logs';

  async logError(error: Error, context?: any) {
    const logData = {
      level: 'error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    };

    try {
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
    } catch (logError) {
      // Fallback to console if logging fails
      console.error('Failed to log error:', logError);
      console.error('Original error:', error);
    }
  }

  private getCurrentUserId(): string | null {
    // Get current user ID from auth context
    // Implementation depends on your auth system
    return null;
  }
}

// Global error handler for production
if (process.env.NODE_ENV === 'production') {
  const logger = new ProductionLogger();

  window.addEventListener('error', (event) => {
    logger.logError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.logError(new Error(event.reason), {
      type: 'unhandledrejection',
    });
  });
}
```

### Health Monitoring

#### Health Check Endpoint
```typescript
// pages/api/health.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection (if using)
    // await redis.ping();

    // Check external services
    // const externalServiceStatus = await checkExternalService();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
      checks: {
        database: 'ok',
        // redis: externalServiceStatus,
      }
    };

    res.status(200).json(health);
  } catch (error) {
    const health = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    };

    res.status(503).json(health);
  }
}
```

## 📚 Additional Resources

### Debugging Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

### Performance Tools
- [WebPageTest](https://webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Bundlephobia](https://bundlephobia.com/)

### Community Resources
- [Next.js Discord](https://discord.gg/nextjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
- [GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Reddit r/nextjs](https://www.reddit.com/r/nextjs/)

---

For issues not covered in this guide, please check the main documentation or open an issue in the GitHub repository.