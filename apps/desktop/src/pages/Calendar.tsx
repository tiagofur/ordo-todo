import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon } from "lucide-react";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { PageTransition, SlideIn } from "@/components/motion";

export function Calendar() {
  const { t } = useTranslation();

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
          </div>
        </SlideIn>

        {/* Calendar Container */}
        <div className="flex-1 min-h-0 border rounded-xl bg-card shadow-sm overflow-hidden">
          <TaskCalendar />
        </div>
      </div>
    </PageTransition>
  );
}
