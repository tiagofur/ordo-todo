import React, { useState, useEffect } from 'react';
import { Activity, Download, Eye, RefreshCw, Filter, Search, Calendar, TrendingUp, BarChart3, Zap, Clock, User, Target, CheckCircle, AlertCircle, XCircle, PlayCircle } from 'lucide-react';
import { cn, Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Progress, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger } from '@ordo-todo/ui';

interface AnalyticsLoggerProps {
  isOpen?: boolean;
  className?: string;
}

interface AnalyticsEvent {
  id: string;
  event: string;
  timestamp: number;
  data: any;
  category: 'user_action' | 'performance' | 'error' | 'feature_usage' | 'system' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface SessionSummary {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number;
  eventsCount: number;
  category: string;
  status: 'active' | 'completed' | 'error';
}

interface PerformanceMetrics {
  eventCount: number;
  categoryCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  hourlyActivity: Record<number, number>;
  topEvents: Array<{ event: string; count: number }>;
  errorsCount: number;
  sessionsCount: number;
}

export function AnalyticsLogger({ isOpen = true, className }: AnalyticsLoggerProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AnalyticsEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [activeTab, setActiveTab] = useState('events');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(true);

  // Mock analytics data for demonstration
  const loadMockAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);

      // Generate mock events
      const mockEvents: AnalyticsEvent[] = [
        {
          id: '1',
          event: 'task_completed',
          timestamp: now - 5000,
          data: { taskId: 'task-123', duration: 25, focusScore: 0.85 },
          category: 'business',
          severity: 'medium',
          source: 'pomodoro-timer',
          userId: 'user-456',
          sessionId: 'session-789',
          metadata: { projectId: 'project-1', tags: ['feature', 'urgent'] }
        },
        {
          id: '2',
          event: 'timer_started',
          timestamp: now - 1800000,
          data: { type: 'pomodoro', duration: 25, taskType: 'development' },
          category: 'user_action',
          severity: 'low',
          source: 'pomodoro-timer',
          userId: 'user-456',
          sessionId: 'session-789'
        },
        {
          id: '3',
          event: 'performance_warning',
          timestamp: now - 120000,
          data: { metric: 'bundle_load_time', value: 3500, threshold: 2000 },
          category: 'performance',
          severity: 'high',
          source: 'performance-monitor',
          userId: 'user-456',
          sessionId: 'session-789'
        },
        {
          id: '4',
          event: 'feature_used',
          timestamp: now - 60000,
          data: { feature: 'analytics_dashboard', action: 'view' },
          category: 'feature_usage',
          severity: 'low',
          source: 'analytics',
          userId: 'user-456',
          sessionId: 'session-789'
        },
        {
          id: '5',
          event: 'task_created',
          timestamp: now - 900000,
          data: { title: 'Review PR #234', priority: 'high', estimatedTime: 45 },
          category: 'business',
          severity: 'medium',
          source: 'task_manager',
          userId: 'user-456',
          sessionId: 'session-789'
        },
        {
          id: '6',
          event: 'application_error',
          timestamp: now - 300000,
          data: { error: 'Network timeout', url: '/api/tasks', stack: '...' },
          category: 'error',
          severity: 'critical',
          source: 'api_client',
          userId: 'user-456',
          sessionId: 'session-789'
        }
      ];

      // Generate mock sessions
      const mockSessions: SessionSummary[] = [
        {
          id: 'session-789',
          startTime: oneHourAgo,
          endTime: now,
          duration: 60 * 60 * 1000, // 1 hour
          eventsCount: mockEvents.length,
          category: 'development',
          status: 'active'
        }
      ];

      // Calculate metrics
      const categoryCounts: Record<string, number> = {};
      const severityCounts: Record<string, number> = {};
      const hourlyActivity: Record<number, number> = {};
      const eventCounts: Record<string, number> = {};

      mockEvents.forEach(event => {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
        severityCounts[event.severity] = (severityCounts[event.severity] || 0) + 1;
        eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;

        const hour = new Date(event.timestamp).getHours();
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
      });

      const topEvents = Object.entries(eventCounts)
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const mockMetrics: PerformanceMetrics = {
        eventCount: mockEvents.length,
        categoryCounts,
        severityCounts,
        hourlyActivity,
        topEvents,
        errorsCount: categoryCounts.error || 0,
        sessionsCount: mockSessions.length
      };

