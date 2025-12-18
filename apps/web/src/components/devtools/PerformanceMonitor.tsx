import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, AlertTriangle, TrendingUp, Monitor, Download, Eye, RefreshCw } from 'lucide-react';
import { performanceMonitor, getVitalRating, webVitalsThresholds } from '@/lib/performance-monitor';
import { formatDistanceToNow } from 'date-fns';
import { cn, Card, CardContent, CardHeader, CardTitle, Button, Progress, Alert, AlertDescription, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ordo-todo/ui';

interface PerformanceMonitorProps {
  isOpen?: boolean;
  className?: string;
}

interface PerformanceMetricCardProps {
  title: string;
  value: number;
  threshold: { good: number; poor: number };
  unit: string;
  icon: React.ReactNode;
  description: string;
}

function PerformanceMetricCard({ title, value, threshold, unit, icon, description }: PerformanceMetricCardProps) {
  const rating = getVitalRating(value, title.toLowerCase() as keyof typeof webVitalsThresholds);

  const getColor = () => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate percentage for progress bar (inverted - higher is worse)
  const percentage = Math.max(0, Math.min(100, ((value - threshold.good) / (threshold.poor - threshold.good)) * 100));

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", getColor())}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h3>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", getColor())}>
                  {Math.round(value)}
                </span>
                <span className="text-xs text-gray-500">{unit}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={rating === 'good' ? 'default' : rating === 'needs-improvement' ? 'secondary' : 'destructive'}>
              {rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Needs Improvement' : 'Poor'}
            </Badge>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Performance</span>
            <span>{Math.round(100 - percentage)}%</span>
          </div>
          <Progress value={100 - percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceMonitor({ isOpen = true, className }: PerformanceMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const currentMetrics = performanceMonitor.getPerformanceSummary();
      setMetrics(currentMetrics.metrics);
      setScore(currentMetrics.score);
    } catch (error) {
      console.error('Failed to refresh performance data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const startMonitoring = () => {
    performanceMonitor.startMonitoring();
    setIsMonitoring(true);
    refreshData();
  };

  const stopMonitoring = () => {
    const finalMetrics = performanceMonitor.stopMonitoring();
    setMetrics(finalMetrics);
    setIsMonitoring(false);
  };

  const exportData = () => {
    try {
      const data = performanceMonitor.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export performance data:', error);
    }
  };

  useEffect(() => {
    if (isOpen && !metrics) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Card className={cn("w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5 text-blue-500" />
              Performance Monitor
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? 'Monitoring' : 'Stopped'}
              </Badge>
              {score && (
                <Badge variant={score.overall >= 80 ? 'default' : score.overall >= 60 ? 'secondary' : 'destructive'}>
                  Score: {score.overall}/100
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isRefreshing ? undefined : refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? (
                  <>
                    <Activity className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-[60vh]">
            {/* Core Web Vitals */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Core Web Vitals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <PerformanceMetricCard
                  title="LCP"
                  value={metrics?.lcp || 0}
                  threshold={webVitalsThresholds.lcp}
                  unit="ms"
                  icon={<Clock className="h-4 w-4" />}
                  description="Largest Contentful Paint"
                />
                <PerformanceMetricCard
                  title="FID"
                  value={metrics?.fid || 0}
                  threshold={webVitalsThresholds.fid}
                  unit="ms"
                  icon={<Zap className="h-4 w-4" />}
                  description="First Input Delay"
                />
                <PerformanceMetricCard
                  title="CLS"
                  value={metrics?.cls || 0}
                  threshold={webVitalsThresholds.cls}
                  unit=""
                  icon={<AlertTriangle className="h-4 w-4" />}
                  description="Cumulative Layout Shift"
                />
              </div>
            </div>

            {/* Navigation Timing */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Navigation Timing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">DOM Content Loaded</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {metrics?.domContentLoaded ? Math.round(metrics.domContentLoaded) : 0}ms
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Load Complete</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {metrics?.loadComplete ? Math.round(metrics.loadComplete) : 0}ms
                  </div>
                </div>
              </div>
            </div>

            {/* Bundle Metrics */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Bundle Metrics
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Bundle Load Time</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics?.bundleLoadTime ? Math.round(metrics.bundleLoadTime) : 0}ms
                </div>
                {metrics?.chunkLoadTimes && Object.keys(metrics.chunkLoadTimes).length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chunk Load Times</div>
                    <div className="space-y-1">
                      {Object.entries(metrics.chunkLoadTimes)
                        .slice(0, 5)
                        .map(([chunk, time]) => (
                          <div key={chunk} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{chunk}</span>
                            <span className="font-medium">{Math.round(Number(time))}ms</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Memory Usage */}
            {metrics?.memoryUsage && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Memory Usage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Used</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatBytes(metrics.memoryUsage.used)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatBytes(metrics.memoryUsage.total)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Limit</div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatBytes(metrics.memoryUsage.limit)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {score?.recommendations && score.recommendations.length > 0 && (
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {score.recommendations.map((recommendation: string, index: number) => (
                    <Alert key={index}>
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {score?.warnings && score.warnings.length > 0 && (
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Warnings
                </h3>
                <div className="space-y-2">
                  {score.warnings.map((warning: string, index: number) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
    </Card>
  );
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Hook for controlling performance monitor
export function usePerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}