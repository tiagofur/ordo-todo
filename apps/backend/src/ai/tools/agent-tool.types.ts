/**
 * Agent tool types (ODD 004 S3).
 *
 * GOLDEN MCP RULE (see ODD 004 "Fuera de alcance"): every tool carries a
 * human `description` and plain-JSON args so the shape is future-exposable
 * as an MCP tool. MCP itself is out of scope — this is shape discipline
 * only, no MCP code here.
 */

export type AgentToolName =
  | 'create_task'
  | 'update_task'
  | 'complete_task'
  | 'create_project'
  | 'schedule_block';

/** Names in a stable order for `@IsIn()` validation and docs. */
export const AGENT_TOOL_NAMES: readonly AgentToolName[] = [
  'create_task',
  'update_task',
  'complete_task',
  'create_project',
  'schedule_block',
];

/** Max steps per plan: anti-abuse cap (mirrored in ProposePlanDto). */
export const MAX_PLAN_STEPS = 20;

/** Plans with more steps than this always require confirmation. */
export const CONFIRMATION_STEP_THRESHOLD = 3;

export interface AgentToolCall {
  tool: AgentToolName;
  args: Record<string, unknown>;
}

export interface AgentPlanStep extends AgentToolCall {
  /** Human description, e.g. "Crear tarea 'X' en proyecto Y". */
  description: string;
}

export interface AgentPlan {
  planId: string;
  steps: AgentPlanStep[];
  requiresConfirmation: boolean;
  /** Human reason, e.g. "5 acciones superan el límite de 3". */
  reason: string;
}

export interface AgentExecuteStepResult {
  step: number;
  tool: AgentToolName;
  ok: boolean;
  result?: unknown;
  error?: string;
}

export interface AgentExecuteResult {
  planId: string;
  executed: AgentExecuteStepResult[];
}

/**
 * Pure confirmation policy (spec-literal S3): confirmation is required for
 * destructive actions or massive plans (>3 ítems = steps).
 *
 * - Destructive = `update_task` with `status: 'CANCELLED'`.
 * - Massive = more than CONFIRMATION_STEP_THRESHOLD steps.
 *
 * `complete_task` is NOT destructive (reversible via update_task).
 * MVP tools take a single id each (no bulk), so "massiva" can only come
 * from the step count — documented here by design.
 *
 * The server re-derives this on execute and NEVER trusts a client flag.
 */
export function planRequiresConfirmation(calls: AgentToolCall[]): boolean {
  if (calls.length > CONFIRMATION_STEP_THRESHOLD) {
    return true;
  }
  return calls.some(
    (call) => call.tool === 'update_task' && call.args?.status === 'CANCELLED',
  );
}

/** Human reason matching `planRequiresConfirmation` — always set. */
export function planReason(calls: AgentToolCall[]): string {
  const destructive = calls.find(
    (call) => call.tool === 'update_task' && call.args?.status === 'CANCELLED',
  );
  if (destructive) {
    return 'el plan incluye cancelar una tarea (acción destructiva)';
  }
  if (calls.length > CONFIRMATION_STEP_THRESHOLD) {
    return (
      `${calls.length} acciones superan el límite de ` +
      `${CONFIRMATION_STEP_THRESHOLD} sin confirmación`
    );
  }
  if (calls.length === 1) {
    return 'acción única de bajo riesgo';
  }
  return `${calls.length} acciones de bajo riesgo`;
}
