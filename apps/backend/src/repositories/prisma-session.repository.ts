import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Session, SessionRepository, SessionInput } from '@ordo-todo/core';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: SessionInput): Promise<Session> {
    const data = await this.prisma.session.create({
      data: {
        sessionToken: input.sessionToken,
        userId: input.userId,
        expires: input.expires,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<Session | null> {
    const data = await this.prisma.session.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByToken(token: string): Promise<Session | null> {
    const data = await this.prisma.session.findUnique({
      where: { sessionToken: token },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
    });

    return sessions.map((s) => this.toDomain(s));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  private toDomain(prismaSession: any): Session {
    return new Session({
      id: prismaSession.id,
      sessionToken: prismaSession.sessionToken,
      userId: prismaSession.userId,
      expires: prismaSession.expires,
    });
  }
}
