import { Inject, Injectable, Optional } from '@nestjs/common';
import type { TaskRepository, TimerRepository } from '@ordo-todo/core';

// ODD 005 S5: learn task durations from real timer history (T4).
//
// DECISION (documented per brief): the source is TimerRepository
// (findByUserIdAndDateRange, read-only) crossed with TaskRepository.findById
// per session taskId. TimerRepository exposes everything needed (sessions with
// duration + taskId) and scheduling must NOT bypass the repository layer with
// Prisma direct for task/timer data — it imports RepositoriesModule only,
// so no DI cycles with tasks/timers modules.
//
// Method: filter to finished WORK/CONTINUOUS sessions in the window, keep the
// ones comparable to the query (same category match, else same priority,
// else NONE -> fallback: filters that match nothing report honestly instead
// of silently widening), trim outliers by IQR, predict the median.
// DECISION: median-of-actuals (not estimated-vs-real ratio): the estimate IS
// the historical actual median; S5's "estimated vs real" check is satisfied by
// beating the static baseline with real data (see spec: mean error test).
//
// Documented sample ladder (MIN_COMPARABLE = 5):
//   <5 comparable  -> source 'fallback', LOW, honest "sin datos suficientes"
//    5..14         -> source 'history', MEDIUM
//   >=15           -> source 'history', HIGH
// The fallback estimate is the long-standing static default (30min): same
// number the old local predictor returned, now labeled honestly.

export const MIN_COMPARABLE_SESSIONS = 5;
export const HIGH_CONFIDENCE_SAMPLES = 15;
export const FALLBACK_MINUTES = 30;
const HISTORY_WINDOW_DAYS = 90;

export type DurationConfidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type DurationSource = 'history' | 'fallback';

export interface DurationQuery {
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface DurationPrediction {
  estimatedMinutes: number;
  confidence: DurationConfidence;
  sampleSize: number;
  source: DurationSource;
  reasoning: string;
}

const median = (sorted: number[]): number => {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

// IQR trim: drop values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]. With <4 values
// there is nothing meaningful to trim — return as-is.
const trimOutliers = (values: number[]): number[] => {
  if (values.length < 4) return values;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)));
  const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)));
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const kept = sorted.filter((v) => v >= lo && v <= hi);
  return kept.length > 0 ? kept : sorted;
};

@Injectable()
export class DurationLearningService {
  constructor(
    @Optional()
    @Inject('TimerRepository')
    private readonly timerRepository?: TimerRepository,
    @Optional()
    @Inject('TaskRepository')
    private readonly taskRepository?: TaskRepository,
  ) {}

  async predict(
    userId: string,
    query: DurationQuery,
  ): Promise<DurationPrediction> {
    const sessions = await this.readHistory(userId);
    if (sessions.length === 0) return this.fallback('sin historial de timers');

    // Cross each session with its task (category/tags/priority).
    const comparable = await this.comparableDurations(sessions, query);
    if (comparable.sampleSize < MIN_COMPARABLE_SESSIONS) {
      return this.fallback(
        `solo ${comparable.sampleSize} sesiones comparables`,
      );
    }

    const trimmed = trimOutliers(comparable.durations);
    const estimate =
      Math.round(median([...trimmed].sort((a, b) => a - b)) / 5) * 5;
    const confidence: DurationConfidence =
      comparable.sampleSize >= HIGH_CONFIDENCE_SAMPLES ? 'HIGH' : 'MEDIUM';
    const scope =
      comparable.matchedBy === 'all'
        ? 'tu historial reciente'
        : `${comparable.matchedBy} similares`;
    return {
      estimatedMinutes: Math.max(10, estimate),
      confidence,
      sampleSize: comparable.sampleSize,
      source: 'history',
      reasoning:
        `Mediana de ${comparable.sampleSize} sesiones de ${scope}` +
        (trimmed.length < comparable.durations.length
          ? ` (${comparable.durations.length - trimmed.length} atípicas excluidas)`
          : '') +
        '. Basado en tus tiempos reales, no en una suposición.',
    };
  }

  private fallback(detail: string): DurationPrediction {
    return {
      estimatedMinutes: FALLBACK_MINUTES,
      confidence: 'LOW',
      sampleSize: 0,
      source: 'fallback',
      // Honest per promises-audit: say "not enough data", never fake precision.
      reasoning:
        `Sin datos suficientes para estimar (${detail}). ` +
        `Uso ${FALLBACK_MINUTES} min como punto de partida; registra tiempo ` +
        `en tareas parecidas para mejorar esta estimación.`,
    };
  }

  private async readHistory(
    userId: string,
  ): Promise<{ duration: number; taskId?: string }[]> {
    if (!this.timerRepository) return [];
    const end = new Date();
    const start = new Date(
      end.getTime() - HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    const sessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      start,
      end,
    );
    // Finished work only: running sessions have no duration yet, breaks are
    // not task work.
    return sessions
      .filter(
        (s) =>
          s.props.endedAt != null &&
          s.props.duration != null &&
          s.props.duration > 0 &&
          (s.props.type === 'WORK' || s.props.type === 'CONTINUOUS'),
      )
      .map((s) => ({
        duration: s.props.duration as number,
        taskId: s.props.taskId,
      }));
  }

  private async comparableDurations(
    sessions: { duration: number; taskId?: string }[],
    query: DurationQuery,
  ): Promise<{ durations: number[]; sampleSize: number; matchedBy: string }> {
    // No task data available (or no query filters): all finished work counts.
    // Blank-only category counts as no filter (trimmed, never matches).
    const taskRepository = this.taskRepository;
    const hasCategory = query.category?.trim() ? true : false;
    if (!taskRepository || (!hasCategory && !query.priority)) {
      return {
        durations: sessions.map((s) => s.duration),
        sampleSize: sessions.length,
        matchedBy: 'all',
      };
    }
    const byTask = new Map<string, { duration: number }[]>();
    for (const s of sessions) {
      if (!s.taskId) continue;
      const list = byTask.get(s.taskId) ?? [];
      list.push(s);
      byTask.set(s.taskId, list);
    }
    const withTask = await Promise.all(
      [...byTask.entries()].map(async ([taskId, sess]) => ({
        sess,
        task: await taskRepository.findById(taskId),
      })),
    );

    // Task has no `category` column: match query.category against tag names
    // and project name (case-insensitive, documented approximation).
    const want = query.category?.trim().toLowerCase();
    const catHit = want
      ? withTask.filter(({ task }) => {
          if (!task) return false;
          const tags = (task.props.tags ?? []).map((t) => t.name.toLowerCase());
          const project = task.props.project?.name?.toLowerCase() ?? '';
          return tags.includes(want) || project === want;
        })
      : [];
    if (catHit.length > 0) {
      const durations = catHit.flatMap(({ sess }) =>
        sess.map((s) => s.duration),
      );
      return {
        durations,
        sampleSize: durations.length,
        matchedBy: `tareas de categoría "${query.category}"`,
      };
    }
    if (query.priority) {
      const prioHit = withTask.filter(
        ({ task }) => task?.props.priority === query.priority,
      );
      if (prioHit.length > 0) {
        const durations = prioHit.flatMap(({ sess }) =>
          sess.map((s) => s.duration),
        );
        return {
          durations,
          sampleSize: durations.length,
          matchedBy: `tareas con prioridad ${query.priority}`,
        };
      }
    }
    // Query filters matched nothing: report honestly instead of silently
    // widening — the caller decides whether a generic history estimate helps.
    // (Reaching here with no effective filters is impossible: the early return
    // above handles that case.)
    return { durations: [], sampleSize: 0, matchedBy: 'none' };
  }
}
