package dev.creapolis.ordotodo.tasks

import dev.creapolis.ordotodo.data.TodayTask
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** ODD 051 S1: a failed pull never leaves the Tareas tab loading. */
class TasksFailedPullTest {
    private val rows = listOf(TodayTask(id = "t1", title = "Preparar demo"))

    @Test
    fun failureWithoutRowsOffersRetry() {
        assertEquals(TasksUiState.Offline, tasksStateAfterFailedPull(emptyList(), "", network = false))
        assertEquals(TasksUiState.Offline, tasksStateAfterFailedPull(emptyList(), "", network = true))
    }

    @Test
    fun apiFailureKeepsLoadedRowsVisible() {
        val state = tasksStateAfterFailedPull(rows, "", network = false)
        assertTrue(state is TasksUiState.Content)
        state as TasksUiState.Content
        assertEquals(1, state.total)
        assertFalse(state.isOffline)
    }

    @Test
    fun networkFailureKeepsRowsAndFlagsOffline() {
        val state = tasksStateAfterFailedPull(rows, "", network = true) as TasksUiState.Content
        assertEquals(1, state.total)
        assertTrue(state.isOffline)
    }

    @Test
    fun failureRespectsTheActiveSearch() {
        val state = tasksStateAfterFailedPull(rows, "nada", network = false) as TasksUiState.Content
        assertEquals(0, state.total)
    }
}
