import { Redis } from "@upstash/redis";

// Redis client for caching and sessions
export const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        : null;

// Helper functions for common operations
export const cache = {
    async get<T>(key: string): Promise<T | null> {
        if (!redis) return null;
        try {
            const data = await redis.get(key);
            return data as T;
        } catch (error) {
            console.error("Redis cache get error:", error);
            return null;
        }
    },

    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (!redis) return;
        try {
            if (ttl) {
                await redis.setex(key, ttl, JSON.stringify(value));
            } else {
                await redis.set(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error("Redis cache set error:", error);
        }
    },

    async del(key: string): Promise<void> {
        if (!redis) return;
        try {
            await redis.del(key);
        } catch (error) {
            console.error("Redis cache del error:", error);
        }
    },

    async exists(key: string): Promise<boolean> {
        if (!redis) return false;
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error("Redis cache exists error:", error);
            return false;
        }
    },
};

// Session management helpers
export const sessions = {
    async get(sessionId: string) {
        return cache.get(`session:${sessionId}`);
    },

    async set(sessionId: string, data: any, ttl: number = 86400) {
        // 24 hours default
        return cache.set(`session:${sessionId}`, data, ttl);
    },

    async del(sessionId: string) {
        return cache.del(`session:${sessionId}`);
    },
};

// Rate limiting helpers
export const rateLimit = {
    async check(key: string, limit: number, window: number): Promise<boolean> {
        if (!redis) return true; // Allow if no Redis

        try {
            const current = await redis.incr(key);
            if (current === 1) {
                await redis.expire(key, window);
            }
            return current <= limit;
        } catch (error) {
            console.error("Redis rate limit error:", error);
            return true; // Allow on error
        }
    },
};