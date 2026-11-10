package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.NativeProject
import dev.creapolis.ordotodo.data.TaskDetailResponse
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * Editable copy of a task. Date fields hold `yyyy-MM-dd` or blank;
 * `projectId = null` means express (no project).
 */
data class EditedTask(
    val title: String,
    val description: String,
    val scheduledDate: String,
    val scheduledTime: String,
    val dueDate: String,
    val priority: String,
    val projectId: String?,
)

data class TaskEditState(
    val taskId: String,
    val loading: Boolean = true,
    val loadError: Boolean = false,
    val original: TaskDetailResponse? = null,
    val title: String = "",
    val description: String = "",
    val scheduledDate: String = "",
    val scheduledTime: String = "",
    val dueDate: String = "",
    val priority: String = "MEDIUM",
    val projectId: String? = null,
    val saving: Boolean = false,
) {
    fun edited(): EditedTask =
        EditedTask(
            title = title,
            description = description,
            scheduledDate = scheduledDate,
            scheduledTime = scheduledTime,
            dueDate = dueDate,
            priority = priority,
            projectId = projectId,
        )
}

/**
 * Project hint (`#tag`) to id, mirroring the web quick-add: exact slug
 * first, then name-contains, case-insensitive. No match (or no hint)
 * means express — never a fallback project (ODD 021).
 */
fun resolveProjectId(hint: String?, projects: List<NativeProject>): String? {
    val needle = hint?.trim()?.lowercase().orEmpty()
    if (needle.isEmpty()) return null
    projects.firstOrNull { it.slug.lowercase() == needle }?.let { return it.id }
    return projects.firstOrNull { it.name.lowercase().contains(needle) }?.id
}

private fun datePart(iso: String?): String = iso?.substringBefore('T').orEmpty()

/**
 * Diff for `PATCH /tasks/:id`: only changed fields, so absent means
 * "leave it" per the backend contract. Blank date/time/project clear
 * the field with explicit null; priority always carries a value.
 * Returns null when nothing changed.
 */
fun buildTaskPatch(original: TaskDetailResponse, edited: EditedTask): JsonObject? {
    var changed = false
    val body =
        buildJsonObject {
            if (edited.title != original.title) {
                put("title", edited.title)
                changed = true
            }
            if (edited.description != original.description.orEmpty()) {
                put("description", edited.description)
                changed = true
            }
            if (edited.scheduledDate != datePart(original.scheduledDate)) {
                if (edited.scheduledDate.isBlank()) put("scheduledDate", JsonNull)
                else put("scheduledDate", edited.scheduledDate)
                changed = true
            }
            if (edited.scheduledTime != original.scheduledTime.orEmpty()) {
                if (edited.scheduledTime.isBlank()) put("scheduledTime", JsonNull)
                else put("scheduledTime", edited.scheduledTime)
                changed = true
            }
            if (edited.dueDate != datePart(original.dueDate)) {
                if (edited.dueDate.isBlank()) put("dueDate", JsonNull)
                else put("dueDate", edited.dueDate)
                changed = true
            }
            if (edited.priority != original.priority) {
                put("priority", edited.priority)
                changed = true
            }
            val originalProject = original.projectId ?: original.project?.id
            if (edited.projectId != originalProject) {
                if (edited.projectId == null) put("projectId", JsonNull)
                else put("projectId", edited.projectId)
                changed = true
            }
        }
    return if (changed) body else null
}
