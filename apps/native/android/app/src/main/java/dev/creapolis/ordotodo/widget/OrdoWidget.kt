package dev.creapolis.ordotodo.widget

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.Button
import androidx.glance.ColorFilter
import androidx.glance.GlanceId
import androidx.glance.GlanceTheme
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.LocalContext
import androidx.glance.action.ActionParameters
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import dev.creapolis.ordotodo.BuildConfig
import dev.creapolis.ordotodo.MainActivity
import dev.creapolis.ordotodo.R
import dev.creapolis.ordotodo.data.ApiClient
import dev.creapolis.ordotodo.data.DayStore
import dev.creapolis.ordotodo.data.DefaultOutboxApi
import dev.creapolis.ordotodo.data.HabitsRepository
import dev.creapolis.ordotodo.data.OutboxOp
import dev.creapolis.ordotodo.data.OutboxSyncEngine
import dev.creapolis.ordotodo.data.SessionStore
import dev.creapolis.ordotodo.data.TasksRepository
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.hoy.SyncOutcome

private val TaskIdKey = ActionParameters.Key<String>("taskId")

/**
 * Interactive day widget (S17): the open tasks as checkboxes plus a capture
 * button, all readable offline from the cached Day snapshot. A toggle
 * enqueues a [OutboxOp.StatusFlip] with an optimistic cache flip and drains
 * immediately on a best-effort basis; the app reconciles the rest on open.
 * The app also pushes a refresh on every successful pull, and the provider
 * requests a periodic update every 30 minutes.
 */
class OrdoWidget : GlanceAppWidget() {
    override suspend fun provideGlance(
        context: Context,
        id: GlanceId,
    ) {
        val day = DayStore.from(context)
        val tasks = day.loadDay()
        val habits = day.loadHabits()
        val (habitsDone, habitsTotal) =
            habits?.let { WidgetData.fromHabits(it) } ?: (0 to 0)
        val data =
            tasks?.let { WidgetData.from(it, habitsDone, habitsTotal) }
                ?: WidgetData(0, 0, null, null, habitsDone, habitsTotal)
        provideContent {
            GlanceTheme {
                OrdoWidgetContent(data)
            }
        }
    }
}

class OrdoWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = OrdoWidget()
}

/** Completes (or reopens) one task from the widget, offline-first. */
class ToggleTaskAction : ActionCallback {
    override suspend fun onAction(
        context: Context,
        glanceId: GlanceId,
        parameters: ActionParameters,
    ) {
        val taskId = parameters[TaskIdKey] ?: return
        try {
            val day = DayStore.from(context)
            val cached = day.loadDay() ?: return
            val task =
                (cached.overdue + cached.dueToday + cached.scheduledToday + cached.available)
                    .firstOrNull { it.id == taskId } ?: return
            if (task.pendingSync && task.id.startsWith("local-")) return
            val done = !task.isDone
            fun flip(t: TodayTask): TodayTask =
                if (t.id == taskId) t.copy(status = if (done) "COMPLETED" else "TODO") else t
            day.saveDay(
                cached.copy(
                    overdue = cached.overdue.map(::flip),
                    dueToday = cached.dueToday.map(::flip),
                    scheduledToday = cached.scheduledToday.map(::flip),
                    available = cached.available.map(::flip),
                ),
            )
            day.enqueueOp(OutboxOp.StatusFlip(taskId, done, System.currentTimeMillis()))
            try {
                val session = SessionStore.from(context)
                val api = ApiClient(BuildConfig.API_BASE_URL, session)
                val outcome =
                    OutboxSyncEngine(DefaultOutboxApi(TasksRepository(api), HabitsRepository(api)))
                        .sync(day)
                if (outcome == SyncOutcome.Unauthorized) session.clear()
            } catch (_: Exception) {
            }
            OrdoWidget().update(context, glanceId)
        } catch (_: Exception) {
        }
    }
}

/** Best-effort refresh; a failing widget must never break the app. */
suspend fun refreshOrdoWidget(context: Context) {
    try {
        val manager = GlanceAppWidgetManager(context)
        manager.getGlanceIds(OrdoWidget::class.java).forEach { id ->
            OrdoWidget().update(context, id)
        }
    } catch (_: Exception) {
    }
}

@Composable
private fun OrdoWidgetContent(data: WidgetData) {
    val context = LocalContext.current
    val openApp =
        actionStartActivity(
            Intent(context, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
        )
    Column(
        modifier = androidx.glance.GlanceModifier.fillMaxSize().padding(16.dp),
    ) {
        Text(
            text = context.getString(R.string.widget_today, data.done, data.total),
            style = TextStyle(color = GlanceTheme.colors.onSurface),
            modifier = androidx.glance.GlanceModifier.clickable(openApp),
        )
        for (item in data.items) {
            Spacer(modifier = androidx.glance.GlanceModifier.height(4.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier =
                    androidx.glance.GlanceModifier
                        .fillMaxWidth()
                        .clickable(
                            actionRunCallback<ToggleTaskAction>(
                                actionParametersOf(TaskIdKey to item.id),
                            ),
                        ),
            ) {
                Image(
                    provider = ImageProvider(R.drawable.ic_check_box_outline_24),
                    contentDescription = null,
                    colorFilter = ColorFilter.tint(GlanceTheme.colors.onSurfaceVariant),
                    modifier = androidx.glance.GlanceModifier.size(24.dp),
                )
                Spacer(modifier = androidx.glance.GlanceModifier.width(8.dp))
                Text(
                    text = item.title,
                    style = TextStyle(color = GlanceTheme.colors.onSurface),
                    maxLines = 1,
                )
            }
        }
        val hidden = data.openCount - data.items.size
        if (hidden > 0) {
            Spacer(modifier = androidx.glance.GlanceModifier.height(4.dp))
            Text(
                text = context.getString(R.string.widget_more, hidden),
                style = TextStyle(color = GlanceTheme.colors.primary),
                modifier = androidx.glance.GlanceModifier.clickable(openApp),
            )
        }
        if (data.habitsTotal > 0) {
            Spacer(modifier = androidx.glance.GlanceModifier.height(4.dp))
            Text(
                text = context.getString(R.string.widget_habits, data.habitsDone, data.habitsTotal),
                style = TextStyle(color = GlanceTheme.colors.onSurfaceVariant),
                modifier = androidx.glance.GlanceModifier.clickable(openApp),
            )
        }
        Spacer(modifier = androidx.glance.GlanceModifier.height(8.dp))
        Button(
            text = context.getString(R.string.widget_capture),
            onClick =
                actionStartActivity(
                    Intent(context, MainActivity::class.java)
                        .setAction(MainActivity.ACTION_CAPTURE)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
                ),
            modifier = androidx.glance.GlanceModifier.fillMaxWidth(),
        )
    }
}
