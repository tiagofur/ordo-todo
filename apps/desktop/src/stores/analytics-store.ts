/**
 * Analytics & Telemetry Store
 *
 * Tracks user behavior, performance metrics, and automatically reports errors.
 * All data is anonymized and privacy-first.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// Types
interface AnalyticsEvent {
  id: string;
  type: 'action' | 'navigation' | 'error' | 'performance' | 'feature';
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
  pageLoad: number;
  apiResponse: number;
  renderTime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  source: string;
  userId?: string;
  timestamp: number;
  sessionId: string;
  userAgent: string;
  url: string;
  context?: Record<string, any>;
  resolved: boolean;
}

interface UsageMetrics {
  sessionDuration: number;
  actionsCount: number;
  navigationCount: number;
  errorsCount: number;
  featuresUsed: string[];
  timeSpentOnPages: Record<string, number>;
  tasksCreated: number;
  tasksCompleted: number;
  pomodoroSessions: number;
  focusTime: number;
}

interface AnalyticsStore {
  // State
  sessionId: string;
  events: AnalyticsEvent[];
  errors: ErrorReport[];
  metrics: PerformanceMetrics;
  usage: UsageMetrics;
  isTracking: boolean;
  consentGiven: boolean;
  lastSyncAt?: number;

  // Session Management
  startSession: () => void;
  endSession: () => void;
  extendSession: () => void;

  // Event Tracking
  trackEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => void;
  trackAction: (category: string, action: string, label?: string, value?: number) => void;
  trackNavigation: (from: string, to: string) => void;
  trackFeature: (featureName: string, action: string) => void;
  trackPerformance: (metric: keyof PerformanceMetrics, value: number) => void;

  // Error Reporting
  reportError: (error: Error, context?: Record<string, any>) => void;
  reportUnhandledRejection: (event: PromiseRejectionEvent) => void;
  resolveError: (errorId: string) => void;

  // Usage Analytics
  updateUsageMetrics: (updates: Partial<UsageMetrics>) => void;
  getUsageReport: (timeRange?: 'day' | 'week' | 'month') => UsageMetrics;

  // Data Management
  enableTracking: () => void;
  disableTracking: () => void;
  clearData: () => void;
  exportData: () => string;

  // Sync and Reporting
  syncAnalytics: () => Promise<void>;
  generateReport: (type: 'usage' | 'performance' | 'errors') => any;
}

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateEventId = () => `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      // Initial State
      sessionId: generateSessionId(),
      events: [],
      errors: [],
      metrics: {
        pageLoad: 0,
        apiResponse: 0,
        renderTime: 0,
      },
      usage: {
        sessionDuration: 0,
        actionsCount: 0,
        navigationCount: 0,
        errorsCount: 0,
        featuresUsed: [],
        timeSpentOnPages: {},
        tasksCreated: 0,
        tasksCompleted: 0,
        pomodoroSessions: 0,
        focusTime: 0,
      },
      isTracking: false,
      consentGiven: false,

      // Start Analytics Session
      startSession: () => {
        const sessionId = generateSessionId();
        const startTime = Date.now();

        set((state) => ({
          sessionId,
          isTracking: true,
          usage: {
            ...state.usage,
            sessionDuration: 0,
            actionsCount: 0,
            navigationCount: 0,
            errorsCount: 0,
          },
        }));

        // Track session start
        get().trackEvent({
          type: 'action',
          category: 'session',
          action: 'start',
          metadata: { startTime },
        });

        // Start monitoring performance
        get().monitorPerformance();

        // Set up automatic sync
        const syncInterval = setInterval(() => {
          if (get().consentGiven) {
            get().syncAnalytics();
          }
        }, 60000); // Sync every minute

        // Store interval for cleanup
        localStorage.setItem('analyticsSyncInterval', syncInterval.toString());
      },

      // End Analytics Session
      endSession: () => {
        const state = get();
        const endTime = Date.now();

        set((prev) => ({
          isTracking: false,
          usage: {
            ...prev.usage,
            sessionDuration: endTime - (prev.usage.sessionDuration || endTime),
          },
        }));

        // Track session end
        state.trackEvent({
          type: 'action',
          category: 'session',
          action: 'end',
          metadata: {
            duration: state.usage.sessionDuration,
            endTime,
          },
        });

        // Clear sync interval
        const intervalId = localStorage.getItem('analyticsSyncInterval');
        if (intervalId) {
          clearInterval(parseInt(intervalId));
          localStorage.removeItem('analyticsSyncInterval');
        }

        // Final sync
        if (state.consentGiven) {
          state.syncAnalytics();
        }
      },

      // Extend Session (for user activity)
      extendSession: () => {
        get().trackEvent({
          type: 'action',
          category: 'session',
          action: 'extend',
        });
      },

      // Track Generic Event
      trackEvent: (event) => {
        if (!get().consentGiven) return;

        const analyticsEvent: AnalyticsEvent = {
          ...event,
          id: generateEventId(),
          timestamp: Date.now(),
          sessionId: get().sessionId,
        };

        set((state) => ({
          events: [...state.events, analyticsEvent],
        }));

        // Update usage metrics based on event type
        switch (event.type) {
          case 'action':
            set((state) => ({
              usage: { ...state.usage, actionsCount: state.usage.actionsCount + 1 },
            }));
            break;
          case 'navigation':
            set((state) => ({
              usage: { ...state.usage, navigationCount: state.usage.navigationCount + 1 },
            }));
            break;
          case 'error':
            set((state) => ({
              usage: { ...state.usage, errorsCount: state.usage.errorsCount + 1 },
            }));
            break;
          case 'feature':
            set((state) => ({
              usage: {
                ...state.usage,
                featuresUsed: [...new Set([...state.usage.featuresUsed, event.category])],
              },
            }));
            break;
        }
      },

      // Track User Action
      trackAction: (category, action, label, value) => {
        get().trackEvent({
          type: 'action',
          category,
          action,
          label,
          value,
        });
      },

      // Track Navigation
      trackNavigation: (from, to) => {
        get().trackEvent({
          type: 'navigation',
          category: 'navigation',
          action: 'page_change',
          label: `${from} → ${to}`,
        });

        // Update time spent on previous page
        const state = get();
        const currentTime = Date.now();
        const timeSpent = currentTime - (state.lastPageVisit || currentTime);

        set((prev) => ({
          usage: {
            ...prev.usage,
            timeSpentOnPages: {
              ...prev.usage.timeSpentOnPages,
              [from]: (prev.usage.timeSpentOnPages[from] || 0) + timeSpent,
            },
          },
          lastPageVisit: currentTime,
        }));
      },

      // Track Feature Usage
      trackFeature: (featureName, action) => {
        get().trackEvent({
          type: 'feature',
          category: featureName,
          action,
        });
      },

      // Track Performance Metrics
      trackPerformance: (metric, value) => {
        set((state) => ({
          metrics: { ...state.metrics, [metric]: value },
        }));

        get().trackEvent({
          type: 'performance',
          category: 'performance',
          action: metric,
          value,
        });
      },

      // Report Error
      reportError: (error, context) => {
        const errorReport: ErrorReport = {
          id: generateEventId(),
          message: error.message,
          stack: error.stack,
          source: 'javascript',
          timestamp: Date.now(),
          sessionId: get().sessionId,
          userAgent: navigator.userAgent,
          url: window.location.href,
          context,
          resolved: false,
        };

        set((state) => ({
          errors: [...state.errors, errorReport],
        }));

        // Track error event
        get().trackEvent({
          type: 'error',
          category: 'error',
          action: 'javascript_error',
          label: error.name,
          metadata: { message: error.message, context },
        });

        // Show user-friendly error notification for critical errors
        if (context?.critical) {
          toast.error('An unexpected error occurred. The issue has been reported automatically.', {
            duration: 5000,
          });
        }

        // Auto-report to server if consent given
        if (get().consentGiven) {
          get().syncAnalytics();
        }
      },

      // Report Unhandled Promise Rejection
      reportUnhandledRejection: (event) => {
        const error = new Error(event.reason);
        get().reportError(error, {
          type: 'unhandled_promise_rejection',
          reason: event.reason,
        });
      },

      // Mark Error as Resolved
      resolveError: (errorId) => {
        set((state) => ({
          errors: state.errors.map(error =>
            error.id === errorId ? { ...error, resolved: true } : error
          ),
        }));
      },

      // Update Usage Metrics
      updateUsageMetrics: (updates) => {
        set((state) => ({
          usage: { ...state.usage, ...updates },
        }));
      },

      // Get Usage Report for Time Range
      getUsageReport: (timeRange = 'day') => {
        const state = get();
        const now = Date.now();
        const timeRanges = {
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
        };

        const rangeStart = now - timeRanges[timeRange];
        const recentEvents = state.events.filter(event => event.timestamp >= rangeStart);

        return {
          ...state.usage,
          actionsCount: recentEvents.filter(e => e.type === 'action').length,
          navigationCount: recentEvents.filter(e => e.type === 'navigation').length,
          errorsCount: recentEvents.filter(e => e.type === 'error').length,
          sessionDuration: state.isTracking ? now - (state.usage.sessionDuration || now) : state.usage.sessionDuration,
        };
      },

      // Enable Analytics Tracking
      enableTracking: () => {
        set({ consentGiven: true });

        // Start tracking if not already started
        if (!get().isTracking) {
          get().startSession();
        }

        toast.success('Analytics tracking enabled');
      },

      // Disable Analytics Tracking
      disableTracking: () => {
        set({ consentGiven: false });

        // Stop current session
        if (get().isTracking) {
          get().endSession();
        }

        // Clear local data
        get().clearData();

        toast.info('Analytics tracking disabled');
      },

      // Clear All Analytics Data
      clearData: () => {
        set({
          events: [],
          errors: [],
          metrics: {
            pageLoad: 0,
            apiResponse: 0,
            renderTime: 0,
          },
        });
      },

      // Export Analytics Data
      exportData: () => {
        const state = get();
        const exportData = {
          events: state.events,
          errors: state.errors,
          metrics: state.metrics,
          usage: state.usage,
          exportedAt: Date.now(),
        };

        return JSON.stringify(exportData, null, 2);
      },

      // Sync Analytics to Server
      syncAnalytics: async () => {
        if (!get().consentGiven) return;

        try {
          const state = get();
          const syncData = {
            sessionId: state.sessionId,
            events: state.events.filter(e => !e.synced),
            errors: state.errors.filter(e => !e.reported),
            metrics: state.metrics,
            usage: state.getUsageReport(),
          };

          await apiClient.reportAnalytics(syncData);

          // Mark as synced
          set((prev) => ({
            lastSyncAt: Date.now(),
            events: prev.events.map(e => ({ ...e, synced: true })),
            errors: prev.errors.map(e => ({ ...e, reported: true })),
          }));

        } catch (error) {
          console.error('Failed to sync analytics:', error);
          // Don't show error to user to avoid annoyance
        }
      },

      // Generate Analytics Report
      generateReport: (type) => {
        const state = get();

        switch (type) {
          case 'usage':
            return {
              totalSessions: state.events.filter(e => e.category === 'session').length / 2,
              totalActions: state.usage.actionsCount,
              totalNavigations: state.usage.navigationCount,
              totalErrors: state.usage.errorsCount,
              featuresUsed: state.usage.featuresUsed,
              averageSessionDuration: state.usage.sessionDuration,
              tasksCreated: state.usage.tasksCreated,
              tasksCompleted: state.usage.tasksCompleted,
              pomodoroSessions: state.usage.pomodoroSessions,
              focusTime: state.usage.focusTime,
              timeSpentByPage: state.usage.timeSpentOnPages,
            };

          case 'performance':
            return {
              pageLoadTime: state.metrics.pageLoad,
              averageApiResponseTime: state.metrics.apiResponse,
              renderTime: state.metrics.renderTime,
              memoryUsage: state.metrics.memoryUsage,
              cpuUsage: state.metrics.cpuUsage,
              performanceEvents: state.events.filter(e => e.type === 'performance'),
            };

          case 'errors':
            return {
              totalErrors: state.errors.length,
              unresolvedErrors: state.errors.filter(e => !e.resolved).length,
              errorsByType: state.errors.reduce((acc, error) => {
                acc[error.source] = (acc[error.source] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
              recentErrors: state.errors.slice(-10),
            };

          default:
            return {};
        }
      },

      // Monitor Performance Metrics
      monitorPerformance: () => {
        // Page Load Time
        if ('performance' in window && 'getEntriesByType' in performance) {
          const navigationEntries = performance.getEntriesByType('navigation');
          if (navigationEntries.length > 0) {
            const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].loadEventStart;
            get().trackPerformance('pageLoad', loadTime);
          }
        }

        // Memory Usage (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          get().trackPerformance('memoryUsage', memory.usedJSHeapSize);
        }

        // API Response Time Monitoring
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
          const start = Date.now();
          const response = await originalFetch(...args);
          const duration = Date.now() - start;

          get().trackPerformance('apiResponse', duration);

          return response;
        };
      },
    }),
    {
      name: 'analytics-store',
      partialize: (state) => ({
        consentGiven: state.consentGiven,
        lastSyncAt: state.lastSyncAt,
        // Only keep recent events and errors to avoid storage bloat
        events: state.events.slice(-1000),
        errors: state.errors.slice(-100),
      }),
    }
  )
);

// Global error handlers
if (typeof window !== 'undefined') {
  // JavaScript errors
  window.addEventListener('error', (event) => {
    const analytics = useAnalyticsStore.getState();
    analytics.reportError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'window_error',
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const analytics = useAnalyticsStore.getState();
    analytics.reportUnhandledRejection(event);
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    const analytics = useAnalyticsStore.getState();
    if (document.hidden) {
      analytics.endSession();
    } else {
      analytics.startSession();
    }
  });

  // Track before unload
  window.addEventListener('beforeunload', () => {
    const analytics = useAnalyticsStore.getState();
    if (analytics.isTracking) {
      analytics.endSession();
    }
  });
}