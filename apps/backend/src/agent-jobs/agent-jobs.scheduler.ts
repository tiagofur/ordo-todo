import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

export interface SchedulableJob {
  id: string;
  schedule: string;
  timezone: string;
}

/**
 * Thin registry wrapper for agent-job cron ticks (ODD 004 S5).
 *
 * Deliberately knows nothing about AgentJobsService: the service passes the
 * tick callback in, so there is no Nest cycle (service → scheduler only).
 */
@Injectable()
export class AgentJobsScheduler {
  private readonly logger = new Logger(AgentJobsScheduler.name);

  constructor(private readonly registry: SchedulerRegistry) {}

  static jobKey(jobId: string): string {
    return `agent-job:${jobId}`;
  }

  register(job: SchedulableJob, tick: () => Promise<unknown>): Date {
    const name = AgentJobsScheduler.jobKey(job.id);
    this.unregister(job.id);
    const cronJob = CronJob.from({
      cronTime: job.schedule,
      onTick: () => {
        tick().catch((error: Error) =>
          this.logger.error(`Job ${job.id} tick failed: ${error.message}`),
        );
      },
      start: true,
      timeZone: job.timezone,
    });
    this.registry.addCronJob(name, cronJob as never);
    return cronJob.nextDate().toJSDate();
  }

  unregister(jobId: string): void {
    const name = AgentJobsScheduler.jobKey(jobId);
    try {
      if (this.registry.doesExist('cron', name)) {
        this.registry.getCronJob(name).stop();
        this.registry.deleteCronJob(name);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to unregister job ${jobId}: ${(error as Error).message}`,
      );
    }
  }

  isRegistered(jobId: string): boolean {
    return this.registry.doesExist('cron', AgentJobsScheduler.jobKey(jobId));
  }
}
