package dev.creapolis.ordotodo.habits

import java.time.LocalDate
import org.junit.Assert.assertEquals
import org.junit.Test

class StationsTest {
    private val today = LocalDate.of(2026, 11, 10)

    @Test
    fun marksDoneDaysOldestFirst() {
        val dates =
            listOf(
                "2026-11-10T07:30:00.000Z",
                "2026-11-09T07:30:00.000Z",
                "2026-11-07T07:30:00.000Z",
            )
        val stations = last7Stations(dates, today)
        assertEquals(7, stations.size)
        // Oldest (Nov 4) first, today (Nov 10) last.
        assertEquals(listOf(false, false, false, true, false, true, true), stations)
    }

    @Test
    fun futureDatesAreIgnored() {
        val stations = last7Stations(listOf("2026-11-11T07:30:00.000Z"), today)
        assertEquals(List(7) { false }, stations)
    }

    @Test
    fun duplicatesCollapseToOne() {
        val stations =
            last7Stations(
                listOf("2026-11-10T07:00:00.000Z", "2026-11-10T19:00:00.000Z"),
                today,
            )
        assertEquals(listOf(false, false, false, false, false, false, true), stations)
    }

    @Test
    fun emptyHistoryIsAllPending() {
        assertEquals(List(7) { false }, last7Stations(emptyList(), today))
    }
}
