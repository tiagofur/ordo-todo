package dev.creapolis.ordotodo.hoy

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate

class DateTimePickerTest {

    private val tuesday = LocalDate.of(2026, 11, 10)
    private val sunday = LocalDate.of(2026, 11, 15)
    private val monday = LocalDate.of(2026, 11, 9)

    @Test
    fun shortcutTodayReturnsReferenceDate() {
        val result = calculateShortcutDate(DateShortcut.TODAY, tuesday)
        assertEquals(tuesday, result)
    }

    @Test
    fun shortcutTomorrowReturnsNextDay() {
        val result = calculateShortcutDate(DateShortcut.TOMORROW, tuesday)
        assertEquals(LocalDate.of(2026, 11, 11), result)
    }

    @Test
    fun shortcutNextMondayFromTuesdayReturnsUpcomingMonday() {
        val result = calculateShortcutDate(DateShortcut.NEXT_MONDAY, tuesday)
        assertEquals(LocalDate.of(2026, 11, 16), result)
    }

    @Test
    fun shortcutNextMondayFromSundayReturnsNextDay() {
        val result = calculateShortcutDate(DateShortcut.NEXT_MONDAY, sunday)
        assertEquals(LocalDate.of(2026, 11, 16), result)
    }

    @Test
    fun shortcutNextMondayFromMondayReturnsNextWeekMonday() {
        val result = calculateShortcutDate(DateShortcut.NEXT_MONDAY, monday)
        assertEquals(LocalDate.of(2026, 11, 16), result)
    }

    @Test
    fun shortcutNoDateReturnsNull() {
        val result = calculateShortcutDate(DateShortcut.CLEAR, tuesday)
        assertNull(result)
    }

    @Test
    fun formatTimeIsoPadsLeadingZeros() {
        assertEquals("09:05", formatTimeIso(9, 5))
        assertEquals("15:30", formatTimeIso(15, 30))
        assertEquals("00:00", formatTimeIso(0, 0))
    }

    @Test
    fun parseDateIsoParsesStandardFormat() {
        assertEquals(LocalDate.of(2026, 11, 10), parseDateIso("2026-11-10"))
        assertNull(parseDateIso("invalid-date"))
        assertNull(parseDateIso(""))
    }

    @Test
    fun parseHourMinuteParsesTimeStrings() {
        assertEquals(Pair(15, 30), parseHourMinute("15:30"))
        assertEquals(Pair(9, 5), parseHourMinute("09:05"))
        assertEquals(Pair(15, 0), parseHourMinute("3pm"))
        assertNull(parseHourMinute(""))
        assertNull(parseHourMinute("invalid"))
    }
}
