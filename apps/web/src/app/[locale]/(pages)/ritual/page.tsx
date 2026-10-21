"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { Sunrise } from "lucide-react";
import { useTranslations } from "next-intl";
import { RitualSection } from "@/components/ritual/ritual-section";

/** Daily-ritual route (ODD 006 T5). Thin page: header + container. */
export default function RitualPage() {
  const t = useTranslations("Ritual");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm shadow-amber-500/25 shrink-0">
            <Sunrise className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <RitualSection
          labels={{
            loading: t("loading"),
            loadError: t("loadError"),
            retry: t("retry"),
            morningTitle: t("morning.title"),
            morningPlanTitle: t("morning.planTitle"),
            morningPlanEmpty: t("morning.planEmpty"),
            morningOverdueTitle: t("morning.overdueTitle"),
            morningOverdueEmpty: t("morning.overdueEmpty"),
            morningTop3Title: t("morning.top3Title"),
            morningTop3Hint: t("morning.top3Hint"),
            morningComplete: t("morning.complete"),
            morningSkip: t("morning.skip"),
            morningCompleted: t("morning.completed"),
            morningSkipped: t("morning.skipped"),
            morningDone: t("morning.done"),
            morningError: t("morning.completeError"),
            morningSkippedToast: t("morning.skippedToast"),
            eveningTitle: t("evening.title"),
            eveningSummaryTitle: t("evening.summaryTitle"),
            eveningSummaryEmpty: t("evening.summaryEmpty"),
            eveningCompletedTitle: t("evening.completedTitle"),
            eveningCompletedEmpty: t("evening.completedEmpty"),
            eveningPendingTitle: t("evening.pendingTitle"),
            eveningPendingEmpty: t("evening.pendingEmpty"),
            eveningTomorrow: t("evening.tomorrow"),
            eveningDate: t("evening.date"),
            eveningArchived: t("evening.archived"),
            eveningOverran: t("evening.overran"),
            eveningUrgent: t("evening.urgent"),
            eveningNoEnergy: t("evening.noEnergy"),
            eveningOther: t("evening.other"),
            eveningComplete: t("evening.complete"),
            eveningSkip: t("evening.skip"),
            eveningCompleted: t("evening.completed"),
            eveningSkipped: t("evening.skipped"),
            eveningShutdown: t("evening.shutdown"),
            eveningDone: t("evening.done"),
            eveningError: t("evening.completeError"),
            eveningSkippedToast: t("evening.skippedToast"),
            eveningDatePlaceholder: t("evening.datePlaceholder"),
            timeboxTitle: t("timebox.title"),
            timeboxEmpty: t("timebox.empty"),
            timeboxStart: t("timebox.start"),
            timeboxEnd: t("timebox.end"),
            timeboxSave: t("timebox.save"),
            timeboxAccept: t("timebox.acceptProposal"),
            timeboxSaved: t("timebox.saved"),
            timeboxError: t("timebox.saveError"),
            streakTitle: t("streak.title"),
            streakDays: t("streak.days"),
            streakBest: t("streak.best"),
            streakNext: t("streak.next"),
            streakReached: t("streak.reached"),
            streakEmpty: t("streak.empty"),
          }}
        />
      </div>
    </AppLayout>
  );
}
