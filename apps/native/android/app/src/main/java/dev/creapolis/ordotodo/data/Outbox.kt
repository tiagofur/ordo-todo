package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.hoy.SyncOutcome
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Unified outbox operation (ODD 051 S4).
 * Encompasses creates, status flips, partial edits, deletions, and habit checks
 * in a single ordered queue with causal ordering and temporal ID reconciliation.
 */
@Serializable
sealed interface OutboxOp {
    val at: Long

    @Serializable
    @SerialName("create_task")
    data class CreateTask(
        val localId: String,
        val title: String,
        val date: String? = null,
        val time: String? = null,
        val priority: String? = null,
        val projectId: String? = null,
        override val at: Long = 0L,
    ) : OutboxOp

    @Serializable
    @SerialName("status_flip")
    data class StatusFlip(
        val taskId: String,
        val done: Boolean,
        override val at: Long = 0L,
    ) : OutboxOp

    @Serializable
    @SerialName("edit_task")
    data class EditTask(
        val taskId: String,
        val patch: Map<String, String?>,
        override val at: Long = 0L,
    ) : OutboxOp

    @Serializable
    @SerialName("delete_task")
    data class DeleteTask(
        val taskId: String,
        override val at: Long = 0L,
    ) : OutboxOp

    @Serializable
    @SerialName("habit_check")
    data class HabitCheck(
        val habitId: String,
        val done: Boolean,
        override val at: Long = 0L,
    ) : OutboxOp
}

/** Durable outbox contract for unified offline operations. */
interface OutboxStore {
    suspend fun outboxPending(): List<OutboxOp>

    suspend fun enqueueOp(op: OutboxOp)

    suspend fun acknowledgeOps(applied: List<OutboxOp>)

    suspend fun updateOutbox(transform: (List<OutboxOp>) -> List<OutboxOp>)
}

/** Operations supported by the backend required to drain the unified outbox. */
interface OutboxApi {
    suspend fun createTask(op: OutboxOp.CreateTask): String

    suspend fun completeTask(id: String)

    suspend fun reopenTask(id: String)

    suspend fun updateTask(id: String, patch: Map<String, String?>)

    suspend fun deleteTask(id: String)

    suspend fun completeHabit(id: String)

    suspend fun uncompleteHabit(id: String)
}

/** Default implementation binding [TasksRepository] and [HabitsRepository] to [OutboxApi]. */
class DefaultOutboxApi(
    private val tasks: TasksRepository,
    private val habits: HabitsRepository? = null,
) : OutboxApi {
    override suspend fun createTask(op: OutboxOp.CreateTask): String = tasks.create(op)

    override suspend fun completeTask(id: String) = tasks.complete(id)

    override suspend fun reopenTask(id: String) = tasks.reopen(id)

    override suspend fun updateTask(id: String, patch: Map<String, String?>) = tasks.updateTask(id, patch)

    override suspend fun deleteTask(id: String) = tasks.deleteTask(id)

    override suspend fun completeHabit(id: String) {
        habits?.complete(id)
    }

    override suspend fun uncompleteHabit(id: String) {
        habits?.uncomplete(id)
    }
}

/**
 * Coalesces operations:
 * - Drops local captures that were deleted locally prior to sync.
 * - For tasks deleted on server, drops prior pending edits and status flips.
 * - Collapses repeated status flips on the same task to the latest desire.
 * - Collapses repeated habit checks to the latest desire.
 * - Merges multiple edits on the same task into the latest edit.
 */
fun coalesceOps(ops: List<OutboxOp>): List<OutboxOp> {
    if (ops.isEmpty()) return emptyList()

    val createdLocalIds = ops.filterIsInstance<OutboxOp.CreateTask>().map { it.localId }.toSet()
    val deletedLocalIds = ops.filterIsInstance<OutboxOp.DeleteTask>().map { it.taskId }.filter { it in createdLocalIds }.toSet()

    val filtered = ops.filter { op ->
        when (op) {
            is OutboxOp.CreateTask -> op.localId !in deletedLocalIds
            is OutboxOp.StatusFlip -> op.taskId !in deletedLocalIds
            is OutboxOp.EditTask -> op.taskId !in deletedLocalIds
            is OutboxOp.DeleteTask -> op.taskId !in deletedLocalIds
            is OutboxOp.HabitCheck -> true
        }
    }

    val deletedServerIds = filtered.filterIsInstance<OutboxOp.DeleteTask>().map { it.taskId }.toSet()

    val lastStatusPerTask = mutableMapOf<String, OutboxOp.StatusFlip>()
    for (op in filtered) {
        if (op is OutboxOp.StatusFlip && op.taskId !in deletedServerIds) {
            lastStatusPerTask[op.taskId] = op
        }
    }

    val lastHabitCheck = mutableMapOf<String, OutboxOp.HabitCheck>()
    for (op in filtered) {
        if (op is OutboxOp.HabitCheck) {
            lastHabitCheck[op.habitId] = op
        }
    }

    val mergedEdits = mutableMapOf<String, OutboxOp.EditTask>()
    for (op in filtered) {
        if (op is OutboxOp.EditTask && op.taskId !in deletedServerIds) {
            val existing = mergedEdits[op.taskId]
            mergedEdits[op.taskId] = if (existing == null) op else {
                op.copy(patch = existing.patch + op.patch)
            }
        }
    }

    val lastIndexPerStatusTask = mutableMapOf<String, Int>()
    val lastIndexPerHabit = mutableMapOf<String, Int>()
    val lastIndexPerEditTask = mutableMapOf<String, Int>()

    filtered.forEachIndexed { index, op ->
        when (op) {
            is OutboxOp.StatusFlip -> if (op.taskId !in deletedServerIds) lastIndexPerStatusTask[op.taskId] = index
            is OutboxOp.HabitCheck -> lastIndexPerHabit[op.habitId] = index
            is OutboxOp.EditTask -> if (op.taskId !in deletedServerIds) lastIndexPerEditTask[op.taskId] = index
            else -> Unit
        }
    }

    val result = mutableListOf<OutboxOp>()
    filtered.forEachIndexed { index, op ->
        when (op) {
            is OutboxOp.CreateTask -> result.add(op)
            is OutboxOp.DeleteTask -> result.add(op)
            is OutboxOp.StatusFlip -> {
                if (index == lastIndexPerStatusTask[op.taskId]) {
                    lastStatusPerTask[op.taskId]?.let(result::add)
                }
            }
            is OutboxOp.HabitCheck -> {
                if (index == lastIndexPerHabit[op.habitId]) {
                    lastHabitCheck[op.habitId]?.let(result::add)
                }
            }
            is OutboxOp.EditTask -> {
                if (index == lastIndexPerEditTask[op.taskId]) {
                    mergedEdits[op.taskId]?.let(result::add)
                }
            }
        }
    }
    return result
}

