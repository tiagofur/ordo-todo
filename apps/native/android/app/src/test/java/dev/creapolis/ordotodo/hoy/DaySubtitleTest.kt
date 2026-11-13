package dev.creapolis.ordotodo.hoy

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate
import java.util.Locale

class DaySubtitleTest {

    private val date = LocalDate.of(2026, 11, 12)

    @Test
    fun `formats subtitle in Spanish with system locale data`() {
        assertEquals("12 de noviembre de 2026", formatDaySubtitle(date, Locale("es")))
    }

    @Test
    fun `formats subtitle in English with system locale data`() {
        assertEquals("November 12, 2026", formatDaySubtitle(date, Locale.ENGLISH))
    }

    @Test
    fun `formats subtitle in Brazilian Portuguese with system locale data`() {
        assertEquals("12 de novembro de 2026", formatDaySubtitle(date, Locale("pt", "BR")))
    }
}
