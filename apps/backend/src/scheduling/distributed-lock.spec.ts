import 'reflect-metadata';
import {
  RedisCronLockBackend,
  getCronLockBackend,
  setCronLockBackend,
} from './distributed-lock';

/** Minimal in-memory fake with node-redis NX/PX + compare-del semantics. */
function fakeRedisClient() {
  const store = new Map<string, { value: string; expiresAt: number }>();
  const live = (key: string) => {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry;
  };
  return {
    store,
    async set(
      key: string,
      value: string,
      options: { NX: boolean; PX: number },
    ) {
      if (options.NX && live(key)) return null;
      store.set(key, { value, expiresAt: Date.now() + options.PX });
      return 'OK';
    },
    async eval(
      _script: string,
      options: { keys: string[]; arguments: string[] },
    ) {
      const [key] = options.keys;
      const [owner] = options.arguments;
      const entry = live(key);
      if (entry && entry.value === owner) {
        store.delete(key);
        return 1;
      }
      return 0;
    },
  };
}

describe('distributed-lock', () => {
  afterEach(() => {
    setCronLockBackend(undefined);
  });

  it('should start unbound (local-only behavior preserved)', () => {
    expect(getCronLockBackend()).toBeUndefined();
  });

  it('should acquire, block a second owner, and release', async () => {
    const client = fakeRedisClient();
    const first = new RedisCronLockBackend(client, 'owner-a');
    const second = new RedisCronLockBackend(client, 'owner-b');

    await expect(first.tryAcquire('cron:x', 60_000)).resolves.toBe(true);
    await expect(second.tryAcquire('cron:x', 60_000)).resolves.toBe(false);
    await first.release('cron:x');
    await expect(second.tryAcquire('cron:x', 60_000)).resolves.toBe(true);
  });

  it('should not release a lock owned by someone else', async () => {
    const client = fakeRedisClient();
    const first = new RedisCronLockBackend(client, 'owner-a');
    const second = new RedisCronLockBackend(client, 'owner-b');

    await first.tryAcquire('cron:x', 60_000);
    await second.release('cron:x');
    // Still held by the first owner.
    await expect(second.tryAcquire('cron:x', 60_000)).resolves.toBe(false);
  });

  it('should expire stale locks', async () => {
    const client = fakeRedisClient();
    const backend = new RedisCronLockBackend(client, 'owner-a');

    await backend.tryAcquire('cron:x', 1);
    await new Promise((resolve) => setTimeout(resolve, 5));
    await expect(backend.tryAcquire('cron:x', 60_000)).resolves.toBe(true);
  });
});
