package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import org.junit.Assert.assertEquals
import org.junit.Test

private fun task(
    id: String,
    time: String? = null,
    status: String = "TODO",
) = TodayTask(
    id = id,
    title = id,
    status = status,
    scheduledTime = time,
)

class SectioningTest {

    @Test
    fun todayGroupsBySectionInOrder() {
        val response = TodayResponse(
            overdue = listOf(task("vencida")),
            dueToday = listOf(task("sin-hora")),
            scheduledToday = listOf(
                task("manana", "09:00"),
                task("tarde", "15:00"),
                task("noche", "21:30"),
                task("hecha", "10:00", status = "COMPLETED"),
            ),
            available = emptyList(),
            notYetAvailable = listOf(task("futura")),
        )

        val sections = sectionToday(response).map { it.kind to it.tasks.map(TodayTask::id) }

        assertEquals(
            listOf(
                DaySectionKind.OVERDUE to listOf("vencida"),
                DaySectionKind.MORNING to listOf("manana"),
                DaySectionKind.AFTERNOON to listOf("tarde"),
                DaySectionKind.EVENING to listOf("noche"),
                DaySectionKind.ANYTIME to listOf("sin-hora"),
                DaySectionKind.DONE to listOf("hecha"),
            ),
            sections,
        )
    }

    @Test
    fun emptySectionsAreOmitted() {
        val response = TodayResponse(
            overdue = emptyList(),
            dueToday = listOf(task("sin-hora")),
            scheduledToday = emptyList(),
            available = emptyList(),
            notYetAvailable = emptyList(),
        )

        val kinds = sectionToday(response).map { it.kind }

        assertEquals(listOf(DaySectionKind.ANYTIME), kinds)
    }
}
