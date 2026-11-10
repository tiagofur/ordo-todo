package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.UnauthorizedException

/** Durable outbox for status flips. Implementations serialize access. */
interface StatusStore {
    suspend fun pending(): List<StatusOp>

    suspend fun enqueue(op: StatusOp)

    suspend fun acknowledge(applied: List<StatusOp>)
}

/** The two server calls a flip needs (backend contract, same as web). */
interface TaskStatusApi {
    suspend fun complete(id: String)

    suspend fun reopen(id: String)
}

sealed interface SyncOutcome {
    data object Drained : SyncOutcome

    data object WaitingForNetwork : SyncOutcome

    data object Unauthorized : SyncOutcome
}

/**
 * Pushes the outbox in order. Drops server-rejected ops (4xx — retrying a
 * rejection never heals), keeps the rest for the next run, and aborts on
 * auth failure so the caller can sign out.
 */
class SyncEngine(private val api: TaskStatusApi) {
    suspend fun sync(store: StatusStore): SyncOutcome {
        val applied = mutableListOf<StatusOp>()
        for (op in coalesce(store.pending())) {
            try {
                if (op.done) api.complete(op.taskId) else api.reopen(op.taskId)
                applied.add(op)
            } catch (_: UnauthorizedException) {
                return SyncOutcome.Unauthorized
            } catch (_: NetworkException) {
                store.acknowledge(applied)
                return SyncOutcome.WaitingForNetwork
            } catch (e: ApiException) {
                if (e.status in 400..499) {
                    applied.add(op)
                } else {
                    store.acknowledge(applied)
                    return SyncOutcome.WaitingForNetwork
                }
            }
        }
        store.acknowledge(applied)
        return SyncOutcome.Drained
    }
}
