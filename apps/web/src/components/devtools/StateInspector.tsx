import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, AlertTriangle, CheckCircle, Info, Filter, Database, Zap, TrendingUp, Box } from 'lucide-react';
import { cn, Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Progress, Alert, AlertDescription, Tabs, TabsContent, TabsList, TabsTrigger, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@ordo-todo/ui';

interface StateInspectorProps {
  isOpen?: boolean;
  className?: string;
}

interface StoreSnapshot {
  name: string;
  type: 'zustand' | 'react-query' | 'local' | 'session' | 'memory';
  size: number;
  keys: string[];
  data: any;
  lastUpdated: string;
  timestamp: number;
}

interface QueryInfo {
  queryKey: string[];
  queryHash: string;
  status: 'fresh' | 'fetching' | 'stale' | 'paused' | 'inactive';
  dataUpdatedAt: number;
  data?: any;
  error?: any;
  isFetching: boolean;
  fetchStatus: 'fetching' | 'paused' | 'idle';
  staleTime?: number;
  cacheTime?: number;
}

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  data: any;
  stored: boolean;
  storageType?: 'indexeddb' | 'localstorage';
}

export function StateInspector({ isOpen = true, className }: StateInspectorProps) {
  const [stores, setStores] = useState<StoreSnapshot[]>([]);
  const [queries, setQueries] = useState<QueryInfo[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('stores');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());

  // Capture Zustand stores from window object
  const captureZustandStores = () => {
    const capturedStores: StoreSnapshot[] = [];

    // Try to access stores that might be exposed on window
    if (typeof window !== 'undefined') {
      const globalObj = window as any;

      // Look for common store patterns
      Object.keys(globalObj).forEach(key => {
        const value = globalObj[key];
        if (value && typeof value === 'object' && value.getState && value.setState) {
          // Likely a Zustand store
          try {
            const state = value.getState();
            const storeSnapshot: StoreSnapshot = {
              name: key,
              type: 'zustand',
              size: JSON.stringify(state).length,
              keys: Object.keys(state),
              data: state,
              lastUpdated: new Date().toISOString(),
              timestamp: Date.now()
            };
            capturedStores.push(storeSnapshot);
          } catch (error) {
            console.warn(`Failed to capture store ${key}:`, error);
          }
        }
      });
    }

    return capturedStores;
  };

  // Capture React Query cache
  const captureReactQueryCache = () => {
    const capturedQueries: QueryInfo[] = [];

    if (typeof window !== 'undefined') {
      // Try to access React Query devtools
      const queryClient = (window as any).__REACT_QUERY_CLIENT__;
      if (queryClient && queryClient.getQueryCache) {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();

        queries.forEach((query: any) => {
          const queryInfo: QueryInfo = {
            queryKey: query.queryKey,
            queryHash: query.queryHash,
            status: query.state.status,
            dataUpdatedAt: query.state.dataUpdatedAt,
            data: query.state.data,
            error: query.state.error,
            isFetching: query.state.isFetching,
            fetchStatus: query.state.fetchStatus,
            staleTime: query.options.staleTime,
            cacheTime: query.options.cacheTime
          };
          capturedQueries.push(queryInfo);
        });
      }
    }

    return capturedQueries;
  };

  // Capture storage data
  const captureStorageData = () => {
    const storageStores: StoreSnapshot[] = [];

    if (typeof window !== 'undefined') {
      // LocalStorage
      try {
        const localData: any = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            localData[key] = localStorage.getItem(key);
          }
        }

        if (Object.keys(localData).length > 0) {
          storageStores.push({
            name: 'localStorage',
            type: 'local',
            size: JSON.stringify(localData).length,
            keys: Object.keys(localData),
            data: localData,
            lastUpdated: new Date().toISOString(),
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn('Failed to capture localStorage:', error);
      }

      // SessionStorage
      try {
        const sessionData: any = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            sessionData[key] = sessionStorage.getItem(key);
          }
        }

        if (Object.keys(sessionData).length > 0) {
          storageStores.push({
            name: 'sessionStorage',
            type: 'session',
            size: JSON.stringify(sessionData).length,
            keys: Object.keys(sessionData),
            data: sessionData,
            lastUpdated: new Date().toISOString(),
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn('Failed to capture sessionStorage:', error);
      }
    }

    return storageStores;
  };

  // Capture analytics events from memory
  const captureAnalyticsEvents = () => {
    if (typeof window !== 'undefined') {
      // Try to get events from analytics storage
      const analyticsEvents = (window as any).__ANALYTICS_EVENTS__;
      if (Array.isArray(analyticsEvents)) {
        return analyticsEvents.map((event: any) => ({
          ...event,
          stored: true,
          storageType: event.storageType || 'memory'
        }));
      }
    }
    return [];
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const zustandStores = captureZustandStores();
      const storageStores = captureStorageData();
      const reactQuery = captureReactQueryCache();
      const analyticsEvents = captureAnalyticsEvents();

      setStores([...zustandStores, ...storageStores]);
      setQueries(reactQuery);
      setEvents(analyticsEvents);
    } catch (error) {
      console.error('Failed to refresh state data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stores.length === 0) {
      refreshData();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      if (isOpen) {
        refreshData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleStoreExpansion = (storeName: string) => {
    setExpandedStores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeName)) {
        newSet.delete(storeName);
      } else {
        newSet.add(storeName);
      }
      return newSet;
    });
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = searchTerm === '' ||
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || store.type === filterType;

    return matchesSearch && matchesType;
  });

  const filteredQueries = queries.filter(query => {
    const matchesSearch = searchTerm === '' ||
      query.queryKey.some(key =>
        typeof key === 'string' && key.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      query.queryHash.includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'text-green-600';
      case 'fetching': return 'text-blue-600';
      case 'stale': return 'text-yellow-600';
      case 'paused': return 'text-gray-600';
      case 'inactive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      fresh: 'default',
      fetching: 'secondary',
      stale: 'outline',
      paused: 'secondary',
      inactive: 'destructive'
    } as const;

    return variants[status as keyof typeof variants] || 'outline';
  };

  const exportStateData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stores,
      queries,
      events: events.slice(0, 100), // Limit events
      summary: {
        totalStores: stores.length,
        totalQueries: queries.length,
        totalEvents: events.length,
        totalMemoryUsage: stores.reduce((sum, store) => sum + store.size, 0)
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-inspection-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <Card className={cn("w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-blue-500" />
              State Inspector
              <Badge variant="outline">{stores.length} stores</Badge>
              <Badge variant="outline">{queries.length} queries</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportStateData}
                disabled={stores.length === 0 && queries.length === 0}
              >
                <Eye className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stores">Stores</TabsTrigger>
              <TabsTrigger value="queries">Queries</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            {/* Stores Tab */}
            <TabsContent value="stores" className="mt-0">
              <div className="p-4">
                {/* Filters */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="zustand">Zustand</SelectItem>
                      <SelectItem value="local">LocalStorage</SelectItem>
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="memory">Memory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stores List */}
                <div className="space-y-2">
                  {filteredStores.map((store) => (
                    <Card key={store.name} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              store.type === 'zustand' ? 'bg-blue-500' :
                              store.type === 'local' ? 'bg-green-500' :
                              store.type === 'session' ? 'bg-yellow-500' : 'bg-gray-500'
                            )} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{store.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {store.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatBytes(store.size)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {store.keys.length} keys • Last updated: {new Date(store.lastUpdated).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStoreExpansion(store.name)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        <Collapsible
                          open={expandedStores.has(store.name)}
                          onOpenChange={() => toggleStoreExpansion(store.name)}
                        >
                          <CollapsibleContent className="mt-3">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                              <pre className="text-xs overflow-auto max-h-48">
                                {JSON.stringify(store.data, null, 2)}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Queries Tab */}
            <TabsContent value="queries" className="mt-0">
              <div className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Queries List */}
                <div className="space-y-2">
                  {filteredQueries.map((query) => (
                    <Card key={query.queryHash} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              query.status === 'fresh' ? 'bg-green-500' :
                              query.status === 'fetching' ? 'bg-blue-500' :
                              query.status === 'stale' ? 'bg-yellow-500' :
                              query.status === 'paused' ? 'bg-gray-500' : 'bg-red-500'
                            )} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={getStatusBadge(query.status)} className="text-xs">
                                  {query.status}
                                </Badge>
                                {query.isFetching && (
                                  <Badge variant="secondary" className="text-xs">
                                    fetching
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mb-1">
                                {query.queryKey.map(key =>
                                  typeof key === 'string' ? key : JSON.stringify(key)
                                ).join(' / ')}
                              </div>
                              <div className="text-xs text-gray-500">
                                Updated: {query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toLocaleTimeString() : 'never'}
                                {query.staleTime && ` • Stale: ${query.staleTime}ms`}
                              </div>
                            </div>
                          </div>
                        </div>

                        {query.error && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {query.error.message || 'Unknown error'}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="mt-0">
              <div className="p-4">
                <div className="space-y-2">
                  {events.slice(0, 50).map((event, index) => (
                    <Card key={`${event.event}-${event.timestamp}-${index}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-sm">{event.event}</span>
                            <Badge variant="outline" className="text-xs">
                              {event.storageType || 'memory'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        {event.data && Object.keys(event.data).length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-20">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No analytics events captured</p>
                    <p className="text-sm">Events will appear here as they are tracked</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
    </Card>
  );
}

// Hook for controlling state inspector
export function useStateInspector() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}