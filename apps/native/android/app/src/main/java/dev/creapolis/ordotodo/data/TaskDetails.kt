package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable

/** Minimal project row for pickers (`GET /projects/all`, array of props). */
@Serializable
data class NativeProject(
    val id: String,
    val name: String,
    val slug: String = "",
    val color: String? = null,
    val workspaceId: String? = null,
)

@Serializable
data class SubtaskItem(
    val id: String,
    val title: String,
    val status: String = "TODO",
) {
    val isDone: Boolean get() = status == "COMPLETED" || status == "CANCELLED"
}

@Serializable
data class RecurrenceConfig(
    val pattern: String = "DAILY", // "DAILY", "WEEKLY", "MONTHLY"
    val interval: Int = 1,
    val daysOfWeek: List<Int>? = null,
    val dayOfMonth: Int? = null,
)

@Serializable
data class TaskTag(
    val id: String,
    val name: String,
    val color: String? = null,
    val workspaceId: String? = null,
)

/**
 * Full task for the detail screen (`GET /tasks/:id` = entity props).
 * Dates arrive as ISO strings; the form only edits the date part.
 */
@Serializable
data class TaskDetailResponse(
    val id: String,
    val title: String,
    val description: String? = null,
    val status: String = "TODO",
    val priority: String = "MEDIUM",
    val dueDate: String? = null,
    val scheduledDate: String? = null,
    val scheduledTime: String? = null,
    val projectId: String? = null,
    val project: TodayProject? = null,
    val estimatedMinutes: Int? = null,
    val recurrence: RecurrenceConfig? = null,
    val subTasks: List<SubtaskItem> = emptyList(),
    val tags: List<TaskTag> = emptyList(),
)
