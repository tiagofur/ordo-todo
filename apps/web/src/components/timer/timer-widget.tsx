"use client";

import { Clock, Play, Pause } from "lucide-react";
import { useActiveTimer } from "@/lib/api-hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function TimerWidget() {
  const pathname = usePathname();
  const isActive = pathname === "/timer";
  const { data: activeSessionData } = useActiveTimer();
  const activeSession = activeSessionData as any;
  const accentColor = "#4f46e5"; // Indigo

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
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const isRunning = activeSession && !activeSession.endedAt;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href="/timer"
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            : isRunning
            ? "border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        {isRunning ? (
          <Play className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <div className="flex-1">
          {isRunning ? (
            <div className="font-medium tabular-nums">
              {formatDuration(activeSession.startedAt)}
            </div>
          ) : (
            <span>Iniciar timer</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
