import { Injectable } from '@nestjs/common';

export type NlPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type NlRecurrence = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface NlParseResult {
  title: string;
  dueAt?: Date;
  recurrence?: NlRecurrence;
  priority: NlPriority;
  projectHint?: string;
  confidenceScore: number;
}

const PRIORITY_TAGS: Record<string, NlPriority> = {
  baja: 'LOW',
  baixa: 'LOW',
  low: 'LOW',
  media: 'MEDIUM',
  média: 'MEDIUM',
  medium: 'MEDIUM',
  alta: 'HIGH',
  high: 'HIGH',
  urgente: 'URGENT',
  urgent: 'URGENT',
};

const URGENT_WORDS = ['urgente', 'urgent', 'asap', 'ya mismo'];
const HIGH_WORDS = ['importante', 'important', 'importante!'];
const LOW_WORDS = ['cuando puedas', 'opcional', 'quando puder'];

const WEEKDAYS: Record<string, number> = {
  // Sunday = 0 (JS Date.getDay)
  domingo: 0,
  sunday: 0,
  lunes: 1,
  monday: 1,
  'segunda-feira': 1,
  segunda: 1,
  martes: 2,
  tuesday: 2,
  'terça-feira': 2,
  terca: 2,
  miércoles: 3,
  miercoles: 3,
  wednesday: 3,
  'quarta-feira': 3,
  quarta: 3,
  jueves: 4,
  thursday: 4,
  'quinta-feira': 4,
  quinta: 4,
  viernes: 5,
  friday: 5,
  'sexta-feira': 5,
  sexta: 5,
  sábado: 6,
  sabado: 6,
  saturday: 6,
};

const RECURRENCE_PATTERNS: { re: RegExp; value: NlRecurrence }[] = [
  {
    re: /(?<![\p{L}\p{N}_])(todos los d[ií]as|every day|daily|todo dia|todos os dias)(?![\p{L}\p{N}_])/iu,
    value: 'DAILY',
  },
  {
    re: /(?<![\p{L}\p{N}_])(cada [\p{L}]+( y [\p{L}]+)?|every (weekday|week|monday|tuesday|wednesday|thursday|friday)|toda (segunda|ter[çc]a|quarta|quinta|sexta)|weekly)(?![\p{L}\p{N}_])/iu,
    value: 'WEEKLY',
  },
  {
    re: /(?<![\p{L}\p{N}_])(monthly|cada mes|todo mes)(?![\p{L}\p{N}_])/iu,
    value: 'MONTHLY',
  },
  {
    re: /(?<![\p{L}\p{N}_])(yearly|anual|cada a[ñn]o)(?![\p{L}\p{N}_])/iu,
    value: 'YEARLY',
  },
];

// Unicode-safe word-boundary matcher. Plain \b fails after accented
// chars (ã, ç, ñ…) even with the u flag on current Node, so all
// NL patterns use explicit lookarounds instead.
function uwb(pattern: string): RegExp {
  return new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`,
    'iu',
  );
}

/**
 * Deterministic multilingual (ES/EN/PT) task parser (S1).
 *
 * Extracts `#project`, `@priority`, dates (`mañana 15h`, `friday 9am`,
 * `25/10`, `on the 1st`), and recurrence from free text — no LLM
 * needed, fully unit-testable. Used as the fast first pass; the AI
 * service enriches low-confidence results via Gemini.
 */
