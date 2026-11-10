package dev.creapolis.ordotodo.widget

import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.data.TodayProject
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import org.junit.Assert.assertEquals
import org.junit.Test

class WidgetDataTest {
    private fun task(id: String, title: String, status: String = "TODO") =
        TodayTask(id = id, title = title, status = status)

    private fun day(vararg tasks: TodayTask) = TodayResponse(dueToday = tasks.toList())

    @Test
    fun countsOpenAndDoneAcrossSections() {
        val data =
            WidgetData.from(
                day(task("1", "A", "COMPLETED"), task("2", "B"), task("3", "C")),
                habitsDone = 2,
                habitsTotal = 3,
            )
        assertEquals(1, data.done)
        assertEquals(3, data.total)
        assertEquals("B", data.nextTitle)
        assertEquals(2, data.habitsDone)
        assertEquals(3, data.habitsTotal)
    }

    @Test
    fun emptyDayHasNoNext() {
        val data = WidgetData.from(day(), habitsDone = 0, habitsTotal = 0)
        assertEquals(0, data.done)
        assertEquals(0, data.total)
        assertEquals(null, data.nextTitle)
    }

    @Test
    fun nextSkipsDoneTasks() {
        val data =
            WidgetData.from(
                day(task("1", "A", "COMPLETED"), task("2", "B", "COMPLETED")),
                habitsDone = 0,
                habitsTotal = 0,
            )
        assertEquals(null, data.nextTitle)
        assertEquals(2, data.done)
    }

    @Test
    fun keepsProjectOfNextTask() {
        val data =
            WidgetData.from(
                day(task("1", "A").copy(project = TodayProject(id = "p", name = "Casa"))),
                habitsDone = 0,
                habitsTotal = 0,
            )
        assertEquals("Casa", data.nextProject)
    }
}
