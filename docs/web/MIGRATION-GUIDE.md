# Ordo-Todo Desktop to Web Migration Guide

## Overview

This guide helps developers migrate from the Ordo-Todo desktop application to the web version, highlighting key differences, architectural changes, and migration strategies.

## 🏗️ Architecture Comparison

### Desktop Application
- **Framework**: Electron + Vite + React
- **State Management**: Zustand + React Query
- **Database**: Local SQLite
- **File System**: Full OS access
- **Performance**: Native APIs access
- **Deployment**: Standalone executables

### Web Application
- **Framework**: Next.js 16 + React
- **State Management**: Zustand + React Query
- **Database**: Remote PostgreSQL + Prisma
- **Storage**: Browser storage APIs
- **Performance**: Web APIs only
- **Deployment**: Web hosting

## 🔄 Migration Mapping

### 1. State Management

#### Desktop Implementation
```typescript
// apps/desktop/src/stores/task-store.ts
interface TaskStore {
  tasks: Task[];
  localSyncQueue: SyncQueueItem[];

  // Local SQLite operations
  saveTask: (task: Task) => Promise<void>;
  syncWithServer: () => Promise<void>;
  getOfflineTasks: () => Task[];
}
```

#### Web Implementation
```typescript
// apps/web/src/stores/task-store.ts
interface TaskStore {
  tasks: Task[];

  // Remote API operations
  saveTask: (task: Task) => Promise<void>;
  syncWithServer: () => Promise<void>; // Real-time sync

  // No local sync queue - uses online/offline detection
}

// Implementation
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  saveTask: async (task: Task) => {
    // Direct API call - no local queue
    await apiClient.saveTask(task);
    set((state) => ({
      tasks: state.tasks.map(t => t.id === task.id ? task : t)
    }));
  },

  syncWithServer: async () => {
    // Real-time sync via WebSocket
    const updatedTasks = await apiClient.syncTasks();
    set({ tasks: updatedTasks });
  },
}));
```

### 2. Performance Monitoring

#### Desktop Implementation
```typescript
// apps/desktop/src/lib/performance-monitor.ts
class DesktopPerformanceMonitor {
  private electronAPI: ElectronAPI;

  // Native system metrics
  getCpuUsage(): number { /* Native access */ }
  getMemoryUsage(): MemoryInfo { /* Native access */ }
  getDiskUsage(): DiskInfo { /* Native access */ }

  // Bundle analysis (Vite-specific)
  analyzeBundle(): BundleInfo { /* Vite stats */ }
}
```

#### Web Implementation
```typescript
// apps/web/src/lib/performance-monitor.ts
class WebPerformanceMonitor {
  // Web Performance APIs
  getCoreWebVitals(): WebVitals { /* PerformanceObserver */ }
  getNavigationTiming(): NavigationTiming { /* Navigation Timing API */ }
  getResourceTiming(): ResourceTiming[] { /* Resource Timing API */ }

  // Bundle analysis (Next.js-specific)
  analyzeBundle(): BundleInfo { /* Next.js build stats */ }

  // Limited browser APIs
  getMemoryUsage(): MemoryInfo { /* Performance.memory (Chrome only) */ }
}
```

### 3. Data Persistence

#### Desktop Implementation
```typescript
// apps/desktop/src/lib/storage.ts
class DesktopStorage {
  private db: SQLiteDatabase;
  private fs: FileSystemAPI;

  // Full file system access
  saveToFile(path: string, data: any): void { /* Native fs */ }
  readFromFile(path: string): any { /* Native fs */ }
  exportData(): ExportData { /* Direct file access */ }

  // SQLite operations
  query(sql: string, params?: any[]): any[] { /* SQLite */ }
}
```

#### Web Implementation
```typescript
// apps/web/src/lib/storage.ts
class WebStorage {
  private apiClient: ApiClient;

  // Browser storage limitations
  saveToLocalStorage(key: string, data: any): void { /* localStorage */ }
  saveToSessionStorage(key: string, data: any): void { /* sessionStorage */ }
  saveToIndexedDB(data: any): Promise<void> { /* IndexedDB */ }

  // No direct file access
  exportData(): Promise<Blob> { /* Download via browser */ }
  importData(file: File): Promise<any> { /* File reader API */ }

  // Remote operations
  saveToServer(data: any): Promise<void> { /* API call */ }
}
```

### 4. Developer Tools

