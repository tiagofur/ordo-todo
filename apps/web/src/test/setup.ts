import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock UI components from @ordo-todo/ui
vi.mock('@ordo-todo/ui', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
  Button: vi.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props} data-testid="button">
      {children}
    </button>
  )),
  Input: vi.fn(({ onChange, ...props }) => (
    <input onChange={onChange ? (e) => onChange(e.target.value) : undefined} {...props} data-testid="input" />
  )),
  Card: vi.fn(({ children, className, ...props }) => (
    <div className={className} data-testid="card" {...props}>
      {children}
    </div>
  )),
  CardContent: vi.fn(({ children, ...props }) => <div data-testid="card-content" {...props}>{children}</div>),
  CardHeader: vi.fn(({ children, ...props }) => <div data-testid="card-header" {...props}>{children}</div>),
  CardTitle: vi.fn(({ children, ...props }) => <h3 data-testid="card-title" {...props}>{children}</h3>),
  Progress: vi.fn(({ value, ...props }) => (
    <div data-testid="progress" {...props}>
      <div style={{ width: `${value}%` }} data-testid="progress-bar" />
    </div>
  )),
  Alert: vi.fn(({ children, ...props }) => (
    <div role="alert" data-testid="alert" {...props}>
      {children}
    </div>
  )),
  AlertDescription: vi.fn(({ children, ...props }) => <div data-testid="alert-description" {...props}>{children}</div>),
  Badge: vi.fn(({ children, ...props }) => (
    <span data-testid="badge" {...props}>{children}</span>
  )),
  Switch: vi.fn(({ checked, onCheckedChange, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid="switch"
      {...props}
    />
  )),
  Dialog: vi.fn(({ children, open, onOpenChange, ...props }) => (
    open ? (
      <div data-testid="dialog" {...props}>
        {typeof onOpenChange === 'function' && (
          <button onClick={() => onOpenChange(false)} data-testid="dialog-close">Close</button>
        )}
        {children}
      </div>
    ) : null
  )),
  DialogContent: vi.fn(({ children, ...props }) => <div data-testid="dialog-content" {...props}>{children}</div>),
  DialogHeader: vi.fn(({ children, ...props }) => <div data-testid="dialog-header" {...props}>{children}</div>),
  DialogTitle: vi.fn(({ children, ...props }) => <h2 data-testid="dialog-title" {...props}>{children}</h2>),
  Tabs: vi.fn(({ children, ...props }) => <div data-testid="tabs" {...props}>{children}</div>),
  TabsList: vi.fn(({ children, ...props }) => <div data-testid="tabs-list" {...props}>{children}</div>),
  TabsContent: vi.fn(({ children, ...props }) => <div data-testid="tabs-content" {...props}>{children}</div>),
  TabsTrigger: vi.fn(({ children, ...props }) => <button data-testid="tabs-trigger" {...props}>{children}</button>),
  Popover: vi.fn(({ children, ...props }) => <div data-testid="popover" {...props}>{children}</div>),
  PopoverContent: vi.fn(({ children, ...props }) => <div data-testid="popover-content" {...props}>{children}</div>),
  PopoverTrigger: vi.fn(({ children, ...props }) => <div data-testid="popover-trigger" {...props}>{children}</div>),
  Select: vi.fn(({ children, onValueChange, ...props }) => (
    <select onChange={(e) => onValueChange?.(e.target.value)} data-testid="select" {...props}>
      {children}
    </select>
  )),
  SelectContent: vi.fn(({ children, ...props }) => <div data-testid="select-content" {...props}>{children}</div>),
  SelectItem: vi.fn(({ children, ...props }) => <option data-testid="select-item" {...props}>{children}</option>),
  SelectTrigger: vi.fn(({ children, ...props }) => <div data-testid="select-trigger" {...props}>{children}</div>),
  SelectValue: vi.fn(({ placeholder, ...props }) => (
    <option value="" disabled data-testid="select-value" {...props}>{placeholder}</option>
  )),
  Textarea: vi.fn(({ onChange, ...props }) => (
    <textarea onChange={onChange ? (e) => onChange(e.target.value) : undefined} {...props} data-testid="textarea" />
  )),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        pathname: '/',
        query: {},
        asPath: '/',
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js image
vi.mock('next/image', () => ({
    default: (props: any) => {
        // eslint-disable-next-line jsx-a11y/alt-text
        return <img {...props} data-testid="next-image" />;
    },
}));

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: React.ComponentType }>) => {
    const Component = React.lazy(loader);
    return (props: any) => (
      <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
        <Component {...props} />
      </React.Suspense>
    );
  },
}));

// Mock Auth.js (NextAuth)
vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: {
            user: {
                id: 'test-user-id',
                email: 'test@example.com',
                name: 'Test User',
            },
        },
        status: 'authenticated',
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

