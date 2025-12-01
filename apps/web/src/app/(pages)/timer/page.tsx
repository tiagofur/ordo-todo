"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { Clock } from "lucide-react";

export default function TimerPage() {
  const accentColor = "#4f46e5"; // Indigo

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
                <Clock className="h-6 w-6" />
              </div>
              Timer
            </h1>
            <p className="text-muted-foreground mt-2">
              Mantén el foco y rastrea tu tiempo de trabajo.
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center py-8">
          <PomodoroTimer />
        </div>
      </div>
    </AppLayout>
  );
}
