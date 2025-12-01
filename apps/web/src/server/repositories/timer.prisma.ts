import { PrismaClient, TimeSession as PrismaTimeSession, SessionType as PrismaSessionType } from "@prisma/client";
import { TimeSession, TimerRepository, SessionType } from "@ordo-todo/core";

export class PrismaTimerRepository implements TimerRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private toDomain(prismaSession: PrismaTimeSession): TimeSession {
        return new TimeSession({
            id: prismaSession.id,
            taskId: prismaSession.taskId ?? undefined,
            userId: prismaSession.userId,
            startedAt: prismaSession.startedAt,
            endedAt: prismaSession.endedAt ?? undefined,
            duration: prismaSession.duration ?? undefined,
            type: this.mapTypeToDomain(prismaSession.type),
            wasCompleted: prismaSession.wasCompleted,
            wasInterrupted: prismaSession.wasInterrupted,
            createdAt: prismaSession.createdAt,
        });
    }

    private mapTypeToDomain(type: PrismaSessionType): SessionType {
        switch (type) {
            case "WORK": return "WORK";
            case "SHORT_BREAK": return "SHORT_BREAK";
            case "LONG_BREAK": return "LONG_BREAK";
            default: return "WORK";
        }
    }

    private mapTypeToPrisma(type: SessionType): PrismaSessionType {
        switch (type) {
            case "WORK": return "WORK";
            case "SHORT_BREAK": return "SHORT_BREAK";
            case "LONG_BREAK": return "LONG_BREAK";
            default: return "WORK";
        }
    }

    async create(session: TimeSession): Promise<TimeSession> {
        const data = {
            id: session.id as string,
            userId: session.props.userId,
            startedAt: session.props.startedAt,
            type: this.mapTypeToPrisma(session.props.type),
            wasCompleted: session.props.wasCompleted,
            wasInterrupted: session.props.wasInterrupted,
            ...(session.props.taskId ? { taskId: session.props.taskId } : {}),
        };

        const created = await this.prisma.timeSession.create({
            data: data as any,
        });

        return this.toDomain(created);
    }

    async update(session: TimeSession): Promise<TimeSession> {
        const data = {
            endedAt: session.props.endedAt,
            duration: session.props.duration,
            wasCompleted: session.props.wasCompleted,
            wasInterrupted: session.props.wasInterrupted,
        };

        const updated = await this.prisma.timeSession.update({
            where: { id: session.id as string },
            data: data,
        });

        return this.toDomain(updated);
    }

    async findById(id: string): Promise<TimeSession | null> {
        const session = await this.prisma.timeSession.findUnique({ where: { id } });
        if (!session) return null;
        return this.toDomain(session);
    }

    async findActiveSession(userId: string): Promise<TimeSession | null> {
        // Active session is one that has started but not ended
        const session = await this.prisma.timeSession.findFirst({
            where: {
                userId,
                endedAt: null,
            },
            orderBy: {
                startedAt: 'desc',
            }
        });
        if (!session) return null;
        return this.toDomain(session);
    }

    async findByTaskId(taskId: string): Promise<TimeSession[]> {
        const sessions = await this.prisma.timeSession.findMany({ where: { taskId } });
        return sessions.map(s => this.toDomain(s));
    }

    async findByUserId(userId: string): Promise<TimeSession[]> {
        const sessions = await this.prisma.timeSession.findMany({ where: { userId } });
        return sessions.map(s => this.toDomain(s));
    }
}
