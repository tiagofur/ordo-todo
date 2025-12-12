import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock UI components
vi.mock('@ordo-todo/ui', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
  Button: vi.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
  Input: vi.fn(({ onChange, ...props }) => (
    <input onChange={onChange ? (e) => onChange(e.target.value) : undefined} {...props} />
  )),
  Card: vi.fn(({ children, className, ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  )),
  CardContent: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardHeader: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardTitle: vi.fn(({ children, ...props }) => <h3 {...props}>{children}</h3>),
  Progress: vi.fn(({ value, ...props }) => (
    <div {...props}>
      <div style={{ width: `${value}%` }} />
    </div>
  )),
  Alert: vi.fn(({ children, ...props }) => (
    <div role="alert" {...props}>
      {children}
    </div>
  )),
  AlertDescription: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Badge: vi.fn(({ children, ...props }) => (
    <span {...props}>{children}</span>
  )),
  Switch: vi.fn(({ checked, onCheckedChange, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )),
  Dialog: vi.fn(({ children, open, onOpenChange, ...props }) => (
    open ? (
      <div {...props}>
        {typeof onOpenChange === 'function' && (
          <button onClick={() => onOpenChange(false)}>Close</button>
        )}
        {children}
      </div>
    ) : null
  )),
  DialogContent: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogHeader: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogTitle: vi.fn(({ children, ...props }) => <h2 {...props}>{children}</h2>),
  Tabs: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsList: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsContent: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsTrigger: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  Popover: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverContent: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverTrigger: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock Electron APIs
const mockElectronAPI = {
  isMaximized: vi.fn().mockResolvedValue(false),
  minimize: vi.fn(),
  maximize: vi.fn(),
  unmaximize: vi.fn(),
  close: vi.fn(),
  db: {
    task: {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByWorkspace: vi.fn(),
      getByProject: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    },
    workspace: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByWorkspace: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      getByWorkspace: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  store: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  },
  notifications: {
    requestPermission: vi.fn().mockResolvedValue(true),
    showNotification: vi.fn(),
  },
  system: {
    getSystemInfo: vi.fn().mockResolvedValue({
      platform: 'darwin',
      arch: 'x64',
      version: '1.0.0',
    }),
  },
};

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

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
export const createMockPromise = <T,>(value: T, delay: number = 0) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), delay));

// Helper function to mock API responses
export const createMockApiResponse = <T,>(data: T, status: number = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  headers: new Headers(),
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});