#### Desktop Implementation
```typescript
// apps/desktop/src/components/devtools/
DesktopDevToolsPanel
├── BundleAnalyzer (Vite-based)
├── PerformanceMonitor (Native APIs)
├── StateInspector (Direct store access)
├── AnalyticsLogger (Local SQLite)
└── SyncQueueInspector (Desktop-specific)
```

#### Web Implementation
```typescript
// apps/web/src/components/devtools/
WebDevToolsPanel
├── BundleAnalyzer (Next.js-based)
├── PerformanceMonitor (Web APIs)
├── StateInspector (Window object access)
├── AnalyticsLogger (Memory/localStorage)
└── // No SyncQueueInspector (web limitation)
```

## 🚀 Migration Steps

### Step 1: Environment Setup

1. **Install Dependencies**
```bash
# Clone web repository
git clone <web-repo-url>
cd ordo-todo/apps/web

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
```

2. **Configure Environment**
```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/ordo_todo_web"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Database Setup**
```bash
# Push schema to database
npx prisma db push

# Generate client
npx prisma generate
```

### Step 2: Code Migration

#### State Stores Migration

**Before (Desktop)**:
```typescript
// Desktop store with local operations
const useDesktopTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  localQueue: [],

  addTask: async (taskData) => {
    const task = new Task(taskData);

    // Add to local queue for sync
    set((state) => ({
      localQueue: [...state.localQueue, { type: 'CREATE', task }]
    }));

    // Save to local SQLite
    await localDB.saveTask(task);
  },
}));
```

**After (Web)**:
```typescript
// Web store with remote operations
const useWebTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  addTask: async (taskData) => {
    const task = new Task(taskData);

    // Direct API call
    await apiClient.createTask(task);

    // Update state from response
    set((state) => ({
      tasks: [...state.tasks, task]
    }));
  },
}));
```

#### Component Migration

**Before (Desktop)**:
```typescript
// Desktop component with Electron APIs
const DesktopTimer = () => {
  const { saveToLocalStorage } = useDesktopStorage();

  const handleTimerComplete = async () => {
    // Native notification
    await electronAPI.showNotification({
      title: 'Timer Complete',
      body: 'Time to take a break!'
    });

    // Save to local file
    await saveToLocalStorage('timer-state', { completed: true });
  };

  return <TimerUI onComplete={handleTimerComplete} />;
};
```

**After (Web)**:
```typescript
// Web component with Browser APIs
const WebTimer = () => {
  const { saveToLocalStorage } = useWebStorage();

  const handleTimerComplete = async () => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete', {
        body: 'Time to take a break!',
        icon: '/icons/icon-192.png'
      });
    }

    // Save to browser storage
    saveToLocalStorage('timer-state', { completed: true });
  };

  return <TimerUI onComplete={handleTimerComplete} />;
};
```

### Step 3: API Migration

#### Database Operations

**Before (Desktop)**:
```typescript
// Direct SQLite operations
class DesktopTaskRepository {
  async saveTask(task: Task): Promise<void> {
    const sql = `
      INSERT INTO tasks (id, title, status, created_at)
      VALUES (?, ?, ?, ?)
    `;

    await this.db.execute(sql, [
      task.id,
      task.title,
      task.status,
      task.createdAt
    ]);
  }

  async getTasks(): Promise<Task[]> {
    const sql = 'SELECT * FROM tasks ORDER BY created_at DESC';
    return await this.db.query(sql);
  }
}
```

**After (Web)**:
```typescript
// API client operations
class WebTaskRepository {
  async saveTask(task: Task): Promise<Task> {
    const response = await apiClient.post('/tasks', {
      title: task.title,
      status: task.status,
      createdAt: task.createdAt
    });

    return response.data;
  }

  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get('/tasks');
    return response.data;
  }
}
```

### Step 4: Testing Migration

#### Test Adaptations

**Before (Desktop)**:
```typescript
// Desktop tests with Electron APIs
describe('Desktop Timer', () => {
  it('should show native notification', async () => {
    const mockShowNotification = jest.fn();
    global.electronAPI = { showNotification: mockShowNotification };

    const { result } = renderHook(() => useDesktopTimer());
    await act(async () => {
      await result.current.completeTimer();
    });

    expect(mockShowNotification).toHaveBeenCalledWith({
      title: 'Timer Complete',
      body: 'Time to take a break!'
    });
  });
});
```

**After (Web)**:
```typescript
// Web tests with Browser APIs
describe('Web Timer', () => {
  it('should show browser notification', async () => {
    const mockNotification = jest.fn();
    global.Notification = jest.fn().mockImplementation((title, options) => {
      mockNotification(title, options);
    });

    const { result } = renderHook(() => useWebTimer());
    await act(async () => {
      await result.current.completeTimer();
    });

    expect(mockNotification).toHaveBeenCalledWith('Timer Complete', {
      body: 'Time to take a break!',
      icon: '/icons/icon-192.png'
    });
  });
});
```

## 🔧 Key Differences & Considerations

### 1. Storage Limitations

**Desktop**: Unlimited local storage with file system access
**Web**: Browser storage limits (localStorage ~5MB, IndexedDB ~50MB+)

**Migration Strategy**:
```typescript
// Web storage adapter
class WebStorageAdapter {
  private async compressData(data: any): Promise<string> {
    // Compress large datasets
    return JSON.stringify(data);
  }

