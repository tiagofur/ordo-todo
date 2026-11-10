package dev.creapolis.ordotodo.data

import dev.creapolis.ordotodo.hoy.SyncOutcome
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class OutboxEngineTest {

    private class FakeOutboxStore(initial: List<OutboxOp> = emptyList()) : OutboxStore {
        var ops = initial.toMutableList()

        override suspend fun outboxPending(): List<OutboxOp> = ops.toList()

        override suspend fun enqueueOp(op: OutboxOp) {
            ops.add(op)
        }

        override suspend fun acknowledgeOps(applied: List<OutboxOp>) {
            ops.removeAll(applied.toSet())
        }

        override suspend fun updateOutbox(transform: (List<OutboxOp>) -> List<OutboxOp>) {
            ops = transform(ops).toMutableList()
        }
    }

    private class FakeOutboxApi(
        private val createResults: Map<String, String> = emptyMap(),
        private val failures: Map<String, Exception> = emptyMap(),
    ) : OutboxApi {
        val calls = mutableListOf<String>()

        override suspend fun createTask(op: OutboxOp.CreateTask): String {
            failures[op.localId]?.let { throw it }
            calls.add("create:${op.localId}:${op.title}")
            return createResults[op.localId] ?: "server-${op.localId}"
        }

        override suspend fun completeTask(id: String) {
            failures[id]?.let { throw it }
            calls.add("complete:$id")
        }

        override suspend fun reopenTask(id: String) {
            failures[id]?.let { throw it }
            calls.add("reopen:$id")
        }

        override suspend fun updateTask(id: String, patch: Map<String, String?>) {
            failures[id]?.let { throw it }
            calls.add("update:$id:$patch")
        }

        override suspend fun deleteTask(id: String) {
            failures[id]?.let { throw it }
            calls.add("delete:$id")
        }

        override suspend fun completeHabit(id: String) {
            failures[id]?.let { throw it }
            calls.add("completeHabit:$id")
        }

        override suspend fun uncompleteHabit(id: String) {
            failures[id]?.let { throw it }
            calls.add("uncompleteHabit:$id")
        }
    }

    @Test
    fun executesInOrderAndDrains() = runBlocking {
        val ops = listOf(
            OutboxOp.CreateTask(localId = "local-1", title = "Task 1", at = 1L),
            OutboxOp.StatusFlip(taskId = "task-2", done = true, at = 2L),
            OutboxOp.HabitCheck(habitId = "habit-1", done = true, at = 3L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi()
        val engine = OutboxSyncEngine(api)

        val outcome = engine.sync(store)

        assertEquals(SyncOutcome.Drained, outcome)
        assertEquals(
            listOf("create:local-1:Task 1", "complete:task-2", "completeHabit:habit-1"),
            api.calls,
        )
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun coalescesStatusFlipsToLatestDesiredState() = runBlocking {
        val ops = listOf(
            OutboxOp.StatusFlip(taskId = "t1", done = true, at = 1L),
            OutboxOp.StatusFlip(taskId = "t2", done = true, at = 2L),
            OutboxOp.StatusFlip(taskId = "t1", done = false, at = 3L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi()
        val engine = OutboxSyncEngine(api)

        assertEquals(SyncOutcome.Drained, engine.sync(store))
        assertEquals(listOf("t2", "t1"), api.calls.map { it.removePrefix("complete:").removePrefix("reopen:") })
        assertEquals("reopen:t1", api.calls.last())
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun coalescesHabitChecksToLatestState() = runBlocking {
        val ops = listOf(
            OutboxOp.HabitCheck(habitId = "h1", done = true, at = 1L),
            OutboxOp.HabitCheck(habitId = "h1", done = false, at = 2L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi()
        val engine = OutboxSyncEngine(api)

        assertEquals(SyncOutcome.Drained, engine.sync(store))
        assertEquals(listOf("uncompleteHabit:h1"), api.calls)
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun localCreateAndLocalDeleteCancelEachOther() = runBlocking {
        val ops = listOf(
            OutboxOp.CreateTask(localId = "local-temp", title = "Cancel me", at = 1L),
            OutboxOp.StatusFlip(taskId = "local-temp", done = true, at = 2L),
            OutboxOp.DeleteTask(taskId = "local-temp", at = 3L),
            OutboxOp.HabitCheck(habitId = "h1", done = true, at = 4L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi()
        val engine = OutboxSyncEngine(api)

        assertEquals(SyncOutcome.Drained, engine.sync(store))
        // Creation and deletion of local task are cancelled; only habit check runs
        assertEquals(listOf("completeHabit:h1"), api.calls)
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun deleteOnExistingTaskInvalidatesPriorPendingStatusAndEdits() = runBlocking {
        val ops = listOf(
            OutboxOp.StatusFlip(taskId = "server-task", done = true, at = 1L),
            OutboxOp.EditTask(taskId = "server-task", patch = mapOf("title" to "Edited"), at = 2L),
            OutboxOp.DeleteTask(taskId = "server-task", at = 3L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi()
        val engine = OutboxSyncEngine(api)

        assertEquals(SyncOutcome.Drained, engine.sync(store))
        assertEquals(listOf("delete:server-task"), api.calls)
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun reconcilesTemporalIdOnSuccessfulCreateForDownstreamOps() = runBlocking {
        val ops = listOf(
            OutboxOp.CreateTask(localId = "local-42", title = "New task", at = 1L),
            OutboxOp.StatusFlip(taskId = "local-42", done = true, at = 2L),
            OutboxOp.EditTask(taskId = "local-42", patch = mapOf("priority" to "HIGH"), at = 3L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi(createResults = mapOf("local-42" to "real-server-id-99"))
        val reconciledList = mutableListOf<Pair<String, String>>()
        val engine = OutboxSyncEngine(api, onTaskCreated = { localId, serverId ->
            reconciledList.add(localId to serverId)
        })

        assertEquals(SyncOutcome.Drained, engine.sync(store))
        assertEquals(listOf("local-42" to "real-server-id-99"), reconciledList)
        assertEquals(
            listOf(
                "create:local-42:New task",
                "complete:real-server-id-99",
                "update:real-server-id-99:{priority=HIGH}",
            ),
            api.calls,
        )
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun drops4xxErrorAndContinuesDrainingQueue() = runBlocking {
        val ops = listOf(
            OutboxOp.CreateTask(localId = "bad-one", title = "Bad", at = 1L),
            OutboxOp.HabitCheck(habitId = "h1", done = true, at = 2L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi(failures = mapOf("bad-one" to ApiException(400, "Validation failed")))
        val engine = OutboxSyncEngine(api)

        assertEquals(SyncOutcome.Drained, engine.sync(store))
        assertEquals(listOf("completeHabit:h1"), api.calls)
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun networkFailureStopsQueueAndRetainsRemainingOps() = runBlocking {
        val ops = listOf(
            OutboxOp.HabitCheck(habitId = "h1", done = true, at = 1L),
            OutboxOp.StatusFlip(taskId = "t2", done = true, at = 2L),
            OutboxOp.HabitCheck(habitId = "h3", done = true, at = 3L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi(failures = mapOf("t2" to NetworkException(IOException("No connection"))))
        val engine = OutboxSyncEngine(api)

        val outcome = engine.sync(store)

        assertEquals(SyncOutcome.WaitingForNetwork, outcome)
        assertEquals(listOf("completeHabit:h1"), api.calls)
        // t2 and h3 remain in store
        assertEquals(listOf("t2", "h3"), store.ops.map {
            when (it) {
                is OutboxOp.StatusFlip -> it.taskId
                is OutboxOp.HabitCheck -> it.habitId
                else -> ""
            }
        })
    }

    @Test
    fun server5xxStopsQueueAndRetainsCurrentAndFutureOps() = runBlocking {
        val ops = listOf(
            OutboxOp.StatusFlip(taskId = "t1", done = true, at = 1L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi(failures = mapOf("t1" to ApiException(503, "Service Unavailable")))
        val engine = OutboxSyncEngine(api)

        assertEquals(SyncOutcome.WaitingForNetwork, engine.sync(store))
        assertEquals(1, store.ops.size)
    }

    @Test
    fun unauthorizedAbortsAndRetainsQueue() = runBlocking {
        val ops = listOf(
            OutboxOp.StatusFlip(taskId = "t1", done = true, at = 1L),
        )
        val store = FakeOutboxStore(ops)
        val api = FakeOutboxApi(failures = mapOf("t1" to UnauthorizedException()))
        val engine = OutboxSyncEngine(api)

        assertEquals(SyncOutcome.Unauthorized, engine.sync(store))
        assertEquals(1, store.ops.size)
    }

    @Test
    fun reconcilesTemporalIdInCachedDay() {
        val day = TodayResponse(
            overdue = listOf(TodayTask(id = "local-1", title = "Overdue", pendingSync = true)),
            scheduledToday = listOf(TodayTask(id = "local-2", title = "Today", pendingSync = true)),
            available = listOf(TodayTask(id = "server-ok", title = "Available", pendingSync = false)),
        )

        val updated = reconcileLocalIdInDay(day, "local-1", "srv-1")

        assertEquals("srv-1", updated.overdue.first().id)
        org.junit.Assert.assertFalse(updated.overdue.first().pendingSync)
        assertEquals("local-2", updated.scheduledToday.first().id)
        assertTrue(updated.scheduledToday.first().pendingSync)
        assertEquals("server-ok", updated.available.first().id)
    }

    @Test
    fun reconcilesTemporalIdInCachedTasks() {
        val tasks = listOf(
            TodayTask(id = "local-9", title = "Pending", pendingSync = true),
            TodayTask(id = "srv-10", title = "Existing", pendingSync = false),
        )

        val updated = reconcileLocalIdInTasks(tasks, "local-9", "srv-9")

        assertEquals("srv-9", updated.first().id)
        org.junit.Assert.assertFalse(updated.first().pendingSync)
        assertEquals("srv-10", updated[1].id)
    }
}
