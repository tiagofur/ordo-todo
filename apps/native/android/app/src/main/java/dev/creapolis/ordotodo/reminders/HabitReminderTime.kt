package dev.creapolis.ordotodo.reminders

import java.time.Instant
import java.time.ZoneId

private val TIME = Regex("""^(\d{1,2}):(\d{2})$""")

/**
 * Next wall-clock trigger for a `preferredTime` (`HH:mm`) strictly after
 * [nowEpoch]: later today when still ahead, otherwise tomorrow. Returns
 * null for blank or malformed input — the habit simply gets no reminder.
 */
fun nextReminderEpoch(
    hhmm: String?,
    nowEpoch: Long,
    zone: ZoneId = ZoneId.systemDefault(),
): Long? {
    val match = hhmm?.let(TIME::matchEntire) ?: return null
    val hour = match.groupValues[1].toIntOrNull()?.takeIf { it in 0..23 } ?: return null
    val minute = match.groupValues[2].toIntOrNull()?.takeIf { it in 0..59 } ?: return null
    val today = Instant.ofEpochMilli(nowEpoch).atZone(zone).toLocalDate()
    val todayAt = today.atTime(hour, minute).atZone(zone).toInstant().toEpochMilli()
    if (todayAt > nowEpoch) return todayAt
    return today.plusDays(1).atTime(hour, minute).atZone(zone).toInstant().toEpochMilli()
}
