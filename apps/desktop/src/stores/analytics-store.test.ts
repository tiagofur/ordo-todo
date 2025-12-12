import { act, renderHook, waitFor } from '@testing-library/react';
import { useAnalyticsStore } from './analytics-store';
import { createMockAnalyticsEvent } from '@/test/setup';

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    reportAnalytics: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    ...window.performance,
    getEntriesByType: vi.fn(() => [
      {
        loadEventStart: 1000,
        loadEventEnd: 1500,
      },
    ]),
  },
  writable: true,
});

// Mock memory API
Object.defineProperty(window, 'performance', {
  value: {
    ...window.performance,
    memory: {
      usedJSHeapSize: 50000000, // 50MB
    },
  },
  writable: true,
});

describe('useAnalyticsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAnalyticsStore.setState({
      consentGiven: false,
      isTracking: false,
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
    });

    // Reset localStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    expect(result.current.consentGiven).toBe(false);
    expect(result.current.isTracking).toBe(false);
    expect(result.current.events).toHaveLength(0);
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.sessionId).toBeDefined();
  });

  it('should enable tracking', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    expect(result.current.consentGiven).toBe(true);
    expect(result.current.isTracking).toBe(true);
  });

  it('should disable tracking', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    // Enable first
    act(() => {
      result.current.enableTracking();
    });

    expect(result.current.consentGiven).toBe(true);

    // Then disable
    act(() => {
      result.current.disableTracking();
    });

    expect(result.current.consentGiven).toBe(false);
    expect(result.current.isTracking).toBe(false);
    expect(result.current.events).toHaveLength(0);
    expect(result.current.errors).toHaveLength(0);
  });

  it('should start session when enabling tracking', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    expect(result.current.isTracking).toBe(true);
    expect(result.current.usage.actionsCount).toBe(0);
    expect(result.current.usage.navigationCount).toBe(0);
    expect(result.current.usage.errorsCount).toBe(0);
  });

  it('should track events when consent is given', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    // Enable tracking first
    act(() => {
      result.current.enableTracking();
    });

    const event = {
      type: 'action' as const,
      category: 'task',
      action: 'created',
      label: 'New Task',
      value: 1,
      metadata: { projectId: 'project-1' },
    };

    act(() => {
      result.current.trackEvent(event);
    });

    expect(result.current.events).toHaveLength(1);
    const trackedEvent = result.current.events[0];
    expect(trackedEvent.type).toBe('action');
    expect(trackedEvent.category).toBe('task');
    expect(trackedEvent.action).toBe('created');
    expect(trackedEvent.label).toBe('New Task');
    expect(trackedEvent.value).toBe(1);
    expect(trackedEvent.metadata).toEqual({ projectId: 'project-1' });
    expect(trackedEvent.sessionId).toBe(result.current.sessionId);
    expect(trackedEvent.timestamp).toBeDefined();
    expect(trackedEvent.id).toBeDefined();
  });

  it('should not track events when consent is not given', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    expect(result.current.consentGiven).toBe(false);

    const event = {
      type: 'action' as const,
      category: 'task',
      action: 'created',
    };

    act(() => {
      result.current.trackEvent(event);
    });

    expect(result.current.events).toHaveLength(0);
  });

  it('should track action events', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    act(() => {
      result.current.trackAction('task', 'created', 'New Task', 1);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].category).toBe('task');
    expect(result.current.events[0].action).toBe('created');
    expect(result.current.events[0].label).toBe('New Task');
    expect(result.current.events[0].value).toBe(1);
    expect(result.current.usage.actionsCount).toBe(1);
  });

  it('should track navigation events', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    act(() => {
      result.current.trackNavigation('/dashboard', '/tasks');
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].category).toBe('navigation');
    expect(result.current.events[0].action).toBe('page_change');
    expect(result.current.events[0].label).toBe('/dashboard → /tasks');
    expect(result.current.usage.navigationCount).toBe(1);
  });

  it('should track feature usage', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    act(() => {
      result.current.trackFeature('quick-actions', 'opened');
    });

    expect(result.current.events).toHaveLength(2); // feature event + action event
    expect(result.current.usage.featuresUsed).toContain('quick-actions');
  });

  it('should track performance metrics', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    act(() => {
      result.current.trackPerformance('apiResponse', 250);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].category).toBe('performance');
    expect(result.current.events[0].action).toBe('apiResponse');
    expect(result.current.events[0].value).toBe(250);
    expect(result.current.metrics.apiResponse).toBe(250);
  });

  it('should report errors', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    const error = new Error('Test error');
    const context = { component: 'TaskComponent', action: 'load' };

    act(() => {
      result.current.reportError(error, context);
    });

    expect(result.current.errors).toHaveLength(1);
    const reportedError = result.current.errors[0];
    expect(reportedError.message).toBe('Test error');
    expect(reportedError.stack).toBeDefined();
    expect(reportedError.source).toBe('javascript');
    expect(reportedError.context).toEqual(context);
    expect(reportedError.resolved).toBe(false);
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].type).toBe('error');
    expect(result.current.usage.errorsCount).toBe(1);
  });

  it('should resolve errors', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    // Add error first
    act(() => {
      result.current.reportError(new Error('Test error'));
    });

    expect(result.current.errors[0].resolved).toBe(false);

    const errorId = result.current.errors[0].id;

    // Resolve error
    act(() => {
      result.current.resolveError(errorId);
    });

    expect(result.current.errors[0].resolved).toBe(true);
  });

  it('should update usage metrics', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    const updates = {
      tasksCreated: 5,
      tasksCompleted: 3,
      pomodoroSessions: 2,
      focusTime: 150000, // 150 seconds in ms
    };

    act(() => {
      result.current.updateUsageMetrics(updates);
    });

    expect(result.current.usage.tasksCreated).toBe(5);
    expect(result.current.usage.tasksCompleted).toBe(3);
    expect(result.current.usage.pomodoroSessions).toBe(2);
    expect(result.current.usage.focusTime).toBe(150000);
  });

  it('should get usage report for time range', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    // Add some events
    act(() => {
      result.current.trackAction('task', 'created');
      result.current.trackAction('task', 'completed');
      result.current.trackNavigation('/dashboard', '/tasks');
    });

    const report = result.current.getUsageReport('day');

    expect(report.actionsCount).toBe(2);
    expect(report.navigationCount).toBe(1);
    expect(report.errorsCount).toBe(0);
  });

  it('should clear data', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    // Add some data
    act(() => {
      result.current.trackAction('task', 'created');
      result.current.reportError(new Error('Test error'));
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.errors).toHaveLength(1);

    // Clear data
    act(() => {
      result.current.clearData();
    });

    expect(result.current.events).toHaveLength(0);
    expect(result.current.errors).toHaveLength(0);
  });

  it('should export data', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    // Add some data
    act(() => {
      result.current.trackAction('task', 'created');
      result.current.trackPerformance('pageLoad', 1200);
    });

    const exportedData = result.current.exportData();
    const parsedData = JSON.parse(exportedData);

    expect(parsedData.events).toHaveLength(1);
    expect(parsedData.metrics.pageLoad).toBe(1200);
    expect(parsedData.usage).toBeDefined();
    expect(parsedData.exportedAt).toBeDefined();
  });

  it('should sync analytics to server', async () => {
    const { result } = renderHook(() => useAnalyticsStore());
    const { apiClient } = await import('@/lib/api-client');

    act(() => {
      result.current.enableTracking();
    });

    // Add some events
    act(() => {
      result.current.trackAction('task', 'created');
    });

    await act(async () => {
      await result.current.syncAnalytics();
    });

    expect(apiClient.reportAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: result.current.sessionId,
        events: expect.arrayContaining([
          expect.objectContaining({
            type: 'action',
            category: 'task',
            action: 'created',
          }),
        ]),
      })
    );

    expect(result.current.lastSyncAt).toBeDefined();
  });

  it('should not sync when consent is not given', async () => {
    const { result } = renderHook(() => useAnalyticsStore());
    const { apiClient } = await import('@/lib/api-client');

    expect(result.current.consentGiven).toBe(false);

    await act(async () => {
      await result.current.syncAnalytics();
    });

    expect(apiClient.reportAnalytics).not.toHaveBeenCalled();
  });

  it('should generate usage report', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    // Add some data
    act(() => {
      result.current.updateUsageMetrics({
        tasksCreated: 10,
        tasksCompleted: 8,
        pomodoroSessions: 5,
        focusTime: 300000,
      });
      result.current.trackFeature('analytics', 'viewed');
      result.current.trackFeature('quick-actions', 'used');
    });

    const report = result.current.generateReport('usage');

    expect(report.totalActions).toBe(0);
    expect(report.tasksCreated).toBe(10);
    expect(report.tasksCompleted).toBe(8);
    expect(report.pomodoroSessions).toBe(5);
    expect(report.focusTime).toBe(300000);
    expect(report.featuresUsed).toHaveLength(2);
    expect(report.featuresUsed).toContain('analytics');
    expect(report.featuresUsed).toContain('quick-actions');
  });

  it('should generate performance report', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    // Track some performance metrics
    act(() => {
      result.current.trackPerformance('pageLoad', 1500);
      result.current.trackPerformance('apiResponse', 300);
    });

    const report = result.current.generateReport('performance');

    expect(report.pageLoadTime).toBe(1500);
    expect(report.averageApiResponseTime).toBe(300);
    expect(report.performanceEvents).toHaveLength(2);
  });

  it('should generate error report', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    // Add some errors
    act(() => {
      result.current.reportError(new Error('JavaScript error'), { source: 'component' });
      result.current.reportError(new Error('API error'), { source: 'api' });
    });

    // Resolve one error
    const errorId = result.current.errors[0].id;
    act(() => {
      result.current.resolveError(errorId);
    });

    const report = result.current.generateReport('errors');

    expect(report.totalErrors).toBe(2);
    expect(report.unresolvedErrors).toBe(1);
    expect(report.errorsByType.javascript).toBe(1);
    expect(report.errorsByType.api).toBe(1);
  });

  it('should handle session lifecycle', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    const initialSessionId = result.current.sessionId;

    // End session
    act(() => {
      result.current.endSession();
    });

    expect(result.current.isTracking).toBe(false);

    // Start new session
    act(() => {
      result.current.startSession();
    });

    expect(result.current.isTracking).toBe(true);
    expect(result.current.sessionId).not.toBe(initialSessionId);
    expect(result.current.usage.sessionDuration).toBe(0);
    expect(result.current.usage.actionsCount).toBe(0);
  });

  it('should extend session', () => {
    const { result } = renderHook(() => useAnalyticsStore());

    act(() => {
      result.current.enableTracking();
    });

    act(() => {
      result.current.extendSession();
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].category).toBe('session');
    expect(result.current.events[0].action).toBe('extend');
  });
});