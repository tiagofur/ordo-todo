package dev.creapolis.ordotodo.focus

import kotlinx.serialization.Serializable
import java.time.Instant
import kotlin.math.max

/**
 * Client-side focus session (F2). The server owns the time session
 * (`POST /timers/start|stop|pause|resume`); this state machine owns pause
 * accounting, the countdown and the alarm trigger, all in epoch millis so
 * it survives process death via [FocusStore].
 */
@Serializable
data class FocusState(
    val sessionId: String,
    val taskId: String?,
    val taskTitle: String,
    /** Server `startedAt`, epoch millis. */
    val startedAtEpoch: Long,
    val pausedTotalMs: Long = 0,
    /** Set while paused; null while running. */
    val pausedSinceEpoch: Long? = null,
    /** Planned length; null = open-ended (no alarm). */
    val plannedDurationMs: Long? = null,
    /** Pomodoro mode: WORK, SHORT_BREAK, LONG_BREAK */
    val mode: PomodoroMode = PomodoroMode.WORK,
    /** Number of completed WORK pomodoros today */
    val completedPomodoros: Int = 0,
)

val FocusState.isPaused: Boolean get() = pausedSinceEpoch != null

/** Elapsed running time, pauses excluded. */
fun elapsedMs(state: FocusState, nowEpoch: Long): Long {
    val ref = state.pausedSinceEpoch ?: nowEpoch
    return max(0L, ref - state.startedAtEpoch - state.pausedTotalMs)
}

fun pauseAt(state: FocusState, nowEpoch: Long): FocusState {
    if (state.isPaused) return state
    return state.copy(pausedSinceEpoch = nowEpoch)
}

fun resumeAt(state: FocusState, nowEpoch: Long): FocusState {
    val since = state.pausedSinceEpoch ?: return state
    return state.copy(
        pausedSinceEpoch = null,
        pausedTotalMs = state.pausedTotalMs + max(0L, nowEpoch - since),
    )
}

/** Millis left of the plan; null when open-ended. Never negative. */
fun remainingMs(state: FocusState, nowEpoch: Long): Long? {
    val planned = state.plannedDurationMs ?: return null
    return max(0L, planned - elapsedMs(state, nowEpoch))
}

/**
 * When the session ends. Frozen while paused so the alarm can be
 * rescheduled on resume without losing time.
 */
fun endAtEpoch(state: FocusState, nowEpoch: Long): Long? {
    val planned = state.plannedDurationMs ?: return null
    val ref = state.pausedSinceEpoch ?: nowEpoch
    return ref + max(0L, planned - elapsedMs(state, ref))
}

enum class AlarmMode {
    EXACT,
    INEXACT,
}

/** ISO-8601 to epoch millis; null when unparseable. */
fun isoToEpoch(iso: String?): Long? {
    if (iso.isNullOrBlank()) return null
    return try {
        Instant.parse(iso).toEpochMilli()
    } catch (_: Exception) {
        null
    }
}

/** Exact alarms need the user grant (API 31+); without it, inexact + honesty. */
fun alarmMode(canScheduleExact: Boolean): AlarmMode =
    if (canScheduleExact) AlarmMode.EXACT else AlarmMode.INEXACT

/** `24:59`, or `1:02:03` past the hour. */
fun formatElapsed(ms: Long): String {
    val totalSeconds = max(0L, ms) / 1000
    val seconds = totalSeconds % 60
    val minutes = (totalSeconds / 60) % 60
    val hours = totalSeconds / 3600
    return if (hours == 0L) {
        "%02d:%02d".format(minutes, seconds)
    } else {
        "%d:%02d:%02d".format(hours, minutes, seconds)
    }
}
