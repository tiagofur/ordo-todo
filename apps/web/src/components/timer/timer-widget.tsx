"use client";

import { useTimer } from "@/components/providers/timer-provider";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { TimerWidget as TimerWidgetUI } from "@ordo-todo/ui";

/**
 * TimerWidget - Web wrapper for the shared TimerWidget component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useTimer hook for timer state
 * - next-intl for translations
 * - Next.js routing with Link component
 */
export function TimerWidget() {
  const t = useTranslations('TimerWidget');
  const pathname = usePathname();
  const isActive = pathname === "/timer";
  const { isRunning, timeLeft, mode, config } = useTimer();

  // Note: The UI component uses a button with onClick, but we wrap it
  // in a Link for proper Next.js navigation. Since TimerWidgetUI renders
  // a button, we'll use router.push approach instead of wrapping with Link.
  return (
    <Link href="/timer">
      <TimerWidgetUI
        isRunning={isRunning}
        timeLeft={timeLeft}
        mode={mode}
        defaultMode={config.defaultMode}
        isActive={isActive}
        labels={{ startTimer: t('startTimer') }}
      />
    </Link>
  );
}
