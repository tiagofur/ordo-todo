package dev.creapolis.ordotodo.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Subset of the backend task payload that the Hoy list renders. */
@Serializable
data class TodaySubTask(
    val id: String,
    val status: String = "TODO",
)

@Serializable
data class TodayProject(
    val id: String,
    val name: String,
    val color: String? = null,
)

@Serializable
data class TodayTask(
    val id: String,
    val title: String,
    val status: String = "TODO",
    val priority: String = "MEDIUM",
    val dueDate: String? = null,
    val doDate: String? = null,
    val scheduledDate: String? = null,
    val scheduledTime: String? = null,
    val project: TodayProject? = null,
    val subTasks: List<TodaySubTask> = emptyList(),
) {
    val isDone: Boolean get() = status == "COMPLETED" || status == "CANCELLED"
    val doneSubTasks: Int get() = subTasks.count { it.status == "COMPLETED" }
}

/** Mirrors `GET /tasks/today` (`tasks.service.findToday`). */
@Serializable
data class TodayResponse(
    val overdue: List<TodayTask> = emptyList(),
    val dueToday: List<TodayTask> = emptyList(),
    val scheduledToday: List<TodayTask> = emptyList(),
    val available: List<TodayTask> = emptyList(),
    @SerialName("notYetAvailable")
    val notYetAvailable: List<TodayTask> = emptyList(),
)
