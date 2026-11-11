package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.HabitCompletion
import dev.creapolis.ordotodo.data.HabitToday
import dev.creapolis.ordotodo.data.TodayResponse
import dev.creapolis.ordotodo.data.TodayTask
import java.time.LocalDate
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

private fun habit(
    id: String,
    timeOfDay: String? = null,
    streak: Int = 0,
    completedDates: List<String> = emptyList(),
) = HabitToday(
    id = id,
    name = id,
    timeOfDay = timeOfDay,
    currentStreak = streak,
    completions = completedDates.map { HabitCompletion(completedAt = "${it}T08:00:00Z") },
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

    @Test
    fun buildAgendaGroupsWeavesTasksAndHabitsByMomentAndSkipsOverdueWhenTriageShown() {
        val sections = listOf(
            DaySection(DaySectionKind.OVERDUE, listOf(task("vencida"))),
            DaySection(DaySectionKind.MORNING, listOf(task("manana-1"))),
            DaySection(DaySectionKind.AFTERNOON, listOf(task("tarde-1"))),
            DaySection(DaySectionKind.DONE, listOf(task("hecha-1", status = "COMPLETED"))),
        )
        val habits = listOf(
            habit("hab-manana", timeOfDay = "MORNING"),
            habit("hab-noche", timeOfDay = "EVENING"),
            habit("hab-anytime", timeOfDay = null),
        )

        val groupsWithTriage = buildAgendaGroups(
            sections = sections,
            habits = habits,
            hasTriageCard = true,
        )

        assertEquals(
            listOf(
                DaySectionKind.MORNING to (listOf("manana-1") to listOf("hab-manana")),
                DaySectionKind.AFTERNOON to (listOf("tarde-1") to emptyList()),
                DaySectionKind.EVENING to (emptyList<String>() to listOf("hab-noche")),
                DaySectionKind.ANYTIME to (emptyList<String>() to listOf("hab-anytime")),
                DaySectionKind.DONE to (listOf("hecha-1") to emptyList()),
            ),
            groupsWithTriage.map { group ->
                group.kind to (group.tasks.map { it.id } to group.habits.map { it.id })
            },
        )
    }

    @Test
    fun resolveHabitStationsUsesStreakFallbackWhenOnlyTodayCompletionPresent() {
        val today = LocalDate.of(2026, 4, 17)
        val activeHabit = habit(
            id = "meditar",
            streak = 5,
            completedDates = listOf("2026-04-17"),
        )
        assertEquals(
            listOf(false, false, true, true, true, true, true),
            resolveHabitStations(activeHabit, today),
        )

        val pendingTodayHabit = habit(
            id = "leer",
            streak = 3,
            completedDates = emptyList(),
        )
        assertEquals(
            listOf(false, false, false, true, true, true, false),
            resolveHabitStations(pendingTodayHabit, today),
        )
    }
}
