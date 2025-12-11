"use client";

import { useState } from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { WeeklyTimeBlocks } from "@/components/calendar/weekly-time-blocks";
import { useTranslations } from "next-intl";
import { Calendar, Clock } from "lucide-react";
import { cn, Button } from "@ordo-todo/ui";

type CalendarView = "monthly" | "timeblocks";

export default function CalendarPage() {
  const t = useTranslations("Calendar");
  const [view, setView] = useState<CalendarView>("timeblocks");

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
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={view === "timeblocks" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("timeblocks")}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Time Blocking
            </Button>
            <Button
              variant={view === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("monthly")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Mensual
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 border rounded-xl bg-card shadow-sm overflow-hidden">
          {view === "monthly" ? <TaskCalendar /> : <WeeklyTimeBlocks />}
        </div>
      </div>
    </AppLayout>
  );
}
