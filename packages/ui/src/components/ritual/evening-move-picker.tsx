import { Button } from '../ui/button.js';
import type {
  RitualEveningDestination,
  RitualEveningMove,
  RitualEveningReason,
} from './evening-types.js';

export interface EveningMovePickerLabels {
  destinationTomorrow: string;
  destinationDate: string;
  destinationArchived: string;
  reasonOverran: string;
  reasonUrgent: string;
  reasonNoEnergy: string;
  reasonOther: string;
  datePlaceholder: string;
}

interface EveningMovePickerProps {
  taskId: string;
  title: string;
  move: RitualEveningMove;
  labels: EveningMovePickerLabels;
  onChange: (taskId: string, patch: Partial<RitualEveningMove>) => void;
}

/**
 * Presentational one-touch destination + reason picker (<150 lines) for
 * a single pending task. The `date` destination shows a native date
 * input whose YYYY-MM-DD value travels raw (TZ-safe string).
 */
export function EveningMovePicker({
  taskId,
  title,
  move,
  labels,
  onChange,
}: EveningMovePickerProps) {
  const destinations: { value: RitualEveningDestination; label: string }[] = [
    { value: 'tomorrow', label: labels.destinationTomorrow },
    { value: 'date', label: labels.destinationDate },
    { value: 'archived', label: labels.destinationArchived },
  ];
  const reasons: { value: RitualEveningReason; label: string }[] = [
    { value: 'overran', label: labels.reasonOverran },
    { value: 'urgent', label: labels.reasonUrgent },
    { value: 'no-energy', label: labels.reasonNoEnergy },
    { value: 'other', label: labels.reasonOther },
  ];

  return (
    <li className="rounded-lg border border-border/60 px-3 py-2">
      <p className="truncate text-sm font-medium">{title}</p>
      <div
        className="mt-1 flex flex-wrap gap-1"
        role="group"
        aria-label={`${title} — ${labels.destinationTomorrow} / ${labels.destinationDate} / ${labels.destinationArchived}`}
      >
        {destinations.map((d) => (
          <Button
            key={d.value}
            size="sm"
            variant={move.destination === d.value ? 'default' : 'outline'}
            onClick={() => onChange(taskId, { destination: d.value })}
          >
            {d.label}
          </Button>
        ))}
        {move.destination === 'date' && (
          <input
            type="date"
            aria-label={labels.datePlaceholder}
            placeholder={labels.datePlaceholder}
            value={move.date ?? ''}
            onChange={(e) => onChange(taskId, { date: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          />
        )}
      </div>
      <div
        className="mt-1 flex flex-wrap gap-1"
        role="group"
        aria-label={`${title} — ${labels.reasonOverran} / ${labels.reasonUrgent} / ${labels.reasonNoEnergy} / ${labels.reasonOther}`}
      >
        {reasons.map((r) => (
          <Button
            key={r.value}
            size="sm"
            variant={move.reason === r.value ? 'default' : 'outline'}
            onClick={() => onChange(taskId, { reason: r.value })}
          >
            {r.label}
          </Button>
        ))}
      </div>
    </li>
  );
}
