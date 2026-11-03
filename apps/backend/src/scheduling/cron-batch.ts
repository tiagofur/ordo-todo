import { PrismaService } from '../database/prisma.service';
import { getCronLockBackend } from './distributed-lock';

/**
 * Batch size for user sweeps. Small enough to keep each page fast, large
 * enough to avoid chatty round-trips.
 */
export const CRON_USER_BATCH_SIZE = 200;

/**
 * Iterates every user in stable id order, `batchSize` rows at a time.
 * Replaces unbounded `findMany({ select })` + sequential per-user awaits in
 * cron sweeps: memory stays flat and a crash resumes... well, restarts the
 * sweep — pages are cheap to re-read and per-user handlers are idempotent
 * by dedup window (see callers).
 */
export async function forEachUserBatched(
  prisma: PrismaService,
  fn: (user: { id: string; timezone: string | null }) => Promise<void>,
  batchSize: number = CRON_USER_BATCH_SIZE,
): Promise<void> {
  let cursor: string | undefined;
  for (;;) {
    const users = await prisma.user.findMany({
      select: { id: true, timezone: true },
      orderBy: { id: 'asc' },
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (users.length === 0) {
      return;
    }
    for (const user of users) {
      await fn({ id: user.id, timezone: user.timezone ?? null });
    }
    if (users.length < batchSize) {
      return;
    }
    cursor = users[users.length - 1].id;
  }
}

/**
 * Default distributed-lock TTL. Covers the longest batched user sweep
 * with margin; a crashed holder blocks at most one extra cycle.
 */
export const CRON_LOCK_DEFAULT_TTL_MS = 15 * 60 * 1000;

/**
 * Method decorator version of the anti-overlap guard. Zero body changes:
 *
 *   @SkipOnOverlap('sendDailyPlanningReminder')
 *   @Cron('0 9 * * 1-5')
 *   async sendDailyPlanningReminder() { ... }
 *
 * Two layers: the in-memory per-instance set (unchanged fast path) plus,
 * when a lock backend is bound (Redis), a distributed `SET NX PX` so
 * replicas of this process also deduplicate. Without a backend — or when
 * the backend throws — the tick runs locally exactly as before
 * (fail-open: a Redis outage must never silence crons).
 */
const OVERLAP_RUNNING = Symbol('cronOverlapRunning');

export function SkipOnOverlap(
  cronKey: string | ((...args: unknown[]) => string),
  skipValue?: unknown,
  opts?: { ttlMs?: number },
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = async function (...args: unknown[]) {
      const key = typeof cronKey === 'function' ? cronKey(...args) : cronKey;
      const self = this as Record<symbol, Set<string> | undefined> & {
        logger?: {
          warn(message: string): void;
          debug?(message: string): void;
        };
      };
      let running = self[OVERLAP_RUNNING];
      if (!running) {
        running = new Set<string>();
        self[OVERLAP_RUNNING] = running;
      }
      if (running.has(key)) {
        self.logger?.warn(`${key} skipped: previous tick still running`);
        return skipValue;
      }
      running.add(key);
      const backend = getCronLockBackend();
      const lockKey = `cron:lock:${key}`;
      let acquiredDistributed = false;
      if (backend) {
        try {
          acquiredDistributed = await backend.tryAcquire(
            lockKey,
            opts?.ttlMs ?? CRON_LOCK_DEFAULT_TTL_MS,
          );
          if (!acquiredDistributed) {
            self.logger?.warn(`${key} skipped: lock held by another replica`);
            return skipValue;
          }
        } catch (error) {
          // Fail open: without the lock we are exactly where we were
          // before distributed locking existed.
          self.logger?.warn(
            `${key} distributed lock unavailable, running locally: ${String(error)}`,
          );
        }
      }
      try {
        return await original.apply(this, args);
      } finally {
        running.delete(key);
        if (acquiredDistributed && backend) {
          try {
            await backend.release(lockKey);
          } catch (error) {
            self.logger?.warn(
              `${key} distributed lock release failed: ${String(error)}`,
            );
          }
        }
      }
    };
    return descriptor;
  };
}

/**
 * In-process anti-overlap for cron ticks. A slow tick (AI calls, SMTP,
 * per-user sweeps) must not run twice concurrently on the same instance:
 * the second tick is skipped and logged by the caller.
 *
 * NOTE: single-instance only. With several replicas this does not
 * deduplicate — that needs a distributed lock (Redis SET NX / advisory),
 * which is a follow-up once REDIS is mandatory in production.
 */
export class CronOverlapGuard {
  private readonly running = new Set<string>();

  async runExclusive<T>(
    key: string,
    fn: () => Promise<T>,
  ): Promise<{ status: 'ran'; result: T } | { status: 'skipped' }> {
    if (this.running.has(key)) {
      return { status: 'skipped' };
    }
    this.running.add(key);
    try {
      return { status: 'ran', result: await fn() };
    } finally {
      this.running.delete(key);
    }
  }
}
