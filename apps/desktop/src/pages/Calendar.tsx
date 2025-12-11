import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { WeeklyTimeBlocks } from "@/components/calendar/weekly-time-blocks";
import { PageTransition, SlideIn } from "@/components/motion";
import { Button } from "@/components/ui/button";

type CalendarView = "timeblocks" | "monthly";

export function Calendar() {
  const { t } = useTranslation();
  const [view, setView] = useState<CalendarView>("timeblocks");

  // Accent color (blue for calendar)
  const accentColor = "#3b82f6"; // Blue-500

  return (
    <PageTransition>
      <div className="h-full flex flex-col space-y-6">
        {/* Header - Styled like Web */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <CalendarIcon className="h-6 w-6" />
                </div>
                {t("Calendar.title") || "Calendario"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("Calendar.subtitle") || "Visualiza y organiza tus tareas en el tiempo"}
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
                <CalendarIcon className="h-4 w-4" />
                Mensual
              </Button>
            </div>
          </div>
        </SlideIn>

        {/* Calendar Container */}
        <div className="flex-1 min-h-0 border rounded-xl bg-card shadow-sm overflow-hidden">
          {view === "monthly" ? <TaskCalendar /> : <WeeklyTimeBlocks />}
        </div>
      </div>
    </PageTransition>
  );
}
