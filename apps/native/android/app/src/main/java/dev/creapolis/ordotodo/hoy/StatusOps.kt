package dev.creapolis.ordotodo.hoy

import kotlinx.serialization.Serializable

/** One wanted status flip. Instances are unique by `(taskId, at)` so the store can ack exactly. */
@Serializable
data class StatusOp(val taskId: String, val done: Boolean, val at: Long = 0L)

/**
 * Collapses the queue so every task appears once, with its latest wish,
 * ordered by last occurrence.
 */
fun coalesce(ops: List<StatusOp>): List<StatusOp> {
    val last = LinkedHashMap<String, StatusOp>()
    for (op in ops) {
        last.remove(op.taskId)
        last[op.taskId] = op
    }
    return last.values.toList()
}