// Mock API client
vi.mock('@ordo-todo/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
        refetchQueries: vi.fn(),
        setQueryData: vi.fn(),
        getQueryData: vi.fn(),
    })),
    QueryClient: vi.fn(),
    QueryClientProvider: vi.fn(({ children }) => <div>{children}</div>),
}));

// Mock Zustand stores
vi.mock('@/stores/auth-store', () => ({
    useAuthStore: vi.fn(() => ({
        user: { id: 'test-user-id', email: 'test@example.com' },
        token: 'test-token',
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
    })),
}));

vi.mock('@/stores/ui-store', () => ({
    useUIStore: vi.fn(() => ({
        sidebarCollapsed: false,
        theme: 'light',
        toggleSidebar: vi.fn(),
        setTheme: vi.fn(),
    })),
}));

// Mock sonner/toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        custom: vi.fn(),
        promise: vi.fn(),
        dismiss: vi.fn(),
        loading: vi.fn(),
    },
}));

// Mock notify module
vi.mock('@/lib/notify', () => ({
    notify: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        loading: vi.fn(),
    },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock File
global.File = vi.fn().mockImplementation((content, name, options) => ({
  content,
  name,
  type: options?.type || 'text/plain',
  size: content.length,
  lastModified: Date.now(),
}));

// Mock FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  readAsBinaryString: vi.fn(),
  onload: null,
  onerror: null,
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

// Mock performance.now for timing tests
Object.defineProperty(global, 'performance', {
  value: {
    ...performance,
    now: vi.fn(() => Date.now()),
  },
});

// Mock WebSocket for real-time features
global.WebSocket = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
}));

// Custom test utilities
export const createMockTask = (overrides = {}) => ({
  id: 'mock-task-id',
  title: 'Mock Task',
  description: 'Mock description',
  status: 'TODO',
  priority: 'MEDIUM',
  created_at: Date.now(),
  updated_at: Date.now(),
  workspace_id: 'mock-workspace-id',
  project_id: null,
  due_date: null,
  estimated_pomodoros: 1,
  completed_pomodoros: 0,
  position: 0,
  parent_task_id: null,
  completed_at: null,
  is_synced: 1,
  sync_status: 'synced',
  local_updated_at: Date.now(),
  server_updated_at: Date.now(),
  is_deleted: 0,
  ...overrides,
});

export const createMockWorkspace = (overrides = {}) => ({
  id: 'mock-workspace-id',
  name: 'Mock Workspace',
  description: 'Mock workspace description',
  color: '#3B82F6',
  icon: '💼',
  owner_id: 'mock-user-id',
  created_at: Date.now(),
  updated_at: Date.now(),
  is_synced: 1,
  sync_status: 'synced',
  local_updated_at: Date.now(),
  server_updated_at: Date.now(),
  is_deleted: 0,
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  id: 'mock-project-id',
  workspace_id: 'mock-workspace-id',
  name: 'Mock Project',
  description: 'Mock project description',
  color: '#10B981',
  status: 'ACTIVE',
  start_date: null,
  end_date: null,
  created_at: Date.now(),
  updated_at: Date.now(),
  is_synced: 1,
  sync_status: 'synced',
  local_updated_at: Date.now(),
  server_updated_at: Date.now(),
  is_deleted: 0,
  ...overrides,
});

export const createMockAnalyticsEvent = (overrides = {}) => ({
  id: 'mock-event-id',
  type: 'action',
  category: 'test',
  action: 'test_action',
  label: 'test_label',
  value: 1,
  timestamp: Date.now(),
  sessionId: 'mock-session-id',
  userId: 'mock-user-id',
  metadata: {},
  ...overrides,
});

// Helper function to wait for async operations
export const waitFor = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create mock promises
export const createMockPromise = <T>(value: T, delay: number = 0) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), delay));

// Helper function to mock API responses
export const createMockApiResponse = <T>(data: T, status: number = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  headers: new Headers(),
});

// Helper function to create mock fetch responses
export const mockFetchResponse = (response: any, options: { status?: number; delay?: number } = {}) => {
  const mockResponse = createMockApiResponse(response, options.status || 200);
  const delay = options.delay || 0;

  return delay > 0
    ? new Promise(resolve => setTimeout(() => resolve(mockResponse), delay))
    : Promise.resolve(mockResponse);
};

// Helper function for user event simulation
export const createMockUserEvent = () => ({
  click: vi.fn(),
  type: vi.fn(),
  hover: vi.fn(),
  unhover: vi.fn(),
  focus: vi.fn(),
  blur: vi.fn(),
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Export test utils for easy importing
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { render, screen, fireEvent, waitFor, within } from '@testing-library/react';