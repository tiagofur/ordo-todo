import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CalendarConnectionsService } from './calendar-connections.service';
import { V1TasksService } from '../v1/v1-tasks.service';
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

interface NormalizedEvent {
  id: string;
  calendarId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  isOrdoEcho: boolean;
}

export interface PullResult {
  integrations: number;
  blocks: number;
  tasks: number;
}

/**
 * Pulls provider calendars into Ordo (S3).
 *
 * External events become `ExternalCalendarBlock` rows ("busy" info for
 * scheduling, consumed by ODD 005). They NEVER become tasks unless the
 * user explicitly opts in (`importAsTasks` + `importProjectId`).
 * Events created by Ordo itself are skipped (echo prevention) via the
 * mapping table and the `ordoTaskId` extended property.
 */
@Injectable()
export class CalendarPullService {
  private readonly logger = new Logger(CalendarPullService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connections: CalendarConnectionsService,
    private readonly v1Tasks: V1TasksService,
    @Optional()
    @Inject(CALENDAR_FETCH)
    private readonly doFetch: CalendarFetch = defaultFetch,
  ) {}

  async pullUser(userId: string): Promise<PullResult> {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId, isActive: true },
    });
    const result: PullResult = { integrations: 0, blocks: 0, tasks: 0 };
    for (const integration of integrations) {
      if (
        integration.provider !== 'GOOGLE_CALENDAR' &&
        integration.provider !== 'MICROSOFT_CALENDAR'
      ) {
        continue;
      }
      result.integrations += 1;
      const partial = await this.pullIntegration(userId, integration as never);
      result.blocks += partial.blocks;
      result.tasks += partial.tasks;
    }
    return result;
  }

  async listBlocks(userId: string, from: Date, to: Date) {
    return this.prisma.externalCalendarBlock.findMany({
      where: {
        userId,
        startAt: { lt: to },
        endAt: { gt: from },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  private async pullIntegration(
    userId: string,
    integration: {
      id: string;
      provider: string;
      settings?: unknown;
    },
  ): Promise<{ blocks: number; tasks: number }> {
    const settings = (integration.settings ?? {}) as Record<string, unknown>;
    const calendarId =
      typeof settings.calendarId === 'string' ? settings.calendarId : 'primary';
    const token = await this.connections.getAccessToken(
      userId,
      integration.provider as 'GOOGLE_CALENDAR' | 'MICROSOFT_CALENDAR',
    );
    const events = await this.fetchEvents(
      integration.provider,
      calendarId,
      token,
    );

    const mappings = await this.prisma.calendarEventMapping.findMany({
      where: { integrationId: integration.id },
    });
    const ordoEventIds = new Set(mappings.map((mapping) => mapping.eventId));

    let blocks = 0;
    let tasks = 0;
    for (const event of events) {
      if (ordoEventIds.has(event.id) || event.isOrdoEcho) {
        continue;
      }
      await this.prisma.externalCalendarBlock.upsert({
        where: {
          integrationId_calendarId_eventId: {
            integrationId: integration.id,
            calendarId: event.calendarId,
            eventId: event.id,
          },
        },
        update: {
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
        },
        create: {
          userId,
          provider: integration.provider as never,
          integrationId: integration.id,
          calendarId: event.calendarId,
          eventId: event.id,
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
        },
      });
      blocks += 1;

      if (
        settings.importAsTasks === true &&
        typeof settings.importProjectId === 'string'
      ) {
        await this.v1Tasks.create(userId, {
          title: event.title,
          projectId: settings.importProjectId,
          description: `Imported from calendar event on ${event.startAt.toISOString()}`,
        } as never);
        tasks += 1;
      }
    }

    return { blocks, tasks };
  }

  private async fetchEvents(
    provider: string,
    calendarId: string,
    token: string,
  ): Promise<NormalizedEvent[]> {
    if (provider === 'MICROSOFT_CALENDAR') {
      return this.fetchMicrosoftEvents(calendarId, token);
    }
    return this.fetchGoogleEvents(calendarId, token);
  }

  private async fetchGoogleEvents(
    calendarId: string,
    token: string,
  ): Promise<NormalizedEvent[]> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: windowEnd.toISOString(),
      singleEvents: 'true',
      maxResults: '250',
      orderBy: 'startTime',
    });
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;
    const payload = (await this.get(url, token)) as {
      items?: {
        id?: string;
        status?: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        extendedProperties?: { private?: { ordoTaskId?: string } };
      }[];
    };

    const events: NormalizedEvent[] = [];
    for (const item of payload.items ?? []) {
      if (!item.id || item.status === 'cancelled') continue;
      const start = item.start?.dateTime;
      const end = item.end?.dateTime;
      if (!start || !end) continue;
      events.push({
        id: item.id,
        calendarId,
        title: item.summary ?? '(no title)',
        startAt: new Date(start),
        endAt: new Date(end),
        isOrdoEcho: Boolean(item.extendedProperties?.private?.ordoTaskId),
      });
    }
    return events;
  }

  private async fetchMicrosoftEvents(
    calendarId: string,
    token: string,
  ): Promise<NormalizedEvent[]> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    const base =
      calendarId === 'primary'
        ? 'https://graph.microsoft.com/v1.0/me/calendarview'
        : `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/calendarview`;
    const params = new URLSearchParams({
      startDateTime: now.toISOString(),
      endDateTime: windowEnd.toISOString(),
      $top: '100',
      $orderby: 'start/dateTime',
    });
    const payload = (await this.get(`${base}?${params.toString()}`, token)) as {
      value?: {
        id?: string;
        subject?: string;
        isCancelled?: boolean;
        isAllDay?: boolean;
        start?: { dateTime?: string };
        end?: { dateTime?: string };
        singleValueExtendedProperties?: { id?: string; value?: string }[];
      }[];
    };

    const events: NormalizedEvent[] = [];
    for (const item of payload.value ?? []) {
      if (!item.id || item.isCancelled || item.isAllDay) continue;
      const start = item.start?.dateTime;
      const end = item.end?.dateTime;
      if (!start || !end) continue;
      const isOrdoEcho = (item.singleValueExtendedProperties ?? []).some(
        (prop) => prop.id?.includes('ordoTaskId'),
      );
      events.push({
        id: item.id,
        calendarId,
        title: item.subject ?? '(no title)',
        startAt: new Date(start),
        endAt: new Date(end),
        isOrdoEcho,
      });
    }
    return events;
  }

  private async get(url: string, token: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      CALENDAR_REQUEST_TIMEOUT_MS,
    );
    try {
      const response = await this.doFetch(url, {
        method: 'GET',
        headers: { authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `Calendar API GET failed with status ${response.status}: ${text.slice(0, 200)}`,
        );
      }
      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }
}
