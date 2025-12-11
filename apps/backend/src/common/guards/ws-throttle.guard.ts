import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface ThrottleRecord {
  count: number;
  resetAt: number;
}

/**
 * WebSocket Rate Limiting Guard
 *
 * Limits the number of WebSocket messages a user can send per time window.
 * This prevents flooding attacks and protects server resources.
 *
 * Default: 50 messages per minute per user
 *
 * Usage:
 * @UseGuards(WsThrottleGuard)
 * @SubscribeMessage('some-event')
 * handleEvent() { ... }
 */
@Injectable()
export class WsThrottleGuard implements CanActivate {
  private readonly logger = new Logger(WsThrottleGuard.name);
  private readonly connections = new Map<string, ThrottleRecord>();

  // Configuration
  private readonly limit: number;
  private readonly ttlMs: number;

  constructor(limit = 50, ttlSeconds = 60) {
    this.limit = limit;
    this.ttlMs = ttlSeconds * 1000;
  }

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const userId = client.data?.userId || client.id;
    const now = Date.now();

    const record = this.connections.get(userId);

    // First request or window expired - reset counter
    if (!record || now > record.resetAt) {
      this.connections.set(userId, {
        count: 1,
        resetAt: now + this.ttlMs,
      });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= this.limit) {
      this.logger.warn(
        `Rate limit exceeded for user ${userId}: ${record.count}/${this.limit} messages`,
      );
      throw new WsException({
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Please wait ${Math.ceil((record.resetAt - now) / 1000)} seconds.`,
      });
    }

    // Increment counter
    record.count++;
    return true;
  }

  /**
   * Clean up expired records periodically
   * Call this from a scheduled task if memory is a concern
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, record] of this.connections.entries()) {
      if (now > record.resetAt) {
        this.connections.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired throttle records`);
    }
  }

  /**
   * Get current stats for monitoring
   */
  getStats(): { activeUsers: number; totalRecords: number } {
    return {
      activeUsers: this.connections.size,
      totalRecords: this.connections.size,
    };
  }
}

/**
 * Pre-configured guard for high-frequency events (100/min)
 */
@Injectable()
export class WsThrottleGuardRelaxed extends WsThrottleGuard {
  constructor() {
    super(100, 60);
  }
}

/**
 * Pre-configured guard for low-frequency events (10/min)
 */
@Injectable()
export class WsThrottleGuardStrict extends WsThrottleGuard {
  constructor() {
    super(10, 60);
  }
}
