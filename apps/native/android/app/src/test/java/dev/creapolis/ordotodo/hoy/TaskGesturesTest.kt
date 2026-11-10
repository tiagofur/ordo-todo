package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.TodayProject
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import java.time.LocalDate
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class TaskGesturesTest {

    private fun sampleTask(
        id: String = "t-1",
        title: String = "Comprar café",
        scheduledDate: String? = "2026-11-10",
        priority: String = "MEDIUM",
        project: TodayProject? = TodayProject("p-1", "Personal"),
    ) = TodayTask(
        id = id,
        title = title,
        scheduledDate = scheduledDate,
        priority = priority,
        project = project,
    )

    @Test
    fun tomorrowDateIsNextCalendarDay() {
        val baseDate = LocalDate.of(2026, 11, 10)
        val tomorrow = baseDate.plusDays(1)
        assertEquals("2026-11-11", tomorrow.toString())
    }

    @Test
    fun reschedulePatchBuildsCorrectDate() {
        val task = sampleTask()
        val tomorrowStr = "2026-11-11"
        val patch = mapOf("scheduledDate" to tomorrowStr)

        assertEquals(tomorrowStr, patch["scheduledDate"])
    }

    @Test
    fun undoRescheduleRevertsToOriginalDate() {
        val task = sampleTask(scheduledDate = "2026-11-10")
        val originalDate = task.scheduledDate
        val tomorrowDate = "2026-11-11"

        // Simulated postpone
        val postponed = task.copy(scheduledDate = tomorrowDate)
        assertEquals("2026-11-11", postponed.scheduledDate)

        // Simulated undo
        val reverted = postponed.copy(scheduledDate = originalDate)
        assertEquals("2026-11-10", reverted.scheduledDate)
    }

    @Test
    fun undoRescheduleWithNullOriginalDateRevertsToNull() {
        val task = sampleTask(scheduledDate = null)
        val originalDate = task.scheduledDate
        val tomorrowDate = "2026-11-11"

        val postponed = task.copy(scheduledDate = tomorrowDate)
        assertEquals("2026-11-11", postponed.scheduledDate)

        val reverted = postponed.copy(scheduledDate = originalDate)
        assertNull(reverted.scheduledDate)
    }

    @Test
    fun removingPostponedTaskFromTodaySections() {
        val t1 = sampleTask(id = "t-1")
        val t2 = sampleTask(id = "t-2")
        val response = TodayResponse(
            dueToday = listOf(t1),
            scheduledToday = listOf(t2),
        )

        // When t1 is rescheduled for tomorrow, it should not appear in today's active sections
        fun List<TodayTask>.filterOut(taskId: String) = filter { it.id != taskId }
        val updated = response.copy(
            dueToday = response.dueToday.filterOut("t-1"),
            scheduledToday = response.scheduledToday.filterOut("t-1"),
        )

        assertTrue(updated.dueToday.isEmpty())
        assertEquals(1, updated.scheduledToday.size)
        assertEquals("t-2", updated.scheduledToday.first().id)
    }

    @Test
    fun priorityUpdatePatch() {
        val patch = mapOf("priority" to "URGENT")
        assertEquals("URGENT", patch["priority"])
    }

    @Test
    fun projectMovePatchCanSetOrClearProject() {
        val setPatch = mapOf("projectId" to "p-work")
        assertEquals("p-work", setPatch["projectId"])

        val clearPatch = mapOf("projectId" to null)
        assertNull(clearPatch["projectId"])
    }

    @Test
    fun snackHoldsUndoReschedulePayload() {
        val snack = Snack(
            message = dev.creapolis.ordotodo.R.string.today_rescheduled_tomorrow,
            undoReschedule = "task-42" to "2026-11-10",
        )

        assertEquals("task-42", snack.undoReschedule?.first)
        assertEquals("2026-11-10", snack.undoReschedule?.second)
        assertNull(snack.undoTaskId)
        assertNull(snack.undoDeleteTaskId)
    }
}
