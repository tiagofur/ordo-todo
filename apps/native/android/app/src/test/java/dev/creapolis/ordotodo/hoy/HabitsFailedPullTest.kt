package dev.creapolis.ordotodo.hoy

import dev.creapolis.ordotodo.data.HabitToday
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** ODD 051 S1: a failed pull never leaves the habits list loading. */
class HabitsFailedPullTest {
    private val habit = HabitToday(id = "h1", name = "Leer")

    @Test
    fun apiFailureEndsLoadingAndAsksForRetry() {
        val state = habitsAfterFailedPull(HabitsUiState(), network = false)
        assertTrue(state.loaded)
        assertTrue(state.failed)
        assertFalse(state.isOffline)
    }

    @Test
    fun networkFailureEndsLoadingAsOffline() {
        val state = habitsAfterFailedPull(HabitsUiState(), network = true)
        assertTrue(state.loaded)
        assertTrue(state.isOffline)
    }

    @Test
    fun failureKeepsHabitsAlreadyShown() {
        val shown = HabitsUiState(habits = listOf(habit), total = 1, loaded = true)
        assertEquals(listOf(habit), habitsAfterFailedPull(shown, network = false).habits)
    }

    @Test
    fun remindersAreNotRescheduledFromAnEmptyFailure() {
        assertFalse(habitsAfterFailedPull(HabitsUiState(), network = false).canScheduleReminders)
        assertFalse(habitsAfterFailedPull(HabitsUiState(), network = true).canScheduleReminders)
        assertFalse(HabitsUiState().canScheduleReminders)
        assertTrue(HabitsUiState(loaded = true).canScheduleReminders)
        val shown = HabitsUiState(habits = listOf(habit), total = 1, loaded = true)
        assertTrue(habitsAfterFailedPull(shown, network = true).canScheduleReminders)
    }
}
