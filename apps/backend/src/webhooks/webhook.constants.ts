export const WEBHOOK_SECRET_PREFIX = 'ordo_whsec_';

export const WEBHOOK_FETCH = Symbol('WEBHOOK_FETCH');

export type WebhookFetch = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal?: AbortSignal;
  },
) => Promise<{ ok: boolean; status: number }>;

export const WEBHOOK_EVENTS = [
  'task.created',
  'task.updated',
  'task.completed',
  'task.deleted',
  'project.created',
  'project.updated',
  'comment.created',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const WEBHOOK_MAX_ATTEMPTS = 8;

export const WEBHOOK_REQUEST_TIMEOUT_MS = 10_000;

export function webhookRetryDelayMs(attempt: number): number {
  const capped = Math.min(attempt, WEBHOOK_MAX_ATTEMPTS);
  return Math.min(60_000 * 2 ** capped, 6 * 3600 * 1000);
}
