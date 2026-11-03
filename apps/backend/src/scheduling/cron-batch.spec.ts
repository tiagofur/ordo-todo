import {
  CronOverlapGuard,
  SkipOnOverlap,
  forEachUserBatched,
} from './cron-batch';
import {
  setCronLockBackend,
  type CronLockBackend,
} from './distributed-lock';
import { PrismaService } from '../database/prisma.service';

afterEach(() => {
  setCronLockBackend(undefined);
});

describe('cron-batch', () => {
  describe('forEachUserBatched', () => {
    const pages = (users: { id: string }[]) => ({
      user: {
        findMany: jest.fn((args: { cursor?: { id: string } }) => {
          const start = args.cursor
            ? users.findIndex((u) => u.id === args.cursor!.id) + 1
            : 0;
          return Promise.resolve(users.slice(start, start + 2));
        }),
      },
    });

    it('pages through every user exactly once', async () => {
      const users = [
        { id: 'a' },
        { id: 'b' },
        { id: 'c' },
        { id: 'd' },
        { id: 'e' },
      ];
      const prisma = pages(users) as unknown as PrismaService;
      const seen: string[] = [];

      await forEachUserBatched(
        prisma,
        async (user) => {
          seen.push(user.id);
        },
        2,
      );

      expect(seen).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(3);
    });

    it('handles an empty table with a single query', async () => {
      const prisma = pages([]) as unknown as PrismaService;
      const fn = jest.fn();

      await forEachUserBatched(prisma, fn, 2);

      expect(fn).not.toHaveBeenCalled();
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('SkipOnOverlap', () => {
    const gate = () => {
      let release!: () => void;
      const promise = new Promise<void>((resolve) => {
        release = resolve;
      });
      return { promise, release };
    };

    it('skips a concurrent tick and lets the next one through', async () => {
      const shared = gate();
      class Svc {
        calls = 0;
        @SkipOnOverlap('tick')
        async tick(): Promise<string> {
          this.calls += 1;
          await shared.promise;
          return 'done';
        }
      }
      const svc = new Svc();

      const first = svc.tick();
      const second = await svc.tick();

      expect(second).toBeUndefined();
      expect(svc.calls).toBe(1);
      shared.release();
      await expect(first).resolves.toBe('done');
      // After release the key is free again.
      await expect(svc.tick()).resolves.toBe('done');
      expect(svc.calls).toBe(2);
    });

    it('keys overlap per arguments when given a factory', async () => {
      class Svc {
        @SkipOnOverlap((id: unknown) => `job:${String(id)}`, 'busy')
        async run(id: string): Promise<string> {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return `ran:${id}`;
        }
      }
      const svc = new Svc();

      const [a, b] = await Promise.all([svc.run('a'), svc.run('b')]);
      expect([a, b].sort()).toEqual(['ran:a', 'ran:b']);
    });

    it('skips a cross-instance tick when the backend lock is held', async () => {
      const held = new Set<string>();
      const backend: CronLockBackend = {
        tryAcquire: jest.fn(async (key: string) => {
          if (held.has(key)) return false;
          held.add(key);
          return true;
        }),
        release: jest.fn(async (key: string) => {
          held.delete(key);
        }),
      };
      setCronLockBackend(backend);

      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      class Svc {
        calls = 0;
        @SkipOnOverlap('shared-tick', 'skipped')
        async tick(): Promise<string> {
          this.calls += 1;
          await gate;
          return 'done';
        }
      }
      // Two separate instances = two replicas sharing one backend.
      const first = new Svc();
      const second = new Svc();

      const running = first.tick();
      const skipped = await second.tick();

      expect(skipped).toBe('skipped');
      expect(second.calls).toBe(0);
      release();
      await expect(running).resolves.toBe('done');
      // After release the next tick runs and frees the lock.
      await expect(first.tick()).resolves.toBe('done');
      expect(held.size).toBe(0);
    });

    it('runs locally when the backend throws (fail-open)', async () => {
      const backend: CronLockBackend = {
        tryAcquire: jest.fn(async () => {
          throw new Error('redis down');
        }),
        release: jest.fn(),
      };
      setCronLockBackend(backend);
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

      class Svc {
        @SkipOnOverlap('flaky-tick')
        async tick(): Promise<string> {
          return 'done';
        }
      }

      await expect(new Svc().tick()).resolves.toBe('done');
      warn.mockRestore();
    });
  });

  describe('CronOverlapGuard', () => {
    it('lets a free key run', async () => {
      const guard = new CronOverlapGuard();
      const fn = jest.fn().mockResolvedValue('ok');

      const out = await guard.runExclusive('cron-a', fn);

      expect(out).toEqual({ status: 'ran', result: 'ok' });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('skips while the same key is running', async () => {
      const guard = new CronOverlapGuard();
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const fn = jest.fn().mockImplementation(() => gate);

      const first = guard.runExclusive('cron-a', fn);
      const second = await guard.runExclusive('cron-a', fn);

      expect(second).toEqual({ status: 'skipped' });
      expect(fn).toHaveBeenCalledTimes(1);
      release();
      await expect(first).resolves.toEqual({
        status: 'ran',
        result: undefined,
      });
    });

    it('releases the key after a failure', async () => {
      const guard = new CronOverlapGuard();
      const failing = jest.fn().mockRejectedValue(new Error('boom'));

      await expect(guard.runExclusive('cron-a', failing)).rejects.toThrow(
        'boom',
      );

      const fn = jest.fn().mockResolvedValue('ok');
      await expect(guard.runExclusive('cron-a', fn)).resolves.toEqual({
        status: 'ran',
        result: 'ok',
      });
    });
  });
});
