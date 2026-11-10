package dev.creapolis.ordotodo.data

import kotlinx.serialization.Serializable

/** Minimal project row for pickers (`GET /projects/all`, array of props). */
@Serializable
data class NativeProject(
    val id: String,
    val name: String,
    val slug: String = "",
    val color: String? = null,
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
)
