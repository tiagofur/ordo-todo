package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.ApiException
import dev.creapolis.ordotodo.data.NetworkException
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import dev.creapolis.ordotodo.data.UnauthorizedException
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException
import java.time.LocalDate

/** ODD 051 S4: captures made offline are queued, shown at once and pushed in order. */
class CreateSyncTest {
    private class FakeStore(initial: List<CreateOp>) : CreateOpStore {
        var ops = initial

        override suspend fun createPending(): List<CreateOp> = ops

        override suspend fun enqueueCreate(op: CreateOp) {
            ops = ops + op
        }

        override suspend fun acknowledgeCreates(applied: List<CreateOp>) {
            ops = ops - applied.toSet()
        }
    }

    private class FakeApi(private val fail: Map<String, Exception> = emptyMap()) : TaskCreateApi {
        val sent = mutableListOf<String>()

        override suspend fun create(op: CreateOp) {
            fail[op.title]?.let { throw it }
            sent += op.title
        }
    }

    private fun op(title: String, date: String? = null, time: String? = null) =
        CreateOp(localId = "local-$title", title = title, date = date, time = time)

    @Test
    fun pushesInCaptureOrderAndEmptiesTheQueue() = runBlocking {
        val store = FakeStore(listOf(op("uno"), op("dos"), op("tres")))
        val api = FakeApi()
        assertEquals(SyncOutcome.Drained, CreateSync(api).sync(store))
        assertEquals(listOf("uno", "dos", "tres"), api.sent)
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun networkFailureKeepsTheRestForLater() = runBlocking {
        val store = FakeStore(listOf(op("uno"), op("dos"), op("tres")))
        val api = FakeApi(mapOf("dos" to NetworkException(IOException("down"))))
        assertEquals(SyncOutcome.WaitingForNetwork, CreateSync(api).sync(store))
        assertEquals(listOf("uno"), api.sent)
        assertEquals(listOf("dos", "tres"), store.ops.map { it.title })
    }

    @Test
    fun serverFaultKeepsTheOp() = runBlocking {
        val store = FakeStore(listOf(op("uno")))
        val api = FakeApi(mapOf("uno" to ApiException(503, "busy")))
        assertEquals(SyncOutcome.WaitingForNetwork, CreateSync(api).sync(store))
        assertEquals(1, store.ops.size)
    }

    @Test
    fun rejectedCaptureIsDroppedSoTheQueueNeverJams() = runBlocking {
        val store = FakeStore(listOf(op("mala"), op("buena")))
        val api = FakeApi(mapOf("mala" to ApiException(400, "invalid")))
        assertEquals(SyncOutcome.Drained, CreateSync(api).sync(store))
        assertEquals(listOf("buena"), api.sent)
        assertTrue(store.ops.isEmpty())
    }

    @Test
    fun authFailureStopsAndKeepsEverythingNotSent() = runBlocking {
        val store = FakeStore(listOf(op("uno"), op("dos")))
        val api = FakeApi(mapOf("dos" to UnauthorizedException()))
        assertEquals(SyncOutcome.Unauthorized, CreateSync(api).sync(store))
        assertEquals(listOf("dos"), store.ops.map { it.title })
    }

    private val today = LocalDate.of(2026, 11, 10)

    @Test
    fun pendingCapturesLandInTheDayWhereTheServerWouldPutThem() {
        val day = TodayResponse(available = listOf(TodayTask(id = "s1", title = "del servidor")))
        val merged =
            dayWithPendingCreates(
                day,
                listOf(
                    op("sin fecha"),
                    op("hoy", date = "2026-11-10", time = "15:00"),
                    op("ayer", date = "2026-11-09"),
                    op("futuro", date = "2026-11-12"),
                ),
                today,
            )
        assertEquals(listOf("del servidor", "sin fecha"), merged.available.map { it.title })
        assertEquals(listOf("hoy"), merged.scheduledToday.map { it.title })
        assertEquals("15:00", merged.scheduledToday.single().scheduledTime)
        assertEquals(listOf("ayer"), merged.overdue.map { it.title })
        assertTrue((merged.available + merged.scheduledToday + merged.overdue).none { it.title == "futuro" })
    }

    @Test
    fun pendingRowsAreMarkedAndServerRowsAreNot() {
        val merged = dayWithPendingCreates(TodayResponse(available = listOf(TodayTask("s1", "x"))), listOf(op("p")), today)
        assertEquals(listOf(false, true), merged.available.map { it.pendingSync })
        assertEquals("local-p", merged.available.last().id)
    }

    @Test
    fun taskListShowsEveryPendingCaptureIncludingFutureOnes() {
        val list = tasksWithPendingCreates(listOf(TodayTask("s1", "x")), listOf(op("futuro", date = "2026-12-01")))
        assertEquals(listOf("x", "futuro"), list.map { it.title })
        assertEquals("2026-12-01", list.last().scheduledDate)
        assertTrue(list.last().pendingSync)
    }

    @Test
    fun noPendingCapturesLeavesTheDayUntouched() {
        val day = TodayResponse(available = listOf(TodayTask("s1", "x")))
        assertEquals(day, dayWithPendingCreates(day, emptyList(), today))
    }
}
