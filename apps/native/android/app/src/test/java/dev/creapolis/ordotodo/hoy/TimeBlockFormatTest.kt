package dev.creapolis.ordotodo.hoy

import org.junit.Assert.assertEquals
import org.junit.Test

class TimeBlockFormatTest {

    @Test
    fun `formats time block with start and end when estimated minutes provided`() {
        assertEquals("15:00 – 16:30", formatTimeBlockRange("15:00", 90))
        assertEquals("09:30 – 10:15", formatTimeBlockRange("09:30", 45))
        assertEquals("08:00 – 09:00", formatTimeBlockRange("08:00", 60))
    }

    @Test
    fun `formats start time only when estimated minutes is null or zero`() {
        assertEquals("11:00", formatTimeBlockRange("11:00", null))
        assertEquals("14:30", formatTimeBlockRange("14:30", 0))
    }

    @Test
    fun `handles day overflow gracefully`() {
        assertEquals("23:30 – 00:30", formatTimeBlockRange("23:30", 60))
    }

    @Test
    fun `handles invalid time string without crashing`() {
        assertEquals("invalid", formatTimeBlockRange("invalid", 30))
    }
}
