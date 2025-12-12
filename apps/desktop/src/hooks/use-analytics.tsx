import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsStore } from '@/stores/analytics-store';

// Analytics hook for easy tracking throughout the app
export function useAnalytics() {
  const {
    trackAction,
    trackNavigation,
    trackFeature,
    updateUsageMetrics,
    isTracking,
    consentGiven,
  } = useAnalyticsStore();
  const location = useLocation();

  // Track page navigation automatically
  useEffect(() => {
    if (consentGiven && isTracking) {
      const from = location.pathname;
      const to = location.pathname;

      // Track navigation
      trackNavigation(from, to);

      // Track page view as action
      trackAction('navigation', 'page_view', to);
    }
  }, [location, consentGiven, isTracking, trackAction, trackNavigation]);

  // Track user actions
  const track = useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number
  ) => {
    if (consentGiven) {
      trackAction(category, action, label, value);
    }
  }, [consentGiven, trackAction]);

  // Track feature usage
  const trackFeatureUsage = useCallback((
    featureName: string,
    action: string = 'used',
    metadata?: Record<string, any>
  ) => {
    if (consentGiven) {
      trackFeature(featureName, action);
      trackAction('feature', `${featureName}_${action}`, undefined, undefined);
    }
  }, [consentGiven, trackFeature, trackAction]);

  // Track task-related events
  const trackTaskEvent = useCallback((
    action: 'created' | 'updated' | 'completed' | 'deleted',
    metadata?: {
      projectId?: string;
      priority?: string;
      estimatedTime?: number;
    }
  ) => {
    if (consentGiven) {
      track('task', action, metadata?.projectId, metadata?.estimatedTime);

      // Update usage metrics
      if (action === 'created') {
        updateUsageMetrics({ tasksCreated: (useAnalyticsStore.getState().usage.tasksCreated || 0) + 1 });
      } else if (action === 'completed') {
        updateUsageMetrics({ tasksCompleted: (useAnalyticsStore.getState().usage.tasksCompleted || 0) + 1 });
      }
    }
  }, [consentGiven, track, updateUsageMetrics]);

  // Track timer events
  const trackTimerEvent = useCallback((
    type: 'pomodoro' | 'break' | 'custom',
    action: 'started' | 'completed' | 'paused' | 'resumed',
    duration?: number
  ) => {
    if (consentGiven) {
      track('timer', `${type}_${action}`, undefined, duration);

      // Update usage metrics for pomodoro sessions
      if (type === 'pomodoro' && action === 'started') {
        updateUsageMetrics({
          pomodoroSessions: (useAnalyticsStore.getState().usage.pomodoroSessions || 0) + 1
        });
      }

      // Update focus time
      if (action === 'completed' && duration) {
        updateUsageMetrics({
          focusTime: (useAnalyticsStore.getState().usage.focusTime || 0) + duration
        });
      }
    }
  }, [consentGiven, track, updateUsageMetrics]);

  // Track UI interactions
  const trackUIEvent = useCallback((
    element: string,
    action: 'click' | 'hover' | 'focus' | 'input',
    context?: string
  ) => {
    if (consentGiven) {
      track('ui', `${element}_${action}`, context);
    }
  }, [consentGiven, track]);

  // Track search events
  const trackSearch = useCallback((
    query: string,
    resultsCount: number,
    searchType: string = 'general'
  ) => {
    if (consentGiven) {
      track('search', 'performed', searchType, resultsCount);
    }
  }, [consentGiven, track]);

  // Track file operations
  const trackFileOperation = useCallback((
    operation: 'upload' | 'download' | 'delete',
    fileType: string,
    fileSize?: number
  ) => {
    if (consentGiven) {
      track('file', operation, fileType, fileSize);
    }
  }, [consentGiven, track]);

  // Track error events
  const trackError = useCallback((
    error: Error | string,
    context?: {
      component?: string;
      action?: string;
      userAction?: string;
    }
  ) => {
    if (consentGiven) {
      const errorMessage = typeof error === 'string' ? error : error.message;
      track('error', 'user_reported', context?.component);

      // Report to analytics store
      const { reportError } = useAnalyticsStore.getState();
      if (typeof error === 'string') {
        reportError(new Error(errorMessage), context);
      } else {
        reportError(error, context);
      }
    }
  }, [consentGiven, track]);

  // Track performance events
  const trackPerformance = useCallback((
    metric: string,
    value: number,
    context?: string
  ) => {
    if (consentGiven) {
      track('performance', metric, context, value);
    }
  }, [consentGiven, track]);

  return {
    // General tracking
    track,
    trackFeatureUsage,

    // Domain-specific tracking
    trackTaskEvent,
    trackTimerEvent,
    trackUIEvent,
    trackSearch,
    trackFileOperation,

    // Error and performance tracking
    trackError,
    trackPerformance,

    // State
    isTracking,
    consentGiven,
  };
}

// Higher-order component for automatic tracking
export function withAnalytics<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: {
    trackOnMount?: string;
    trackProps?: Array<keyof T>;
    category?: string;
  } = {}
) {
  const TrackedComponent = (props: T) => {
    const analytics = useAnalytics();

    useEffect(() => {
      if (options.trackOnMount && analytics.consentGiven) {
        analytics.track(
          options.category || 'component',
          'mounted',
          options.trackOnMount
        );
      }
    }, []);

    // Track prop changes
    useEffect(() => {
      if (options.trackProps && analytics.consentGiven) {
        options.trackProps.forEach(propName => {
          if (props[propName]) {
            analytics.track(
              options.category || 'component',
              'prop_change',
              String(propName)
            );
          }
        });
      }
    }, Object.values(options.trackProps || []).map(prop => props[prop]));

    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name})`;

  return TrackedComponent;
}

// Pre-configured tracking hooks for common patterns
export function useTaskAnalytics() {
  const { trackTaskEvent } = useAnalytics();

  return {
    trackTaskCreated: (metadata?: any) => trackTaskEvent('created', metadata),
    trackTaskUpdated: (metadata?: any) => trackTaskEvent('updated', metadata),
    trackTaskCompleted: (metadata?: any) => trackTaskEvent('completed', metadata),
    trackTaskDeleted: (metadata?: any) => trackTaskEvent('deleted', metadata),
  };
}

export function useTimerAnalytics() {
  const { trackTimerEvent } = useAnalytics();

  return {
    trackPomodoroStarted: () => trackTimerEvent('pomodoro', 'started'),
    trackPomodoroCompleted: (duration: number) => trackTimerEvent('pomodoro', 'completed', duration),
    trackBreakStarted: () => trackTimerEvent('break', 'started'),
    trackBreakCompleted: (duration: number) => trackTimerEvent('break', 'completed', duration),
    trackTimerPaused: () => trackTimerEvent('custom', 'paused'),
    trackTimerResumed: () => trackTimerEvent('custom', 'resumed'),
  };
}

export function useUIAnalytics() {
  const { trackUIEvent } = useAnalytics();

  return {
    trackButtonClick: (buttonName: string, context?: string) =>
      trackUIEvent(`button_${buttonName}`, 'click', context),
    trackModalOpened: (modalName: string) =>
      trackUIEvent(`modal_${modalName}`, 'opened'),
    trackDropdownOpened: (dropdownName: string) =>
      trackUIEvent(`dropdown_${dropdownName}`, 'opened'),
    trackFormFieldFocused: (fieldName: string) =>
      trackUIEvent(`form_field_${fieldName}`, 'focus'),
    trackFormSubmitted: (formName: string) =>
      trackUIEvent(`form_${formName}`, 'submitted'),
  };
}