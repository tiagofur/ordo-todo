import { browser } from 'wxt/browser';
import type { TodayTasksResponse } from '@ordo-todo/api-client';
import { apiClient } from './api-client';
import { getSession } from './auth';

const MAX_BADGE = '99';

/** Tareas de hoy sin completar = vencidas + vencen hoy; ni COMPLETED ni CANCELLED. */
export function computeBadgeCount(today: TodayTasksResponse): number {
  const pending = [...today.overdue, ...today.dueToday].filter(
    (task) =>
      task.status !== 'COMPLETED' &&
      task.status !== 'CANCELLED' &&
      !task.completedAt,
  );
  return pending.length;
}

export async function refreshBadge(): Promise<void> {
  try {
    if (!(await getSession())) {
      await browser.action.setBadgeText({ text: '' });
      return;
    }
    const today = await apiClient.getTasksToday();
    const count = computeBadgeCount(today);
    await browser.action.setBadgeBackgroundColor({ color: '#AD46FF' });
    await browser.action.setBadgeText({
      text: count > 0 ? (count > 99 ? MAX_BADGE : String(count)) : '',
    });
  } catch {
    // Sin datos (red, refresh fallido): badge neutro, nunca feedback falso.
    await browser.action.setBadgeText({ text: '' });
  }
}

/** Feedback temporal de la captura contextual: ✓ 5 s (o ! si falló). */
export async function flashBadge(ok: boolean): Promise<void> {
  await browser.action.setBadgeBackgroundColor({ color: ok ? '#16a34a' : '#dc2626' });
  await browser.action.setBadgeText({ text: ok ? '✓' : '!' });
  setTimeout(() => {
    void refreshBadge();
  }, 5000);
}
