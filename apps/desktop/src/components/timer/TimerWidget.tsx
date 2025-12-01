import { Timer } from "lucide-react";

export function TimerWidget() {
  // TODO: Implement actual timer functionality
  return (
    <button className="flex w-full items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20">
      <Timer className="h-4 w-4" />
      <span>Timer</span>
    </button>
  );
}
