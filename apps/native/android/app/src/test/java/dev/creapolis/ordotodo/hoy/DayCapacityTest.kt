package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.TodayTask
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class DayCapacityTest {

    @Test
    fun `calculates total estimated minutes excluding completed tasks`() {
        val tasks = listOf(
            TodayTask(id = "1", title = "Task 1", estimatedMinutes = 60),
            TodayTask(id = "2", title = "Task 2", estimatedMinutes = 30),
            TodayTask(id = "3", title = "Done Task", estimatedMinutes = 90, status = "COMPLETED"),
            TodayTask(id = "4", title = "No estimate", estimatedMinutes = null),
        )

        val capacity = calculateDayCapacity(tasks, availableMinutes = 480)
        assertEquals(90, capacity.estimatedMinutes)
        assertEquals(480, capacity.availableMinutes)
        assertFalse(capacity.isOverloaded)
        assertEquals(0, capacity.overageMinutes)
        assertEquals(90f / 480f, capacity.progress, 0.001f)
    }

    @Test
    fun `detects overload when estimated minutes exceed available minutes`() {
        val tasks = listOf(
            TodayTask(id = "1", title = "Big 1", estimatedMinutes = 300),
            TodayTask(id = "2", title = "Big 2", estimatedMinutes = 240),
        )

        val capacity = calculateDayCapacity(tasks, availableMinutes = 480)
        assertEquals(540, capacity.estimatedMinutes)
        assertTrue(capacity.isOverloaded)
        assertEquals(60, capacity.overageMinutes)
        assertEquals(1.0f, capacity.clampedProgress, 0.001f)
    }

    @Test
    fun `formats duration in hours and minutes`() {
        assertEquals("0m", formatMinutes(0))
        assertEquals("45m", formatMinutes(45))
        assertEquals("1h", formatMinutes(60))
        assertEquals("2h 15m", formatMinutes(135))
    }

    @Test
    fun `triages task to today`() {
        val patch = triageTask(
            taskId = "t1",
            target = TriageTarget.TODAY,
            todayStr = "2026-11-10",
            tomorrowStr = "2026-11-11",
        )
        assertEquals("t1", patch.taskId)
        assertEquals("2026-11-10", patch.scheduledDate)
        assertEquals("2026-11-10", patch.dueDate)
    }

    @Test
    fun `triages task to tomorrow`() {
        val patch = triageTask(
            taskId = "t1",
            target = TriageTarget.TOMORROW,
            todayStr = "2026-11-10",
            tomorrowStr = "2026-11-11",
        )
        assertEquals("t1", patch.taskId)
        assertEquals("2026-11-11", patch.scheduledDate)
        assertEquals("2026-11-11", patch.dueDate)
    }

    @Test
    fun `triages task to no date`() {
        val patch = triageTask(
            taskId = "t1",
            target = TriageTarget.NO_DATE,
            todayStr = "2026-11-10",
            tomorrowStr = "2026-11-11",
        )
        assertEquals("t1", patch.taskId)
        assertEquals(null, patch.scheduledDate)
        assertEquals(null, patch.dueDate)
    }

    @Test
    fun `batch triages all overdue tasks to tomorrow excluding done tasks`() {
        val overdue = listOf(
            TodayTask(id = "o1", title = "Overdue 1"),
            TodayTask(id = "o2", title = "Overdue 2"),
            TodayTask(id = "o3", title = "Done Overdue", status = "COMPLETED"),
        )

        val patches = batchTriageToTomorrow(overdue, tomorrowStr = "2026-11-11")
        assertEquals(2, patches.size)
        assertEquals("o1", patches[0].taskId)
        assertEquals("2026-11-11", patches[0].scheduledDate)
        assertEquals("o2", patches[1].taskId)
        assertEquals("2026-11-11", patches[1].scheduledDate)
    }
}