  private async chunkData(data: string): Promise<string[]> {
    // Split data for IndexedDB
    const chunks = [];
    const chunkSize = 1000000; // 1MB chunks

    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    return chunks;
  }
}
```

### 2. Offline Functionality

**Desktop**: Full offline support with local SQLite
**Web**: Limited offline support with Service Workers

**Migration Strategy**:
```typescript
// Web offline support
class WebOfflineManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async setupOfflineSupport(): Promise<void> {
    if ('serviceWorker' in navigator) {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');

      // Background sync for offline actions
      await this.setupBackgroundSync();
    }
  }

  private async setupBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await this.swRegistration?.sync.register('sync-tasks');
    }
  }
}
```

### 3. File System Access

**Desktop**: Direct file system read/write operations
**Web**: File upload/download via browser APIs only

**Migration Strategy**:
```typescript
// Web file operations
class WebFileManager {
  async exportData(data: any): Promise<void> {
    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ordo-todo-export.json';
    a.click();

    URL.revokeObjectURL(url);
  }

  async importData(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
}
```

### 4. Performance Monitoring

**Desktop**: Native system metrics (CPU, RAM, Disk)
**Web**: Browser performance APIs (Web Vitals, Resource Timing)

**Migration Strategy**:
```typescript
// Web performance adaptation
class WebPerformanceAdapter {
  getMetrics(): PerformanceMetrics {
    // Map desktop metrics to web equivalents
    return {
      cpuUsage: this.estimateCpuUsage(), // Approximation
      memoryUsage: this.getMemoryUsage(), // Limited
      diskUsage: null, // Not available in web
      networkLatency: this.getNetworkLatency(),
      bundleSize: this.getBundleSize()
    };
  }

  private estimateCpuUsage(): number {
    // Estimate CPU usage from frame rate and long tasks
    const frameRate = this.getFrameRate();
    const longTasks = this.getLongTasks();

    return Math.max(0, 100 - (frameRate / 60 * 100)) + (longTasks.length * 5);
  }
}
```

## 🛠️ Migration Checklist

### Pre-Migration
- [ ] Backup existing desktop data
- [ ] Set up web development environment
- [ ] Create migration plan for user data
- [ ] Test API endpoints
- [ ] Verify database schema compatibility

### Code Migration
- [ ] Update state management for remote operations
- [ ] Replace native API calls with web APIs
- [ ] Adapt file system operations
- [ ] Update notification system
- [ ] Migrate performance monitoring
- [ ] Update developer tools integration

### Testing
- [ ] Adapt existing tests for web environment
- [ ] Test offline functionality
- [ ] Verify data synchronization
- [ ] Test performance on web
- [ ] Validate user experience

### Deployment
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Deploy to web hosting
- [ ] Set up monitoring and analytics
- [ ] Test production performance

### Post-Migration
- [ ] User data migration completion
- [ ] Performance monitoring setup
- [ ] User training and documentation
- [ ] Feedback collection and improvements
- [ ] Ongoing maintenance plan

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)

### Tools
- [Browser DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [WebPageTest](https://webpagetest.org/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

### Migration Examples
- [Electron to Web Migration Patterns](https://www.electronjs.org/docs/latest/tutorial/migration)
- [PWA Migration Guide](https://web.dev/progressive-web-apps-checklist/)
- [React Web App Migration](https://react.dev/learn/add-interactivity)

---

This migration guide provides a comprehensive approach to transitioning from the desktop to web version. For specific implementation details, refer to the individual component documentation and the web application source code.