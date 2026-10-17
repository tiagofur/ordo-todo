/**
 * RFC 5545 compliant iCalendar (.ics) generator for tasks
 */

export interface IcsTaskInput {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | string | null;
  scheduledDate?: Date | string | null;
  scheduledTime?: string | null;
  scheduledEndTime?: string | null;
  estimatedMinutes?: number | null;
  projectName?: string | null;
}

export function generateIcsFeed(
  tasks: IcsTaskInput[],
  calendarName = 'Ordo Tasks',
): string {
  const formatUtc = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const formatDateOnly = (date: Date) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  };

  const escapeIcs = (str: string) => {
    return (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  };

  const nowStr = formatUtc(new Date());

  const priorityMap: Record<string, number> = {
    URGENT: 1,
    HIGH: 3,
    MEDIUM: 5,
    LOW: 9,
  };

  const eventBlocks = tasks
    .map((task) => {
      const title = escapeIcs(task.title);
      const descParts: string[] = [];
      if (task.projectName) {
        descParts.push(`Project: ${task.projectName}`);
      }
      if (task.description) {
        descParts.push(task.description);
      }
      const desc = escapeIcs(descParts.join('\n\n'));
      const isCompleted = task.status === 'COMPLETED';

      let dtStart = '';
      let dtEnd = '';

      if (task.scheduledDate && task.scheduledTime) {
        const start = new Date(task.scheduledDate);
        const [h, m] = task.scheduledTime.split(':').map(Number);
        start.setUTCHours(h || 0, m || 0, 0, 0);

        let end = new Date(start);
        if (task.scheduledEndTime) {
          const [eh, em] = task.scheduledEndTime.split(':').map(Number);
          end.setUTCHours(eh || 0, em || 0, 0, 0);
        } else {
          const duration = task.estimatedMinutes || 60;
          end = new Date(start.getTime() + duration * 60 * 1000);
        }

        dtStart = `DTSTART:${formatUtc(start)}`;
        dtEnd = `DTEND:${formatUtc(end)}`;
      } else if (task.dueDate) {
        const due = new Date(task.dueDate);
        const nextDay = new Date(due);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        dtStart = `DTSTART;VALUE=DATE:${formatDateOnly(due)}`;
        dtEnd = `DTEND;VALUE=DATE:${formatDateOnly(nextDay)}`;
      } else {
        return '';
      }

      const priority = priorityMap[task.priority] || 5;

      return [
        'BEGIN:VEVENT',
        `UID:${task.id}@ordo-todo.app`,
        `DTSTAMP:${nowStr}`,
        dtStart,
        dtEnd,
        `SUMMARY:${title}`,
        desc ? `DESCRIPTION:${desc}` : null,
        `STATUS:${isCompleted ? 'COMPLETED' : 'CONFIRMED'}`,
        `PRIORITY:${priority}`,
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\r\n');
    })
    .filter(Boolean);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ordo Todo//Task Calendar Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
    'X-WR-TIMEZONE:UTC',
    ...eventBlocks,
    'END:VCALENDAR',
  ].join('\r\n');
}
