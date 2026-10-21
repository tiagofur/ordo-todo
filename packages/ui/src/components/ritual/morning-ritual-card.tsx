import { Sunrise, Check, SkipForward } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Button } from '../ui/button.js';
import { Checkbox } from '../ui/checkbox.js';
import { Badge } from '../ui/badge.js';
import { OverdueList } from './overdue-list.js';
import { usePreselectedTop3 } from './use-preselected-top3.js';

export interface MorningRitualPlanBlock {
  taskId: string;
  title: string;
  start: string;
  end: string;
  reason: string;
}

export interface MorningRitualOverdue {
  taskId: string;
  title: string;
  dueDateKey: string;
}

export interface MorningRitualCardLabels {
  title: string;
  planTitle: string;
  planEmpty: string;
  overdueTitle: string;
  overdueEmpty: string;
  top3Title: string;
  top3Hint: string;
  complete: string;
  skip: string;
  completed: string;
  skipped: string;
}

interface MorningRitualCardProps {
  planBlocks: MorningRitualPlanBlock[];
  overdue: MorningRitualOverdue[];
  suggestedTop3: string[];
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  labels: MorningRitualCardLabels;
  onComplete: (top3: string[]) => void;
  onSkip: () => void;
}

/**
 * Presentational morning-ritual card (<150 lines). No fetching: the
 * container passes the resolved plan (titles included), overdue tasks,
 * the suggested top-3 and callbacks. Hours/date-keys render raw
 * (strings); TZ-safe by construction.
 */
export function MorningRitualCard({
  planBlocks,
  overdue,
  suggestedTop3,
  status,
  labels,
  onComplete,
  onSkip,
}: MorningRitualCardProps) {
  const [selected, toggle] = usePreselectedTop3(suggestedTop3, planBlocks);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sunrise className="h-4 w-4 shrink-0 text-muted-foreground" />
          <CardTitle className="text-sm">{labels.title}</CardTitle>
          {status !== 'PENDING' && (
            <Badge variant="secondary">
              {status === 'DONE' ? labels.completed : labels.skipped}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <section aria-label={labels.planTitle}>
          <p className="text-xs font-medium text-muted-foreground">{labels.planTitle}</p>
          {planBlocks.length === 0 ? (
            <p className="text-xs text-muted-foreground">{labels.planEmpty}</p>
          ) : (
            <ul className="mt-1 space-y-2">
              {planBlocks.map((block) => (
                <li
                  key={block.taskId}
                  className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2"
                >
                  <Checkbox
                    id={`top3-${block.taskId}`}
                    aria-label={block.title}
                    checked={selected.includes(block.taskId)}
                    onCheckedChange={() => toggle(block.taskId)}
                    disabled={status !== 'PENDING'}
                  />
                  <div className="min-w-0">
                    <label htmlFor={`top3-${block.taskId}`} className="truncate text-sm font-medium">
                      {block.title}
                    </label>
                    <p className="truncate text-xs text-muted-foreground">
                      <span>{`${block.start} – ${block.end}`}</span>
                      {' · '}
                      <span>{block.reason}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <OverdueList overdue={overdue} title={labels.overdueTitle} empty={labels.overdueEmpty} />
        {status === 'PENDING' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {`${labels.top3Title} · ${labels.top3Hint} (${selected.length}/3)`}
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onComplete(selected)} disabled={selected.length === 0}>
                <Check className="h-3.5 w-3.5" />
                {labels.complete}
              </Button>
              <Button size="sm" variant="outline" onClick={onSkip}>
                <SkipForward className="h-3.5 w-3.5" />
                {labels.skip}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
