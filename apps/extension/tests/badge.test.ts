import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { computeBadgeCount, refreshBadge } from '../src/lib/badge';
import type { TodayTasksResponse } from '@ordo-todo/api-client';

// apiClient usa axios: se mockea el módulo entero (el fetch no lo intercepta).
vi.mock('../src/lib/api-client', () => ({
  apiClient: { getTasksToday: vi.fn() },
}));

import { apiClient } from '../src/lib/api-client';

const task = (id: string, status: string, completedAt: Date | null = null) =>
  ({ id, title: `t-${id}`, status, completedAt, projectId: null }) as never;

const today = (overdue: never[], dueToday: never[]): TodayTasksResponse =>
  ({ overdue, dueToday, scheduledToday: [], available: [], notYetAvailable: [] }) as never;

describe('computeBadgeCount (ODD 024 S4)', () => {
  it('cuenta vencidas + de hoy sin completar', () => {
    const count = computeBadgeCount(
      today(
        [task('1', 'TODO'), task('2', 'COMPLETED')] as never[],
        [task('3', 'IN_PROGRESS'), task('4', 'CANCELLED')] as never[],
      ),
    );
    expect(count).toBe(2);
  });

  it('completedAt también descuenta aunque el status no lo diga', () => {
    const count = computeBadgeCount(
      today([task('1', 'TODO', new Date())] as never[], [] as never[]),
    );
    expect(count).toBe(0);
  });
});

describe('refreshBadge (ODD 024 S4)', () => {
  beforeEach(async () => {
    await fakeBrowser.reset();
    vi.mocked(apiClient.getTasksToday).mockReset();
  });

  it('sin sesión limpia el badge', async () => {
    await refreshBadge();
    expect(await fakeBrowser.action.getBadgeText({})).toBe('');
  });

  it('con sesión pone el número de pendientes (cap 99)', async () => {
    await fakeBrowser.storage.session.set({
      ordoTokens: {
        accessToken: 'a',
        refreshToken: 'r',
        expiresAt: Date.now() + 3600_000,
        scope: 'x',
      },
      ordoSession: { email: 'o@r.do' },
    });
    vi.mocked(apiClient.getTasksToday).mockResolvedValue(
      today(
        Array.from({ length: 120 }, (_, i) => task(`o${i}`, 'TODO')) as never[],
        [] as never[],
      ),
    );

    await refreshBadge();

    expect(await fakeBrowser.action.getBadgeText({})).toBe('99');
  });

  it('error de API → badge neutro, nunca feedback falso', async () => {
    await fakeBrowser.storage.session.set({
      ordoTokens: {
        accessToken: 'a',
        refreshToken: 'r',
        expiresAt: Date.now() + 3600_000,
        scope: 'x',
      },
      ordoSession: { email: 'o@r.do' },
    });
    vi.mocked(apiClient.getTasksToday).mockRejectedValue(new Error('down'));

    await refreshBadge();

    expect(await fakeBrowser.action.getBadgeText({})).toBe('');
  });
});
