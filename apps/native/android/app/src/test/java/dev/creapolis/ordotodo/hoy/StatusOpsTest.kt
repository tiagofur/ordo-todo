package dev.creapolis.ordotodo.hoy

import org.junit.Assert.assertEquals
import org.junit.Test

class StatusOpsTest {

    @Test
    fun lastOpPerTaskWins() {
        val ops =
            listOf(
                StatusOp("a", done = true, at = 1),
                StatusOp("a", done = false, at = 2),
                StatusOp("a", done = true, at = 3),
            )

        assertEquals(listOf(StatusOp("a", done = true, at = 3)), coalesce(ops))
    }

    @Test
    fun independentTasksKeepOrder() {
        val ops =
            listOf(
                StatusOp("a", done = true, at = 1),
                StatusOp("b", done = false, at = 2),
                StatusOp("a", done = false, at = 3),
            )

        assertEquals(
            listOf(
                StatusOp("b", done = false, at = 2),
                StatusOp("a", done = false, at = 3),
            ),
            coalesce(ops),
        )
    }

    @Test
    fun emptyStaysEmpty() {
        assertEquals(emptyList<StatusOp>(), coalesce(emptyList()))
    }
}
