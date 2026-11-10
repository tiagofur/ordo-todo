package dev.creapolis.ordotodo.hoy

import java.time.LocalTime
import java.time.format.DateTimeFormatter

private val TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm")

/**
 * Pure formatter for time blocks on the day timeline (ODD 051 S12 / D7).
 * When estimated minutes are present (> 0), produces a range like "15:00 – 16:30".
 * Otherwise returns the start time "15:00".
 */
fun formatTimeBlockRange(scheduledTime: String, estimatedMinutes: Int?): String {
    if (estimatedMinutes == null || estimatedMinutes <= 0) {
        return scheduledTime
    }
    return try {
        val start = LocalTime.parse(scheduledTime, TIME_FORMATTER)
        val end = start.plusMinutes(estimatedMinutes.toLong())
        val endStr = end.format(TIME_FORMATTER)
        "$scheduledTime – $endStr"
    } catch (_: Exception) {
        scheduledTime
    }
}
