import { EveningMovePicker } from './evening-move-picker.js';
import type {
  EveningRitualCardLabels,
  RitualEveningMove,
  RitualEveningTaskItem,
} from './evening-types.js';

interface PendingMovesListProps {
  pending: RitualEveningTaskItem[];
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  labels: EveningRitualCardLabels;
  moveOf: (taskId: string) => RitualEveningMove;
  onChange: (taskId: string, patch: Partial<RitualEveningMove>) => void;
}

/**
 * Pending section of the evening card: interactive pickers while PENDING,
 * read-only title list after close (DONE/SKIPPED).
 */
export function PendingMovesList({
  pending,
  status,
  labels,
  moveOf,
  onChange,
}: PendingMovesListProps) {
  if (pending.length === 0) {
    return <p className="text-xs text-muted-foreground">{labels.pendingEmpty}</p>;
  }
  if (status !== 'PENDING') {
    return (
      <ul className="mt-1 space-y-1">
        {pending.map((task) => (
          <li key={task.taskId} className="truncate text-xs font-medium">
            {task.title}
          </li>
        ))}
      </ul>
    );
  }
  return (
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
          onChange={onChange}
        />
      ))}
    </ul>
  );
}
