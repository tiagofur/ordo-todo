package dev.creapolis.ordotodo.reminders

import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class HabitReminderTimeTest {
    private val zone = ZoneId.of("America/Mexico_City")

    private fun epoch(
        y: Int,
        m: Int,
        d: Int,
        h: Int,
        min: Int,
    ): Long = LocalDateTime.of(y, m, d, h, min).atZone(zone).toInstant().toEpochMilli()

    private fun iso(epoch: Long): String =
        LocalDateTime.ofInstant(Instant.ofEpochMilli(epoch), zone).toString()

    @Test
    fun laterTodayStaysToday() {
        val now = epoch(2026, 11, 10, 8, 0)
        assertEquals("2026-11-10T09:00", iso(nextReminderEpoch("09:00", now, zone)!!))
    }

    @Test
    fun exactNowRollsToTomorrow() {
        val now = epoch(2026, 11, 10, 8, 0)
        assertEquals("2026-11-11T08:00", iso(nextReminderEpoch("08:00", now, zone)!!))
    }

    @Test
    fun earlierTodayRollsToTomorrow() {
        val now = epoch(2026, 11, 10, 8, 0)
        assertEquals("2026-11-11T07:59", iso(nextReminderEpoch("07:59", now, zone)!!))
    }

    @Test
    fun malformedReturnsNull() {
        val now = epoch(2026, 11, 10, 8, 0)
        assertNull(nextReminderEpoch(null, now, zone))
        assertNull(nextReminderEpoch("", now, zone))
        assertNull(nextReminderEpoch("mañana", now, zone))
        assertNull(nextReminderEpoch("25:00", now, zone))
        assertNull(nextReminderEpoch("09:60", now, zone))
    }
}
