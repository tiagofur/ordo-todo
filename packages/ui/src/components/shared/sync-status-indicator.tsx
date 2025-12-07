'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  WifiOff,
} from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Button } from '../ui/button.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip.js';


type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  isOnline?: boolean;
  pendingChanges?: number;
  failedChanges?: number;
  lastSyncFormatted?: string;
  onForceSync?: () => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  labels?: {
    offline?: string;
    offlineDesc?: string;
    syncing?: string;
    syncingDesc?: string;
    error?: string;
    errorDesc?: string;
    pending?: string;
    pendingDesc?: (count: number) => string;
    synced?: string;
    syncedDesc?: (time: string) => string;
    unknown?: string;
    failedChanges?: (count: number) => string;
  };
}

const DEFAULT_LABELS = {
  offline: 'Offline',
  offlineDesc: 'Changes will sync when online',
  syncing: 'Syncing...',
  syncingDesc: 'Syncing your changes',
  error: 'Sync Error',
  errorDesc: 'Failed to sync. Click to retry',
  pending: 'Pending',
  pendingDesc: (count: number) => `${count} changes pending`,
  synced: 'Synced',
  syncedDesc: (time: string) => `Last sync: ${time}`,
  unknown: 'Unknown',
  failedChanges: (count: number) => `${count} failed changes`,
};

export function SyncStatusIndicator({
  status,
  isOnline = true,
  pendingChanges = 0,
  failedChanges = 0,
  lastSyncFormatted = '',
  onForceSync,
  className,
  showLabel = false,
  size = 'md',
  labels = {},
}: SyncStatusIndicatorProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

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
        label: t.offline,
        description: t.offlineDesc,
      };
    }

    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          label: t.syncing,
          description: t.syncingDesc,
          animate: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: t.error,
          description: t.errorDesc,
        };
      case 'idle':
        if (pendingChanges > 0) {
          return {
            icon: Cloud,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            label: t.pending,
            description: t.pendingDesc(pendingChanges),
          };
        }
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: t.synced,
          description: t.syncedDesc(lastSyncFormatted),
        };
      case 'offline':
        return {
          icon: CloudOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: t.offline,
          description: t.offlineDesc,
        };
      default:
        return {
          icon: Cloud,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          label: t.unknown,
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const handleClick = () => {
    if (status === 'error' || (status === 'idle' && pendingChanges > 0)) {
      onForceSync?.();
    }
  };

  const tooltipText = `${statusInfo.label}${statusInfo.description ? ` - ${statusInfo.description}` : ''}${failedChanges > 0 ? ` (${t.failedChanges(failedChanges)})` : ''}`;

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
            <p className="text-xs text-muted-foreground">
              {statusInfo.description}
            </p>
            {failedChanges > 0 && (
              <p className="text-xs text-red-500">
                {t.failedChanges(failedChanges)}
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
interface SyncStatusDotProps {
  status: SyncStatus;
  isOnline?: boolean;
  pendingChanges?: number;
  className?: string;
}

export function SyncStatusDot({
  status,
  isOnline = true,
  pendingChanges = 0,
  className,
}: SyncStatusDotProps) {
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
interface OfflineBannerProps {
  isOnline: boolean;
  pendingChanges?: number;
  labels?: {
    message?: string;
    pending?: string;
  };
}

export function OfflineBanner({
  isOnline,
  pendingChanges = 0,
  labels = {},
}: OfflineBannerProps) {
  const t = {
    message: "You're offline. Changes will sync when you reconnect.",
    pending: 'pending',
    ...labels,
  };

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
          {t.message}
          {pendingChanges > 0 && (
            <span className="ml-1 font-medium">
              ({pendingChanges} {t.pending})
            </span>
          )}
        </span>
      </div>
    </motion.div>
  );
}
