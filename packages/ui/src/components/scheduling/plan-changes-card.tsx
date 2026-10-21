import { ArrowRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';

export type PlanChangeType = 'moved' | 'added' | 'removed' | 'resized';

export interface PlanChangesCardChange {
  taskId: string;
  title: string;
  type: PlanChangeType;
  from?: { start: string; end: string };
  to?: { start: string; end: string };
  reason: string;
}

export interface PlanChangesCardLabels {
  title: string;
  empty: string;
  accept: string;
  reject: string;
  moved: string;
  added: string;
  removed: string;
  resized: string;
}

interface PlanChangesCardProps {
  changes: PlanChangesCardChange[];
  labels: PlanChangesCardLabels;
  onAccept: () => void;
  onReject: () => void;
}

const fmtSlot = (slot?: { start: string; end: string }): string =>
  slot ? `${slot.start} – ${slot.end}` : '';

/**
 * Presentational plan-diff card (<150 lines). No fetching: the container
 * passes resolved changes (titles included), labels and callbacks.
 * Accept = apply proposal, reject = dismiss proposal.
 */
export function PlanChangesCard({
  changes,
  labels,
  onAccept,
  onReject,
}: PlanChangesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <CardTitle className="text-sm">{labels.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {changes.length === 0 ? (
          <p className="text-xs text-muted-foreground">{labels.empty}</p>
        ) : (
          <>
            <ul className="space-y-2">
              {changes.map((change) => (
                <li
                  key={change.taskId}
                  className="rounded-lg border border-border/60 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {change.title}
                    </p>
                    <Badge variant="outline">{labels[change.type]}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    <span>
                      {[fmtSlot(change.from), fmtSlot(change.to)]
                        .filter(Boolean)
                        .join(' → ')}
                    </span>
                    {change.reason && (
                      <>
                        {' · '}
                        <span>{change.reason}</span>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={onAccept}>
                <Check className="h-3.5 w-3.5" />
                {labels.accept}
              </Button>
              <Button size="sm" variant="outline" onClick={onReject}>
                <X className="h-3.5 w-3.5" />
                {labels.reject}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
