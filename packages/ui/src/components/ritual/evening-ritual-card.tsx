import { useState } from 'react';
import { MoonStar, Check, SkipForward } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { EveningMovePicker } from './evening-move-picker.js';
import { TaskTitleList } from './task-title-list.js';
import type {
  EveningRitualCardLabels,
  RitualEveningMove,
  RitualEveningTaskItem,
} from './evening-types.js';

export type {
  EveningRitualCardLabels,
  RitualEveningDestination,
  RitualEveningMove,
  RitualEveningReason,
  RitualEveningTaskItem,
} from './evening-types.js';

interface EveningRitualCardProps {
  summary: string | null;
  completed: RitualEveningTaskItem[];
  pending: RitualEveningTaskItem[];
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  shutdownComplete: boolean;
  shutdownSuggestion?: string;
  labels: EveningRitualCardLabels;
  onComplete: (moves: RitualEveningMove[]) => void;
  onSkip: () => void;
}

/**
 * Presentational evening-ritual card (<150 lines). One-touch destination
 * + reason per pending task (defaults: tomorrow + overran); the container
 * resolves titles and posts the moves.
 */
export function EveningRitualCard({
  summary,
  completed,
  pending,
  status,
  shutdownComplete,
  shutdownSuggestion,
  labels,
  onComplete,
  onSkip,
}: EveningRitualCardProps) {
  const [moves, setMoves] = useState<Record<string, RitualEveningMove>>({});

  const moveOf = (taskId: string): RitualEveningMove =>
    moves[taskId] ?? { taskId, destination: 'tomorrow', reason: 'overran' };

  const setMove = (taskId: string, patch: Partial<RitualEveningMove>) =>
    setMoves((prev) => ({ ...prev, [taskId]: { ...moveOf(taskId), ...patch } }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MoonStar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <CardTitle className="text-sm">{labels.title}</CardTitle>
          {status !== 'PENDING' && (
            <Badge variant="secondary">
              {status === 'DONE' ? labels.completed : labels.skipped}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <section aria-label={labels.summaryTitle}>
          <p className="text-xs font-medium text-muted-foreground">{labels.summaryTitle}</p>
          <p className="text-xs text-muted-foreground">{summary ?? labels.summaryEmpty}</p>
        </section>
        <TaskTitleList tasks={completed} title={labels.completedTitle} empty={labels.completedEmpty} />
        <section aria-label={labels.pendingTitle}>
          <p className="text-xs font-medium text-muted-foreground">
            {labels.pendingTitle}
            {pending.length > 0 && <span>{` (${pending.length})`}</span>}
          </p>
          {pending.length === 0 ? (
            <p className="text-xs text-muted-foreground">{labels.pendingEmpty}</p>
          ) : (
            status === 'PENDING' && (
              <ul className="mt-1 space-y-2">
                {pending.map((task) => (
                  <EveningMovePicker
                    key={task.taskId}
                    taskId={task.taskId}
                    title={task.title}
                    move={moveOf(task.taskId)}
                    labels={{
                      destinationTomorrow: labels.destinationTomorrow,
                      destinationDate: labels.destinationDate,
                      destinationArchived: labels.destinationArchived,
                      reasonOverran: labels.reasonOverran,
                      reasonUrgent: labels.reasonUrgent,
                      reasonNoEnergy: labels.reasonNoEnergy,
                      reasonOther: labels.reasonOther,
                      datePlaceholder: labels.datePlaceholder,
                    }}
                    onChange={setMove}
                  />
                ))}
              </ul>
            )
          )}
        </section>
        {shutdownComplete && (
          <section aria-label={labels.shutdown}>
            <p className="text-xs font-medium">{labels.shutdown}</p>
            {shutdownSuggestion && (
              <p className="text-xs text-muted-foreground">{shutdownSuggestion}</p>
            )}
          </section>
        )}
        {status === 'PENDING' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onComplete(pending.map((t) => moveOf(t.taskId)))}
            >
              <Check className="h-3.5 w-3.5" />
              {labels.complete}
            </Button>
            <Button size="sm" variant="outline" onClick={onSkip}>
              <SkipForward className="h-3.5 w-3.5" />
              {labels.skip}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
