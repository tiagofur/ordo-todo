import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { CalendarConnectionsService } from './calendar-connections.service';
import {
  CALENDAR_FETCH,
  CALENDAR_REQUEST_TIMEOUT_MS,
} from './calendar.constants';
import type { CalendarFetch } from './calendar.constants';

const defaultFetch: CalendarFetch = async (url, init) => {
  const response = await fetch(url, init);
  return {
    ok: response.ok,
    status: response.status,
    json: () => response.json() as Promise<unknown>,
    text: () => response.text(),
  };
};

export interface PushSettings {
  calendarId?: string;
  completedFormat?: 'prefix' | 'suffix' | 'none';
  onDelete?: 'delete' | 'keep';
}

interface CalendarApi {
  createUrl: (calendarId: string) => string;
  updateUrl: (calendarId: string, eventId: string) => string;
  deleteUrl: (calendarId: string, eventId: string) => string;
  buildBody: (task: {
    title: string;
    description: string | null;
    status: string;
    dueDate: Date;
    id: string;
  }) => Record<string, unknown>;
}

const GOOGLE_API: CalendarApi = {
  createUrl: (calendarId) =>
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  updateUrl: (calendarId, eventId) =>
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
  deleteUrl: (calendarId, eventId) =>
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
  buildBody: (task) => ({
    summary: task.title,
    description: task.description ?? '',
    start: { dateTime: task.dueDate.toISOString() },
    end: { dateTime: task.dueDate.toISOString() },
    extendedProperties: { private: { ordoTaskId: task.id } },
  }),
};

const MICROSOFT_API: CalendarApi = {
  createUrl: (calendarId) =>
    calendarId === 'primary'
      ? 'https://graph.microsoft.com/v1.0/me/events'
      : `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events`,
  updateUrl: (_calendarId, eventId) =>
    `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`,
  deleteUrl: (_calendarId, eventId) =>
    `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`,
  buildBody: (task) => ({
    subject: task.title,
    body: { contentType: 'text', content: task.description ?? '' },
    start: { dateTime: task.dueDate.toISOString(), timeZone: 'UTC' },
    end: { dateTime: task.dueDate.toISOString(), timeZone: 'UTC' },
    singleValueExtendedProperties: [
      {
        id: 'String {00000000-0000-0000-0000-000000000000} Name ordoTaskId',
        value: task.id,
      },
    ],
  }),
};

/**
 * Pushes Ordo tasks to provider calendars (S2).
 *
 * One event per (task, provider, calendar). Settings resolve from the
 * project (`project.settings.calendar`) with integration-level
 * overrides. Completed tasks are marked per `completedFormat`;
 * deletions propagate per `onDelete` (mapping row is always removed).
 */
@Injectable()
export class CalendarPushService {
  private readonly logger = new Logger(CalendarPushService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connections: CalendarConnectionsService,
    @Optional()
    @Inject(CALENDAR_FETCH)
    private readonly doFetch: CalendarFetch = defaultFetch,
  ) {}

