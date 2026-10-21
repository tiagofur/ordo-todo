import { CalendarDays, Lock, LockOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';

export interface DayPlanCardBlock {
  taskId: string;
  title: string;
  start: string;
  end: string;
  reason: string;
}

export interface DayPlanCardLabels {
  title: string;
  empty: string;
  frozen: string;
  freeze: string;
  unfreeze: string;
}

interface DayPlanCardProps {
  blocks: DayPlanCardBlock[];
  frozenTaskIds: string[];
  labels: DayPlanCardLabels;
  onToggleFreeze: (taskId: string, freeze: boolean) => void;
}

/**
 * Presentational day-plan card (<150 lines). No fetching: the container
 * passes resolved blocks (titles included), labels and callbacks.
 * Hours render raw ("HH:MM – HH:MM"); TZ-safe by construction (strings).
 */
export function DayPlanCard({
  blocks,
  frozenTaskIds,
  labels,
  onToggleFreeze,
}: DayPlanCardProps) {
  const frozen = new Set(frozenTaskIds);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <CardTitle className="text-sm">{labels.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {blocks.length === 0 ? (
          <p className="text-xs text-muted-foreground">{labels.empty}</p>
        ) : (
          <ul className="space-y-2">
            {blocks.map((block) => {
              const isFrozen = frozen.has(block.taskId);
              return (
                <li
                  key={block.taskId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {block.title}
                      </p>
                      {isFrozen && (
                        <Badge variant="secondary">{labels.frozen}</Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      <span>{`${block.start} – ${block.end}`}</span>
                      {' · '}
                      <span>{block.reason}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleFreeze(block.taskId, !isFrozen)}
                  >
                    {isFrozen ? (
                      <LockOpen className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    {isFrozen ? labels.unfreeze : labels.freeze}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
