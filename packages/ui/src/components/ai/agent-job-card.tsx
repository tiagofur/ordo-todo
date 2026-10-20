import { Bot, Pause, Play, Trash2, Zap } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';

export interface AgentJobCardJob {
  id: string;
  name: string;
  schedule: string;
  taskPrompt: string;
  isActive: boolean;
  nextRunAt: string | null;
  lastStatus: string | null;
}

interface AgentJobCardLabels {
  active: string;
  paused: string;
  nextRun: string;
  neverRan: string;
  pause: string;
  resume: string;
  runNow: string;
  del: string;
}

interface AgentJobCardProps {
  job: AgentJobCardJob;
  labels: AgentJobCardLabels;
  runningId?: string | null;
  onToggle: (id: string, isActive: boolean) => void;
  onRunNow: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Presentational agent-job card (<150 lines). No fetching: the container
 * passes the job, labels and callbacks. nextRunAt is shown raw (localized
 * date string); cron → human text is a future extension.
 */
export function AgentJobCard({
  job,
  labels,
  runningId,
  onToggle,
  onRunNow,
  onDelete,
}: AgentJobCardProps) {
  const next = job.nextRunAt
    ? new Date(job.nextRunAt).toLocaleString()
    : labels.neverRan;
  const running = runningId === job.id;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CardTitle className="truncate text-sm">{job.name}</CardTitle>
          </div>
          <Badge variant={job.isActive ? 'default' : 'secondary'}>
            {job.isActive ? labels.active : labels.paused}
          </Badge>
        </div>
        <CardDescription className="truncate">
          {job.schedule} · {job.taskPrompt}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          {labels.nextRun}: {next}
          {job.lastStatus && job.lastStatus !== 'ok'
            ? ` · ${job.lastStatus}`
            : ''}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggle(job.id, !job.isActive)}
          >
            {job.isActive ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {job.isActive ? labels.pause : labels.resume}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={running}
            onClick={() => onRunNow(job.id)}
          >
            <Zap className="h-3.5 w-3.5" />
            {labels.runNow}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(job.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {labels.del}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
