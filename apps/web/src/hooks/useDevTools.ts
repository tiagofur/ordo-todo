import { useState, useEffect, useCallback } from 'react';
import { useBundleAnalyzer } from '@/components/devtools/BundleAnalyzer';
import { usePerformanceMonitor } from '@/components/devtools/PerformanceMonitor';
import { useStateInspector } from '@/components/devtools/StateInspector';
import { useAnalyticsLogger } from '@/components/devtools/AnalyticsLogger';

interface DevToolsState {
  bundleAnalyzer: ReturnType<typeof useBundleAnalyzer>;
  performanceMonitor: ReturnType<typeof usePerformanceMonitor>;
  stateInspector: ReturnType<typeof useStateInspector>;
  analyticsLogger: ReturnType<typeof useAnalyticsLogger>;
}

interface DevToolsConfig {
  autoStartPerformanceMonitor?: boolean;
  enableKeyboardShortcuts?: boolean;
  showDevModeIndicator?: boolean;
  logActions?: boolean;
}

export function useDevTools(config: DevToolsConfig = {}) {
  const {
    autoStartPerformanceMonitor = true,
    enableKeyboardShortcuts = true,
    showDevModeIndicator = true,
    logActions = false
  } = config;

  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Initialize all tool hooks
  const bundleAnalyzer = useBundleAnalyzer();
  const performanceMonitor = usePerformanceMonitor();
  const stateInspector = useStateInspector();
  const analyticsLogger = useAnalyticsLogger();

  const tools: DevToolsState = {
    bundleAnalyzer,
    performanceMonitor,
    stateInspector,
    analyticsLogger
  };

  // Unified keyboard shortcuts handler
  const handleKeyboardShortcut = useCallback((event: KeyboardEvent) => {
    if (!enableKeyboardShortcuts) return;

    const isCtrlShift = event.ctrlKey && event.shiftKey;

    if (isCtrlShift) {
      switch (event.key.toLowerCase()) {
        case 'p':
          event.preventDefault();
          performanceMonitor.toggle();
          setActiveTool(performanceMonitor.isOpen ? 'performance' : null);
          if (logActions) console.log('🚀 Performance Monitor toggled');
          break;

        case 'b':
          event.preventDefault();
          bundleAnalyzer.toggle();
          setActiveTool(bundleAnalyzer.isOpen ? 'bundle' : null);
          if (logActions) console.log('📦 Bundle Analyzer toggled');
          break;

        case 'i':
          event.preventDefault();
          stateInspector.toggle();
          setActiveTool(stateInspector.isOpen ? 'state' : null);
          if (logActions) console.log('🗄️ State Inspector toggled');
          break;

        case 'a':
          event.preventDefault();
          analyticsLogger.toggle();
          setActiveTool(analyticsLogger.isOpen ? 'analytics' : null);
          if (logActions) console.log('📊 Analytics Logger toggled');
          break;

        case 'd':
          event.preventDefault();
          // Toggle all tools visibility
          const anyToolOpen = Object.values(tools).some(tool => tool.isOpen);
          if (anyToolOpen) {
            Object.values(tools).forEach(tool => tool.close());
            setActiveTool(null);
            if (logActions) console.log('🔧 All DevTools closed');
          } else {
            performanceMonitor.open();
            setActiveTool('performance');
            if (logActions) console.log('🔧 DevTools panel opened');
          }
          break;

        case 'h':
          event.preventDefault();
          // Help command
          console.log('🔧 Ordo-Todo DevTools Shortcuts:');
          console.log('Ctrl+Shift+P: Performance Monitor');
          console.log('Ctrl+Shift+B: Bundle Analyzer');
          console.log('Ctrl+Shift+I: State Inspector');
          console.log('Ctrl+Shift+A: Analytics Logger');
          console.log('Ctrl+Shift+D: Toggle DevTools Panel');
          console.log('Ctrl+Shift+H: Show Help');
          break;
      }
    }

    // Escape to close current tool
    if (event.key === 'Escape' && activeTool) {
      const currentTool = tools[activeTool as keyof DevToolsState];
      if (currentTool?.isOpen) {
        currentTool.close();
        setActiveTool(null);
        if (logActions) console.log(`🔧 ${activeTool} closed`);
      }
    }
  }, [enableKeyboardShortcuts, logActions, activeTool, tools]);

  // Initialize devtools
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    // Add keyboard shortcuts
    if (enableKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyboardShortcut);
    }

    // Auto-start performance monitor
    if (autoStartPerformanceMonitor && !performanceMonitor.isOpen) {
      setTimeout(() => {
        performanceMonitor.open();
        setActiveTool('performance');
        if (logActions) console.log('🚀 Performance Monitor auto-started');
      }, 2000);
    }

    // Expose devtools to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__DEVTOOLS__ = {
        tools,
        config,
        actions: {
          openPerformanceMonitor: performanceMonitor.open,
          openBundleAnalyzer: bundleAnalyzer.open,
          openStateInspector: stateInspector.open,
          openAnalyticsLogger: analyticsLogger.open,
          closeAll: () => {
            Object.values(tools).forEach(tool => tool.close());
            setActiveTool(null);
          }
        }
      };

      console.log('🔧 Ordo-Todo DevTools initialized. Press Ctrl+Shift+H for help.');
    }

    setIsInitialized(true);

    return () => {
      if (enableKeyboardShortcuts) {
        document.removeEventListener('keydown', handleKeyboardShortcut);
      }
    };
  }, []);

  // Monitor tool states
  useEffect(() => {
    const openTools = Object.entries(tools)
      .filter(([_, tool]) => tool.isOpen)
      .map(([name]) => name);

    if (openTools.length > 0 && logActions) {
      console.log(`🔧 Open tools: ${openTools.join(', ')}`);
    }
  }, [tools, logActions]);

  // Quick actions
  const openAll = useCallback(() => {
    performanceMonitor.open();
    bundleAnalyzer.open();
    stateInspector.open();
    analyticsLogger.open();
    setActiveTool('performance');
    if (logActions) console.log('🔧 All DevTools opened');
  }, [logActions]);

  const closeAll = useCallback(() => {
    Object.values(tools).forEach(tool => tool.close());
    setActiveTool(null);
    if (logActions) console.log('🔧 All DevTools closed');
  }, [logActions, tools]);

  const openPerformanceReport = useCallback(() => {
    performanceMonitor.open();
    setActiveTool('performance');
    if (logActions) console.log('🚀 Performance Report opened');
  }, [logActions]);

  const openBundleAnalysis = useCallback(() => {
    bundleAnalyzer.open();
    setActiveTool('bundle');
    if (logActions) console.log('📦 Bundle Analysis opened');
  }, [logActions]);

  // Get summary of current state
  const getSummary = useCallback(() => {
    const openTools = Object.entries(tools)
      .filter(([_, tool]) => tool.isOpen)
      .map(([name]) => name);

    return {
      isInitialized,
      activeTool,
      openTools,
      totalTools: Object.keys(tools).length,
      config
    };
  }, [isInitialized, activeTool, tools, config]);

  return {
    // Tool references
    tools,

    // State
    isInitialized,
    activeTool,
    anyToolOpen: Object.values(tools).some(tool => tool.isOpen),

    // Quick actions
    openAll,
    closeAll,
    openPerformanceReport,
    openBundleAnalysis,

    // Individual tools
    performanceMonitor: tools.performanceMonitor,
    bundleAnalyzer: tools.bundleAnalyzer,
    stateInspector: tools.stateInspector,
    analyticsLogger: tools.analyticsLogger,

    // Utility
    getSummary,
    setActiveTool,

    // Config
    config: {
      autoStartPerformanceMonitor,
      enableKeyboardShortcuts,
      showDevModeIndicator,
      logActions
    }
  };
}

// Types for TypeScript
export type DevToolsHook = ReturnType<typeof useDevTools>;
export type { DevToolsConfig, DevToolsState };

// Default export
export default useDevTools;