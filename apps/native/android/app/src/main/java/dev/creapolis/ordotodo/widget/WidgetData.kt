package dev.creapolis.ordotodo.widget

import dev.creapolis.ordotodo.data.HabitsTodayResponse
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask

/** Everything the Glance widget renders (F4b). Pure mapping, JVM-tested. */
data class WidgetData(
    val done: Int,
    val total: Int,
    val nextTitle: String?,
    val nextProject: String?,
    val habitsDone: Int,
    val habitsTotal: Int,
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
            )
        }

        fun fromHabits(response: HabitsTodayResponse): Pair<Int, Int> {
            val all = response.habits.ifEmpty { response.grouped.all() }
            return all.count { it.doneToday } to all.size
        }
    }
}
