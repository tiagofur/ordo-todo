import React, { useState } from 'react';
import { Activity, CheckCircle, XCircle, Clock, RefreshCw, Play, Pause, Trash2, AlertCircle, Search, Filter, Download, Eye } from 'lucide-react';
import { useOfflineSyncStore } from '@/stores/offline-sync-store';
import { formatDistanceToNow } from 'date-fns';
import { cn, Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Progress, Alert, AlertDescription } from '@ordo-todo/ui';

interface SyncQueueInspectorProps {
  isOpen?: boolean;
}

export function SyncQueueInspector({ isOpen = true }: SyncQueueInspectorProps) {
  const { queue, forceSync, retryOperation, removeOperation, resolveAllConflicts } = useOfflineSyncStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);

  // Filter operations
  const filteredOperations = queue.operations.filter(op => {
    const matchesSearch = searchTerm === '' ||
      op.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || op.status === filterStatus;
    const matchesType = filterType === 'all' || op.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Filter conflicts
  const filteredConflicts = queue.conflicts.filter(conflict => {
    return searchTerm === '' ||
      conflict.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conflict.entityId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get unique types and statuses
  const types = Array.from(new Set(queue.operations.map(op => op.type)));
  const statuses = Array.from(new Set(queue.operations.map(op => op.status)));

  // Status icons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Entity type icons
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      case 'project':
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'workspace':
        return <div className="w-2 h-2 rounded-full bg-purple-500" />;
      case 'session':
        return <div className="w-2 h-2 rounded-full bg-orange-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500" />;
    }
  };

  // Export queue data
  const exportQueueData = () => {
    const data = {
      queue: {
        operations: queue.operations,
        conflicts: queue.conflicts,
        isOnline: queue.isOnline,
        syncStatus: queue.syncStatus,
        syncProgress: queue.syncProgress,
      },
      exportedAt: Date.now(),
      stats: {
        totalOperations: queue.operations.length,
        pendingOperations: queue.operations.filter(op => op.status === 'pending').length,
        failedOperations: queue.operations.filter(op => op.status === 'failed').length,
        completedOperations: queue.operations.filter(op => op.status === 'completed').length,
        totalConflicts: queue.conflicts.length,
        unresolvedConflicts: queue.conflicts.filter(c => !c.resolvedAt).length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-queue-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format operation data for display
  const formatOperationData = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-blue-500" />
            Sync Queue Inspector
            <Badge variant={queue.isOnline ? 'default' : 'secondary'}>
              {queue.isOnline ? 'Online' : 'Offline'}
            </Badge>
            <Badge variant={queue.syncStatus === 'syncing' ? 'default' : 'outline'}>
              {queue.syncStatus}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {queue.syncStatus === 'syncing' && (
              <Button variant="outline" size="sm" disabled>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Syncing...
              </Button>
            )}
            {queue.isOnline && queue.syncStatus !== 'syncing' && (
              <Button variant="outline" size="sm" onClick={() => forceSync()}>
                <Play className="h-4 w-4 mr-1" />
                Force Sync
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button variant="outline" size="sm" onClick={exportQueueData}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Sync Progress */}
        {queue.syncStatus === 'syncing' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Sync Progress</span>
              <span>{queue.syncProgress}%</span>
            </div>
            <Progress value={queue.syncProgress} className="h-2" />
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-3 mt-3">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {queue.operations.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total Operations</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {filteredOperations.filter(op => op.status === 'pending').length}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {filteredOperations.filter(op => op.status === 'completed').length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {filteredOperations.filter(op => op.status === 'failed').length}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Failed</div>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {queue.conflicts.filter(c => !c.resolvedAt).length}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Conflicts</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Filters */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search operations or conflicts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="capitalize">{status}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-y-auto max-h-[500px]">
          {/* Conflicts Section */}
          {filteredConflicts.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Conflicts ({filteredConflicts.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveAllConflicts('local')}
                    className="text-xs"
                  >
                    Resolve All
                  </Button>
                </div>
                <div className="space-y-2">
                  {filteredConflicts.slice(0, 3).map(conflict => (
                    <div key={conflict.id} className="bg-white dark:bg-gray-800 p-2 rounded border border-orange-200 dark:border-orange-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(conflict.entityType)}
                          <span className="text-sm font-medium capitalize">
                            {conflict.entityType} {conflict.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {conflict.entityId}
                          </Badge>
                        </div>
                        <Badge variant={conflict.resolvedAt ? 'default' : 'destructive'} className="text-xs">
                          {conflict.resolvedAt ? 'Resolved' : 'Pending'}
                        </Badge>
                      </div>
                      {showDetails && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <div>Local: {JSON.stringify(conflict.localData, null, 1)}</div>
                          <div>Remote: {JSON.stringify(conflict.remoteData, null, 1)}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredConflicts.length > 3 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      And {filteredConflicts.length - 3} more conflicts...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Operations Section */}
          <div className="p-3">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Operations ({filteredOperations.length})
            </h3>
            {filteredOperations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No operations found matching your filters
              </p>
            ) : (
              <div className="space-y-2">
                {filteredOperations.map(operation => (
                  <div key={operation.id} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(operation.status)}
                        {getTypeIcon(operation.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm capitalize">
                              {operation.type} {operation.entityType}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {operation.entityId}
                            </Badge>
                            <Badge variant={operation.status === 'pending' ? 'secondary' : operation.status === 'completed' ? 'default' : 'destructive'} className="text-xs capitalize">
                              {operation.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatDistanceToNow(new Date(operation.timestamp), { addSuffix: true })}</span>
                            {operation.retryCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Retry {operation.retryCount}
                              </Badge>
                            )}
                            {operation.lastRetry && (
                              <span>Last retry: {formatDistanceToNow(new Date(operation.lastRetry), { addSuffix: true })}</span>
                            )}
                          </div>

                          {/* Operation Details */}
                          {showDetails && (
                            <div className="mt-2">
                              <details className="text-xs">
                                <summary className="cursor-pointer text-blue-500 hover:text-blue-600">
                                  View Operation Data
                                </summary>
                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto text-xs">
                                  {formatOperationData(operation.data)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {operation.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryOperation(operation.id)}
                            className="h-6 w-6 p-0"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOperation(operation.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for controlling sync queue inspector
export function useSyncQueueInspector() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}