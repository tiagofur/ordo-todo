import type { ThrottlerStorage } from '@nestjs/throttler';

/**
 * ThrottlerStorage stub that never records a hit.
 *
 * Registration is limited to 3 attempts per hour per IP and every supertest
 * request comes from the same IP, so a spec that creates more than three
 * accounts must override the storage with this stub. Rate limiting itself is
 * covered by src/common/guards/throttle.guard.spec.ts.
 *
 * @example
 * Test.createTestingModule({ imports: [AppModule] })
 *   .overrideProvider(ThrottlerStorage)
 *   .useValue(neverThrottleStorage)
 */
export const neverThrottleStorage: ThrottlerStorage = {
  increment: async () => ({
    totalHits: 0,
    timeToExpire: 0,
    isBlocked: false,
    timeToBlockExpire: 0,
  }),
};
