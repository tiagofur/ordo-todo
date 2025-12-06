"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { useTranslations } from "next-intl";

export default function CalendarPage() {
  const t = useTranslations("Calendar");

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 border rounded-xl bg-card shadow-sm overflow-hidden">
          <TaskCalendar />
        </div>
      </div>
    </AppLayout>
  );
}
