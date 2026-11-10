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
import dev.creapolis.ordotodo.data.OutboxOp
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.widget.refreshOrdoWidget
import java.time.LocalDate
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

const val TASK_REMINDER_CHANNEL = "task_reminders"

/**
 * Task reminders manager (ODD 051 S9). Schedules local alarms for tasks with
 * scheduled date and time. Exact when permission granted (Android 12+),
 * inexact fallback otherwise. Self-healing on completion or deletion.
 */
class TaskReminders(private val context: Context) {

    fun canExact(): Boolean {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return false
        return Build.VERSION.SDK_INT < 31 || manager.canScheduleExactAlarms()
    }

    /**
     * Re-synchronizes alarms with the active task list.
     * Cancels alarms for completed or deleted tasks, and schedules pending ones.
     */
    fun rescheduleAll(tasks: List<TodayTask>, defaultLeadMinutes: Int = 0) {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return
        val now = System.currentTimeMillis()
        val wanted = tasks.filterNot { it.isDone }.mapNotNull { task ->
            val at = nextTaskReminderEpoch(task.scheduledDate, task.scheduledTime, defaultLeadMinutes, now)
                ?: return@mapNotNull null
            task to at
        }
        val previous = scheduledIds()
        val wantedIds = wanted.map { it.first.id }.toSet()

        // Cancel alarms that are no longer wanted
        (previous - wantedIds).forEach { manager.cancel(pending(it, null)) }

        // Schedule wanted alarms
        wanted.forEach { (task, at) -> schedule(manager, task.id, task.title, at) }

        prefs().edit().putStringSet(KEY_IDS, wantedIds).apply()
    }

    fun schedule(task: TodayTask, triggerAtEpoch: Long) {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return
        schedule(manager, task.id, task.title, triggerAtEpoch)
    }

    fun scheduleSnooze(taskId: String, taskTitle: String, triggerAtEpoch: Long) {
        val manager = context.getSystemService(AlarmManager::class.java) ?: return
        schedule(manager, taskId, taskTitle, triggerAtEpoch)
    }

    fun cancel(taskId: String) {
        context.getSystemService(AlarmManager::class.java)?.cancel(pending(taskId, null))
        prefs().edit().putStringSet(KEY_IDS, scheduledIds() - taskId).apply()
    }

