package dev.creapolis.ordotodo.ritual

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RitualLogicTest {

    @Test
    fun `toggleTop3 adds task up to 3 tasks`() {
        var top3 = emptyList<String>()
        top3 = toggleTop3(top3, "t1")
        assertEquals(listOf("t1"), top3)

        top3 = toggleTop3(top3, "t2")
        assertEquals(listOf("t1", "t2"), top3)

        top3 = toggleTop3(top3, "t3")
        assertEquals(listOf("t1", "t2", "t3"), top3)

        // Adding a 4th does not exceed max 3
        top3 = toggleTop3(top3, "t4")
        assertEquals(listOf("t1", "t2", "t3"), top3)
    }

    @Test
    fun `toggleTop3 removes already selected task`() {
        val top3 = listOf("t1", "t2", "t3")
        val updated = toggleTop3(top3, "t2")
        assertEquals(listOf("t1", "t3"), updated)
    }

    @Test
    fun `defaultEveningMoves maps all pending tasks to tomorrow with overran reason`() {
        val pending = listOf(
            RitualEveningTask(taskId = "p1", title = "Pending 1"),
            RitualEveningTask(taskId = "p2", title = "Pending 2"),
        )
        val moves = defaultEveningMoves(pending)
        assertEquals(2, moves.size)
        assertEquals("p1", moves[0].taskId)
        assertEquals("tomorrow", moves[0].destination)
        assertEquals("overran", moves[0].reason)
        assertEquals("p2", moves[1].taskId)
    }

    @Test
    fun `determines active ritual phase based on hour and state`() {
        // Morning pending before 17:00
        val phaseMorning = activeRitualPhase(
            morningStatus = "PENDING",
            eveningStatus = "PENDING",
            hourOfDay = 9,
        )
        assertEquals(RitualPhase.MORNING, phaseMorning)

        // Morning already DONE, hour 10:00 -> NONE
        val phaseDoneMorning = activeRitualPhase(
            morningStatus = "DONE",
            eveningStatus = "PENDING",
            hourOfDay = 10,
        )
        assertEquals(RitualPhase.NONE, phaseDoneMorning)

        // Evening pending at or after 17:00
        val phaseEvening = activeRitualPhase(
            morningStatus = "DONE",
            eveningStatus = "PENDING",
            hourOfDay = 18,
        )
        assertEquals(RitualPhase.EVENING, phaseEvening)

        // Both DONE -> NONE
        val phaseAllDone = activeRitualPhase(
            morningStatus = "DONE",
            eveningStatus = "DONE",
            hourOfDay = 20,
        )
        assertEquals(RitualPhase.NONE, phaseAllDone)
    }

    @Test
    fun `streak format shows calm non-punitive message`() {
        assertTrue(streakLabel(current = 0, longest = 0).isNotBlank())
        assertEquals("Racha: 1 día", streakLabel(current = 1, longest = 5))
        assertEquals("Racha: 7 días", streakLabel(current = 7, longest = 7))
    }
}
