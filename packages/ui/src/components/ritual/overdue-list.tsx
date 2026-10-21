import type { MorningRitualOverdue } from './morning-ritual-card.js';

interface OverdueListProps {
  overdue: MorningRitualOverdue[];
  title: string;
  empty: string;
}

/**
 * Presentational overdue-tasks list (<150 lines). Date keys render raw
 * (YYYY-MM-DD strings); TZ-safe by construction.
 */
export function OverdueList({ overdue, title, empty }: OverdueListProps) {
  return (
    <section aria-label={title}>
      <p className="text-xs font-medium text-muted-foreground">
        {title}
        {overdue.length > 0 && <span>{` (${overdue.length})`}</span>}
      </p>
      {overdue.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {overdue.map((task) => (
            <li
              key={task.taskId}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="truncate font-medium">{task.title}</span>
              <span className="shrink-0 text-muted-foreground">
                {task.dueDateKey}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
