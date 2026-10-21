import { useState } from 'react';
import { Clock, Check, Wand2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Button } from '../ui/button.js';

export interface TimeboxCardTask {
  taskId: string;
  title: string;
  start: string;
  end: string;
}

export interface TimeboxCardBlock {
  taskId: string;
  start: string;
  end: string;
}

export interface TimeboxCardLabels {
  title: string;
  empty: string;
  startLabel: string;
  endLabel: string;
  save: string;
  acceptProposal: string;
  saved: string;
  saveError: string;
}

interface TimeboxCardProps {
  top3: TimeboxCardTask[];
  labels: TimeboxCardLabels;
  onSave: (blocks: TimeboxCardBlock[]) => void;
  onAcceptProposal: () => void;
}

/**
 * Presentational time-boxing card (<150 lines). Edits the top-3 blocks
 * as HH:mm strings (native time inputs; TZ-safe by construction) or
 * accepts the plan proposal with one touch. No fetching.
 */
export function TimeboxCard({ top3, labels, onSave, onAcceptProposal }: TimeboxCardProps) {
  const [times, setTimes] = useState<Record<string, { start: string; end: string }>>({});

  const timeOf = (task: TimeboxCardTask) =>
    times[task.taskId] ?? { start: task.start, end: task.end };

  const setTime = (taskId: string, patch: { start?: string; end?: string }) =>
    setTimes((prev) => {
      const base = prev[taskId] ?? {
        start: top3.find((t) => t.taskId === taskId)?.start ?? '',
        end: top3.find((t) => t.taskId === taskId)?.end ?? '',
      };
      return { ...prev, [taskId]: { ...base, ...patch } };
    });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <CardTitle className="text-sm">{labels.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {top3.length === 0 ? (
          <p className="text-xs text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="space-y-2">
            <ul className="space-y-2">
              {top3.map((task) => {
                const time = timeOf(task);
                return (
                  <li
                    key={task.taskId}
                    className="rounded-lg border border-border/60 px-3 py-2"
                  >
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        {labels.startLabel}
                        <input
                          type="time"
                          aria-label={`${labels.startLabel} ${task.title}`}
                          value={time.start}
                          onChange={(e) => setTime(task.taskId, { start: e.target.value })}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        />
                      </label>
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        {labels.endLabel}
                        <input
                          type="time"
                          aria-label={`${labels.endLabel} ${task.title}`}
                          value={time.end}
                          onChange={(e) => setTime(task.taskId, { end: e.target.value })}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  onSave(top3.map((t) => ({ taskId: t.taskId, ...timeOf(t) })))
                }
              >
                <Check className="h-3.5 w-3.5" />
                {labels.save}
              </Button>
              <Button size="sm" variant="outline" onClick={onAcceptProposal}>
                <Wand2 className="h-3.5 w-3.5" />
                {labels.acceptProposal}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
