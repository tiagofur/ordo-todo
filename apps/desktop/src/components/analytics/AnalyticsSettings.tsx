import { useState, useEffect } from 'react';
import { BarChart3, LineChart, PieChart, Download, Trash2, Shield, Eye, EyeOff, Activity, AlertTriangle, Clock, Zap } from 'lucide-react';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription, Badge, Switch } from '@ordo-todo/ui';
import { formatDistanceToNow } from 'date-fns';

export function AnalyticsSettings() {
  const {
    consentGiven,
    isTracking,
    lastSyncAt,
    events,
    errors,
    enableTracking,
    disableTracking,
    clearData,
    exportData,
    generateReport,
    syncAnalytics,
  } = useAnalyticsStore();

  const [reports, setReports] = useState<any>({
    usage: null,
    performance: null,
    errors: null,
  });

  const [showDataPreview, setShowDataPreview] = useState(false);

  useEffect(() => {
    if (consentGiven) {
      setReports({
        usage: generateReport('usage'),
        performance: generateReport('performance'),
        errors: generateReport('errors'),
      });
    }
  }, [consentGiven, generateReport]);

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      clearData();
    }
  };

  const recentEvents = events.slice(-5);
  const recentErrors = errors.slice(-3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Analytics & Telemetry</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Help us improve Ordo Todo by sharing anonymous usage data. All data is privacy-first and never contains personal information.
        </p>
      </div>

      {/* Consent Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Share Anonymous Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Help improve the app by sharing usage patterns and performance data
              </p>
            </div>
            <Switch
              checked={consentGiven}
              onCheckedChange={consentGiven ? disableTracking : enableTracking}
            />
          </div>

          {consentGiven && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Tracking Active</span> - We're collecting anonymous usage data to improve your experience.
              </AlertDescription>
            </Alert>
          )}

          {!consentGiven && (
            <Alert>
              <EyeOff className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Tracking Disabled</span> - No analytics data is being collected.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      {consentGiven && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Usage Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.usage ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Actions</span>
                    <span className="font-medium">{reports.usage.totalActions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Features Used</span>
                    <span className="font-medium">{reports.usage.featuresUsed?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasks Created</span>
                    <span className="font-medium">{reports.usage.tasksCreated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pomodoro Sessions</span>
                    <span className="font-medium">{reports.usage.pomodoroSessions}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.performance ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Page Load</span>
                    <span className="font-medium">{reports.performance.pageLoadTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Response</span>
                    <span className="font-medium">{reports.performance.averageApiResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Render Time</span>
                    <span className="font-medium">{reports.performance.renderTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="font-medium">
                      {reports.performance.memoryUsage
                        ? `${(reports.performance.memoryUsage / 1024 / 1024).toFixed(1)}MB`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.errors ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Errors</span>
                    <span className="font-medium">{reports.errors.totalErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Unresolved</span>
                    <span className="font-medium text-orange-600">{reports.errors.unresolvedErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Session Status</span>
                    <Badge variant={isTracking ? 'default' : 'secondary'}>
                      {isTracking ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Sync</span>
                    <span className="font-medium text-xs">
                      {lastSyncAt
                        ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })
                        : 'Never'
                      }
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Management */}
      {consentGiven && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => syncAnalytics()}>
                <Activity className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={() => setShowDataPreview(!showDataPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showDataPreview ? 'Hide' : 'Show'} Data
              </Button>
              <Button variant="outline" onClick={handleClearData} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>

            {showDataPreview && (
              <div className="space-y-4 mt-4">
                {/* Recent Events */}
                <div>
                  <h4 className="font-medium mb-2">Recent Events</h4>
                  <div className="space-y-1 text-sm">
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <div key={event.id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-mono text-xs">{event.category}.{event.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No events recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Recent Errors */}
                {recentErrors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Errors</h4>
                    <div className="space-y-1 text-sm">
                      {recentErrors.map((error) => (
                        <div key={error.id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-xs truncate flex-1">{error.message}</span>
                            <Badge variant={error.resolved ? 'default' : 'destructive'} className="text-xs ml-2">
                              {error.resolved ? 'Resolved' : 'Open'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
            <span>All data is anonymized and contains no personal information</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
            <span>We only collect usage patterns, performance metrics, and error reports</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
            <span>Data is used exclusively to improve the app experience</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
            <span>You can disable analytics at any time and all data will be deleted</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5" />
            <span>Data is stored securely and transmitted over encrypted connections</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}