/** Replaces occurrences of a temporary local ID with the persistent server ID. */
fun reconcileId(ops: List<OutboxOp>, localId: String, serverId: String): List<OutboxOp> =
    ops.map { op ->
        when (op) {
            is OutboxOp.StatusFlip -> if (op.taskId == localId) op.copy(taskId = serverId) else op
            is OutboxOp.EditTask -> if (op.taskId == localId) op.copy(taskId = serverId) else op
            is OutboxOp.DeleteTask -> if (op.taskId == localId) op.copy(taskId = serverId) else op
            is OutboxOp.CreateTask -> op
            is OutboxOp.HabitCheck -> op
        }
    }

/** Replaces temporary local ID with server ID in a cached [TodayResponse]. */
fun reconcileLocalIdInDay(day: TodayResponse, localId: String, serverId: String): TodayResponse {
    fun List<TodayTask>.reconcile() = map { task ->
        if (task.id == localId) task.copy(id = serverId, pendingSync = false) else task
    }
    return day.copy(
        overdue = day.overdue.reconcile(),
        dueToday = day.dueToday.reconcile(),
        scheduledToday = day.scheduledToday.reconcile(),
        available = day.available.reconcile(),
        notYetAvailable = day.notYetAvailable.reconcile(),
    )
}

/** Replaces temporary local ID with server ID in a cached task list. */
fun reconcileLocalIdInTasks(tasks: List<TodayTask>, localId: String, serverId: String): List<TodayTask> =
    tasks.map { task ->
        if (task.id == localId) task.copy(id = serverId, pendingSync = false) else task
    }

/**
 * Pushes the unified outbox in causal order.
 * Drops server-rejected ops (4xx) so they cannot jam the queue.
 * Network/5xx stops execution and preserves unapplied ops for next time.
 * When a task is created on the server, [onTaskCreated] reconciles cache and downstream ops.
 */
class OutboxSyncEngine(
    private val api: OutboxApi,
    private val onTaskCreated: (suspend (localId: String, serverId: String) -> Unit)? = null,
) {
    suspend fun sync(store: OutboxStore): SyncOutcome {
        val original = store.outboxPending()
        val coalesced = coalesceOps(original)
        if (coalesced.size < original.size) {
            store.updateOutbox { coalesced }
        }

        val applied = mutableListOf<OutboxOp>()
        var queue = coalesced

        var index = 0
        while (index < queue.size) {
            val op = queue[index]
            try {
                when (op) {
                    is OutboxOp.CreateTask -> {
                        val serverId = api.createTask(op)
                        applied.add(op)
                        if (serverId.isNotBlank() && serverId != op.localId) {
                            onTaskCreated?.invoke(op.localId, serverId)
                            queue = reconcileId(queue, op.localId, serverId)
                            store.updateOutbox { reconcileId(it, op.localId, serverId) }
                        }
                    }
                    is OutboxOp.StatusFlip -> {
                        if (op.done) api.completeTask(op.taskId) else api.reopenTask(op.taskId)
                        applied.add(op)
                    }
                    is OutboxOp.EditTask -> {
                        api.updateTask(op.taskId, op.patch)
                        applied.add(op)
                    }
                    is OutboxOp.DeleteTask -> {
                        api.deleteTask(op.taskId)
                        applied.add(op)
                    }
                    is OutboxOp.HabitCheck -> {
                        if (op.done) api.completeHabit(op.habitId) else api.uncompleteHabit(op.habitId)
                        applied.add(op)
                    }
                }
                index++
            } catch (_: UnauthorizedException) {
                store.acknowledgeOps(applied)
                return SyncOutcome.Unauthorized
            } catch (_: NetworkException) {
                store.acknowledgeOps(applied)
                return SyncOutcome.WaitingForNetwork
            } catch (e: ApiException) {
                if (e.status in 400..499) {
                    applied.add(op)
                    index++
                } else {
                    store.acknowledgeOps(applied)
                    return SyncOutcome.WaitingForNetwork
                }
            }
        }
        store.acknowledgeOps(applied)
        return SyncOutcome.Drained
    }
}
