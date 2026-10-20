import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CronJob } from 'cron';
import { PrismaService } from '../database/prisma.service';
import { AIService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AgentJobsScheduler } from './agent-jobs.scheduler';
import { parseScheduleNl } from './agent-nl-schedule.parser';
import type {
  CreateAgentJobDto,
  UpdateAgentJobDto,
} from './dto/agent-jobs.dto';

const SCHEDULE_EXAMPLES =
  'Ejemplos: "cada viernes a las 5", "cada día a las 8", "every friday at 5pm", "toda sexta às 17h".';

/**
 * Persistent user-owned recurrent jobs (ODD 004 S5).
 *
 * MVP execution routes: weekly summary / daily summary prompts run the
 * matching report generator; anything else falls back to free chat with the
 * user's task context. Every run updates lastRunAt/lastStatus/nextRunAt and
 * notifies the user. Failures never kill the cron tick.
 */
@Injectable()
export class AgentJobsService implements OnModuleInit {
  private readonly logger = new Logger(AgentJobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
    private readonly notifications: NotificationsService,
    private readonly scheduler: AgentJobsScheduler,
  ) {}

  async onModuleInit(): Promise<void> {
    const jobs = await this.prisma.agentJob.findMany({
      where: { isActive: true },
    });
    for (const job of jobs) {
      try {
        const nextRunAt = this.scheduler.register(job, () =>
          this.executeJob(job.id),
        );
        await this.prisma.agentJob.update({
          where: { id: job.id },
          data: { nextRunAt },
        });
      } catch (error) {
        this.logger.warn(
          `Failed to register job ${job.id} on boot: ${(error as Error).message}`,
        );
      }
    }
    if (jobs.length > 0) {
      this.logger.log(`Registered ${jobs.length} active agent jobs`);
    }
  }

  async create(userId: string, dto: CreateAgentJobDto) {
    const parsed = parseScheduleNl(dto.scheduleText);
    if (!parsed) {
      throw new BadRequestException(
        `No entendí el horario. ${SCHEDULE_EXAMPLES}`,
      );
    }
    try {
      CronJob.from({ cronTime: parsed.cron, onTick: () => {} });
    } catch {
      throw new BadRequestException(
        `Horario inválido (${parsed.cron}). ${SCHEDULE_EXAMPLES}`,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timezone = dto.timezone ?? user?.timezone ?? 'America/Mexico_City';
    try {
      // Validate cron AND timezone together before persisting: a bad zone
      // must 400 here, never 500 after the row is committed.
      CronJob.from({
        cronTime: parsed.cron,
        onTick: () => {},
        timeZone: timezone,
      });
    } catch {
      throw new BadRequestException(
        `Zona horaria inválida (${timezone}). ${SCHEDULE_EXAMPLES}`,
      );
    }

    const job = await this.prisma.agentJob.create({
      data: {
        userId,
        name: dto.name,
        schedule: parsed.cron,
        timezone,
        taskPrompt: dto.taskPrompt,
        isActive: true,
      },
    });
    const nextRunAt = this.scheduler.register(job, () =>
      this.executeJob(job.id),
    );
    return this.prisma.agentJob.update({
      where: { id: job.id },
      data: { nextRunAt },
    });
  }

  list(userId: string) {
    return this.prisma.agentJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async get(userId: string, id: string) {
    const job = await this.prisma.agentJob.findFirst({
      where: { id, userId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async update(userId: string, id: string, dto: UpdateAgentJobDto) {
    const job = await this.get(userId, id);
    const updated = await this.prisma.agentJob.update({
      where: { id: job.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.taskPrompt !== undefined ? { taskPrompt: dto.taskPrompt } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    if (dto.isActive === false) {
      this.scheduler.unregister(job.id);
    } else if (dto.isActive === true || updated.isActive) {
      const nextRunAt = this.scheduler.register(updated, () =>
        this.executeJob(updated.id),
      );
      return this.prisma.agentJob.update({
        where: { id: job.id },
        data: { nextRunAt },
      });
    }
    return updated;
  }

  async remove(userId: string, id: string): Promise<void> {
    const job = await this.get(userId, id);
    this.scheduler.unregister(job.id);
    await this.prisma.agentJob.delete({ where: { id: job.id } });
  }

  async runNow(userId: string, id: string) {
    const job = await this.get(userId, id);
    return this.executeJob(job.id);
  }

  async executeJob(jobId: string) {
    const job = await this.prisma.agentJob.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    const now = new Date();
    try {
      const result = await this.runPrompt(
        job.userId,
        job.taskPrompt,
        job.timezone,
      );
      const summary = summarize(result);
      const nextRunAt = this.scheduler.isRegistered(job.id)
        ? this.nextDateOf(job)
        : now;
      await this.prisma.agentJob.update({
        where: { id: job.id },
        data: { lastRunAt: now, lastStatus: 'ok', nextRunAt },
      });
      await this.notifications.create({
        userId: job.userId,
        type: 'SYSTEM',
        title: `Job ejecutado: ${job.name}`,
        message: summary,
        metadata: { jobId: job.id },
      });
      return { ok: true as const, summary };
    } catch (error) {
      const message = (error as Error).message.slice(0, 200);
      await this.prisma.agentJob.update({
        where: { id: job.id },
        data: { lastRunAt: now, lastStatus: `error: ${message}` },
      });
      await this.notifications.create({
        userId: job.userId,
        type: 'SYSTEM',
        title: `Falló el job: ${job.name}`,
        message,
        metadata: { jobId: job.id },
      });
      return { ok: false as const, error: message };
    }
  }

  private async runPrompt(
    userId: string,
    taskPrompt: string,
    timezone: string,
  ): Promise<unknown> {
    if (/resumen semanal|weekly summary|resumo semanal/i.test(taskPrompt)) {
      return this.aiService.generateWeeklyReport(userId);
    }
    if (
      /resumen diario|daily summary|resumo di[áa]rio|briefing|shutdown/i.test(
        taskPrompt,
      )
    ) {
      const hour = parseInt(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          hourCycle: 'h23',
          timeZone: timezone,
        }).format(new Date()),
        10,
      );
      return this.aiService.generateDailyReport(
        userId,
        hour < 12 ? 'AM' : 'PM',
      );
    }
    return this.aiService.chat(userId, taskPrompt);
  }

  private nextDateOf(job: { schedule: string; timezone: string }): Date {
    return CronJob.from({
      cronTime: job.schedule,
      onTick: () => {},
      timeZone: job.timezone,
    })
      .nextDate()
      .toJSDate();
  }
}

function summarize(result: unknown): string {
  if (typeof result === 'string') return result.slice(0, 200);
  if (result !== null && typeof result === 'object') {
    const record = result as Record<string, unknown>;
    if (typeof record.summary === 'string') {
      return record.summary.slice(0, 200);
    }
    if (typeof record.message === 'string') {
      return record.message.slice(0, 200);
    }
  }
  return 'Ejecutado correctamente.';
}
