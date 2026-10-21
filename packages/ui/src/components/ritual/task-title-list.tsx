import type { RitualEveningTaskItem } from './evening-types.js';

interface TaskTitleListProps {
  tasks: RitualEveningTaskItem[];
  title: string;
  empty: string;
}

/**
 * Presentational titled list of task titles (<150 lines). Used for the
 * evening completed section (pending uses EveningMovePicker instead).
 */
export function TaskTitleList({ tasks, title, empty }: TaskTitleListProps) {
  return (
    <section aria-label={title}>
      <p className="text-xs font-medium text-muted-foreground">
        {title}
        {tasks.length > 0 && <span>{` (${tasks.length})`}</span>}
      </p>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {tasks.map((task) => (
            <li key={task.taskId} className="truncate text-xs font-medium">
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
