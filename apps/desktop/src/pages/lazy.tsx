/**
 * Lazy-loaded page components with code splitting
 * Improves initial load performance by loading pages on-demand
 */

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// ============================================
// Loading Fallback Component
// ============================================

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
      role="status"
      aria-label={message}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

// ============================================
// Lazy Page Wrapper with Error Boundary
// ============================================

interface LazyPageProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LazyPage({ children, fallback }: LazyPageProps) {
  return (
    <Suspense fallback={fallback || <PageLoader />}>
      {children}
    </Suspense>
  );
}

// ============================================
// Lazy-loaded Pages (Code Splitting)
// ============================================

// Core pages - loaded immediately or with priority
export const LazyDashboard = lazy(() => 
  import('./Dashboard').then(module => ({ default: module.Dashboard }))
);

export const LazyTasks = lazy(() => 
  import('./Tasks').then(module => ({ default: module.Tasks }))
);

export const LazyTimer = lazy(() => 
  import('./Timer').then(module => ({ default: module.Timer }))
);

export const LazyCalendar = lazy(() => 
  import('./Calendar').then(module => ({ default: module.Calendar }))
);

// Secondary pages - loaded on demand
export const LazyProjects = lazy(() => 
  import('./Projects').then(module => ({ default: module.Projects }))
);

export const LazyProjectDetail = lazy(() => 
  import('./ProjectDetail').then(module => ({ default: module.ProjectDetail }))
);

export const LazyAnalytics = lazy(() => 
  import('./Analytics').then(module => ({ default: module.Analytics }))
);

export const LazyTags = lazy(() => 
  import('./Tags').then(module => ({ default: module.Tags }))
);

export const LazyWorkspaces = lazy(() => 
  import('./Workspaces').then(module => ({ default: module.Workspaces }))
);

export const LazyWorkspaceDetail = lazy(() => 
  import('./WorkspaceDetail').then(module => ({ default: module.WorkspaceDetail }))
);

export const LazySettings = lazy(() => 
  import('./Settings').then(module => ({ default: module.Settings }))
);

export const LazyAuth = lazy(() => 
  import('./Auth').then(module => ({ default: module.Auth }))
);

// Floating window (separate window context)
export const LazyTimerFloating = lazy(() => 
  import('./TimerFloating').then(module => ({ default: module.TimerFloating }))
);

export const LazyFocusMode = lazy(() => import('./FocusMode'));

// ============================================
// Preload Functions for Route Prefetching
// ============================================

/**
 * Preload a page component before navigation
 * Call on hover or focus of navigation links
 */
export const preloadPage = {
  dashboard: () => import('./Dashboard'),
  tasks: () => import('./Tasks'),
  timer: () => import('./Timer'),
  calendar: () => import('./Calendar'),
  projects: () => import('./Projects'),
  projectDetail: () => import('./ProjectDetail'),
  analytics: () => import('./Analytics'),
  tags: () => import('./Tags'),
  settings: () => import('./Settings'),
  auth: () => import('./Auth'),
};

/**
 * Preload multiple pages (e.g., on app init)
 */
export async function preloadCorePages(): Promise<void> {
  await Promise.all([
    preloadPage.dashboard(),
    preloadPage.tasks(),
    preloadPage.timer(),
  ]);
}

// ============================================
// Generic Lazy Component Factory
// ============================================

/**
 * Create a lazy-loaded component with custom loading fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <PageLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
