"use client";

import { useTimer } from "@/components/providers/timer-provider";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { TimerWidget as TimerWidgetUI } from "@ordo-todo/ui";

/**
 * TimerWidget - Web wrapper for the shared TimerWidget component
 * 
 * Integrates the platform-agnostic UI component with:
 * - useTimer hook for timer state
 * - next-intl for translations
 * - Next.js routing via useRouter
 */
export function TimerWidget() {
  const t = useTranslations('TimerWidget');
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === "/timer";
  const { isRunning, timeLeft, mode, config } = useTimer();

  return (
    <TimerWidgetUI
      isRunning={isRunning}
      timeLeft={timeLeft}
      mode={mode}
      defaultMode={config.defaultMode}
      isActive={isActive}
      onClick={() => router.push('/timer')}
      labels={{ startTimer: t('startTimer') }}
    />
  );
}
