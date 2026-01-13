import { Injectable } from '@nestjs/common';
import { AuthEventType } from '@ordo-todo/db';

export interface CreateAuthAuditLogDto {
    type: AuthEventType;
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}

export interface AuthAuditLogFilter {
    userId?: string;
    email?: string;
    type?: AuthEventType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

@Injectable()
export class AuthAuditLogRepository {
    constructor(private readonly prisma: any) { }

    /**
     * Create a new auth audit log entry
     */
    async create(data: CreateAuthAuditLogDto) {
        return this.prisma.authAuditLog.create({
            data: {
                type: data.type,
                userId: data.userId,
                email: data.email,
                ip: data.ip,
                userAgent: data.userAgent,
                metadata: data.metadata as any,
            },
        });
    }

    /**
     * Find auth audit logs with filters
     */
    async findMany(filter: AuthAuditLogFilter) {
        const where: any = {};

        if (filter.userId) {
            where.userId = filter.userId;
        }

        if (filter.email) {
            where.email = filter.email;
        }

        if (filter.type) {
            where.type = filter.type;
        }

        if (filter.startDate || filter.endDate) {
            where.createdAt = {};
            if (filter.startDate) {
                where.createdAt.gte = filter.startDate;
            }
            if (filter.endDate) {
                where.createdAt.lte = filter.endDate;
            }
        }

        return this.prisma.authAuditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: filter.limit || 50,
            skip: filter.offset || 0,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Get count of logs matching filter
     */
    async count(filter: AuthAuditLogFilter) {
        const where: any = {};

        if (filter.userId) {
            where.userId = filter.userId;
        }

        if (filter.email) {
            where.email = filter.email;
        }

        if (filter.type) {
            where.type = filter.type;
        }

        return this.prisma.authAuditLog.count({ where });
    }

    /**
     * Get recent login attempts for an email (for rate limiting / security)
     */
    async getRecentLoginAttempts(email: string, sinceMinutes: number = 15) {
        const since = new Date();
        since.setMinutes(since.getMinutes() - sinceMinutes);

        return this.prisma.authAuditLog.findMany({
            where: {
                email,
                type: {
                    in: [AuthEventType.LOGIN_SUCCESS, AuthEventType.LOGIN_FAILED],
                },
                createdAt: {
                    gte: since,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get failed login count for rate limiting
     */
    async getFailedLoginCount(email: string, sinceMinutes: number = 15): Promise<number> {
        const since = new Date();
        since.setMinutes(since.getMinutes() - sinceMinutes);

        return this.prisma.authAuditLog.count({
            where: {
                email,
                type: AuthEventType.LOGIN_FAILED,
                createdAt: {
                    gte: since,
                },
            },
        });
    }

    /**
     * Get audit logs for a specific user
     */
    async findByUserId(userId: string, limit: number = 50) {
        return this.prisma.authAuditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Delete old audit logs (for data retention)
     */
    async deleteOlderThan(date: Date) {
        return this.prisma.authAuditLog.deleteMany({
            where: {
                createdAt: {
                    lt: date,
                },
            },
        });
    }
}
