package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.serialization.Serializable

/** One wanted check-in flip. Unique by `(habitId, at)` so the store can ack exactly. */
@Serializable
data class HabitOp(val habitId: String, val done: Boolean, val at: Long = 0L)

/**
 * Collapses the queue so every habit appears once, with its latest wish,
 * ordered by last occurrence.
 */
fun coalesceHabits(ops: List<HabitOp>): List<HabitOp> {
    val last = LinkedHashMap<String, HabitOp>()
    for (op in ops) {
        last.remove(op.habitId)
        last[op.habitId] = op
    }
    return last.values.toList()
}

/** Durable outbox for check-in flips. Implementations serialize access. */
interface HabitOpStore {
    suspend fun habitPending(): List<HabitOp>

    suspend fun enqueueHabit(op: HabitOp)

    suspend fun acknowledgeHabits(applied: List<HabitOp>)
}

/** The two server calls a flip needs (`POST|DELETE /habits/:id/complete`). */
interface HabitCheckApi {
    suspend fun complete(id: String)

    suspend fun uncomplete(id: String)
}

/**
 * Pushes the outbox in order (F3c). Drops server-rejected ops (4xx),
 * keeps the rest for the next run, aborts on auth failure.
 */
class HabitSync(private val api: HabitCheckApi) {
    suspend fun sync(store: HabitOpStore): SyncOutcome {
        val applied = mutableListOf<HabitOp>()
        for (op in coalesceHabits(store.habitPending())) {
            try {
                if (op.done) api.complete(op.habitId) else api.uncomplete(op.habitId)
                applied.add(op)
            } catch (_: UnauthorizedException) {
                return SyncOutcome.Unauthorized
            } catch (_: NetworkException) {
                store.acknowledgeHabits(applied)
                return SyncOutcome.WaitingForNetwork
            } catch (e: ApiException) {
                if (e.status in 400..499) {
                    applied.add(op)
                } else {
                    store.acknowledgeHabits(applied)
                    return SyncOutcome.WaitingForNetwork
                }
            }
        }
        store.acknowledgeHabits(applied)
        return SyncOutcome.Drained
    }
}
