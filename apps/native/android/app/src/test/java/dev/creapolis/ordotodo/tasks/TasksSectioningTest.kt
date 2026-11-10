package dev.creapolis.ordotodo.tasks

import dev.creapolis.ordotodo.data.TodayProject
import dev.creapolis.ordotodo.data.TodayTask
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class TasksSectioningTest {
    private fun task(
        id: String,
        title: String = "Tarea $id",
        status: String = "TODO",
        scheduledDate: String? = null,
        dueDate: String? = null,
        project: TodayProject? = null,
    ) = TodayTask(
        id = id,
        title = title,
        status = status,
        scheduledDate = scheduledDate,
        dueDate = dueDate,
        project = project,
    )

    @Test
    fun splitsUpcomingUndatedAndDone() {
        val tasks =
            listOf(
                task("u1", scheduledDate = "2099-01-02"),
                task("n1"),
                task("d1", status = "COMPLETED", scheduledDate = "2099-01-03"),
            )
        val sections = sectionTasks(tasks, query = "", projectFilter = null)
        val upcoming = sections.first { it.kind == TasksSectionKind.UPCOMING }
        val undated = sections.first { it.kind == TasksSectionKind.UNDATED }
        val done = sections.first { it.kind == TasksSectionKind.DONE }
        assertEquals(listOf("u1"), upcoming.tasks.map(TodayTask::id))
        assertEquals(listOf("n1"), undated.tasks.map(TodayTask::id))
        assertEquals(listOf("d1"), done.tasks.map(TodayTask::id))
    }

    @Test
    fun dueDateCountsAsDatedAndSortsAscending() {
        val tasks =
            listOf(
                task("b", dueDate = "2099-05-01"),
                task("a", scheduledDate = "2099-01-01"),
            )
        val sections = sectionTasks(tasks, query = "", projectFilter = null)
        val upcoming = sections.first { it.kind == TasksSectionKind.UPCOMING }
        assertEquals(listOf("a", "b"), upcoming.tasks.map(TodayTask::id))
    }

    @Test
    fun queryFiltersByTitleAcrossSections() {
        val tasks =
            listOf(
                task("1", title = "Enviar factura"),
                task("2", title = "Comprar pan"),
            )
        val sections = sectionTasks(tasks, query = "factura", projectFilter = null)
        assertEquals(listOf("1"), sections.flatMap { it.tasks }.map(TodayTask::id))
    }

    @Test
    fun projectFilterKeepsOnlyThatProject() {
        val home = TodayProject(id = "p1", name = "Casa")
        val tasks =
            listOf(
                task("1", scheduledDate = "2099-01-01", project = home),
                task("2", scheduledDate = "2099-01-01"),
            )
        val sections = sectionTasks(tasks, query = "", projectFilter = "p1")
        assertTrue(sections.flatMap { it.tasks }.all { it.project?.id == "p1" })
        assertEquals(listOf("1"), sections.flatMap { it.tasks }.map(TodayTask::id))
    }

    @Test
    fun blankQueryMatchesEverything() {
        val tasks = listOf(task("1"), task("2", status = "COMPLETED"))
        val sections = sectionTasks(tasks, query = "   ", projectFilter = null)
        assertEquals(2, sections.flatMap { it.tasks }.size)
    }

    @Test
    fun flipTaskListTogglesStatus() {
        val tasks = listOf(task("1"), task("2", status = "COMPLETED"))
        val done = flipTaskList(tasks, "1", true)
        assertTrue(done.first { it.id == "1" }.isDone)
        val open = flipTaskList(done, "2", false)
        assertEquals(listOf("1"), open.filter(TodayTask::isDone).map(TodayTask::id))
    }
}
