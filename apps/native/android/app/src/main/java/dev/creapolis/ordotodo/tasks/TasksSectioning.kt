package dev.creapolis.ordotodo.tasks

import dev.creapolis.ordotodo.data.TodayTask

enum class TasksSectionKind {
    UPCOMING,
    UNDATED,
    DONE,
}

data class TasksSection(
    val kind: TasksSectionKind,
    val tasks: List<TodayTask>,
)

/** Sort key: scheduled date first, then due date; undated sorts last. */
fun taskSortDate(task: TodayTask): String = task.scheduledDate ?: task.dueDate ?: "\uFFFF"

/**
 * Pure bucketing for the Tareas tab (F3b): done tasks close the list,
 * dated tasks sort ascending (Próximas), the rest stay Sin fecha.
 * Query matches title case-insensitively; project narrows by id.
 */
fun sectionTasks(
    tasks: List<TodayTask>,
    query: String,
    projectFilter: String?,
): List<TasksSection> {
    val needle = query.trim().lowercase()
    val visible =
        tasks.filter { task ->
            (projectFilter == null || task.project?.id == projectFilter) &&
                (needle.isEmpty() || task.title.lowercase().contains(needle))
        }
    val (done, open) = visible.partition(TodayTask::isDone)
    val (dated, undated) = open.partition { it.scheduledDate != null || it.dueDate != null }
    return listOf(
        TasksSection(TasksSectionKind.UPCOMING, dated.sortedBy(::taskSortDate)),
        TasksSection(TasksSectionKind.UNDATED, undated.sortedBy(TodayTask::title)),
        TasksSection(TasksSectionKind.DONE, done.sortedBy(::taskSortDate)),
    )
}
