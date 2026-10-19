import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../database/prisma.service';

export interface RemoteEventState {
  title: string;
  dueDate: Date;
  status: string;
  updatedAt: Date;
}

export interface ConflictDetection {
  conflict: boolean;
  localChanged: boolean;
  remoteChanged: boolean;
  winner: 'local' | 'remote' | 'none';
  details?: {
    taskId: string;
    eventId: string;
    localUpdatedAt: Date;
    remoteUpdatedAt: Date;
  };
}

export interface AccountSyncStatus {
  provider: string;
  status: 'ok' | 'error' | 're-auth-required' | 'never-synced';
  email: string | null;
  lastSyncAt: Date | null;
  conflicts: unknown[];
}

/**
 * Detects two-sided edits between Ordo tasks and provider events (S4).
 *
 * Compares the live state of each side against `lastSyncedHash`
 * (written by the push service on every sync). Last-write-wins by
 * `updatedAt`, with the conflict recorded in the integration settings
 * log so the UI can show it and offer manual resolution.
 */
@Injectable()
export class CalendarConflictsService {
  private readonly logger = new Logger(CalendarConflictsService.name);

  constructor(private readonly prisma: PrismaService) {}

  hashOf(title: string, due: Date, status: string): string {
    return createHash('sha256')
      .update(
        JSON.stringify({
          title,
          due: due instanceof Date ? due.toISOString() : due,
          status,
        }),
      )
      .digest('hex');
  }

  async detect(
    userId: string,
    mapping: {
      taskId: string;
      eventId: string;
      lastSyncedHash: string | null;
    },
    remote: RemoteEventState,
  ): Promise<ConflictDetection> {
    void userId;
    const task = await this.prisma.task.findUnique({
      where: { id: mapping.taskId },
    });
    if (!task || !task.dueDate || !mapping.lastSyncedHash) {
      return {
        conflict: false,
        localChanged: false,
        remoteChanged: false,
        winner: 'none',
      };
    }

    const localHash = this.hashOf(task.title, task.dueDate, task.status);
    const remoteHash = this.hashOf(remote.title, remote.dueDate, remote.status);
    const localChanged = localHash !== mapping.lastSyncedHash;
    const remoteChanged = remoteHash !== mapping.lastSyncedHash;

    if (!localChanged && !remoteChanged) {
      return { conflict: false, localChanged, remoteChanged, winner: 'none' };
    }
    if (localChanged && !remoteChanged) {
      return { conflict: false, localChanged, remoteChanged, winner: 'local' };
    }
    if (!localChanged && remoteChanged) {
      return { conflict: false, localChanged, remoteChanged, winner: 'remote' };
    }

    const taskUpdatedAt =
      task.updatedAt instanceof Date
        ? task.updatedAt
        : new Date(task.updatedAt);
    const winner = remote.updatedAt > taskUpdatedAt ? 'remote' : 'local';
    this.logger.warn(
      `Calendar conflict on task ${mapping.taskId} (event ${mapping.eventId}): both sides changed, ${winner} wins`,
    );
    return {
      conflict: true,
      localChanged,
      remoteChanged,
      winner,
      details: {
        taskId: mapping.taskId,
        eventId: mapping.eventId,
        localUpdatedAt: taskUpdatedAt,
        remoteUpdatedAt: remote.updatedAt,
      },
    };
  }

  async recordConflict(
    userId: string,
    integrationId: string,
    details: { taskId: string; eventId: string; winner: string },
  ): Promise<void> {
    void userId;
    const integrations = await this.prisma.userIntegration.findMany({
      where: { id: integrationId } as never,
    });
    const current = (integrations[0]?.settings ?? {}) as Record<
      string,
      unknown
    >;
    const conflicts = Array.isArray(current.conflicts) ? current.conflicts : [];
    await this.prisma.userIntegration.update({
      where: { id: integrationId },
      data: {
        settings: {
          ...current,
          conflicts: [
            ...conflicts.slice(-19),
            { ...details, at: new Date().toISOString() },
          ],
        },
      },
    });
  }

  async accountStatus(userId: string): Promise<AccountSyncStatus[]> {
    const integrations = await this.prisma.userIntegration.findMany({
      where: { userId },
    });
    return integrations.map((integration) => {
      const settings = (integration.settings ?? {}) as Record<string, unknown>;
      let status: AccountSyncStatus['status'] = 'ok';
      if (settings.status === 're-auth-required') {
        status = 're-auth-required';
      } else if (settings.status === 'error') {
        status = 'error';
      } else if (!integration.lastSyncAt) {
        status = 'never-synced';
      }
      return {
        provider: integration.provider,
        status,
        email: integration.providerEmail,
        lastSyncAt: integration.lastSyncAt,
        conflicts: Array.isArray(settings.conflicts) ? settings.conflicts : [],
      };
    });
  }
}
