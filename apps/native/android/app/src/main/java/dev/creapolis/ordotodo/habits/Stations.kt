package dev.creapolis.ordotodo.habits

import java.time.LocalDate

/**
 * Seven-station streak strip (F3d): oldest day first, today last.
 * A station is lit when any completion falls on that ISO day; future
 * dates never light. Pure for JVM tests — pass `LocalDate.now()`.
 */
fun last7Stations(dates: List<String>, today: LocalDate): List<Boolean> {
    val done =
        dates
            .mapNotNull { runCatching { LocalDate.parse(it.take(10)) }.getOrNull() }
            .filter { !it.isAfter(today) }
            .toSet()
    return (6 downTo 0).map { back -> done.contains(today.minusDays(back.toLong())) }
}
