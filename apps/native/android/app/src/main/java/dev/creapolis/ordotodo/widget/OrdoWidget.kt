package dev.creapolis.ordotodo.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceId
import androidx.glance.GlanceTheme
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import dev.creapolis.ordotodo.MainActivity
import dev.creapolis.ordotodo.data.DayStore

/**
 * Day widget (F4b): tasks progress, next task and habits progress from the
 * cached Day snapshot — readable offline. Tapping opens the app. The app
 * pushes a refresh on every successful pull; there are no periodic
 * background updates (WorkManager is excluded from the offline build).
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
    Column(
        modifier =
            androidx.glance.GlanceModifier.fillMaxSize().padding(16.dp).clickable(
                actionStartActivity<MainActivity>(),
            ),
    ) {
        Text(
            text = "Hoy ${data.done}/${data.total}",
            style = TextStyle(color = GlanceTheme.colors.onSurface),
        )
        val next = data.nextTitle
        if (next != null) {
            Spacer(modifier = androidx.glance.GlanceModifier.height(4.dp))
            Text(
                text = next,
                style = TextStyle(color = GlanceTheme.colors.onSurfaceVariant),
                maxLines = 2,
            )
        }
        if (data.habitsTotal > 0) {
            Spacer(modifier = androidx.glance.GlanceModifier.height(4.dp))
            Text(
                text = "Hábitos ${data.habitsDone}/${data.habitsTotal}",
                style = TextStyle(color = GlanceTheme.colors.onSurfaceVariant),
            )
        }
    }
}
