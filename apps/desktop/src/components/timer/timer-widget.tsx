import { Clock, Pause } from "lucide-react";
import { api } from "@/utils/api";
import { Link } from "react-router-dom";

export function TimerWidget() {
  const { data: activeSession } = api.timer.active.useQuery(undefined, {
    refetchInterval: 1000, // Update every second
  });

  const formatDuration = (startedAt: Date | string): string => {
    const start = typeof startedAt === "string" ? new Date(startedAt) : startedAt;
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!activeSession) {
    return (
      <Link
        to="/timer"
        className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm hover:bg-accent"
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Iniciar timer</span>
      </Link>
    );
  }

  const isRunning = !activeSession.endedAt;

  return (
    <Link
      to="/timer"
      className="flex items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2 text-sm hover:bg-primary/10"
    >
      {isRunning ? (
        <div className="relative flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 rounded-full bg-primary"></span>
        </div>
      ) : (
        <Pause className="h-4 w-4 text-primary" />
      )}
      <div className="flex-1">
        <div className="font-medium tabular-nums text-primary">
          {formatDuration(activeSession.startedAt)}
        </div>
      </div>
    </Link>
  );
}
