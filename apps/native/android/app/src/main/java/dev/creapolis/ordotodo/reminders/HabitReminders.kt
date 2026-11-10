package dev.creapolis.ordotodo.reminders

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import dev.creapolis.ordotodo.BuildConfig
import dev.creapolis.ordotodo.MainActivity
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiClient
import dev.creapolis.ordotodo.data.DayStore
import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.data.HabitsRepository
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.hoy.HabitOp
import dev.creapolis.ordotodo.hoy.HabitSync
import dev.creapolis.ordotodo.widget.refreshOrdoWidget
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Daily habit reminders (F4c). One inexact-tolerant alarm per habit with a
 * `preferredTime`: exact when the user granted it (API 31+), otherwise
 * inexact with the same honest tradeoff as the focus timer. Alarms
 * self-heal: a firing alarm for a removed or already-done habit cancels
 * itself instead of notifying. Reboots reschedule from the cached snapshot.
 */
class HabitReminders(private val context: Context) {

    fun canExact(): Boolean {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return false
        return Build.VERSION.SDK_INT < 31 || manager.canScheduleExactAlarms()
    }

    /** Replaces the whole reminder set with the current habits. */
    fun rescheduleAll(habits: List<HabitToday>) {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return
        val now = System.currentTimeMillis()
        val wanted = habits.mapNotNull { habit ->
            val at = nextReminderEpoch(habit.preferredTime, now) ?: return@mapNotNull null
            habit to at
        }
        // Drop alarms for habits that no longer want one, then (re)schedule.
        val previous = scheduledIds()
        val wantedIds = wanted.map { it.first.id }.toSet()
        (previous - wantedIds).forEach { manager.cancel(pending(it, null)) }
        wanted.forEach { (habit, at) -> schedule(manager, habit, at) }
        prefs().edit().putStringSet(KEY_IDS, wantedIds).apply()
    }

    fun schedule(habit: HabitToday, triggerAtEpoch: Long) {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return
        schedule(manager, habit, triggerAtEpoch)
    }

    fun cancel(habitId: String) {
        context.getSystemService(AlarmManager::class.java)?.cancel(pending(habitId, null))
        prefs().edit().putStringSet(KEY_IDS, scheduledIds() - habitId).apply()
    }

    private fun schedule(manager: AlarmManager, habit: HabitToday, triggerAtEpoch: Long) {
        val pending = pending(habit.id, habit.name)
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

    private fun pending(habitId: String, habitName: String?): PendingIntent =
        PendingIntent.getBroadcast(
            context,
            ("habit:$habitId").hashCode(),
            Intent(context, HabitReminderReceiver::class.java)
                .putExtra(HabitReminderReceiver.EXTRA_HABIT, habitId)
                .putExtra(HabitReminderReceiver.EXTRA_NAME, habitName),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

    private fun scheduledIds(): Set<String> =
        prefs().getStringSet(KEY_IDS, emptySet()).orEmpty()

    private fun prefs() = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS = "habit_reminders"
        private const val KEY_IDS = "ids"
    }
}

/** Builds the reminder stack from an application context. */
internal fun reminderDeps(context: Context): ReminderDeps {
    val app = context.applicationContext
    val session = SessionStore.from(app)
    val api = ApiClient(BuildConfig.API_BASE_URL, session)
    return ReminderDeps(
        day = DayStore.from(app),
        habits = HabitsRepository(api),
        reminders = HabitReminders(app),
    )
}

internal data class ReminderDeps(
    val day: DayStore,
    val habits: HabitsRepository,
    val reminders: HabitReminders,
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

private fun showReminder(context: Context, habitId: String, name: String) {
    val app = context.applicationContext
    val manager = app.getSystemService(NotificationManager::class.java) ?: return
    manager.createNotificationChannel(
        NotificationChannel(
            REMINDER_CHANNEL,
            app.getString(R.string.reminder_channel),
            NotificationManager.IMPORTANCE_DEFAULT,
        ),
    )
    val open =
        PendingIntent.getActivity(
            app,
            habitId.hashCode(),
            Intent(app, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    val done =
        PendingIntent.getBroadcast(
            app,
            -habitId.hashCode(),
            Intent(app, HabitReminderDoneReceiver::class.java)
                .putExtra(HabitReminderDoneReceiver.EXTRA_HABIT, habitId),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    val notification =
        NotificationCompat.Builder(app, REMINDER_CHANNEL)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(name)
            .setContentText(app.getString(R.string.reminder_text))
            .setAutoCancel(true)
            .setContentIntent(open)
            .addAction(0, app.getString(R.string.reminder_done), done)
            .build()
    manager.notify(habitId.hashCode(), notification)
}

/** Fires at the habit's preferred time: notify unless done, then roll over. */
class HabitReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val habitId = intent.getStringExtra(EXTRA_HABIT) ?: return
        val name = intent.getStringExtra(EXTRA_NAME).orEmpty()
        goAsync {
            val deps = reminderDeps(context)
            val cached = deps.day.loadHabits()
            val habit = cached?.habits?.ifEmpty { cached.grouped.all() }
                ?.firstOrNull { it.id == habitId }
            if (habit == null || habit.doneToday) {
                // Stale or already done: self-heal, no noise.
                deps.reminders.cancel(habitId)
                return@goAsync
            }
            showReminder(context, habitId, name.ifEmpty { habit.name })
            nextReminderEpoch(habit.preferredTime, System.currentTimeMillis() + 60_000L)
                ?.let { deps.reminders.schedule(habit, it) }
        }
    }

    companion object {
        const val EXTRA_HABIT = "habit_id"
        const val EXTRA_NAME = "habit_name"
    }
}

/** "Done" action: enqueue the check-in and push it, then clear + refresh. */
class HabitReminderDoneReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val habitId = intent.getStringExtra(EXTRA_HABIT) ?: return
        goAsync {
            val app = context.applicationContext
            val deps = reminderDeps(context)
            try {
                deps.day.enqueueHabit(HabitOp(habitId, true))
                HabitSync(deps.habits).sync(deps.day)
                refreshOrdoWidget(app)
            } catch (_: Exception) {
                // The op stays queued; the next pull drains it.
            } finally {
                app.getSystemService(NotificationManager::class.java)
                    ?.cancel(habitId.hashCode())
            }
        }
    }

    companion object {
        const val EXTRA_HABIT = "habit_id"
    }
}

/** Reboots reschedule from the cached snapshot — no network needed. */
class HabitReminderBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        goAsync {
            val deps = reminderDeps(context)
            val cached = deps.day.loadHabits() ?: return@goAsync
            val all = cached.habits.ifEmpty { cached.grouped.all() }
            deps.reminders.rescheduleAll(all)
        }
    }
}

private const val REMINDER_CHANNEL = "habit_reminders"
