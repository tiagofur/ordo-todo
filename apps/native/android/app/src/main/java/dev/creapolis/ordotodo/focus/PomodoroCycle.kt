package dev.creapolis.ordotodo.focus

import kotlinx.serialization.Serializable

@Serializable
enum class PomodoroMode {
    WORK,
    SHORT_BREAK,
    LONG_BREAK,
}

@Serializable
data class PomodoroConfig(
    val workDurationMinutes: Int = 25,
    val shortBreakMinutes: Int = 5,
    val longBreakMinutes: Int = 15,
    val pomodorosUntilLongBreak: Int = 4,
) {
    fun durationMs(mode: PomodoroMode): Long =
        when (mode) {
            PomodoroMode.WORK -> workDurationMinutes * 60_000L
            PomodoroMode.SHORT_BREAK -> shortBreakMinutes * 60_000L
            PomodoroMode.LONG_BREAK -> longBreakMinutes * 60_000L
        }
}

/**
 * Result of completing or skipping a phase.
 */
data class PhaseTransitionResult(
    val nextMode: PomodoroMode,
    val completedPomodoros: Int,
    val durationMs: Long,
    val wasCredited: Boolean,
)

object PomodoroCycle {
    const val SKIP_CREDIT_THRESHOLD_PERCENT = 80

    /**
     * ODD 016: A phase is credited if elapsed time reaches at least 80% of the planned duration,
     * or if it reached the natural end (remainingMs == 0). Open-ended sessions (plannedMs == null)
     * are credited if they ran at least 1 minute.
     */
    fun isCredited(elapsedMs: Long, plannedDurationMs: Long?): Boolean {
        if (plannedDurationMs == null || plannedDurationMs <= 0L) {
            return elapsedMs >= 60_000L
        }
        val pct = (elapsedMs * 100) / plannedDurationMs
        return pct >= SKIP_CREDIT_THRESHOLD_PERCENT
    }

    /**
     * Determines the next phase when current phase completes naturally or is skipped.
     */
    fun transition(
        currentMode: PomodoroMode,
        completedPomodoros: Int,
        config: PomodoroConfig,
        credited: Boolean,
    ): PhaseTransitionResult {
        return when (currentMode) {
            PomodoroMode.WORK -> {
                val newCount = if (credited) completedPomodoros + 1 else completedPomodoros
                val nextMode =
                    if (newCount > 0 && newCount % config.pomodorosUntilLongBreak == 0) {
                        PomodoroMode.LONG_BREAK
                    } else {
                        PomodoroMode.SHORT_BREAK
                    }
                PhaseTransitionResult(
                    nextMode = nextMode,
                    completedPomodoros = newCount,
                    durationMs = config.durationMs(nextMode),
                    wasCredited = credited,
                )
            }
            PomodoroMode.SHORT_BREAK, PomodoroMode.LONG_BREAK -> {
                PhaseTransitionResult(
                    nextMode = PomodoroMode.WORK,
                    completedPomodoros = completedPomodoros,
                    durationMs = config.durationMs(PomodoroMode.WORK),
                    wasCredited = credited,
                )
            }
        }
    }
}
