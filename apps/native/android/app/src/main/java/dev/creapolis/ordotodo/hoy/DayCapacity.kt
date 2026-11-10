package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.TodayTask

/**
 * Pure model and calculation for Day Capacity and Overdue Triage (ODD 051 S10).
 */
data class DayCapacity(
    val estimatedMinutes: Int,
    val availableMinutes: Int,
) {
    val progress: Float
        get() = if (availableMinutes <= 0) 0f else (estimatedMinutes.toFloat() / availableMinutes.toFloat())

    val clampedProgress: Float
        get() = progress.coerceIn(0f, 1f)

    val isOverloaded: Boolean
        get() = estimatedMinutes > availableMinutes

    val overageMinutes: Int
        get() = (estimatedMinutes - availableMinutes).coerceAtLeast(0)
}

/**
 * Calculates total estimated minutes of pending today tasks vs. available daily minutes.
 * Completed/cancelled tasks are excluded.
 */
fun calculateDayCapacity(
    tasks: List<TodayTask>,
    availableMinutes: Int = 480,
): DayCapacity {
    val totalEstimated = tasks
        .filter { !it.isDone }
        .sumOf { it.estimatedMinutes ?: 0 }

    return DayCapacity(
        estimatedMinutes = totalEstimated,
        availableMinutes = availableMinutes.coerceAtLeast(1),
    )
}

fun formatMinutes(minutes: Int): String {
    if (minutes <= 0) return "0m"
    val hours = minutes / 60
    val rem = minutes % 60
    return when {
        hours > 0 && rem > 0 -> "${hours}h ${rem}m"
        hours > 0 -> "${hours}h"
        else -> "${rem}m"
    }
}

enum class TriageTarget {
    TODAY,
    TOMORROW,
    NO_DATE,
}

data class TriagePatch(
    val taskId: String,
    val scheduledDate: String?,
    val dueDate: String?,
)

fun triageTask(
    taskId: String,
    target: TriageTarget,
    todayStr: String,
    tomorrowStr: String,
): TriagePatch {
    return when (target) {
        TriageTarget.TODAY -> TriagePatch(
            taskId = taskId,
            scheduledDate = todayStr,
            dueDate = todayStr,
        )
        TriageTarget.TOMORROW -> TriagePatch(
            taskId = taskId,
            scheduledDate = tomorrowStr,
            dueDate = tomorrowStr,
        )
        TriageTarget.NO_DATE -> TriagePatch(
            taskId = taskId,
            scheduledDate = null,
            dueDate = null,
        )
    }
}

fun batchTriageToTomorrow(
    overdueTasks: List<TodayTask>,
    tomorrowStr: String,
): List<TriagePatch> {
    return overdueTasks
        .filter { !it.isDone }
        .map { task ->
            triageTask(
                taskId = task.id,
                target = TriageTarget.TOMORROW,
                todayStr = "",
                tomorrowStr = tomorrowStr,
            )
        }
}
