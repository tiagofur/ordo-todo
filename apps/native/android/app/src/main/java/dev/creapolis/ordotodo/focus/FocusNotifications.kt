package dev.creapolis.ordotodo.focus

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import dev.creapolis.ordotodo.MainActivity
import dev.creapolis.ordotodo.R

/**
 * Ongoing focus notification with chronometer / countdown and end-of-session alerts.
 */
class FocusNotifications(private val context: Context) {

    fun buildOngoingNotification(state: FocusState, nowEpoch: Long): Notification {
        ensureChannels()
        val sessionId = state.sessionId
        val paused = state.isPaused

        val toggle =
            PendingIntent.getBroadcast(
                context,
                sessionId.hashCode(),
                Intent(context, FocusActionReceiver::class.java)
                    .putExtra(FocusActionReceiver.EXTRA_SESSION, sessionId)
                    .putExtra(
                        FocusActionReceiver.EXTRA_ACTION,
                        if (paused) FocusActionReceiver.ACTION_RESUME else FocusActionReceiver.ACTION_PAUSE,
                    ),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val skip =
            PendingIntent.getBroadcast(
                context,
                sessionId.hashCode() + 1,
                Intent(context, FocusActionReceiver::class.java)
                    .putExtra(FocusActionReceiver.EXTRA_SESSION, sessionId)
                    .putExtra(FocusActionReceiver.EXTRA_ACTION, FocusActionReceiver.ACTION_SKIP),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val stop =
            PendingIntent.getBroadcast(
                context,
                -sessionId.hashCode(),
                Intent(context, FocusActionReceiver::class.java)
                    .putExtra(FocusActionReceiver.EXTRA_SESSION, sessionId)
                    .putExtra(FocusActionReceiver.EXTRA_ACTION, FocusActionReceiver.ACTION_STOP),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val modeLabel =
            when (state.mode) {
                PomodoroMode.WORK -> context.getString(R.string.timer_mode_work)
                PomodoroMode.SHORT_BREAK -> context.getString(R.string.timer_mode_short_break)
                PomodoroMode.LONG_BREAK -> context.getString(R.string.timer_mode_long_break)
            }
        val title = "$modeLabel · ${state.taskTitle}"

        val left = remainingMs(state, nowEpoch)
        val elapsed = formatElapsed(elapsedMs(state, nowEpoch))
        val builder =
            NotificationCompat.Builder(context, ONGOING_CHANNEL)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(contentIntent())
                .addAction(
                    0,
                    context.getString(if (paused) R.string.timer_resume else R.string.timer_pause),
                    toggle,
                )
                .addAction(
                    0,
                    context.getString(R.string.timer_skip),
                    skip,
                )
                .addAction(
                    0,
                    context.getString(R.string.timer_stop),
                    stop,
                )

        if (paused) {
            builder.setUsesChronometer(false)
            val line = if (left == null) elapsed else "$elapsed · −${formatElapsed(left)}"
            builder.setContentText(line)
        } else if (state.plannedDurationMs != null) {
            val endEpoch = endAtEpoch(state, nowEpoch) ?: (nowEpoch + (left ?: 0L))
            builder.setWhen(endEpoch)
            builder.setUsesChronometer(true)
            builder.setChronometerCountDown(true)
            builder.setContentText(context.getString(R.string.timer_channel_ongoing))
        } else {
            builder.setWhen(state.startedAtEpoch + state.pausedTotalMs)
            builder.setUsesChronometer(true)
            builder.setChronometerCountDown(false)
            builder.setContentText(context.getString(R.string.timer_channel_ongoing))
        }

        return builder.build()
    }

    fun showOngoing(state: FocusState, nowEpoch: Long = System.currentTimeMillis()) {
        manager().notify(ONGOING_ID, buildOngoingNotification(state, nowEpoch))
    }

    /**
     * Placeholder while the service reconciles store and backend; the live
     * timer replaces it in place. It exists so `startForeground` runs
     * synchronously in `onStartCommand` — any I/O first risks
     * `ForegroundServiceDidNotStartInTimeException` on slow networks.
     */
    fun buildSyncNotification(): Notification {
        ensureChannels()
        return NotificationCompat.Builder(context, ONGOING_CHANNEL)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(context.getString(R.string.app_name))
            .setContentText(context.getString(R.string.timer_channel_ongoing))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(contentIntent())
            .build()
    }

    fun showCompleted(title: String) {
        ensureChannels()
        val notification =
            NotificationCompat.Builder(context, ALERTS_CHANNEL)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(context.getString(R.string.timer_completed))
                .setContentText(title)
                .setAutoCancel(true)
                .setContentIntent(contentIntent())
                .build()
        manager().notify(ALERTS_ID, notification)
    }

    fun cancelOngoing() {
        manager().cancel(ONGOING_ID)
    }

    private fun contentIntent(): PendingIntent =
        PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

    private fun ensureChannels() {
        val manager = manager()
        manager.createNotificationChannel(
            NotificationChannel(
                ONGOING_CHANNEL,
                context.getString(R.string.timer_channel_ongoing),
                NotificationManager.IMPORTANCE_LOW,
            ),
        )
        manager.createNotificationChannel(
            NotificationChannel(
                ALERTS_CHANNEL,
                context.getString(R.string.timer_channel_alerts),
                NotificationManager.IMPORTANCE_DEFAULT,
            ),
        )
    }

    private fun manager(): NotificationManager =
        context.getSystemService(NotificationManager::class.java)

    companion object {
        const val ONGOING_CHANNEL = "focus_ongoing"
        const val ALERTS_CHANNEL = "focus_alerts"
        const val ONGOING_ID = 2001
        const val ALERTS_ID = 2002
    }
}
