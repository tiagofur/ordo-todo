package dev.creapolis.ordotodo.reminders

import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId

private val TIME_REGEX = Regex("""^(\d{1,2}):(\d{2})$""")
private val DATE_REGEX = Regex("""^(\d{4})-(\d{2})-(\d{2})""")

/**
 * Calculates the epoch millisecond trigger time for a task reminder given:
 * - [scheduledDate]: ISO date e.g. "2026-11-10" or "2026-11-10T..."
 * - [scheduledTime]: "HH:mm" e.g. "14:30"
 * - [leadMinutes]: antelación in minutes (0 = exact scheduled time, 10 = 10m before, 30 = 30m before)
 * - [nowEpoch]: current time in epoch millis
 * - [zone]: time zone (defaults to system default)
 *
 * Returns null if:
 * - date or time is missing/blank or malformed
 * - the calculated trigger is in the past (<= nowEpoch)
 */
fun nextTaskReminderEpoch(
    scheduledDate: String?,
    scheduledTime: String?,
    leadMinutes: Int = 0,
    nowEpoch: Long,
    zone: ZoneId = ZoneId.systemDefault(),
): Long? {
    if (scheduledDate.isNullOrBlank() || scheduledTime.isNullOrBlank()) return null
    val dateMatch = DATE_REGEX.find(scheduledDate) ?: return null
    val timeMatch = TIME_REGEX.matchEntire(scheduledTime.trim()) ?: return null

    val year = dateMatch.groupValues[1].toIntOrNull() ?: return null
    val month = dateMatch.groupValues[2].toIntOrNull() ?: return null
    val day = dateMatch.groupValues[3].toIntOrNull() ?: return null

    val hour = timeMatch.groupValues[1].toIntOrNull()?.takeIf { it in 0..23 } ?: return null
    val minute = timeMatch.groupValues[2].toIntOrNull()?.takeIf { it in 0..59 } ?: return null

    val localDate =
        try {
            LocalDate.of(year, month, day)
        } catch (_: Exception) {
            return null
        }

    val localTime =
        try {
            LocalTime.of(hour, minute)
        } catch (_: Exception) {
            return null
        }

    val taskInstant = localDate.atTime(localTime).atZone(zone).toInstant()
    val reminderInstant = taskInstant.minusSeconds(leadMinutes.toLong() * 60L)
    val reminderEpoch = reminderInstant.toEpochMilli()

    return if (reminderEpoch > nowEpoch) reminderEpoch else null
}

/**
 * Calculates snooze trigger time in epoch millis.
 * e.g. snoozeMinutes = 10 -> now + 10m
 * e.g. snoozeMinutes = 60 -> now + 1h
 */
fun calculateSnoozeEpoch(
    nowEpoch: Long,
    snoozeMinutes: Long,
): Long = nowEpoch + (snoozeMinutes * 60_000L)
