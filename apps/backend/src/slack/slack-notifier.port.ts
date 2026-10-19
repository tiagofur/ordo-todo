export const SLACK_NOTIFIER = Symbol('SLACK_NOTIFIER');

export interface SlackNotificationInput {
  userId: string;
  type: string;
  title: string;
  message?: string;
  resourceId?: string;
  resourceType?: string;
}

/**
 * Port implemented by `SlackNotifierService` (SlackModule) and injected
 * optionally into `NotificationsService`. Keeps the notifications module
 * decoupled from Slack: no import cycle, no new dependencies.
 */
export interface SlackNotifier {
  notify(input: SlackNotificationInput): Promise<void>;
}