    private fun schedule(manager: AlarmManager, taskId: String, taskTitle: String, triggerAtEpoch: Long) {
        val pending = pending(taskId, taskTitle)
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

    private fun pending(taskId: String, taskTitle: String?): PendingIntent =
        PendingIntent.getBroadcast(
            context,
            ("task:$taskId").hashCode(),
            Intent(context, TaskReminderReceiver::class.java)
                .putExtra(TaskReminderReceiver.EXTRA_TASK_ID, taskId)
                .putExtra(TaskReminderReceiver.EXTRA_TASK_TITLE, taskTitle),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

    private fun scheduledIds(): Set<String> =
        prefs().getStringSet(KEY_IDS, emptySet()).orEmpty()

    private fun prefs() = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS = "task_reminders"
        private const val KEY_IDS = "scheduled_task_ids"
    }
}

internal data class TaskReminderDeps(
    val day: DayStore,
    val tasks: TasksRepository,
    val reminders: TaskReminders,
)

internal fun taskReminderDeps(context: Context): TaskReminderDeps {
    val app = context.applicationContext
    val session = SessionStore.from(app)
    val api = ApiClient(BuildConfig.API_BASE_URL, session)
    return TaskReminderDeps(
        day = DayStore.from(app),
        tasks = TasksRepository(api),
        reminders = TaskReminders(app),
    )
}

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

private fun showTaskReminder(context: Context, taskId: String, title: String, time: String?) {
    val app = context.applicationContext
    val manager = app.getSystemService(NotificationManager::class.java) ?: return
    manager.createNotificationChannel(
        NotificationChannel(
            TASK_REMINDER_CHANNEL,
            app.getString(R.string.reminder_task_channel),
            NotificationManager.IMPORTANCE_HIGH,
        ),
    )
    val open =
        PendingIntent.getActivity(
            app,
            taskId.hashCode(),
            Intent(app, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    val done =
        PendingIntent.getBroadcast(
            app,
            -taskId.hashCode(),
            Intent(app, TaskReminderDoneReceiver::class.java)
                .putExtra(TaskReminderReceiver.EXTRA_TASK_ID, taskId),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    val snooze10m =
        PendingIntent.getBroadcast(
            app,
            ("snooze:10:$taskId").hashCode(),
            Intent(app, TaskReminderSnoozeReceiver::class.java)
                .putExtra(TaskReminderReceiver.EXTRA_TASK_ID, taskId)
                .putExtra(TaskReminderReceiver.EXTRA_TASK_TITLE, title)
                .putExtra(TaskReminderSnoozeReceiver.EXTRA_SNOOZE_MINUTES, 10L),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    val snoozeTomorrow =
        PendingIntent.getBroadcast(
            app,
            ("snooze:tomorrow:$taskId").hashCode(),
            Intent(app, TaskReminderSnoozeReceiver::class.java)
                .putExtra(TaskReminderReceiver.EXTRA_TASK_ID, taskId)
                .putExtra(TaskReminderReceiver.EXTRA_TASK_TITLE, title)
                .putExtra(TaskReminderSnoozeReceiver.EXTRA_TOMORROW, true),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

    val contentText = time ?: app.getString(R.string.reminder_text)
    val notification =
        NotificationCompat.Builder(app, TASK_REMINDER_CHANNEL)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(contentText)
            .setAutoCancel(true)
            .setContentIntent(open)
            .addAction(0, app.getString(R.string.reminder_done), done)
            .addAction(0, app.getString(R.string.reminder_snooze10m), snooze10m)
            .addAction(0, app.getString(R.string.reminder_snooze_tomorrow), snoozeTomorrow)
            .build()
    manager.notify(taskId.hashCode(), notification)
}

/** Fires when the scheduled task alarm triggers: shows notification with actions. */
class TaskReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val taskId = intent.getStringExtra(EXTRA_TASK_ID) ?: return
        val title = intent.getStringExtra(EXTRA_TASK_TITLE).orEmpty()
        goAsync {
            val deps = taskReminderDeps(context)
            val cachedDay = deps.day.loadDay()
            val allTasks = cachedDay?.let {
                it.overdue + it.dueToday + it.scheduledToday + it.available + it.notYetAvailable
            } ?: emptyList()
            val task = allTasks.firstOrNull { it.id == taskId }
            if (task == null || task.isDone) {
                // Task was deleted or already completed: self-heal and silence
                deps.reminders.cancel(taskId)
                return@goAsync
            }
            showTaskReminder(context, taskId, title.ifEmpty { task.title }, task.scheduledTime)
        }
    }

    companion object {
        const val EXTRA_TASK_ID = "task_id"
        const val EXTRA_TASK_TITLE = "task_title"
    }
}

/** "Done" action from notification: completes task and cancels notification. */
class TaskReminderDoneReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val taskId = intent.getStringExtra(TaskReminderReceiver.EXTRA_TASK_ID) ?: return
        goAsync {
            val app = context.applicationContext
            val deps = taskReminderDeps(context)
            try {
                deps.day.enqueueOp(OutboxOp.StatusFlip(taskId, true, System.currentTimeMillis()))
                deps.tasks.complete(taskId)
                deps.day.loadDay()?.let { d ->
                    fun List<TodayTask>.patch() = map {
                        if (it.id == taskId) it.copy(status = "COMPLETED") else it
                    }
                    val updated = d.copy(
                        overdue = d.overdue.patch(),
                        dueToday = d.dueToday.patch(),
                        scheduledToday = d.scheduledToday.patch(),
                        available = d.available.patch(),
                        notYetAvailable = d.notYetAvailable.patch(),
                    )
                    deps.day.saveDay(updated)
                }
                refreshOrdoWidget(app)
            } catch (_: Exception) {
                // Op stays queued in outbox
            } finally {
                deps.reminders.cancel(taskId)
                app.getSystemService(NotificationManager::class.java)?.cancel(taskId.hashCode())
            }
        }
    }
}

/** Snooze action: 10m or tomorrow. */
class TaskReminderSnoozeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val taskId = intent.getStringExtra(TaskReminderReceiver.EXTRA_TASK_ID) ?: return
        val title = intent.getStringExtra(TaskReminderReceiver.EXTRA_TASK_TITLE).orEmpty()
        val isTomorrow = intent.getBooleanExtra(EXTRA_TOMORROW, false)
        val minutes = intent.getLongExtra(EXTRA_SNOOZE_MINUTES, 10L)
        goAsync {
            val app = context.applicationContext
            val deps = taskReminderDeps(context)
            try {
                if (isTomorrow) {
                    val tomorrow = LocalDate.now().plusDays(1).toString()
                    val patch = mapOf("scheduledDate" to tomorrow)
                    deps.day.enqueueOp(OutboxOp.EditTask(taskId, patch, System.currentTimeMillis()))
                    deps.tasks.updateTask(taskId, patch)
                    deps.day.loadDay()?.let { d ->
                        fun List<TodayTask>.filterOut() = filter { it.id != taskId }
                        val updated = d.copy(
                            overdue = d.overdue.filterOut(),
                            dueToday = d.dueToday.filterOut(),
                            scheduledToday = d.scheduledToday.filterOut(),
                            available = d.available.filterOut(),
                            notYetAvailable = d.notYetAvailable.filterOut(),
                        )
                        deps.day.saveDay(updated)
                    }
                    deps.reminders.cancel(taskId)
                } else {
                    val snoozeEpoch = calculateSnoozeEpoch(System.currentTimeMillis(), minutes)
                    deps.reminders.scheduleSnooze(taskId, title, snoozeEpoch)
                }
            } catch (_: Exception) {
                // best effort
            } finally {
                app.getSystemService(NotificationManager::class.java)?.cancel(taskId.hashCode())
            }
        }
    }

    companion object {
        const val EXTRA_SNOOZE_MINUTES = "snooze_minutes"
        const val EXTRA_TOMORROW = "snooze_tomorrow"
    }
}

/** Reboots reschedule task alarms from the cached snapshot. */
class TaskReminderBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        goAsync {
            val deps = taskReminderDeps(context)
            val cachedDay = deps.day.loadDay() ?: return@goAsync
            val allTasks = cachedDay.overdue + cachedDay.dueToday + cachedDay.scheduledToday +
                cachedDay.available + cachedDay.notYetAvailable
            deps.reminders.rescheduleAll(allTasks)
        }
    }
}
