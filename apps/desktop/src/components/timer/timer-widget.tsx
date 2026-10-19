import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TimerWidget as TimerWidgetUI, type TimerMode } from "@ordo-todo/ui";
import { useTimer } from "@/contexts/timer-context";

export function TimerWidget() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === "/timer";
  const { isRunning, timeLeft, mode } = useTimer();

  const validMode: TimerMode =
    mode === "SHORT_BREAK" || mode === "LONG_BREAK" || mode === "CONTINUOUS"
      ? mode
      : "WORK";

  return (
    <TimerWidgetUI
      isRunning={isRunning}
      timeLeft={timeLeft}
      mode={validMode}
      defaultMode="POMODORO"
      isActive={isActive}
      onClick={() => navigate("/timer")}
      labels={{ startTimer: t("Timer.start", "Iniciar timer") }}
    />
  );
}
