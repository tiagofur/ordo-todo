import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  Recurrence,
  RecurrenceRepository,
  RecurrenceInput,
} from '@ordo-todo/core';

/**
 * Prisma implementation of RecurrenceRepository
 * Manages recurring task patterns and calculations
 */
@Injectable()
export class PrismaRecurrenceRepository implements RecurrenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: RecurrenceInput): Promise<Recurrence> {
    const data = await this.prisma.recurrence.create({
      data: {
        taskId: input.taskId,
        pattern: input.pattern,
        interval: input.interval,
        daysOfWeek: input.daysOfWeek,
        dayOfMonth: input.dayOfMonth,
        endDate: input.endDate,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<Recurrence | null> {
    const data = await this.prisma.recurrence.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByTaskId(taskId: string): Promise<Recurrence | null> {
    const data = await this.prisma.recurrence.findUnique({
      where: { taskId },
    });

    return data ? this.toDomain(data) : null;
  }

  async update(id: string, input: Partial<RecurrenceInput>): Promise<Recurrence> {
    const data = await this.prisma.recurrence.update({
      where: { id },
      data: {
        pattern: input.pattern,
        interval: input.interval,
        daysOfWeek: input.daysOfWeek,
        dayOfMonth: input.dayOfMonth,
        endDate: input.endDate,
      },
    });

    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recurrence.delete({
      where: { id },
    });
  }

  async findActive(): Promise<Recurrence[]> {
    const now = new Date();

    const recurrences = await this.prisma.recurrence.findMany({
      where: {
        OR: [
          { endDate: null }, // No end date
          { endDate: { gt: now } }, // End date in the future
        ],
      },
    });

    return recurrences.map((r) => this.toDomain(r));
  }

  async findEndingBefore(date: Date): Promise<Recurrence[]> {
    const recurrences = await this.prisma.recurrence.findMany({
      where: {
        endDate: {
          lte: date,
        },
      },
    });

    return recurrences.map((r) => this.toDomain(r));
  }

  async findByPattern(pattern: any): Promise<Recurrence[]> {
    const recurrences = await this.prisma.recurrence.findMany({
      where: { pattern },
    });

    return recurrences.map((r) => this.toDomain(r));
  }

  /**
   * Convert Prisma model to domain entity
   */
  private toDomain(prismaRecurrence: any): Recurrence {
    return new Recurrence({
      id: prismaRecurrence.id,
      taskId: prismaRecurrence.taskId,
      pattern: prismaRecurrence.pattern,
      interval: prismaRecurrence.interval,
      daysOfWeek: prismaRecurrence.daysOfWeek,
      dayOfMonth: prismaRecurrence.dayOfMonth,
      endDate: prismaRecurrence.endDate,
      createdAt: prismaRecurrence.createdAt,
    });
  }
}
