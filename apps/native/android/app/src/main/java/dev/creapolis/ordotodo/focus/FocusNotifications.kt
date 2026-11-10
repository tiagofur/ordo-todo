package dev.creapolis.ordotodo.focus

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import dev.creapolis.ordotodo.MainActivity
import dev.creapolis.ordotodo.R

/**
 * Ongoing focus notification (v1: plain notification, no foreground
 * service) plus the end-of-session alert. Tapping returns to the app.
 */
class FocusNotifications(private val context: Context) {

    fun showOngoing(title: String, line: String, paused: Boolean, sessionId: String) {
        ensureChannels()
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
        val stop =
            PendingIntent.getBroadcast(
                context,
                -sessionId.hashCode(),
                Intent(context, FocusActionReceiver::class.java)
                    .putExtra(FocusActionReceiver.EXTRA_SESSION, sessionId)
                    .putExtra(FocusActionReceiver.EXTRA_ACTION, FocusActionReceiver.ACTION_STOP),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        val notification =
            NotificationCompat.Builder(context, ONGOING_CHANNEL)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(line)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(contentIntent())
                .addAction(
                    0,
                    context.getString(if (paused) R.string.timer_resume else R.string.timer_pause),
                    toggle,
                )
                .addAction(0, context.getString(R.string.timer_stop), stop)
                .build()
        manager().notify(ONGOING_ID, notification)
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
        const val ONGOING_ID = 1001
        const val ALERTS_ID = 1002
    }
}