@Injectable()
export class TaskNlParserService {
  parse(input: string, now: Date = new Date()): NlParseResult {
    let rest = input.trim();
    let score = 0.5;
    const matched: string[] = [];

    // #project
    let projectHint: string | undefined;
    const projectMatch = rest.match(/#([\p{L}\p{N}_-]+)/u);
    if (projectMatch) {
      projectHint = projectMatch[1];
      rest = rest.replace(projectMatch[0], ' ');
      score += 0.1;
      matched.push('project');
    }

    // @priority
    let priority: NlPriority = 'MEDIUM';
    const tagMatch = rest.match(/@([\p{L}]+)/u);
    if (tagMatch && PRIORITY_TAGS[tagMatch[1].toLowerCase()]) {
      priority = PRIORITY_TAGS[tagMatch[1].toLowerCase()];
      rest = rest.replace(tagMatch[0], ' ');
      score += 0.1;
      matched.push('priority-tag');
    } else {
      const stripWord = (words: string[]): boolean => {
        for (const word of words) {
          // Escape regex chars in the literal word, then Unicode-safe bounds.
          const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = uwb(escaped);
          if (re.test(rest)) {
            rest = rest.replace(re, ' ');
            return true;
          }
        }
        return false;
      };
      if (stripWord(URGENT_WORDS)) {
        priority = 'URGENT';
        score += 0.1;
        matched.push('priority-word');
      } else if (stripWord(HIGH_WORDS)) {
        priority = 'HIGH';
        score += 0.1;
        matched.push('priority-word');
      } else if (stripWord(LOW_WORDS)) {
        priority = 'LOW';
        score += 0.1;
        matched.push('priority-word');
      }
    }

    // Recurrence
    let recurrence: NlRecurrence | undefined;
    for (const { re, value } of RECURRENCE_PATTERNS) {
      const match = rest.match(re);
      if (match) {
        recurrence = value;
        rest = rest.replace(match[0], ' ');
        score += 0.1;
        matched.push('recurrence');
        break;
      }
    }

    // Date + optional time (before recurrence so "día 1" yields both
    // a date and, via isMonthDay, a MONTHLY recurrence).
    // Always take `consumed`: extractDate also strips non-date noise
    // ("in <month>") that must not leak into the title.
    const { date, consumed, isMonthDay } = this.extractDate(rest, now);
    rest = consumed;
    let dueAt: Date | undefined;
    if (date) {
      dueAt = date;
      score += 0.15;
      matched.push('date');
    }
    if (isMonthDay && !recurrence) {
      recurrence = 'MONTHLY';
      score += 0.05;
    }

    // Title = leftovers, cleaned.
    const title = rest
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+(el|la|on|the|dia|día)\s*$/i, '')
      .trim();
    const finalTitle = title || input.trim();

    // Confidence: base 0.5 + matched signals, capped; garbage stays low.
    let confidenceScore = Math.min(0.95, score);
    if (matched.length === 0 && finalTitle.split(/\s+/).length <= 3) {
      confidenceScore = 0.4;
    }
    if (matched.length === 0) {
      confidenceScore = Math.min(confidenceScore, 0.55);
    }

    return {
      title: finalTitle,
      ...(dueAt ? { dueAt } : {}),
      ...(recurrence ? { recurrence } : {}),
      priority,
      ...(projectHint ? { projectHint } : {}),
      confidenceScore: Math.round(confidenceScore * 100) / 100,
    };
  }

  private extractDate(
    text: string,
    now: Date,
  ): { date?: Date; consumed: string; isMonthDay?: boolean } {
    const lower = text.toLowerCase();
    let rest = text;

    // Time first: "15h", "15:30", "3pm", "10:30am", "9h", bare "10:30".
    let hours: number | undefined;
    let minutes = 0;
    const timeMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(h|am|pm)\b/);
    const bareTimeMatch = !timeMatch
      ? lower.match(/\b(\d{1,2}):(\d{2})\b/)
      : null;
    const effectiveTimeMatch = timeMatch ?? bareTimeMatch;
    if (effectiveTimeMatch) {
      hours = parseInt(effectiveTimeMatch[1], 10);
      minutes = effectiveTimeMatch[2] ? parseInt(effectiveTimeMatch[2], 10) : 0;
      const suffix = effectiveTimeMatch[3];
      if (suffix === 'pm' && hours < 12) hours += 12;
      if (suffix === 'am' && hours === 12) hours = 0;
      rest = rest.replace(effectiveTimeMatch[0], ' ');
    }

    const at = (base: Date): Date => {
      const date = new Date(base);
      if (hours !== undefined) {
        date.setUTCHours(hours, minutes, 0, 0);
      } else {
        date.setUTCHours(9, 0, 0, 0);
      }
      return date;
    };

    // today / hoy / hoje
    if (uwb('(hoy|today|hoje)').test(rest)) {
      const cleaned = rest.replace(uwb('(hoy|today|hoje)'), ' ');
      return { date: at(now), consumed: cleaned };
    }

