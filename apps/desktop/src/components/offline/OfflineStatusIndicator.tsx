import { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw, XCircle, Clock, Database } from 'lucide-react';
import { useOfflineSyncStore } from '@/stores/offline-sync-store';
import { cn, Badge, Button, Popover, PopoverContent, PopoverTrigger } from '@ordo-todo/ui';
import { formatDistanceToNow } from 'date-fns';

export function OfflineStatusIndicator() {
  const { queue, forceSync, setupNetworkListeners } = useOfflineSyncStore();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const cleanup = setupNetworkListeners();
    return cleanup;
  }, [setupNetworkListeners]);

  const { isOnline, syncStatus, conflicts, operations } = queue;
  const pendingOperations = operations.filter(op => op.status === 'pending').length;
  const failedOperations = operations.filter(op => op.status === 'failed').length;
  const unresolvedConflicts = conflicts.filter(c => !c.resolvedAt).length;

  // Auto-hide after 5 seconds if no issues
  useEffect(() => {
    if (isOnline && pendingOperations === 0 && unresolvedConflicts === 0) {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isOnline, pendingOperations, unresolvedConflicts]);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (syncStatus === 'error' || failedOperations > 0) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (unresolvedConflicts > 0) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    if (syncStatus === 'syncing') {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (pendingOperations > 0) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'error') return 'Sync Error';
    if (failedOperations > 0) return `${failedOperations} Failed`;
    if (unresolvedConflicts > 0) return `${unresolvedConflicts} Conflicts`;
    if (syncStatus === 'syncing') return 'Syncing...';
    if (pendingOperations > 0) return `${pendingOperations} Pending`;
    return 'Synced';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (syncStatus === 'error' || failedOperations > 0) return 'bg-red-100 text-red-600 border-red-200';
    if (unresolvedConflicts > 0) return 'bg-orange-100 text-orange-600 border-orange-200';
    if (syncStatus === 'syncing') return 'bg-blue-100 text-blue-600 border-blue-200';
    if (pendingOperations > 0) return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    return 'bg-green-100 text-green-600 border-green-200';
  };

  const needsAction = !isOnline || syncStatus === 'error' || failedOperations > 0 || unresolvedConflicts > 0;

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 transition-all duration-300',
      !isVisible && !needsAction && 'translate-y-20 opacity-0',
      needsAction && 'animate-pulse'
    )}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'flex items-center gap-2 px-4 py-2 shadow-lg border-2',
              getStatusColor(),
              needsAction && 'border-current'
            )}
          >
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
            {pendingOperations > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingOperations}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Sync Status</h3>
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                getStatusColor()
              )}>
                {getStatusIcon()}
                {getStatusText()}
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Online</p>
                    <p className="text-xs text-gray-500">Connected to server</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Offline</p>
                    <p className="text-xs text-gray-500">Working offline</p>
                  </div>
                </>
              )}
            </div>

            {/* Sync Progress */}
            {syncStatus === 'syncing' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Sync Progress</span>
                  <span>{queue.syncProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${queue.syncProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Database className="h-4 w-4 text-blue-500 mb-1" />
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {pendingOperations}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Pending</p>
              </div>

              {failedOperations > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-500 mb-1" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {failedOperations}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                </div>
              )}

              {unresolvedConflicts > 0 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mb-1" />
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {unresolvedConflicts}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Conflicts</p>
                </div>
              )}
            </div>

            {/* Last Sync */}
            {queue.lastSyncAt && (
              <div className="text-sm text-gray-500">
                Last sync: {formatDistanceToNow(new Date(queue.lastSyncAt), { addSuffix: true })}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {!isOnline ? (
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                  <WifiOff className="h-4 w-4" />
                  <p>You're currently offline. Changes will sync when you reconnect.</p>
                </div>
              ) : failedOperations > 0 ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={forceSync}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed Operations
                </Button>
              ) : unresolvedConflicts > 0 ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.location.hash = '/settings/sync-conflicts';
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Resolve Conflicts
                </Button>
              ) : pendingOperations > 0 ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={forceSync}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              ) : null}
            </div>

            {/* Offline Mode Info */}
            <div className="text-xs text-gray-500 border-t pt-3">
              <p>All changes are saved locally and will sync automatically when online.</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}