/**
 * Deterministic trilingual NL → cron parser for agent jobs (ODD 004 S5).
 *
 * MVP scope: DAILY, WEEKLY (1-2 days), WEEKDAYS. Monthly/yearly and complex
 * recurrences are out of scope (return null with the controller guiding the
 * user with examples).
 *
 * Style follows TaskNlParserService: Unicode-aware lookarounds, never `\b`
 * (which fails after accented vowels even with the `u` flag).
 */

export interface NlSchedule {
  /** 5-field cron: `min hour * * dow` (dow 0 = Sunday). */
  cron: string;
  /** Human summary, always Spanish in MVP. */
  summary: string;
}

const BOUND = String.raw`(?<![\p{L}\p{N}_])`;
const BOUND_END = String.raw`(?![\p{L}\p{N}_])`;

interface DayName {
  re: RegExp;
  dow: number;
  es: string;
}

const DAYS: DayName[] = [
  { re: /lunes|monday|segunda/i, dow: 1, es: 'lunes' },
  { re: /martes|tuesday|ter[çc]a/i, dow: 2, es: 'martes' },
  { re: /mi[ée]rcoles|wednesday|quarta/i, dow: 3, es: 'miércoles' },
  { re: /jueves|thursday|quinta/i, dow: 4, es: 'jueves' },
  { re: /viernes|friday|sexta/i, dow: 5, es: 'viernes' },
  { re: /s[áa]bado|saturday/i, dow: 6, es: 'sábado' },
  { re: /domingo|sunday/i, dow: 0, es: 'domingo' },
];

const DAILY_RE = new RegExp(
  `${BOUND}(cada d[íi]a|todos los d[íi]as|daily|every day|todo dia|todos os dias)${BOUND_END}`,
  'iu',
);
const WEEKDAYS_RE = new RegExp(
  `${BOUND}(d[íi]as laborables|d[ií]a laborable|weekdays?|dias [úu]teis|dias uteis)${BOUND_END}`,
  'iu',
);

const TIME_RE = new RegExp(
  `${BOUND}(?:a las|at|[àa]s)?\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(h|am|pm|de la ma[ñn]ana|de la tarde|de la noche|da manh[ãa]|da tarde|da noite)?${BOUND_END}`,
  'iu',
);

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function parseTime(input: string): { hour: number; minute: number } | null {
  const match = TIME_RE.exec(input);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = (match[3] ?? '').toLowerCase();
  if (minute > 59) return null;
  if (
    meridiem === 'pm' ||
    meridiem === 'de la tarde' ||
    meridiem === 'da tarde' ||
    meridiem === 'de la noche' ||
    meridiem === 'da noite'
  ) {
    if (hour < 12) hour += 12;
  } else if (
    meridiem === 'am' ||
    meridiem === 'de la mañana' ||
    meridiem === 'de la manana' ||
    meridiem === 'da manhã' ||
    meridiem === 'da manha'
  ) {
    if (hour === 12) hour = 0;
  } else if (hour >= 1 && hour <= 6) {
    // Bare 1-6 without meridiem reads as afternoon in ES/PT ("a las 5" = 5pm).
    hour += 12;
  }
  if (hour > 23) return null;
  return { hour, minute };
}

function findDays(input: string): DayName[] {
  const found: DayName[] = [];
  for (const day of DAYS) {
    const re = new RegExp(`${BOUND}(?:${day.re.source})${BOUND_END}`, 'iu');
    if (re.test(input)) found.push(day);
  }
  return found.sort((a, b) => a.dow - b.dow);
}

/**
 * Parses a natural-language schedule into cron + Spanish summary.
 * Returns null when the input is out of MVP scope.
 */
export function parseScheduleNl(input: string): NlSchedule | null {
  const text = input.trim();
  if (!text) return null;

  const time = parseTime(text);
  if (!time) return null;

  const { hour, minute } = time;
  const hhmm = `${pad(hour)}:${pad(minute)}`;

  if (WEEKDAYS_RE.test(text)) {
    return {
      cron: `${minute} ${hour} * * 1-5`,
      summary: `Cada día laborable a las ${hhmm}`,
    };
  }

  if (DAILY_RE.test(text)) {
    return {
      cron: `${minute} ${hour} * * *`,
      summary: `Cada día a las ${hhmm}`,
    };
  }

  const days = findDays(text);
  if (days.length >= 1 && days.length <= 2) {
    const dow = days.map((d) => d.dow).join(',');
    const names = days.map((d) => d.es).join(', ');
    return {
      cron: `${minute} ${hour} * * ${dow}`,
      summary: `Cada ${names} a las ${hhmm}`,
    };
  }

  return null;
}
