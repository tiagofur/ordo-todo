import { CalendarDays, CheckCircle2, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

export type CalendarAccountState = 'ok' | 'error' | 're-auth-required' | 'never-synced';

export interface CalendarAccount {
  provider: string;
  status: CalendarAccountState;
  email: string | null;
  lastSyncAt: string | Date | null;
  conflicts: unknown[];
}

interface CalendarConnectionCardProps {
  account: CalendarAccount | null;
  provider: string;
  providerName: string;
  labels: {
    connect: string;
    disconnect: string;
    reconnect: string;
    connectedAs: string;
    neverSynced: string;
    conflicts: (count: number) => string;
  };
  onConnect: () => void;
  onDisconnect: () => void;
  busy?: boolean;
}

const STATUS_META: Record<
  CalendarAccountState,
  { icon: typeof CheckCircle2; color: string }
> = {
  ok: { icon: CheckCircle2, color: '#10B981' },
  error: { icon: AlertTriangle, color: '#F59E0B' },
  're-auth-required': { icon: RefreshCw, color: '#F97316' },
  'never-synced': { icon: XCircle, color: '#6B7280' },
};

/**
 * CalendarConnectionCard - connect/disconnect + sync status per provider.
 *
 * Presentational only: all data and callbacks come via props.
 */
export function CalendarConnectionCard({
  account,
  providerName,
  labels,
  onConnect,
  onDisconnect,
  busy = false,
}: CalendarConnectionCardProps) {
  const connected = account !== null && account.status !== 'never-synced';
  const meta = account ? STATUS_META[account.status] : null;
  const StatusIcon = meta?.icon ?? CalendarDays;
  const conflictCount = account?.conflicts.length ?? 0;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${meta?.color ?? '#6B7280'}20` }}
      >
        <StatusIcon
          className="h-5 w-5"
          style={{ color: meta?.color ?? '#6B7280' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">{providerName}</h4>
        {!connected && (
          <p className="text-sm text-muted-foreground">{labels.neverSynced}</p>
        )}
        {connected && account?.email && (
          <p className="text-sm text-muted-foreground">
            {labels.connectedAs} {account.email}
          </p>
        )}
        {conflictCount > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
            {labels.conflicts(conflictCount)}
          </p>
        )}
      </div>
      {!connected ? (
        <button
          onClick={onConnect}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {labels.connect}
        </button>
      ) : account?.status === 're-auth-required' ? (
        <button
          onClick={onConnect}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {labels.reconnect}
        </button>
      ) : (
        <button
          onClick={onDisconnect}
          disabled={busy}
          className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted disabled:opacity-50 shrink-0"
        >
          {labels.disconnect}
        </button>
      )}
    </div>
  );
}
