import { useTranslation } from "react-i18next";
import { Clock, Timer as TimerIcon, History } from "lucide-react";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { SessionHistory } from "@/components/timer/session-history";
import { useTimerContext } from "@/contexts/timer-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition, SlideIn } from "@/components/motion";

export function Timer() {
  const { t } = useTranslation();
  const { mode } = useTimerContext();

  // Dynamic colors based on timer mode
  const MODE_COLORS = {
    WORK: "#ef4444", // Red
    SHORT_BREAK: "#4ade80", // Light Green
    LONG_BREAK: "#15803d", // Dark Green
    CONTINUOUS: "#3b82f6", // Blue
  };

  const accentColor = MODE_COLORS[mode as keyof typeof MODE_COLORS] || "#ef4444";

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Dynamic color based on mode */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-colors duration-500"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                  }}
                >
                  <TimerIcon className="h-6 w-6" />
                </div>
                {t("timer.title") || "Focus Timer"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("timer.subtitle") || "Gestiona tu tiempo con la técnica Pomodoro"}
              </p>
            </div>
          </div>
        </SlideIn>

        {/* Tabs */}
        <SlideIn delay={0.1}>
          <Tabs defaultValue="timer" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="timer" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("timer.tabs.timer") || "Temporizador"}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t("timer.tabs.history") || "Historial"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timer" className="mt-6">
              <div className="flex justify-center py-8">
                <PomodoroTimer />
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <SessionHistory />
            </TabsContent>
          </Tabs>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
