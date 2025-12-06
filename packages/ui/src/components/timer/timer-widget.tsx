"use client";

import { Clock, Play, Pause } from "lucide-react";
import { useTimer } from "@/components/providers/timer-provider";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "../../utils/index.js";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TomatoIcon } from "../ui/custom-icons.js";

export function TimerWidget() {
  const t = useTranslations('TimerWidget');
  const pathname = usePathname();
  const isActive = pathname === "/timer";
  const { isRunning, timeLeft, formatTime, mode, config } = useTimer();

  const getThemeClasses = () => {
    if (!isActive && !isRunning) {
      return "text-muted-foreground hover:bg-muted/50 hover:text-foreground";
    }

    const colorKey = {
      WORK: "red",
      SHORT_BREAK: "green-light",
      LONG_BREAK: "green-dark",
      CONTINUOUS: "blue"
    }[mode] || "blue";

    if (isActive) {
      const activeClasses: Record<string, string> = {
        red: "bg-red-500 text-white shadow-lg shadow-red-500/20",
        "green-light": "bg-green-400 text-white shadow-lg shadow-green-400/20",
        "green-dark": "bg-green-800 text-white shadow-lg shadow-green-800/20",
        blue: "bg-blue-500 text-white shadow-lg shadow-blue-500/20",
      };
      return activeClasses[colorKey];
    }

    // isRunning
    const runningClasses: Record<string, string> = {
      red: "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900/70",
      "green-light": "border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900/70",
      "green-dark": "border border-green-700 bg-green-100 text-green-900 hover:bg-green-200 dark:border-green-600 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800/70",
      blue: "border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900/70",
    };
    return runningClasses[colorKey];
  };
  
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
          getThemeClasses()
        )}
      >
        {isRunning ? (
          <Play className="h-4 w-4" />
        ) : (
          config.defaultMode === "POMODORO" ? <TomatoIcon className="h-4 w-4" /> : <Clock className="h-4 w-4" />
        )}
        <div className="flex-1">
          {isRunning ? (
            <div className="font-medium tabular-nums">
              {formatTime(timeLeft)}
            </div>
          ) : (
            <span>{t('startTimer')}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
