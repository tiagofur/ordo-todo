"use client";

import { toast } from "sonner";
import {
  DayPlanCard,
  PlanChangesCard,
  RiskAlertsCard,
} from "@ordo-todo/ui";
import { useTasks } from "@/lib/api-hooks";
import type {
  DayPlanBlock,
  DayPlanChange,
} from "@ordo-todo/api-client";
import {
  useApplyDayPlan,
  useDayPlan,
  useDayPlanRisks,
  useDismissDayPlan,
  useToggleFreezeDayPlan,
} from "@/hooks/use-day-plan";

interface DayPlanSectionLabels {
  loading: string;
  loadError: string;
  retry: string;
  title: string;
  planEmpty: string;
  planFrozen: string;
  planFreeze: string;
  planUnfreeze: string;
  changesTitle: string;
  changesEmpty: string;
  changesAccept: string;
  changesReject: string;
  changeMoved: string;
  changeAdded: string;
  changeRemoved: string;
  changeResized: string;
  risksTitle: string;
  risksEmpty: string;
  applied: string;
  applyError: string;
  dismissed: string;
  dismissError: string;
  freezeError: string;
}

/**
 * "Mi plan de hoy" container (ODD 005 S6). Fetches the day plan,
 * resolves task titles, wires the presentational scheduling cards.
 * Risks degrade gracefully (no card) until T4b lands. Labels injected
 * for testability (page passes next-intl strings).
 */
export function DayPlanSection({ labels }: { labels: DayPlanSectionLabels }) {
  const { data: plan, isLoading, isError, refetch } = useDayPlan();
  const { data: risks } = useDayPlanRisks();
  const { data: tasks } = useTasks();
  const applyPlan = useApplyDayPlan();
  const dismissPlan = useDismissDayPlan();
  const toggleFreeze = useToggleFreezeDayPlan();

  const titles = new Map(
    (tasks ?? []).map((task) => [task.id, task.title] as const),
  );
  const titleOf = (taskId: string): string =>
    titles.get(taskId) ?? taskId;

  const handleAccept = () => {
    if (!plan) return;
    applyPlan.mutate(plan.proposalId, {
      onSuccess: () => toast.success(labels.applied),
      onError: () => toast.error(labels.applyError),
    });
  };

  const handleReject = () => {
    if (!plan) return;
    dismissPlan.mutate(plan.proposalId, {
      onSuccess: () => toast.success(labels.dismissed),
      onError: () => toast.error(labels.dismissError),
    });
  };

  const handleToggleFreeze = (taskId: string, freeze: boolean) => {
    toggleFreeze.mutate(
      { taskId, freeze },
      { onError: () => toast.error(labels.freezeError) },
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{labels.loading}</p>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
        <p className="text-sm text-muted-foreground">{labels.loadError}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 cursor-pointer"
        >
          {labels.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DayPlanCard
        blocks={plan.blocks.map((block: DayPlanBlock) => ({
          taskId: block.taskId,
          title: titleOf(block.taskId),
          start: block.start,
          end: block.end,
          reason: block.reason,
        }))}
        frozenTaskIds={plan.frozenTaskIds}
        labels={{
          title: labels.title,
          empty: labels.planEmpty,
          frozen: labels.planFrozen,
          freeze: labels.planFreeze,
          unfreeze: labels.planUnfreeze,
        }}
        onToggleFreeze={handleToggleFreeze}
      />
      <div className="space-y-6">
        <PlanChangesCard
          changes={plan.changes.map((change: DayPlanChange) => ({
            taskId: change.taskId,
            title: titleOf(change.taskId),
            type: change.type,
            from: change.from,
            to: change.to,
            reason: change.reason,
          }))}
          labels={{
            title: labels.changesTitle,
            empty: labels.changesEmpty,
            accept: labels.changesAccept,
            reject: labels.changesReject,
            moved: labels.changeMoved,
            added: labels.changeAdded,
            removed: labels.changeRemoved,
            resized: labels.changeResized,
          }}
          onAccept={handleAccept}
          onReject={handleReject}
        />
        {risks && risks.length > 0 && (
          <RiskAlertsCard
            risks={risks}
            labels={{
              title: labels.risksTitle,
              empty: labels.risksEmpty,
            }}
            onSelectOption={() => undefined}
          />
        )}
      </div>
    </div>
  );
}
