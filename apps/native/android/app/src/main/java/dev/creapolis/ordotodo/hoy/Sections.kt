package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask

/**
 * Hoy sections in display order. Tasks land by `scheduledTime`
 * (morning < 12:00, evening from 20:00, no time = anytime); the backend
 * `overdue` bucket always opens the day and done tasks always close it.
 */
enum class DaySectionKind {
    OVERDUE,
    MORNING,
    AFTERNOON,
    EVENING,
    ANYTIME,
    DONE,
}

data class DaySection(
    val kind: DaySectionKind,
    val tasks: List<TodayTask>,
)

private fun hourOf(task: TodayTask): Int? =
    task.scheduledTime
        ?.substringBefore(':')
        ?.toIntOrNull()
        ?.takeIf { it in 0..23 }

private fun place(task: TodayTask): DaySectionKind =
    when (val hour = hourOf(task)) {
        null -> DaySectionKind.ANYTIME
        in 0..11 -> DaySectionKind.MORNING
        in 12..19 -> DaySectionKind.AFTERNOON
        else -> DaySectionKind.EVENING
    }

/**
 * Groups a `GET /tasks/today` payload into display sections. Empty sections
 * are omitted; `notYetAvailable` never shows on Hoy.
 */
fun sectionToday(response: TodayResponse): List<DaySection> {
    val ordered = DaySectionKind.entries.associateWith { mutableListOf<TodayTask>() }

    for (task in response.overdue) {
        ordered.getValue(if (task.isDone) DaySectionKind.DONE else DaySectionKind.OVERDUE).add(task)
    }
    val rest = response.dueToday + response.scheduledToday + response.available
    for (task in rest) {
        ordered.getValue(if (task.isDone) DaySectionKind.DONE else place(task)).add(task)
    }

    return ordered.entries
        .filter { it.value.isNotEmpty() }
        .map { DaySection(it.key, it.value) }
}
