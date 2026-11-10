package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.serialization.Serializable
import java.time.LocalDate

/**
 * One capture made without a connection (ODD 051 S4). `localId` is the row
 * id until the server creates the task; `date` is `yyyy-MM-dd`.
 */
@Serializable
data class CreateOp(
    val localId: String,
    val title: String,
    val date: String? = null,
    val time: String? = null,
    val priority: String? = null,
    val projectId: String? = null,
    val at: Long = 0L,
)

/** Durable outbox for offline captures. Implementations serialize access. */
interface CreateOpStore {
    suspend fun createPending(): List<CreateOp>

    suspend fun enqueueCreate(op: CreateOp)

    suspend fun acknowledgeCreates(applied: List<CreateOp>)
}

/** `POST /tasks` for one queued capture. */
interface TaskCreateApi {
    suspend fun create(op: CreateOp)
}

/**
 * Pushes queued captures in the order they were made. A capture the server
 * rejects (4xx) is dropped so it cannot jam the queue; network and server
 * faults keep everything not yet sent for the next run.
 */
class CreateSync(private val api: TaskCreateApi) {
    suspend fun sync(store: CreateOpStore): SyncOutcome {
        val applied = mutableListOf<CreateOp>()
        for (op in store.createPending()) {
            try {
                api.create(op)
                applied.add(op)
            } catch (_: UnauthorizedException) {
                store.acknowledgeCreates(applied)
                return SyncOutcome.Unauthorized
            } catch (_: NetworkException) {
                store.acknowledgeCreates(applied)
                return SyncOutcome.WaitingForNetwork
            } catch (e: ApiException) {
                if (e.status in 400..499) {
                    applied.add(op)
                } else {
                    store.acknowledgeCreates(applied)
                    return SyncOutcome.WaitingForNetwork
                }
            }
        }
        store.acknowledgeCreates(applied)
        return SyncOutcome.Drained
    }
}

/** The row a queued capture shows as until it syncs. */
fun pendingTask(op: CreateOp): TodayTask =
    TodayTask(
        id = op.localId,
        title = op.title,
        priority = op.priority ?: "MEDIUM",
        scheduledDate = op.date,
        scheduledTime = op.time,
        pendingSync = true,
    )

/**
 * Adds queued captures to the day where the server would place them:
 * undated → available, today → scheduled, past → overdue. Future dates
 * are not part of Hoy.
 */
fun dayWithPendingCreates(day: TodayResponse, ops: List<CreateOp>, today: LocalDate): TodayResponse {
    if (ops.isEmpty()) return day
    val iso = today.toString()
    val undated = ops.filter { it.date == null }.map(::pendingTask)
    val forToday = ops.filter { it.date == iso }.map(::pendingTask)
    val past = ops.filter { it.date != null && it.date < iso }.map(::pendingTask)
    return day.copy(
        overdue = day.overdue + past,
        scheduledToday = day.scheduledToday + forToday,
        available = day.available + undated,
    )
}

/** The Tareas list shows every queued capture, whatever its date. */
fun tasksWithPendingCreates(tasks: List<TodayTask>, ops: List<CreateOp>): List<TodayTask> =
    if (ops.isEmpty()) tasks else tasks + ops.map(::pendingTask)
