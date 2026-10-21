"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  EveningRitualCard,
  MorningRitualCard,
  StreakCard,
  TimeboxCard,
  type RitualEveningMove as CardMove,
  type TimeboxCardBlock,
  type TimeboxCardTask,
} from "@ordo-todo/ui";
import { useTasks } from "@/lib/api-hooks";
import type { RitualEveningMove } from "@ordo-todo/api-client";
import {
  useAcceptTimebox,
  useCompleteEvening,
  useCompleteMorning,
  useEveningRitual,
  useMorningRitual,
  useSaveTimebox,
  useSkipEvening,
  useSkipMorning,
  useStreak,
} from "@/hooks/use-ritual";

interface RitualSectionLabels {
  loading: string;
  loadError: string;
  retry: string;
  morningTitle: string;
  morningPlanTitle: string;
  morningPlanEmpty: string;
  morningOverdueTitle: string;
  morningOverdueEmpty: string;
  morningTop3Title: string;
  morningTop3Hint: string;
  morningComplete: string;
  morningSkip: string;
  morningCompleted: string;
  morningSkipped: string;
  morningDone: string;
  morningError: string;
  morningSkippedToast: string;
  eveningTitle: string;
  eveningSummaryTitle: string;
  eveningSummaryEmpty: string;
  eveningCompletedTitle: string;
  eveningCompletedEmpty: string;
  eveningPendingTitle: string;
  eveningPendingEmpty: string;
  eveningTomorrow: string;
  eveningDate: string;
  eveningArchived: string;
  eveningOverran: string;
  eveningUrgent: string;
  eveningNoEnergy: string;
  eveningOther: string;
  eveningComplete: string;
  eveningSkip: string;
  eveningCompleted: string;
  eveningSkipped: string;
  eveningShutdown: string;
  eveningDone: string;
  eveningError: string;
  eveningSkippedToast: string;
  eveningUnmoved: string;
  eveningDatePlaceholder: string;
  timeboxTitle: string;
  timeboxEmpty: string;
  timeboxStart: string;
  timeboxEnd: string;
  timeboxSave: string;
  timeboxAccept: string;
  timeboxSaved: string;
  timeboxError: string;
  streakTitle: string;
  streakDays: string;
  streakBest: string;
  streakNext: string;
  streakReached: string;
  streakEmpty: string;
}

/**
 * Daily-ritual container (ODD 006 T5). Fetches morning/evening/streak,
 * resolves task titles, wires the presentational ritual cards.
 * Labels injected for testability (page passes next-intl strings).
 */
