package dev.creapolis.ordotodo.focus

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import dev.creapolis.ordotodo.BuildConfig
import dev.creapolis.ordotodo.data.ApiClient
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TimerRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * End-of-session alarm (F2). Exact when the user granted it
 * (`canScheduleExactAlarms`, API 31+); otherwise an inexact alarm and the
 * UI says so honestly — in doze the alert may arrive minutes late.
 */
class FocusAlarms(private val context: Context) {

    fun canExact(): Boolean {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return false
        return Build.VERSION.SDK_INT < 31 || manager.canScheduleExactAlarms()
    }

    fun schedule(sessionId: String, triggerAtEpoch: Long) {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return
        val pending = pending(sessionId)
        manager.cancel(pending)
        try {
            if (canExact()) {
                manager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtEpoch,
                    pending,
                )
            } else {
                manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtEpoch, pending)
            }
        } catch (_: SecurityException) {
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtEpoch, pending)
        }
    }

    fun cancel(sessionId: String) {
        context.getSystemService(AlarmManager::class.java)?.cancel(pending(sessionId))
    }

    private fun pending(sessionId: String): PendingIntent =
        PendingIntent.getBroadcast(
            context,
            sessionId.hashCode(),
            Intent(context, FocusAlarmReceiver::class.java)
                .putExtra(FocusAlarmReceiver.EXTRA_SESSION, sessionId),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
}

/** Builds the timer stack from an application context (receivers have no VM). */
internal fun focusDeps(context: Context): FocusDeps {
    val app = context.applicationContext
    val session = SessionStore.from(app)
    val api = ApiClient(BuildConfig.API_BASE_URL, session)
    return FocusDeps(
        timers = TimerRepository(api),
        store = FocusStore.from(app),
        notifs = FocusNotifications(app),
        alarms = FocusAlarms(app),
    )
}

internal data class FocusDeps(
    val timers: TimerRepository,
    val store: FocusStore,
    val notifs: FocusNotifications,
    val alarms: FocusAlarms,
)

private fun BroadcastReceiver.goAsync(block: suspend () -> Unit) {
    val pending = goAsync()
    CoroutineScope(Dispatchers.IO).launch {
        try {
            block()
        } finally {
            pending.finish()
        }
    }
}

private suspend fun completeSession(context: Context, sessionId: String, completed: Boolean) {
    val deps = focusDeps(context)
    val current = deps.store.load()
    if (current?.sessionId != sessionId) return
    try {
        deps.timers.stop(completed)
    } catch (_: Exception) {
        // Best effort: the server state reconciles on next restore.
    }
    deps.store.save(null)
    deps.alarms.cancel(sessionId)
    FocusService.stop(context)
    deps.notifs.cancelOngoing()
    if (completed) deps.notifs.showCompleted(current.taskTitle)
}

/** Fires when the planned duration ends: closes the session server-side. */
class FocusAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val sessionId = intent.getStringExtra(EXTRA_SESSION) ?: return
        goAsync { completeSession(context, sessionId, completed = true) }
    }

    companion object {
        const val EXTRA_SESSION = "session_id"
    }
}

/** Notification buttons: pause, resume, skip and stop the active session. */
class FocusActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val sessionId = intent.getStringExtra(EXTRA_SESSION) ?: return
        val action = intent.getStringExtra(EXTRA_ACTION) ?: return
        goAsync {
            val deps = focusDeps(context)
            val current = deps.store.load()
            if (current?.sessionId != sessionId) return@goAsync
            val wall = System.currentTimeMillis()
            try {
                when (action) {
                    ACTION_PAUSE -> {
                        if (current.isPaused) return@goAsync
                        deps.timers.pause()
                        val paused = pauseAt(current, wall)
                        deps.store.save(paused)
                        deps.alarms.cancel(sessionId)
                        FocusService.start(context)
                    }
                    ACTION_RESUME -> {
                        if (!current.isPaused) return@goAsync
                        val active = deps.timers.active() ?: return@goAsync
                        val pauseStart = active.currentPauseStart ?: return@goAsync
                        deps.timers.resume(pauseStart)
                        val resumed = resumeAt(current, wall)
                        deps.store.save(resumed)
                        endAtEpoch(resumed, wall)?.let { deps.alarms.schedule(sessionId, it) }
                        FocusService.start(context)
                    }
                    ACTION_SKIP -> {
                        val elapsed = elapsedMs(current, wall)
                        val credited = PomodoroCycle.isCredited(elapsed, current.plannedDurationMs)
                        try {
                            deps.timers.stop(credited)
                        } catch (_: Exception) {}
                        val config = deps.timers.getPreferences()
                        val next = PomodoroCycle.transition(current.mode, current.completedPomodoros, config, credited)
                        val created =
                            deps.timers.start(
                                current.taskId,
                                type = next.nextMode.name,
                                durationMinutes = (next.durationMs / 60_000L).toInt(),
                            )
                        val startedAt = isoToEpoch(created.startedAt) ?: wall
                        val newState =
                            FocusState(
                                sessionId = created.id,
                                taskId = current.taskId,
                                taskTitle = current.taskTitle,
                                startedAtEpoch = startedAt,
                                plannedDurationMs = next.durationMs,
                                mode = next.nextMode,
                                completedPomodoros = next.completedPomodoros,
                            )
                        deps.store.save(newState)
                        deps.alarms.cancel(sessionId)
                        endAtEpoch(newState, wall)?.let { deps.alarms.schedule(newState.sessionId, it) }
                        FocusService.start(context)
                        return@goAsync
                    }
                    ACTION_STOP -> {
                        val elapsed = elapsedMs(current, wall)
                        val credited = PomodoroCycle.isCredited(elapsed, current.plannedDurationMs)
                        completeSession(context, sessionId, completed = credited)
                        return@goAsync
                    }
                    else -> return@goAsync
                }
            } catch (_: Exception) {
                FocusService.sync(context)
            }
        }
    }

    companion object {
        const val EXTRA_SESSION = "session_id"
        const val EXTRA_ACTION = "focus_action"
        const val ACTION_PAUSE = "pause"
        const val ACTION_RESUME = "resume"
        const val ACTION_SKIP = "skip"
        const val ACTION_STOP = "stop"
    }
}

class FocusBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            FocusService.sync(context)
        }
    }
}
