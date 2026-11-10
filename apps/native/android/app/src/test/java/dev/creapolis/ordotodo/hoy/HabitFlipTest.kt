package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.HabitCompletion
import dev.creapolis.ordotodo.data.HabitToday
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HabitFlipTest {
    private fun habit(id: String, done: Boolean) =
        HabitToday(id = id, name = id, completions = if (done) listOf(HabitCompletion()) else emptyList())

    @Test
    fun flipsOneHabitToDone() {
        val before = listOf(habit("a", false), habit("b", true))
        val after = flipHabitList(before, "a", true)
        assertTrue(after.first { it.id == "a" }.doneToday)
        assertTrue(after.first { it.id == "b" }.doneToday)
        assertFalse(before.first { it.id == "a" }.doneToday)
    }

    @Test
    fun flipsOneHabitToPending() {
        val before = listOf(habit("a", true), habit("b", true))
        val after = flipHabitList(before, "a", false)
        assertFalse(after.first { it.id == "a" }.doneToday)
        assertTrue(after.first { it.id == "b" }.doneToday)
    }

    @Test
    fun unknownIdLeavesListUntouched() {
        val before = listOf(habit("a", false))
        val after = flipHabitList(before, "zzz", true)
        assertEquals(before, after)
    }
}
