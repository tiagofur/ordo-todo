package dev.creapolis.ordotodo.focus

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

private fun running(planned: Long? = 25 * 60_000L) =
    FocusState(
        sessionId = "s-1",
        taskId = "t-1",
        taskTitle = "Enviar factura",
        startedAtEpoch = 0,
        plannedDurationMs = planned,
    )

class FocusTimerTest {

    @Test
    fun elapsedGrowsWhileRunning() {
        val state = running()

        assertEquals(60_000L, elapsedMs(state, 60_000L))
        assertFalse(state.isPaused)
    }

    @Test
    fun pauseFreezesElapsed() {
        val paused = pauseAt(running(), 60_000L)

        assertTrue(paused.isPaused)
        assertEquals(60_000L, elapsedMs(paused, 120_000L))
    }

    @Test
    fun doublePauseIsNoOp() {
        val paused = pauseAt(pauseAt(running(), 60_000L), 90_000L)

        assertEquals(60_000L, elapsedMs(paused, 200_000L))
    }

    @Test
    fun resumeAccumulatesPause() {
        val resumed = resumeAt(pauseAt(running(), 60_000L), 120_000L)

        assertFalse(resumed.isPaused)
        assertEquals(60_000L, elapsedMs(resumed, 120_000L))
        assertEquals(90_000L, elapsedMs(resumed, 150_000L))
    }

    @Test
    fun resumeWhileRunningIsNoOp() {
        val state = resumeAt(running(), 60_000L)

        assertEquals(60_000L, elapsedMs(state, 60_000L))
    }

    @Test
    fun remainingCountsDown() {
        val state = running()

        assertEquals(24 * 60_000L, remainingMs(state, 60_000L))
    }

    @Test
    fun openEndedHasNoRemainingOrEnd() {
        val state = running(planned = null)

        assertNull(remainingMs(state, 60_000L))
        assertNull(endAtEpoch(state, 60_000L))
    }

    @Test
    fun endAtStaysPutWhilePaused() {
        val paused = pauseAt(running(), 60_000L)

        assertEquals(25 * 60_000L, endAtEpoch(paused, 999_999_999L))
    }

    @Test
    fun alarmModeFollowsPermission() {
        assertEquals(AlarmMode.EXACT, alarmMode(canScheduleExact = true))
        assertEquals(AlarmMode.INEXACT, alarmMode(canScheduleExact = false))
    }

    @Test
    fun formatElapsed() {
        assertEquals("00:00", formatElapsed(0L))
        assertEquals("01:05", formatElapsed(65_000L))
        assertEquals("1:01:01", formatElapsed(3_661_000L))
    }

    @Test
    fun isoToEpochParses() {
        assertEquals(1_767_225_600_000L, isoToEpoch("2026-01-01T00:00:00Z"))
    }

    @Test
    fun isoToEpochRejectsGarbage() {
        assertNull(isoToEpoch("mañana"))
        assertNull(isoToEpoch(""))
        assertNull(isoToEpoch(null))
    }
}
