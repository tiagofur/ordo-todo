import type {
  MeetingActionItem,
  MeetingAnalysis,
  MeetingDecision,
  MeetingParticipant,
  MeetingTopic,
} from './types/meeting.types';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const SENTIMENTS = ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED'] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeActionItem(item: unknown): MeetingActionItem {
  if (typeof item === 'string') {
    return { title: item, priority: 'MEDIUM', context: '' };
  }
  const r = asRecord(item) ?? {};
  const priority = asString(r.priority);
  return {
    title: asString(r.title) || asString(r.action) || 'Untitled Task',
    description: typeof r.description === 'string' ? r.description : undefined,
    assignee: typeof r.assignee === 'string' ? r.assignee : undefined,
    dueDate: typeof r.dueDate === 'string' ? r.dueDate : undefined,
    priority: (PRIORITIES as readonly string[]).includes(priority)
      ? (priority as MeetingActionItem['priority'])
      : 'MEDIUM',
    context: asString(r.context),
  };
}

function normalizeDecision(item: unknown): MeetingDecision {
  if (typeof item === 'string') {
    return { decision: item, context: '' };
  }
  const r = asRecord(item) ?? {};
  return {
    decision: asString(r.decision),
    context: asString(r.context),
    participants: Array.isArray(r.participants)
      ? r.participants.filter((p): p is string => typeof p === 'string')
      : undefined,
  };
}

function normalizeParticipant(item: unknown): MeetingParticipant {
  if (typeof item === 'string') {
    return { name: item };
  }
  const r = asRecord(item) ?? {};
  return {
    name: asString(r.name),
    role: typeof r.role === 'string' ? r.role : undefined,
    speakingTime: typeof r.speakingTime === 'number' ? r.speakingTime : undefined,
  };
}

function normalizeTopic(item: unknown): MeetingTopic {
  if (typeof item === 'string') {
    return { topic: item, summary: '' };
  }
  const r = asRecord(item) ?? {};
  return {
    topic: asString(r.topic),
    duration: typeof r.duration === 'number' ? r.duration : undefined,
    summary: asString(r.summary),
  };
}

/**
 * Coerce an AI meeting analysis into the canonical contract. Model output
 * drifts (bare strings, off-union priorities, missing objects, non-arrays):
 * this normalizes every variant instead of casting, so renderers can rely
 * on the shape. Never throws.
 */
export function normalizeMeetingAnalysis(input: unknown): MeetingAnalysis {
  const r = asRecord(input) ?? {};
  const sentiment = asString(r.sentiment);
  return {
    summary: asString(r.summary),
    keyPoints: asArray(r.keyPoints).filter(
      (p): p is string => typeof p === 'string',
    ),
    actionItems: asArray(r.actionItems).map(normalizeActionItem),
    decisions: asArray(r.decisions).map(normalizeDecision),
    participants: asArray(r.participants).map(normalizeParticipant),
    topics: asArray(r.topics).map(normalizeTopic),
    sentiment: (SENTIMENTS as readonly string[]).includes(sentiment)
      ? (sentiment as MeetingAnalysis['sentiment'])
      : 'NEUTRAL',
  };
}
