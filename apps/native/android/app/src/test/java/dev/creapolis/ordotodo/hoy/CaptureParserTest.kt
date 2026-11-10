package dev.creapolis.ordotodo.hoy

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate

private val TODAY = LocalDate.of(2026, 11, 9)

class CaptureParserTest {

    @Test
    fun spanishRelativeDayAndTime() {
        val parsed = parseCapture("Enviar factura mañana 15:00", TODAY)

        assertEquals("Enviar factura", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 10), parsed.scheduledDate)
        assertEquals("15:00", parsed.scheduledTime)
        assertNull(parsed.priority)
    }

    @Test
    fun englishRelativeDayPmAndP1() {
        val parsed = parseCapture("Send invoice tomorrow 3pm p1", TODAY)

        assertEquals("Send invoice", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 10), parsed.scheduledDate)
        assertEquals("15:00", parsed.scheduledTime)
        assertEquals("URGENT", parsed.priority)
    }

    @Test
    fun portugueseDayAfterTomorrowHshAndBangs() {
        val parsed = parseCapture("Enviar fatura depois de amanhã 15h !!", TODAY)

        assertEquals("Enviar fatura", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 11), parsed.scheduledDate)
        assertEquals("15:00", parsed.scheduledTime)
        assertEquals("URGENT", parsed.priority)
    }

    @Test
    fun numericDayMonth() {
        val parsed = parseCapture("Llamar al banco 12/11", TODAY)

        assertEquals("Llamar al banco", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 12), parsed.scheduledDate)
        assertNull(parsed.scheduledTime)
    }

    @Test
    fun isoDateParsed() {
        val parsed = parseCapture("Planificar release 2026-11-20 10:00", TODAY)

        assertEquals("Planificar release", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 20), parsed.scheduledDate)
        assertEquals("10:00", parsed.scheduledTime)
    }

    @Test
    fun dayMonthNameRollsToNextYear() {
        val parsed = parseCapture("Revisar contrato 12 ene 09:00", TODAY)

        assertEquals("Revisar contrato", parsed.title)
        assertEquals(LocalDate.of(2027, 1, 12), parsed.scheduledDate)
        assertEquals("09:00", parsed.scheduledTime)
    }

    @Test
    fun pastDayMonthRollsToNextYear() {
        val parsed = parseCapture("Fiesta 01/01", TODAY)

        assertEquals(LocalDate.of(2027, 1, 1), parsed.scheduledDate)
    }

    @Test
    fun invalidDateStaysAsText() {
        val parsed = parseCapture("Reunión 31/02 10:00", TODAY)

        assertEquals("Reunión 31/02", parsed.title)
        assertNull(parsed.scheduledDate)
        assertEquals("10:00", parsed.scheduledTime)
    }

    @Test
    fun trailingBangIsHighPriority() {
        val parsed = parseCapture("Urgente !! terminar informe", TODAY)

        assertEquals("URGENT", parsed.priority)
        assertEquals("Urgente terminar informe", parsed.title)
    }

    @Test
    fun blankInputHasBlankTitle() {
        val parsed = parseCapture("   ", TODAY)

        assertEquals("", parsed.title)
        assertNull(parsed.scheduledDate)
        assertNull(parsed.scheduledTime)
        assertNull(parsed.priority)
    }

    @Test
    fun prepositionBeforeTimeIsRemoved() {
        val parsed = parseCapture("Llamar a las 15:00", TODAY)

        assertEquals("Llamar", parsed.title)
        assertEquals("15:00", parsed.scheduledTime)
    }

    @Test
    fun englishDayAfterTomorrow() {
        val parsed = parseCapture("Pay bills day after tomorrow", TODAY)

        assertEquals("Pay bills", parsed.title)
        assertEquals(LocalDate.of(2026, 11, 11), parsed.scheduledDate)
    }

    @Test
    fun p3IsMedium() {
        val parsed = parseCapture("Ordenar p3", TODAY)

        assertEquals("Ordenar", parsed.title)
        assertEquals("MEDIUM", parsed.priority)
    }

    @Test
    fun firstDateMarkerWins() {
        val parsed = parseCapture("Llamar 12/11 mañana", TODAY)

        assertEquals(LocalDate.of(2026, 11, 12), parsed.scheduledDate)
        assertEquals("Llamar mañana", parsed.title)
    }
}