export function RitualSection({ labels }: { labels: RitualSectionLabels }) {
  const { data: morning, isLoading, isError, refetch } = useMorningRitual();
  const {
    data: evening,
    isLoading: eveningLoading,
    isError: eveningError,
    refetch: refetchEvening,
  } = useEveningRitual();
  const { data: streak } = useStreak();
  const { data: tasks } = useTasks();
  const completeMorning = useCompleteMorning();
  const skipMorning = useSkipMorning();
  const completeEvening = useCompleteEvening();
  const skipEvening = useSkipEvening();
  const saveTimebox = useSaveTimebox();
  const acceptTimebox = useAcceptTimebox();
  const [shutdownSuggestion, setShutdownSuggestion] = useState<string | undefined>();

  const titles = useMemo(
    () => new Map((tasks ?? []).map((task) => [task.id, task.title] as const)),
    [tasks],
  );
  const titleOf = (taskId: string): string => titles.get(taskId) ?? taskId;

  const morningStatus = morning?.ritual?.morningStatus ?? "PENDING";
  const eveningStatus = evening?.ritual?.eveningStatus ?? "PENDING";
  const top3: TimeboxCardTask[] = useMemo(() => {
    const ids = morning?.ritual?.morningTop3 ?? [];
    const blocks = new Map(
      (morning?.plan.blocks ?? []).map((b) => [b.taskId, b] as const),
    );
    return ids.map((taskId) => {
      const block = blocks.get(taskId);
      return {
        taskId,
        title: titleOf(taskId),
        start: block?.start ?? "",
        end: block?.end ?? "",
      };
    });
  }, [morning, titles]);

  const handleCompleteMorning = (top3Ids: string[]) => {
    completeMorning.mutate(top3Ids, {
      onSuccess: () => toast.success(labels.morningDone),
      onError: () => toast.error(labels.morningError),
    });
  };

  const handleSkipMorning = () => {
    skipMorning.mutate(undefined, {
      onSuccess: () => toast.success(labels.morningSkippedToast),
      onError: () => toast.error(labels.morningError),
    });
  };

  const handleCompleteEvening = (moves: CardMove[]) => {
    completeEvening.mutate(moves as RitualEveningMove[], {
      onSuccess: (result) => {
        setShutdownSuggestion(result.suggestion);
        toast.success(labels.eveningDone);
        // Partial closes are allowed: surface unmoved pendings explicitly
        // instead of silently dropping them (backend reports them).
        if (result.unmoved.length > 0) {
          toast.warning(
            `${labels.eveningUnmoved}: ${result.unmoved.map(titleOf).join(', ')}`,
          );
        }
      },
      onError: () => toast.error(labels.eveningError),
    });
  };

  const handleSkipEvening = () => {
    skipEvening.mutate(undefined, {
      onSuccess: () => toast.success(labels.eveningSkippedToast),
      onError: () => toast.error(labels.eveningError),
    });
  };

  const handleSaveTimebox = (blocks: TimeboxCardBlock[]) => {
    saveTimebox.mutate(blocks, {
      onSuccess: () => toast.success(labels.timeboxSaved),
      onError: () => toast.error(labels.timeboxError),
    });
  };

  const handleAcceptTimebox = () => {
    acceptTimebox.mutate(undefined, {
      onSuccess: () => toast.success(labels.timeboxSaved),
      onError: () => toast.error(labels.timeboxError),
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">{labels.loading}</p>
      </div>
    );
  }

  if (isError || !morning) {
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
      <div className="space-y-6">
        <MorningRitualCard
          planBlocks={morning.plan.blocks.map((block) => ({
            taskId: block.taskId,
            title: titleOf(block.taskId),
            start: block.start,
            end: block.end,
            reason: block.reason,
          }))}
          overdue={morning.overdue}
          suggestedTop3={morning.suggestedTop3}
          status={morningStatus}
          labels={{
            title: labels.morningTitle,
            planTitle: labels.morningPlanTitle,
            planEmpty: labels.morningPlanEmpty,
            overdueTitle: labels.morningOverdueTitle,
            overdueEmpty: labels.morningOverdueEmpty,
            top3Title: labels.morningTop3Title,
            top3Hint: labels.morningTop3Hint,
            complete: labels.morningComplete,
            skip: labels.morningSkip,
            completed: labels.morningCompleted,
            skipped: labels.morningSkipped,
          }}
          onComplete={handleCompleteMorning}
          onSkip={handleSkipMorning}
        />
        <TimeboxCard
          top3={morningStatus === "DONE" ? top3 : []}
          labels={{
            title: labels.timeboxTitle,
            empty: labels.timeboxEmpty,
            startLabel: labels.timeboxStart,
            endLabel: labels.timeboxEnd,
            save: labels.timeboxSave,
            acceptProposal: labels.timeboxAccept,
          }}
          onSave={handleSaveTimebox}
          onAcceptProposal={handleAcceptTimebox}
        />
      </div>
      <div className="space-y-6">
        {eveningLoading || !evening ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {eveningError ? labels.loadError : labels.loading}
            </p>
            {eveningError && (
              <button
                type="button"
                onClick={() => refetchEvening()}
                className="mt-3 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 cursor-pointer"
              >
                {labels.retry}
              </button>
            )}
          </div>
        ) : (
          <EveningRitualCard
          summary={eveningSummary(evening?.summary)}
          completed={(evening?.completed ?? []).map((t) => ({
            taskId: t.taskId,
            title: titleOf(t.taskId),
          }))}
          pending={(evening?.pending ?? []).map((t) => ({
            taskId: t.taskId,
            title: titleOf(t.taskId),
          }))}
          status={eveningStatus}
          shutdownComplete={eveningStatus === "DONE"}
          shutdownSuggestion={shutdownSuggestion}
          labels={{
            title: labels.eveningTitle,
            summaryTitle: labels.eveningSummaryTitle,
            summaryEmpty: labels.eveningSummaryEmpty,
            completedTitle: labels.eveningCompletedTitle,
            completedEmpty: labels.eveningCompletedEmpty,
            pendingTitle: labels.eveningPendingTitle,
            pendingEmpty: labels.eveningPendingEmpty,
            destinationTomorrow: labels.eveningTomorrow,
            destinationDate: labels.eveningDate,
            destinationArchived: labels.eveningArchived,
            reasonOverran: labels.eveningOverran,
            reasonUrgent: labels.eveningUrgent,
            reasonNoEnergy: labels.eveningNoEnergy,
            reasonOther: labels.eveningOther,
            complete: labels.eveningComplete,
            skip: labels.eveningSkip,
            completed: labels.eveningCompleted,
            skipped: labels.eveningSkipped,
            shutdown: labels.eveningShutdown,
            datePlaceholder: labels.eveningDatePlaceholder,
          }}
          onComplete={handleCompleteEvening}
          onSkip={handleSkipEvening}
        />
        )}
        {streak && (
          <StreakCard
            current={streak.current}
            longest={streak.longest}
            milestones={[7, 30, 100]}
            labels={{
              title: labels.streakTitle,
              days: labels.streakDays,
              best: labels.streakBest,
              nextMilestone: labels.streakNext,
              milestoneReached: labels.streakReached,
              empty: labels.streakEmpty,
            }}
          />
        )}
      </div>
    </div>
  );
}

/** The PM summary is an opaque report object; show its headline text. */
function eveningSummary(summary: Record<string, unknown> | null | undefined): string | null {
  if (!summary) return null;
  const headline = summary.headline ?? summary.summary ?? summary.text;
  return typeof headline === "string" ? headline : null;
}
