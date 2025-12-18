import React, { useState, useEffect } from 'react';
import { Wrench, Zap, Package, Database, BarChart3, Monitor, Eye, Settings, X, Maximize2, Minimize2, Info } from 'lucide-react';
import { cn, Card, CardContent, CardHeader, CardTitle, Button, Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ordo-todo/ui';
import { BundleAnalyzer, useBundleAnalyzer } from './BundleAnalyzer';
import { PerformanceMonitor, usePerformanceMonitor } from './PerformanceMonitor';
import { StateInspector, useStateInspector } from './StateInspector';
import { AnalyticsLogger, useAnalyticsLogger } from './AnalyticsLogger';

interface DevToolsPanelProps {
  className?: string;
  defaultPosition?: 'floating' | 'docked';
}

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  component: React.ComponentType<any>;
  hook: () => { isOpen: boolean; open: () => void; close: () => void; toggle: () => void; };
  shortcut: string;
  badge?: string | number;
  color: string;
}

export function DevToolsPanel({ className, defaultPosition = 'floating' }: DevToolsPanelProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [position, setPosition] = useState<'top-right' | 'bottom-right' | 'bottom-left'>('top-right');
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Tool hooks
  const bundleAnalyzer = useBundleAnalyzer();
  const performanceMonitor = usePerformanceMonitor();
  const stateInspector = useStateInspector();
  const analyticsLogger = useAnalyticsLogger();

  // Available tools
  const tools: Tool[] = [
    {
      id: 'performance',
      name: 'Performance Monitor',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Monitor Core Web Vitals and runtime performance',
      component: PerformanceMonitor,
      hook: () => performanceMonitor,
      shortcut: 'Ctrl+Shift+P',
      color: 'text-blue-500',
    },
    {
      id: 'bundle',
      name: 'Bundle Analyzer',
      icon: <Package className="h-4 w-4" />,
      description: 'Analyze bundle size and composition',
      component: BundleAnalyzer,
      hook: () => bundleAnalyzer,
      shortcut: 'Ctrl+Shift+B',
      color: 'text-green-500',
    },
    {
      id: 'state',
      name: 'State Inspector',
      icon: <Database className="h-4 w-4" />,
      description: 'Inspect application state and stores',
      component: StateInspector,
      hook: () => stateInspector,
      shortcut: 'Ctrl+Shift+I',
      color: 'text-purple-500',
    },
    {
      id: 'analytics',
      name: 'Analytics Logger',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'View analytics events and metrics',
      component: AnalyticsLogger,
      hook: () => analyticsLogger,
      shortcut: 'Ctrl+Shift+A',
      color: 'text-orange-500',
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check Ctrl+Shift combinations
      if (event.ctrlKey && event.shiftKey) {
        const tool = tools.find(t => {
          const [modifier1, modifier2, key] = t.shortcut.toLowerCase().split('+');
          return (
            event.ctrlKey && modifier1 === 'ctrl' &&
            event.shiftKey && modifier2 === 'shift' &&
            event.key.toLowerCase() === key
          );
        });

        if (tool) {
          event.preventDefault();
          const hook = tool.hook();
          hook.toggle();

          // Update active tool
          if (hook.isOpen) {
            setActiveTool(tool.id);
          } else if (activeTool === tool.id) {
            setActiveTool(null);
          }
        }
      }

      // Escape to close current tool
      if (event.key === 'Escape' && activeTool) {
        const tool = tools.find(t => t.id === activeTool);
        if (tool) {
          tool.hook().close();
          setActiveTool(null);
        }
      }

      // Toggle devtools panel with Ctrl+Shift+D
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setIsMinimized(!isMinimized);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeTool, isMinimized]);

  // REMOVED: Auto-open performance monitor - was blocking UI
  // Users can open DevTools manually via Ctrl+Shift+D

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const renderTool = (tool: Tool) => {
    const hook = tool.hook();
    const ToolComponent = tool.component;

    if (!hook.isOpen) return null;

    // Render tool in a closeable panel with close button
    return (
      <div key={tool.id} className="fixed inset-0 z-50" onClick={() => {
        hook.close();
        setActiveTool(null);
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute -top-2 -right-2 z-10 h-8 w-8 p-0 rounded-full bg-white dark:bg-gray-800 shadow-lg"
              onClick={() => {
                hook.close();
                setActiveTool(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <ToolComponent isOpen={true} />
          </div>
        </div>
      </div>
    );
  };

  // Don't render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Floating DevTools Button */}
      {!isMinimized && (
        <div className={cn("fixed z-50", getPositionClasses(), className)}>
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-blue-500" />
                  DevTools
                  <Badge variant="secondary" className="text-xs">Dev</Badge>
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsLocked(!isLocked)}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle lock position</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsMinimized(true)}
                      >
                        <Minimize2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Minimize panel</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => {
                  const hook = tool.hook();
                  const isActive = activeTool === tool.id;

                  return (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "h-8 justify-start text-xs",
                            isActive && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          )}
                          onClick={() => {
                            hook.toggle();
                            setActiveTool(isActive ? null : tool.id);
                          }}
                        >
                          <span className={cn("mr-1", tool.color)}>{tool.icon}</span>
                          {tool.name.split(' ')[0]}
                          {hook.isOpen && (
                            <Eye className="h-3 w-3 ml-auto" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-gray-500">{tool.description}</p>
                          <p className="text-blue-500 mt-1">{tool.shortcut}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>💡 Quick shortcuts:</p>
                  <div className="grid grid-cols-2 gap-x-2">
                    <span>P: Performance</span>
                    <span>B: Bundle</span>
                    <span>I: State Inspector</span>
                    <span>A: Analytics</span>
                  </div>
                  <p className="text-blue-500">Ctrl+Shift+D: Toggle panel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Minimized DevTools Button */}
      {isMinimized && (
        <div className={cn("fixed z-50", getPositionClasses())}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 shadow-lg border-blue-500"
                onClick={() => setIsMinimized(false)}
              >
                <Wrench className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs">DevTools</span>
                <Maximize2 className="h-3 w-3 ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Expand DevTools Panel (Ctrl+Shift+D)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Position Selector (when unlocked) */}
      {!isMinimized && !isLocked && (
        <div className={cn("fixed z-50", position === 'top-right' ? 'top-4 right-4' : position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4')}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 border">
            <div className="flex flex-col gap-1">
              <Button
                variant={position === 'top-right' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 p-1"
                onClick={() => setPosition('top-right')}
              >
                <div className="w-2 h-2 border border-current rounded-br"></div>
              </Button>
              <Button
                variant={position === 'bottom-right' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 p-1"
                onClick={() => setPosition('bottom-right')}
              >
                <div className="w-2 h-2 border border-current rounded-tr"></div>
              </Button>
              <Button
                variant={position === 'bottom-left' ? 'default' : 'ghost'}
                size="sm"
                className="h-6 p-1"
                onClick={() => setPosition('bottom-left')}
              >
                <div className="w-2 h-2 border border-current rounded-tl"></div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render active tools */}
      {tools.map(renderTool)}

      {/* Development Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Development Mode
          </Badge>
        </div>
      )}
    </TooltipProvider>
  );
}

// Hook for controlling devtools panel
export function useDevTools() {
  const [isVisible, setIsVisible] = useState(true);

  return {
    isVisible,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggle: () => setIsVisible(!isVisible),
  };
}