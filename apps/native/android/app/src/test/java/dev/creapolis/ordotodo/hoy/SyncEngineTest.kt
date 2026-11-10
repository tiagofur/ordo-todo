package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

private class FakeStore(initial: List<StatusOp> = emptyList()) : StatusStore {
    val ops = initial.toMutableList()

    override suspend fun pending(): List<StatusOp> = ops.toList()

    override suspend fun enqueue(op: StatusOp) {
        ops.add(op)
    }

    override suspend fun acknowledge(applied: List<StatusOp>) {
        ops.removeAll(applied.toSet())
    }
}

private class FakeApi(
    private val behavior: (id: String, done: Boolean) -> Unit = { _, _ -> },
) : TaskStatusApi {
    val calls = mutableListOf<Pair<String, Boolean>>()

    override suspend fun complete(id: String) {
        calls.add(id to true)
        behavior(id, true)
    }

    override suspend fun reopen(id: String) {
        calls.add(id to false)
        behavior(id, false)
    }
}

class SyncEngineTest {

    @Test
    fun drainsCoalescedOpsInOrder() =
        runBlocking {
            val store = FakeStore(listOf(StatusOp("a", true, 1), StatusOp("b", false, 2)))
            val api = FakeApi()

            assertEquals(SyncOutcome.Drained, SyncEngine(api).sync(store))
            assertEquals(listOf("a" to true, "b" to false), api.calls)
            assertEquals(emptyList<StatusOp>(), store.ops)
        }

    @Test
    fun networkFailureKeepsRemainder() =
        runBlocking {
            val store =
                FakeStore(
                    listOf(StatusOp("a", true, 1), StatusOp("b", true, 2), StatusOp("c", false, 3)),
                )
            val api =
                FakeApi { id, _ ->
                    if (id == "b") throw NetworkException(java.io.IOException("down"))
                }

            assertEquals(SyncOutcome.WaitingForNetwork, SyncEngine(api).sync(store))
            assertEquals(listOf("a" to true, "b" to true), api.calls)
            assertEquals(
                listOf(StatusOp("b", true, 2), StatusOp("c", false, 3)),
                store.ops,
            )
        }

    @Test
    fun goneTaskIsDroppedAndSyncContinues() =
        runBlocking {
            val store = FakeStore(listOf(StatusOp("gone", true, 1), StatusOp("b", true, 2)))
            val api =
                FakeApi { id, _ ->
                    if (id == "gone") throw ApiException(404, "not found")
                }

            assertEquals(SyncOutcome.Drained, SyncEngine(api).sync(store))
            assertEquals(listOf("gone" to true, "b" to true), api.calls)
            assertEquals(emptyList<StatusOp>(), store.ops)
        }

    @Test
    fun unauthorizedAbortsKeepingEverything() =
        runBlocking {
            val ops = listOf(StatusOp("a", true, 1))
            val store = FakeStore(ops)
            val api =
                FakeApi { _, _ ->
                    throw UnauthorizedException()
                }

            assertEquals(SyncOutcome.Unauthorized, SyncEngine(api).sync(store))
            assertEquals(ops, store.ops)
        }
}
