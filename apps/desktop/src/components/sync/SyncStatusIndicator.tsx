/**
 * Sync Status Indicator Component
 * 
 * Shows the current sync status in the UI with visual feedback
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  WifiOff
} from 'lucide-react';
import { useSyncStore, useLastSyncFormatted } from '../../stores/sync-store';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SyncStatusIndicator({
  className,
  showLabel = false,
  size = 'md',
}: SyncStatusIndicatorProps) {
  const { t } = useTranslation();
  const { status, pendingChanges, failedChanges, isOnline, initialize, forceSync } = useSyncStore();
  const lastSyncFormatted = useLastSyncFormatted();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconSize = sizeClasses[size];

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        label: t('sync.offline', 'Offline'),
        description: t('sync.offlineDesc', 'Changes will sync when online'),
      };
    }

    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          label: t('sync.syncing', 'Syncing...'),
          description: t('sync.syncingDesc', 'Syncing your changes'),
          animate: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: t('sync.error', 'Sync Error'),
          description: t('sync.errorDesc', 'Failed to sync. Click to retry'),
        };
      case 'idle':
        if (pendingChanges > 0) {
          return {
            icon: Cloud,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            label: t('sync.pending', 'Pending'),
            description: t('sync.pendingDesc', '{{count}} changes pending', { count: pendingChanges }),
          };
        }
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: t('sync.synced', 'Synced'),
          description: t('sync.syncedDesc', 'Last sync: {{time}}', { time: lastSyncFormatted }),
        };
      case 'offline':
        return {
          icon: CloudOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: t('sync.offline', 'Offline'),
          description: t('sync.offlineDesc', 'Changes will sync when online'),
        };
      default:
        return {
          icon: Cloud,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          label: t('sync.unknown', 'Unknown'),
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const handleClick = () => {
    if (status === 'error' || (status === 'idle' && pendingChanges > 0)) {
      forceSync();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex items-center gap-2 px-2',
              statusInfo.bgColor,
              className
            )}
            onClick={handleClick}
            disabled={status === 'syncing' || !isOnline}
          >
            <motion.div
              animate={statusInfo.animate ? { rotate: 360 } : {}}
              transition={
                statusInfo.animate
                  ? { duration: 1, repeat: Infinity, ease: 'linear' }
                  : {}
              }
            >
              <Icon className={cn(iconSize, statusInfo.color)} />
            </motion.div>
            
            {showLabel && (
              <span className={cn('text-sm', statusInfo.color)}>
                {statusInfo.label}
              </span>
            )}
            
            <AnimatePresence>
              {pendingChanges > 0 && status !== 'syncing' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white"
                >
                  {pendingChanges > 99 ? '99+' : pendingChanges}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{statusInfo.label}</p>
            <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
            {failedChanges > 0 && (
              <p className="text-xs text-red-500">
                {t('sync.failedChanges', '{{count}} failed changes', { count: failedChanges })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact sync status for use in tight spaces (e.g., status bar)
 */
export function SyncStatusDot({ className }: { className?: string }) {
  const { status, pendingChanges, isOnline } = useSyncStore();

  const getColor = () => {
    if (!isOnline) return 'bg-yellow-500';
    switch (status) {
      case 'syncing':
        return 'bg-blue-500 animate-pulse';
      case 'error':
        return 'bg-red-500';
      case 'idle':
        return pendingChanges > 0 ? 'bg-orange-500' : 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', getColor(), className)}
    />
  );
}

/**
 * Sync status banner for offline mode
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline, pendingChanges } = useSyncStore();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-yellow-500/10 border-b border-yellow-500/20"
    >
      <div className="flex items-center justify-center gap-2 py-2 px-4">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <span className="text-sm text-yellow-600">
          {t('sync.offlineBanner', "You're offline. Changes will sync when you reconnect.")}
          {pendingChanges > 0 && (
            <span className="ml-1 font-medium">
              ({pendingChanges} {t('sync.pendingChanges', 'pending')})
            </span>
          )}
        </span>
      </div>
    </motion.div>
  );
}
