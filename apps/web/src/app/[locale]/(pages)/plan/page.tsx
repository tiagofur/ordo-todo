"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { DayPlanSection } from "@/components/scheduling/day-plan-section";

/** "Mi plan de hoy" route (ODD 005 S6). Thin page: header + container. */
export default function DayPlanPage() {
  const t = useTranslations("Scheduling");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-sm shadow-cyan-500/25 shrink-0">
            <CalendarDays className="h-5 w-5" />
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

        <DayPlanSection
          labels={{
            loading: t("loading"),
            loadError: t("loadError"),
            retry: t("retry"),
            title: t("title"),
            planEmpty: t("plan.empty"),
            planFrozen: t("plan.frozen"),
            planFreeze: t("plan.freeze"),
            planUnfreeze: t("plan.unfreeze"),
            changesTitle: t("changes.title"),
            changesEmpty: t("changes.empty"),
            changesAccept: t("changes.accept"),
            changesReject: t("changes.reject"),
            changeMoved: t("changes.moved"),
            changeAdded: t("changes.added"),
            changeRemoved: t("changes.removed"),
            changeResized: t("changes.resized"),
            risksTitle: t("risks.title"),
            risksEmpty: t("risks.empty"),
            risksOverload: t("risks.overload"),
            risksDeadlineAtRisk: t("risks.deadlineAtRisk"),
            applied: t("applied"),
            applyError: t("applyError"),
            dismissed: t("dismissed"),
            dismissError: t("dismissError"),
            freezeError: t("freezeError"),
          }}
        />
      </div>
    </AppLayout>
  );
}