      setEvents(mockEvents);
      setSessions(mockSessions);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && events.length === 0) {
      loadMockAnalyticsData();
    }
  }, [isOpen]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' ||
      event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.data?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user_action': return 'text-blue-600';
      case 'performance': return 'text-orange-600';
      case 'error': return 'text-red-600';
      case 'feature_usage': return 'text-green-600';
      case 'system': return 'text-purple-600';
      case 'business': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const exportAnalyticsData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      events,
      sessions,
      metrics,
      summary: {
        totalEvents: events.length,
        totalSessions: sessions.length,
        errorsCount: metrics?.errorsCount || 0,
        dateRange: {
          start: events.length > 0 ? new Date(Math.min(...events.map(e => e.timestamp))).toISOString() : null,
          end: events.length > 0 ? new Date(Math.max(...events.map(e => e.timestamp))).toISOString() : null
        }
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startLogging = () => {
    setIsRecording(true);
    // In a real implementation, this would start collecting events
  };

  const stopLogging = () => {
    setIsRecording(false);
    // In a real implementation, this would stop collecting events
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Analytics Logger
              <Badge variant={isRecording ? 'default' : 'secondary'}>
                {isRecording ? (
                  <>
                    <PlayCircle className="h-3 w-3 mr-1" />
                    Recording
                  </>
                ) : (
                  'Stopped'
                )}
              </Badge>
              {metrics && (
                <Badge variant="outline">{metrics.eventCount} events</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? 'destructive' : 'default'}
                size="sm"
                onClick={isRecording ? stopLogging : startLogging}
              >
                {isRecording ? 'Stop' : 'Start'} Logging
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMockAnalyticsData}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportAnalyticsData}
                disabled={events.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {metrics && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Events</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{metrics.eventCount}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Sessions</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{metrics.sessionsCount}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Errors</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{metrics.errorsCount}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Categories</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{Object.keys(metrics.categoryCounts).length}</div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events" className="mt-0">
              <div className="p-4">
                {/* Filters */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="user_action">User Action</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="feature_usage">Feature Usage</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Events List */}
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(event.severity)}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{event.event}</span>
                                <Badge variant="outline" className={cn("text-xs", getCategoryColor(event.category))}>
                                  {event.category}
                                </Badge>
                                <Badge variant="outline" className={cn("text-xs", getSeverityColor(event.severity))}>
                                  {event.severity}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {event.source} • {new Date(event.timestamp).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {event.userId && <span>User: {event.userId}</span>}
                                {event.sessionId && <span> • Session: {event.sessionId}</span>}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No events found</p>
                    <p className="text-sm">Try adjusting your filters or start logging to see events</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="mt-0">
              <div className="p-4">
                {metrics ? (
                  <div className="space-y-6">
                    {/* Category Distribution */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Category Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(metrics.categoryCounts).map(([category, count]) => (
                          <div key={category} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm font-medium", getCategoryColor(category))}>
                                {category}
                              </span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                            <Progress
                              value={(count / metrics.eventCount) * 100}
                              className="mt-2 h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Events */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Top Events</h3>
                      <div className="space-y-2">
                        {metrics.topEvents.map((item, index) => (
                          <div key={item.event} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{index + 1}</Badge>
                              <span className="font-medium text-sm">{item.event}</span>
                            </div>
                            <Badge variant="secondary">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Severity Distribution */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Severity Distribution</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(metrics.severityCounts).map(([severity, count]) => (
                          <div key={severity} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              {getSeverityIcon(severity)}
                              <span className={cn("text-sm font-medium", getSeverityColor(severity))}>
                                {severity}
                              </span>
                            </div>
                            <div className="text-2xl font-bold mt-1">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No metrics available</p>
                    <p className="text-sm">Start logging events to see analytics metrics</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="mt-0">
              <div className="p-4">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              session.status === 'active' ? 'bg-green-500' :
                              session.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                            )} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{session.id}</span>
                                <Badge variant="outline" className="text-xs">
                                  {session.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {session.category}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600">
                                {formatDuration(session.duration)} • {session.eventsCount} events
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(session.startTime).toLocaleString()} -
                                {session.endTime ? new Date(session.endTime).toLocaleString() : 'ongoing'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No sessions recorded</p>
                    <p className="text-sm">Sessions will appear here as user activity is tracked</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getSeverityIcon(selectedEvent.severity)}
                    {selectedEvent.event}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <Badge variant="outline" className={cn("ml-2", getCategoryColor(selectedEvent.category))}>
                        {selectedEvent.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Severity:</span>
                      <Badge variant="outline" className={cn("ml-2", getSeverityColor(selectedEvent.severity))}>
                        {selectedEvent.severity}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Source:</span>
                      <span className="ml-2">{selectedEvent.source}</span>
                    </div>
                    <div>
                      <span className="font-medium">Timestamp:</span>
                      <span className="ml-2">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {selectedEvent.data && (
                    <div>
                      <h4 className="font-medium mb-2">Event Data:</h4>
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <pre className="text-xs overflow-auto max-h-40">
                          {JSON.stringify(selectedEvent.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Metadata:</h4>
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <pre className="text-xs overflow-auto max-h-40">
                          {JSON.stringify(selectedEvent.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}

// Hook for controlling analytics logger
export function useAnalyticsLogger() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}