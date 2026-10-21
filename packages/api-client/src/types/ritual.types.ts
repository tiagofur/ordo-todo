// ODD 006 T5: ritual wire types — mirrors backend RitualService views
// (ritual.service.ts) + DTOs (dto/*.dto.ts). Dates arrive as ISO strings.

import type { DayPlanView } from './task.types';

export type RitualStatus = 'PENDING' | 'DONE' | 'SKIPPED';

export interface RitualDayState {
  morningStatus: RitualStatus;
  morningAt: string | null;
  morningTop3: string[];
  morningPlannedAt: string | null;
  eveningStatus: RitualStatus;
  eveningAt: string | null;
}

export interface RitualOverdueTask {
  taskId: string;
  title: string;
  dueDateKey: string;
}

export interface RitualMorningView {
  plan: DayPlanView;
  overdue: RitualOverdueTask[];
  suggestedTop3: string[];
  ritual: RitualDayState | null;
}

export interface RitualEveningTask {
  taskId: string;
  title: string;
}

export interface RitualEveningView {
  summary: Record<string, unknown> | null;
  completed: RitualEveningTask[];
  pending: RitualEveningTask[];
  ritual: RitualDayState | null;
}

export type RitualMoveDestination = 'tomorrow' | 'date' | 'archived';

export type RitualMoveReason = 'overran' | 'urgent' | 'no-energy' | 'other';

export interface RitualEveningMove {
  taskId: string;
  destination: RitualMoveDestination;
  date?: string;
  reason: RitualMoveReason;
}

export interface RitualEveningComplete {
  shutdownComplete: boolean;
  suggestion: string;
  unmoved: string[];
}

export interface RitualTimeboxBlockInput {
  taskId: string;
  start: string;
  end?: string;
}

export interface RitualTimeboxBlock {
  taskId: string;
  start: string;
  end: string;
}

export interface RitualStreak {
  current: number;
  longest: number;
}
