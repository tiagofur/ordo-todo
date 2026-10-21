import { Flame, Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Badge } from '../ui/badge.js';

export interface StreakCardLabels {
  title: string;
  days: string;
  best: string;
  nextMilestone: string;
  milestoneReached: string;
  empty: string;
}

interface StreakCardProps {
  current: number;
  longest: number;
  milestones: number[];
  labels: StreakCardLabels;
}

/**
 * Presentational streak card (<150 lines). Read-only: current streak,
 * best streak, next milestone + reached-milestone celebration.
 */
export function StreakCard({ current, longest, milestones, labels }: StreakCardProps) {
  const reached = [...milestones].filter((m) => current >= m).pop();
  const next = [...milestones].sort((a, b) => a - b).find((m) => m > current);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 shrink-0 text-muted-foreground" />
          <CardTitle className="text-sm">{labels.title}</CardTitle>
          {reached !== undefined && current > 0 && (
            <Badge variant="secondary">
              <Trophy className="mr-1 h-3 w-3" />
              {labels.milestoneReached}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {current === 0 && longest === 0 ? (
          <p className="text-xs text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold">{current}</p>
              <p className="text-xs text-muted-foreground">{labels.days}</p>
            </div>
            <div className="pb-0.5">
              <p className="text-xs text-muted-foreground">{labels.best}</p>
              <p className="text-sm font-medium">{longest}</p>
              {next !== undefined && (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {labels.nextMilestone}
                  </p>
                  <p className="text-sm font-medium">{next}</p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
