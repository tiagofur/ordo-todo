package dev.creapolis.ordotodo.habits

import dev.creapolis.ordotodo.data.HabitCompletion
import dev.creapolis.ordotodo.data.HabitToday
import org.junit.Assert.assertEquals
import org.junit.Test

class HabitsGroupingTest {
    private fun habit(id: String, moment: String? = null) =
        HabitToday(
            id = id,
            name = id,
            timeOfDay = moment,
            completions = listOf(HabitCompletion()),
        )

    @Test
    fun groupsByMomentInDayOrder() {
        val habits =
            listOf(
                habit("any"),
                habit("eve", "EVENING"),
                habit("morn", "MORNING"),
                habit("aft", "AFTERNOON"),
            )
        val grouped = groupHabitsByMoment(habits)
        assertEquals(
            listOf("MORNING", "AFTERNOON", "EVENING", null),
            grouped.map { it.first },
        )
        assertEquals(listOf("morn"), grouped[0].second.map(HabitToday::id))
    }

    @Test
    fun unknownMomentsFallIntoAnytime() {
        val grouped = groupHabitsByMoment(listOf(habit("x", "WEEKLY")))
        assertEquals(1, grouped.size)
        assertEquals(null, grouped[0].first)
    }

    @Test
    fun emptyMomentsAreSkipped() {
        val grouped = groupHabitsByMoment(listOf(habit("m", "MORNING")))
        assertEquals(listOf("MORNING"), grouped.map { it.first })
    }
}
