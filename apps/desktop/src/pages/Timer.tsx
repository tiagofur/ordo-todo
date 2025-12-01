import { PomodoroTimer } from "@/components/timer/pomodoro-timer";

export function Timer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Focus Timer</h1>
        <p className="text-muted-foreground">Gestiona tu tiempo con la técnica Pomodoro</p>
      </div>
      
      <div className="flex justify-center py-8">
        <PomodoroTimer />
      </div>
    </div>
  );
}
