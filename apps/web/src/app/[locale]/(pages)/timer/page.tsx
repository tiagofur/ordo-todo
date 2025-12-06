"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { SessionHistory } from "@/components/timer/session-history";
import { Clock } from "lucide-react";
import { TomatoIcon } from "@/components/ui/custom-icons";
import { useTimer } from "@/components/providers/timer-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TimerPage() {
  const { mode, config } = useTimer();

  const MODE_COLORS = {
    WORK: "#ef4444", // Red
    SHORT_BREAK: "#4ade80", // Light Green (Leaves)
    LONG_BREAK: "#15803d", // Dark Green (Branches)
    CONTINUOUS: "#3b82f6", // Blue
  };

  const accentColor = MODE_COLORS[mode] || "#ef4444";
  const isPomodoro = config.defaultMode === "POMODORO";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
                }}
              >
                {isPomodoro ? (
                  <TomatoIcon className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              {isPomodoro ? "Pomodoro" : "Timer"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Mantén el foco y rastrea tu tiempo de trabajo.
            </p>
          </div>
        </div>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="timer">Temporizador</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
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
      </div>
    </AppLayout>
  );
}
