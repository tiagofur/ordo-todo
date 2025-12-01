"use client";

import { Clock, Play, Pause } from "lucide-react";
import { useTimer } from "@/components/providers/timer-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function TimerWidget() {
  const pathname = usePathname();
  const isActive = pathname === "/timer";
  const { isRunning, timeLeft, formatTime } = useTimer();
  
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
              {formatTime(timeLeft)}
            </div>
          ) : (
            <span>Iniciar timer</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
