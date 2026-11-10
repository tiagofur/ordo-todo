package dev.creapolis.ordotodo.reminders

import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class TaskReminderTimeTest {

    private val zone = ZoneId.of("America/Mexico_City")

    @Test
    fun triggerAtExactScheduledTime() {
        // Scheduled: 2026-11-10 15:30
        // Now: 2026-11-10 14:00
        val now = LocalDate.of(2026, 11, 10).atTime(14, 0).atZone(zone).toInstant().toEpochMilli()
        val expected = LocalDate.of(2026, 11, 10).atTime(15, 30).atZone(zone).toInstant().toEpochMilli()

        val trigger = nextTaskReminderEpoch(
            scheduledDate = "2026-11-10",
            scheduledTime = "15:30",
            leadMinutes = 0,
            nowEpoch = now,
            zone = zone,
        )

        assertEquals(expected, trigger)
    }

    @Test
    fun triggerWith10MinutesLeadTime() {
        // Scheduled: 2026-11-10 15:30, lead = 10 min -> trigger at 15:20
        // Now: 2026-11-10 14:00
        val now = LocalDate.of(2026, 11, 10).atTime(14, 0).atZone(zone).toInstant().toEpochMilli()
        val expected = LocalDate.of(2026, 11, 10).atTime(15, 20).atZone(zone).toInstant().toEpochMilli()

        val trigger = nextTaskReminderEpoch(
            scheduledDate = "2026-11-10",
            scheduledTime = "15:30",
            leadMinutes = 10,
            nowEpoch = now,
            zone = zone,
        )

        assertEquals(expected, trigger)
    }

    @Test
    fun triggerWith30MinutesLeadTime() {
        // Scheduled: 2026-11-10 15:30, lead = 30 min -> trigger at 15:00
        val now = LocalDate.of(2026, 11, 10).atTime(14, 0).atZone(zone).toInstant().toEpochMilli()
        val expected = LocalDate.of(2026, 11, 10).atTime(15, 0).atZone(zone).toInstant().toEpochMilli()

        val trigger = nextTaskReminderEpoch(
            scheduledDate = "2026-11-10",
            scheduledTime = "15:30",
            leadMinutes = 30,
            nowEpoch = now,
            zone = zone,
        )

        assertEquals(expected, trigger)
    }

    @Test
    fun pastTriggerReturnsNull() {
        // Scheduled: 2026-11-10 14:00
        // Now: 2026-11-10 15:00 (past)
        val now = LocalDate.of(2026, 11, 10).atTime(15, 0).atZone(zone).toInstant().toEpochMilli()

        val trigger = nextTaskReminderEpoch(
            scheduledDate = "2026-11-10",
            scheduledTime = "14:00",
            leadMinutes = 0,
            nowEpoch = now,
            zone = zone,
        )

        assertNull(trigger)
    }

    @Test
    fun leadTimePushesPastReturnsNull() {
        // Scheduled: 2026-11-10 14:15, lead = 30 min -> trigger would be 13:45
        // Now: 2026-11-10 14:00 (13:45 is past)
        val now = LocalDate.of(2026, 11, 10).atTime(14, 0).atZone(zone).toInstant().toEpochMilli()

        val trigger = nextTaskReminderEpoch(
            scheduledDate = "2026-11-10",
            scheduledTime = "14:15",
            leadMinutes = 30,
            nowEpoch = now,
            zone = zone,
        )

        assertNull(trigger)
    }

    @Test
    fun dateWithIsoTimestampParsesCorrectly() {
        val now = LocalDate.of(2026, 11, 10).atTime(10, 0).atZone(zone).toInstant().toEpochMilli()
        val expected = LocalDate.of(2026, 11, 10).atTime(16, 0).atZone(zone).toInstant().toEpochMilli()

        val trigger = nextTaskReminderEpoch(
            scheduledDate = "2026-11-10T00:00:00.000Z",
            scheduledTime = "16:00",
            leadMinutes = 0,
            nowEpoch = now,
            zone = zone,
        )

        assertEquals(expected, trigger)
    }

    @Test
    fun blankOrMissingDateTimeReturnsNull() {
        val now = 1_000_000L
        assertNull(nextTaskReminderEpoch(null, "15:00", 0, now, zone))
        assertNull(nextTaskReminderEpoch("2026-11-10", null, 0, now, zone))
        assertNull(nextTaskReminderEpoch("", "15:00", 0, now, zone))
        assertNull(nextTaskReminderEpoch("2026-11-10", "", 0, now, zone))
        assertNull(nextTaskReminderEpoch("invalid-date", "15:00", 0, now, zone))
        assertNull(nextTaskReminderEpoch("2026-11-10", "99:99", 0, now, zone))
    }

    @Test
    fun snoozeCalculationAddsCorrectMilliseconds() {
        val now = 1_000_000L
        val snooze10m = calculateSnoozeEpoch(now, 10)
        assertEquals(now + 600_000L, snooze10m)

        val snooze1h = calculateSnoozeEpoch(now, 60)
        assertEquals(now + 3_600_000L, snooze1h)
    }
}