    // tomorrow / mañana / amanhã
    if (uwb('(ma[ñn]ana|tomorrow|amanh[ãa]|amanha)').test(rest)) {
      const cleaned = rest.replace(
        uwb('(ma[ñn]ana|tomorrow|amanh[ãa]|amanha)'),
        ' ',
      );
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      return { date: at(tomorrow), consumed: cleaned };
    }

    // next <weekday> / <weekday> que viene|vem / <weekday> (upcoming)
    const weekdayMatch = rest.match(
      uwb(
        '(next\\s+)?(domingo|sunday|lunes|monday|segunda(?:-feira)?|martes|tuesday|ter[çc]a(?:-feira)?|mi[eé]rcoles|wednesday|quarta(?:-feira)?|jueves|thursday|quinta(?:-feira)?|viernes|friday|sexta(?:-feira)?|s[áa]bado|saturday)(\\s+que\\s+(viene|vem))?',
      ),
    );
    if (weekdayMatch) {
      const raw = weekdayMatch[2].toLowerCase();
      const ascii = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const target = WEEKDAYS[raw] ?? WEEKDAYS[ascii];
      if (target !== undefined) {
        // Rule: upcoming weekday; same day counts as +7 (never today).
        // "next X" / "X que viene" follow the same rule — documented.
        const upcoming = (target - now.getUTCDay() + 7) % 7;
        const delta = upcoming === 0 ? 7 : upcoming;
        const base = new Date(now);
        base.setUTCDate(base.getUTCDate() + delta);
        const cleaned = rest.replace(weekdayMatch[0], ' ');
        return { date: at(base), consumed: cleaned };
      }
    }

    // DD/MM or MM/DD numeric: "25/10" (ES/PT) vs "10/25" (EN).
    const numericMatch = rest.match(/\b(\d{1,2})\/(\d{1,2})\b/);
    if (numericMatch) {
      const first = parseInt(numericMatch[1], 10);
      const second = parseInt(numericMatch[2], 10);
      // Heuristic: if first > 12 it's DD/MM; if second > 12 it's MM/DD;
      // default DD/MM (ES/PT majority), EN tests use unambiguous 10/25.
      let day: number;
      let month: number;
      if (first > 12) {
        day = first;
        month = second;
      } else if (second > 12) {
        day = second;
        month = first;
      } else {
        day = first;
        month = second;
      }
      const year = now.getUTCFullYear();
      const cleaned = rest.replace(numericMatch[0], ' ');
      return {
        date: at(new Date(Date.UTC(year, month - 1, day))),
        consumed: cleaned,
      };
    }

    // "día 1" / "on the 1st" / "dia 1" → next 1st of month.
    // Also flags isMonthDay so the caller infers MONTHLY recurrence.
    const monthDayMatch = rest.match(
      uwb('(d[íi]a|dia|on the)\\s+(\\d{1,2})(st|nd|rd|th)?'),
    );
    if (monthDayMatch) {
      const day = parseInt(monthDayMatch[2], 10);
      const candidate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), Math.min(day, 28)),
      );
      candidate.setUTCDate(day);
      if (candidate.getUTCDate() !== day || candidate <= now) {
        candidate.setUTCMonth(candidate.getUTCMonth() + 1);
        candidate.setUTCDate(Math.min(day, 28));
        candidate.setUTCDate(day);
      }
      const cleaned = rest.replace(monthDayMatch[0], ' ');
      return { date: at(candidate), consumed: cleaned, isMonthDay: true };
    }

    // "in <month>" without a day ("yearly in april"): not a concrete
    // date — strip it so the title stays clean, recurrence comes from
    // the YEARLY pattern matched earlier.
    const inMonthMatch = rest.match(
      uwb(
        'in\\s+(january|february|march|april|may|june|july|august|september|october|november|december)',
      ),
    );
    if (inMonthMatch) {
      rest = rest.replace(inMonthMatch[0], ' ');
    }

    // Time without a day → today at that time.
    if (hours !== undefined) {
      return { date: at(now), consumed: rest };
    }

    return { consumed: rest };
  }
}