  async pushTask(userId: string, taskId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task || task.ownerId !== userId || !task.dueDate) {
      return;
    }
    const datedTask = { ...task, dueDate: task.dueDate };
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isActive: true },
    });
    for (const integration of integrations) {
      if (
        integration.provider !== 'GOOGLE_CALENDAR' &&
        integration.provider !== 'MICROSOFT_CALENDAR'
      ) {
        continue;
      }
      await this.pushToIntegration(userId, datedTask, integration);
    }
  }

  async removeTask(
    userId: string,
    taskId: string,
    overrides: PushSettings = {},
  ): Promise<void> {
    const mappings = await this.prisma.calendarEventMapping.findMany({
      where: { taskId },
    });
    for (const mapping of mappings) {
      if (mapping.userId !== userId) continue;
      const settings = this.resolveSettings({}, overrides);
      if (settings.onDelete === 'delete') {
        try {
          const token = await this.connections.getAccessToken(
            userId,
            mapping.provider as 'GOOGLE_CALENDAR' | 'MICROSOFT_CALENDAR',
          );
          const api = this.apiFor(mapping.provider);
          await this.request(
            api.deleteUrl(mapping.calendarId, mapping.eventId),
            'DELETE',
            token,
            undefined,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to delete provider event ${mapping.eventId}: ${(error as Error).message}`,
          );
        }
      }
      await this.prisma.calendarEventMapping.deleteMany({
        where: { id: mapping.id },
      });
    }
  }

  private async pushToIntegration(
    userId: string,
    task: {
      id: string;
      title: string;
      description: string | null;
      status: string;
      dueDate: Date;
      projectId: string;
      project?: { settings?: unknown } | null;
    },
    integration: {
      id: string;
      provider: string;
      settings?: unknown;
    },
  ): Promise<void> {
    const settings = this.resolveSettings(
      (integration.settings as Record<string, unknown> | null) ?? {},
      ((task.project?.settings as Record<string, unknown> | null)?.calendar ??
        {}) as PushSettings,
    );
    const calendarId = settings.calendarId ?? 'primary';
    const api = this.apiFor(integration.provider);
    const token = await this.connections.getAccessToken(
      userId,
      integration.provider as 'GOOGLE_CALENDAR' | 'MICROSOFT_CALENDAR',
    );

    const title = this.formatTitle(task.title, task.status, settings);
    const body = api.buildBody({
      title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate,
      id: task.id,
    });

    const existing = await this.prisma.calendarEventMapping.findMany({
      where: {
        taskId: task.id,
        provider: integration.provider as never,
        calendarId,
      },
    });
    const mapping = existing[0];

    let eventId: string;
    if (mapping) {
      const updated = await this.request(
        api.updateUrl(calendarId, mapping.eventId),
        integration.provider === 'GOOGLE_CALENDAR' ? 'PATCH' : 'PATCH',
        token,
        body,
      );
      eventId =
        (updated as { id?: string }).id ??
        (updated as { Id?: string }).Id ??
        mapping.eventId;
    } else {
      const created = await this.request(
        api.createUrl(calendarId),
        'POST',
        token,
        body,
      );
      eventId =
        (created as { id?: string }).id ??
        (created as { Id?: string }).Id ??
        '';
      if (!eventId) {
        throw new Error(`Provider returned no event id for task ${task.id}`);
      }
    }

    const hash = createHash('sha256')
      .update(JSON.stringify({ title, due: task.dueDate, status: task.status }))
      .digest('hex');
    await this.prisma.calendarEventMapping.upsert({
      where: {
        taskId_provider_calendarId: {
          taskId: task.id,
          provider: integration.provider as never,
          calendarId,
        },
      },
      update: {
        eventId,
        integrationId: integration.id,
        lastSyncedHash: hash,
        lastSyncedAt: new Date(),
      },
      create: {
        userId,
        taskId: task.id,
        provider: integration.provider as never,
        integrationId: integration.id,
        calendarId,
        eventId,
        lastSyncedHash: hash,
        lastSyncedAt: new Date(),
      },
    });
  }

  private apiFor(provider: string): CalendarApi {
    if (provider === 'MICROSOFT_CALENDAR') return MICROSOFT_API;
    return GOOGLE_API;
  }

  private resolveSettings(
    integrationSettings: Record<string, unknown>,
    overrides: PushSettings,
  ): Required<PushSettings> {
    const merged = { ...integrationSettings, ...overrides } as Record<
      string,
      unknown
    >;
    return {
      calendarId:
        typeof merged.calendarId === 'string' ? merged.calendarId : 'primary',
      completedFormat:
        merged.completedFormat === 'prefix' ||
        merged.completedFormat === 'suffix' ||
        merged.completedFormat === 'none'
          ? merged.completedFormat
          : 'prefix',
      onDelete: merged.onDelete === 'keep' ? 'keep' : 'delete',
    };
  }

  private formatTitle(
    title: string,
    status: string,
    settings: Required<PushSettings>,
  ): string {
    if (status !== 'COMPLETED' || settings.completedFormat === 'none') {
      return title;
    }
    if (settings.completedFormat === 'suffix') {
      return `${title} ✅`;
    }
    return `✅ ${title}`;
  }

  private async request(
    url: string,
    method: string,
    token: string,
    body: Record<string, unknown> | undefined,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      CALENDAR_REQUEST_TIMEOUT_MS,
    );
    try {
      const response = await this.doFetch(url, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: body ? JSON.stringify(body) : '',
        signal: controller.signal,
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `Calendar API ${method} failed with status ${response.status}: ${text.slice(0, 200)}`,
        );
      }
      if (response.status === 204) return {};
      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}
