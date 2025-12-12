import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, Trash2, Eye, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { formatDistanceToNow } from 'date-fns';
import { cn, Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '@ordo-todo/ui';

interface EventEntry {
  id: string;
  timestamp: number;
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface AnalyticsLoggerProps {
  isOpen?: boolean;
  maxEvents?: number;
}

export function AnalyticsLogger({ isOpen = true, maxEvents = 1000 }: AnalyticsLoggerProps) {
  const { events, consentGiven, isTracking } = useAnalyticsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showMetadata, setShowMetadata] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Filter events
  const filteredEvents = events
    .slice(-maxEvents)
    .reverse() // Show newest first
    .filter(event => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          event.action.toLowerCase().includes(searchLower) ||
          event.category.toLowerCase().includes(searchLower) ||
          event.label?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(event => {
      if (filterType !== 'all') {
        return event.type === filterType;
      }
      return true;
    })
    .filter(event => {
      if (filterCategory !== 'all') {
        return event.category === filterCategory;
      }
      return true;
    });

  // Get unique categories and types
  const categories = Array.from(new Set(events.map(e => e.category))).sort();
  const types = Array.from(new Set(events.map(e => e.type))).sort();

  // Event type icons
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'action':
        return <Activity className="h-3 w-3 text-blue-500" />;
      case 'navigation':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'performance':
        return <Clock className="h-3 w-3 text-purple-500" />;
      case 'feature':
        return <Eye className="h-3 w-3 text-orange-500" />;
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  // Export events to JSON
  const exportEvents = () => {
    const data = {
      events: filteredEvents,
      exportedAt: Date.now(),
      totalEvents: events.length,
      filteredEvents: filteredEvents.length,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-events-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-blue-500" />
            Analytics Event Logger
            <Badge variant="outline" className="ml-2">
              {filteredEvents.length} / {events.length}
            </Badge>
            <Badge variant={consentGiven ? 'default' : 'secondary'}>
              {consentGiven ? 'Tracking' : 'Disabled'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetadata(!showMetadata)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showMetadata ? 'Hide' : 'Show'} Metadata
            </Button>
            <Button variant="outline" size="sm" onClick={exportEvents}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
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
              {types.map(type => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    {getEventIcon(type)}
                    <span className="capitalize">{type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  <span className="capitalize">{category}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-y-auto max-h-[500px]">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm mt-1">
                {!consentGiven
                  ? 'Enable analytics tracking to see events'
                  : 'Try adjusting your filters or search terms'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {event.category}.{event.action}
                          </span>
                          {event.label && (
                            <span className="text-xs text-gray-500 truncate">
                              ({event.label})
                            </span>
                          )}
                          {event.value !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {event.value}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {event.type}
                          </Badge>
                        </div>

                        {/* Metadata */}
                        {showMetadata && event.metadata && Object.keys(event.metadata).length > 0 && (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleEventExpansion(event.id)}
                              className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                              <span>Metadata</span>
                              <span>{expandedEvents.has(event.id) ? '▼' : '▶'}</span>
                            </button>
                            {expandedEvents.has(event.id) && (
                              <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>
                Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
              </span>
              {events.length >= maxEvents && (
                <span className="text-xs text-orange-600">
                  Showing last {maxEvents} events
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Tracking: {isTracking ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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