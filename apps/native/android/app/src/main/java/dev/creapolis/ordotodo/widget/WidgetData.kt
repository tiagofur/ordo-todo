package dev.creapolis.ordotodo.widget

import dev.creapolis.ordotodo.data.HabitsTodayResponse
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask

/** One tappable row in the Glance widget (S17): open tasks only. */
data class WidgetTaskItem(
    val id: String,
    val title: String,
)

/** Maximum rows the widget shows; the rest live behind "+N más". */
const val WIDGET_MAX_ITEMS = 5

/** Everything the Glance widget renders (F4b, interactive in S17). Pure mapping, JVM-tested. */
data class WidgetData(
    val done: Int,
    val total: Int,
    val nextTitle: String?,
    val nextProject: String?,
    val habitsDone: Int,
    val habitsTotal: Int,
    val items: List<WidgetTaskItem> = emptyList(),
    val openCount: Int = 0,
) {
    companion object {
        fun from(
            day: TodayResponse,
            habitsDone: Int,
            habitsTotal: Int,
        ): WidgetData {
            val open =
                (day.overdue + day.dueToday + day.scheduledToday + day.available)
                    .filterNot(TodayTask::isDone)
            val all =
                day.overdue + day.dueToday + day.scheduledToday + day.available
            val next = open.firstOrNull()
            return WidgetData(
                done = all.count(TodayTask::isDone),
                total = all.size,
                nextTitle = next?.title,
                nextProject = next?.project?.name,
                habitsDone = habitsDone,
                habitsTotal = habitsTotal,
                items = open.take(WIDGET_MAX_ITEMS).map { WidgetTaskItem(it.id, it.title) },
                openCount = open.size,
            )
        }

        fun fromHabits(response: HabitsTodayResponse): Pair<Int, Int> {
            val all = response.habits.ifEmpty { response.grouped.all() }
            return all.count { it.doneToday } to all.size
        }
    }
}
