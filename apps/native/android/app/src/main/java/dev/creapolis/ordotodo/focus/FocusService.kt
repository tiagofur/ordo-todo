package dev.creapolis.ordotodo.focus

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * Foreground Service for active focus / Pomodoro timer (S14).
 * Ensures the session survives app death and keeps the notification ticking live.
 */
class FocusService : Service() {

    private val scope = CoroutineScope(Dispatchers.Main + Job())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_SYNC
        if (action == ACTION_STOP) {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }
        // Foreground synchronously: syncWithStoreAndForeground hits DataStore
        // and possibly the network, and a slow reconcile used to kill the
        // process with ForegroundServiceDidNotStartInTimeException.
        ServiceCompat.startForeground(
            this,
            FocusNotifications.ONGOING_ID,
            FocusNotifications(this).buildSyncNotification(),
            foregroundServiceType(),
        )
        syncWithStoreAndForeground()
        return START_STICKY
    }

    private fun syncWithStoreAndForeground() {
        scope.launch {
            val deps = focusDeps(applicationContext)
            val localState = deps.store.load()
            if (localState == null) {
                val active =
                    try {
                        deps.timers.active()
                    } catch (_: Exception) {
                        null
                    }
                if (active == null) {
                    ServiceCompat.stopForeground(this@FocusService, ServiceCompat.STOP_FOREGROUND_REMOVE)
                    stopSelf()
                    return@launch
                }
                val now = System.currentTimeMillis()
                val startedAt = isoToEpoch(active.startedAt) ?: now
                val pausedSince = isoToEpoch(active.currentPauseStart)
                val state =
                    FocusState(
                        sessionId = active.id,
                        taskId = active.taskId,
                        taskTitle = active.taskId ?: "Focus",
                        startedAtEpoch = startedAt,
                        pausedTotalMs = active.totalPauseTime * 1000,
                        pausedSinceEpoch = pausedSince,
                    )
                deps.store.save(state)
                startWithState(deps, state)
            } else {
                startWithState(deps, localState)
            }
        }
    }

    private fun foregroundServiceType(): Int =
        if (Build.VERSION.SDK_INT >= 34) {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        } else {
            0
        }

    private fun startWithState(deps: FocusDeps, state: FocusState) {
        val notification = deps.notifs.buildOngoingNotification(state, System.currentTimeMillis())
        ServiceCompat.startForeground(
            this,
            FocusNotifications.ONGOING_ID,
            notification,
            foregroundServiceType(),
        )
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }

    companion object {
        const val ACTION_START = "dev.creapolis.ordotodo.focus.START"
        const val ACTION_STOP = "dev.creapolis.ordotodo.focus.STOP"
        const val ACTION_SYNC = "dev.creapolis.ordotodo.focus.SYNC"

        fun start(context: Context) {
            val intent =
                Intent(context, FocusService::class.java).apply {
                    action = ACTION_START
                }
            ContextCompat.startForegroundService(context, intent)
        }

        fun stop(context: Context) {
            val intent =
                Intent(context, FocusService::class.java).apply {
                    action = ACTION_STOP
                }
            context.startService(intent)
        }

        fun sync(context: Context) {
            val intent =
                Intent(context, FocusService::class.java).apply {
                    action = ACTION_SYNC
                }
            ContextCompat.startForegroundService(context, intent)
        }
    }
}
