/**
 * Pluggable cross-instance lock backend for cron ticks.
 *
 * When no backend is bound (Redis absent or not connected) callers must
 * use their previous local-only behavior unchanged — the backend only
 * engages where it is explicitly consulted. Redis failures are the
 * caller's problem to classify; backends should surface them, never
 * swallow them into a "locked" verdict.
 */
export interface CronLockBackend {
  /**
   * Atomically acquire `key` for `ttlMs`. Resolves true only when this
   * caller is the new owner.
   */
  tryAcquire(key: string, ttlMs: number): Promise<boolean>;

  /** Release a key previously acquired by this caller. */
  release(key: string): Promise<void>;
}

let boundBackend: CronLockBackend | undefined;

/**
 * Bind (or unbind with `undefined`) the process-wide cron lock backend.
 * Called by `RedisService` on connect/destroy; tests bind fakes.
 */
export function setCronLockBackend(backend: CronLockBackend | undefined): void {
  boundBackend = backend;
}

/** The currently bound backend, if any. */
export function getCronLockBackend(): CronLockBackend | undefined {
  return boundBackend;
}

/**
 * Redis-backed cron lock. Requires only the two commands it uses so
 * tests can bind fakes without a server.
 */
export class RedisCronLockBackend implements CronLockBackend {
  constructor(
    private readonly client: {
      set(
        key: string,
        value: string,
        options: { NX: boolean; PX: number },
      ): Promise<unknown>;
      eval(
        script: string,
        options: { keys: string[]; arguments: string[] },
      ): Promise<unknown>;
    },
    private readonly ownerId: string = `${Date.now()}`,
  ) {}

  async tryAcquire(key: string, ttlMs: number): Promise<boolean> {
    const acquired = await this.client.set(key, this.ownerId, {
      NX: true,
      PX: ttlMs,
    });
    return acquired === 'OK';
  }

  async release(key: string): Promise<void> {
    // Compare-and-del: a tick that outlived its TTL must not release the
    // lock a newer tick already acquired.
    await this.client.eval(
      'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
      { keys: [key], arguments: [this.ownerId] },
    );
  }
}
