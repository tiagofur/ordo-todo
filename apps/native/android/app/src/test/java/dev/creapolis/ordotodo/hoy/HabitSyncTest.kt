package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import java.io.IOException
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class HabitSyncTest {
    private class FakeApi(var failWith: suspend (HabitOp) -> Unit = {}) : HabitCheckApi {
        val calls = mutableListOf<HabitOp>()

        override suspend fun complete(id: String) {
            val op = HabitOp(id, true)
            failWith(op)
            calls.add(op)
        }

        override suspend fun uncomplete(id: String) {
            val op = HabitOp(id, false)
            failWith(op)
            calls.add(op)
        }
    }

    private class MemoryStore(var ops: List<HabitOp> = emptyList()) : HabitOpStore {
        var acked: List<HabitOp> = emptyList()

        override suspend fun habitPending(): List<HabitOp> = ops

        override suspend fun enqueueHabit(op: HabitOp) {
            ops = ops + op
        }

        override suspend fun acknowledgeHabits(applied: List<HabitOp>) {
            acked = acked + applied
            ops = ops - applied.toSet()
        }
    }

    @Test
    fun coalesceKeepsLastWishPerHabit() {
        val ops =
            listOf(
                HabitOp("a", true, 1),
                HabitOp("b", true, 2),
                HabitOp("a", false, 3),
            )
        val collapsed = coalesceHabits(ops)
        assertEquals(listOf(HabitOp("b", true, 2), HabitOp("a", false, 3)), collapsed)
    }

    @Test
    fun drainsQueueInOrder() =
        runBlocking {
            val api = FakeApi()
            val store = MemoryStore(listOf(HabitOp("a", true), HabitOp("b", false)))
            assertEquals(SyncOutcome.Drained, HabitSync(api).sync(store))
            assertEquals(listOf(HabitOp("a", true), HabitOp("b", false)), api.calls)
            assertEquals(emptyList<HabitOp>(), store.ops)
        }

    @Test
    fun networkFailureKeepsRemaining() =
        runBlocking {
            val api =
                FakeApi { op ->
                    if (op.habitId == "b") throw NetworkException(IOException("down"))
                }
            val store = MemoryStore(listOf(HabitOp("a", true), HabitOp("b", true)))
            assertEquals(SyncOutcome.WaitingForNetwork, HabitSync(api).sync(store))
            assertEquals(listOf(HabitOp("b", true)), store.ops)
        }

    @Test
    fun clientErrorDropsTheOp() =
        runBlocking {
            val api =
                FakeApi {
                    throw ApiException(404, "gone")
                }
            val store = MemoryStore(listOf(HabitOp("a", true)))
            assertEquals(SyncOutcome.Drained, HabitSync(api).sync(store))
            assertEquals(emptyList<HabitOp>(), store.ops)
        }
}
